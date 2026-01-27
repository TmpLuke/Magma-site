"use server";

import crypto from 'crypto';

const MONEYMOTION_API_URL = "https://api.moneymotion.io";

interface LineItem {
  name: string;
  description: string;
  pricePerItemInCents: number;
  quantity: number;
}

interface CreateCheckoutSessionParams {
  description: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  customerEmail: string;
  lineItems: LineItem[];
}

interface CheckoutSessionResponse {
  checkoutSessionId: string;
}

interface CheckoutStatusResponse {
  id: string;
  status: 'pending' | 'completed' | 'refunded' | 'expired' | 'disputed';
  checkoutSessionItems: any[];
  customerEmail: string;
  totalPrice: {
    amountInCents: number;
    currency: string;
  };
}

// Create a checkout session
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ success: boolean; checkoutSessionId?: string; error?: string }> {
  try {
    const apiKey = process.env.MONEYMOTION_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: "MoneyMotion API key not configured" };
    }

    const response = await fetch(
      `${MONEYMOTION_API_URL}/checkoutSessions.createCheckoutSession`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          json: {
            description: params.description,
            urls: {
              success: params.successUrl,
              cancel: params.cancelUrl,
              failure: params.failureUrl,
            },
            userInfo: {
              email: params.customerEmail,
            },
            lineItems: params.lineItems,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[MoneyMotion] Create session error:", response.status, errorText);
      return { 
        success: false, 
        error: `API error: ${response.status}` 
      };
    }

    const data = await response.json();
    const checkoutSessionId = data?.result?.data?.json?.checkoutSessionId;

    if (!checkoutSessionId) {
      console.error("[MoneyMotion] No checkout session ID in response:", data);
      return { 
        success: false, 
        error: "Invalid API response" 
      };
    }

    return {
      success: true,
      checkoutSessionId,
    };
  } catch (error) {
    console.error("[MoneyMotion] Create session exception:", error);
    return { 
      success: false, 
      error: "Failed to create checkout session" 
    };
  }
}

// Get checkout session status
export async function getCheckoutStatus(
  checkoutId: string
): Promise<{ success: boolean; data?: CheckoutStatusResponse; error?: string }> {
  try {
    const apiKey = process.env.MONEYMOTION_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: "MoneyMotion API key not configured" };
    }

    const url = new URL(
      `${MONEYMOTION_API_URL}/checkoutSessions.getCompletedOrPendingCheckoutSessionInfo`
    );
    url.searchParams.set("json.checkoutId", checkoutId);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[MoneyMotion] Get status error:", response.status, errorText);
      return { 
        success: false, 
        error: `API error: ${response.status}` 
      };
    }

    const responseData = await response.json();
    const sessionData = responseData?.result?.data?.json;

    if (!sessionData) {
      console.error("[MoneyMotion] No session data in response:", responseData);
      return { 
        success: false, 
        error: "Invalid API response" 
      };
    }

    return {
      success: true,
      data: sessionData,
    };
  } catch (error) {
    console.error("[MoneyMotion] Get status exception:", error);
    return { 
      success: false, 
      error: "Failed to get checkout status" 
    };
  }
}

// HMAC SHA512 signature verification
export async function hmacSha512Sign(secret: string, data: string): Promise<string> {
  return crypto.createHmac("sha512", secret).update(data).digest("base64");
}

export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  try {
    const computedHash = await hmacSha512Sign(secret, rawBody);
    return crypto.timingSafeEqual(
      Buffer.from(computedHash),
      Buffer.from(signatureHeader)
    );
  } catch (error) {
    console.error("[MoneyMotion] Signature verification error:", error);
    return false;
  }
}
