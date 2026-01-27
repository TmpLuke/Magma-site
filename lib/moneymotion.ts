"use server";

import crypto from 'crypto';

const MONEYMOTION_API_URL = "https://api.moneymotion.io";

interface LineItem {
  name: string;
  description: string;
  pricePerItemInCents: number;
  quantity: number;
}

interface CreateCheckoutParams {
  description: string;
  successUrl: string;
  cancelUrl: string;
  failureUrl: string;
  customerEmail: string;
  lineItems: LineItem[];
}

interface CheckoutSessionResponse {
  result: {
    data: {
      json: {
        checkoutSessionId: string;
      };
    };
  };
}

interface CheckoutStatusResponse {
  result: {
    data: {
      json: {
        id: string;
        createdAt: string;
        status: 'pending' | 'completed' | 'refunded' | 'expired' | 'disputed';
        checkoutSessionItems: Array<{
          name: string;
          pricePerItemInCents: number;
          quantity: number;
          description: string;
        }>;
        checkoutSessionRedirectUrls: Array<{
          url: string;
          type: string;
        }>;
        customerEmail: string;
        totalPrice: {
          amountInCentsUsd: number;
          amountInCents: number;
          currency: string;
        };
      };
    };
  };
}

// Create checkout session
export async function createCheckoutSession(params: CreateCheckoutParams) {
  try {
    const apiKey = process.env.MONEYMOTION_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: "API key not configured" };
    }

    const body = JSON.stringify({
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
    });

    const response = await fetch(
      `${MONEYMOTION_API_URL}/checkoutSessions.createCheckoutSession`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-moneymotion-api-key": apiKey,
        },
        body,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[MoneyMotion] Create session error:", response.status, errorText);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data: CheckoutSessionResponse = await response.json();
    const checkoutSessionId = data?.result?.data?.json?.checkoutSessionId;

    if (!checkoutSessionId) {
      console.error("[MoneyMotion] No checkout session ID:", data);
      return {
        success: false,
        error: "Invalid API response",
      };
    }

    return {
      success: true,
      checkoutSessionId,
      checkoutUrl: `https://moneymotion.io/checkout/${checkoutSessionId}`,
    };
  } catch (error) {
    console.error("[MoneyMotion] Create session exception:", error);
    return {
      success: false,
      error: "Failed to create checkout session",
    };
  }
}

// Get checkout status
export async function getCheckoutStatus(checkoutId: string) {
  try {
    const apiKey = process.env.MONEYMOTION_API_KEY;
    
    if (!apiKey) {
      return { success: false, error: "API key not configured" };
    }

    const url = `${MONEYMOTION_API_URL}/checkoutSessions.getCompletedOrPendingCheckoutSessionInfo?json.checkoutId=${checkoutId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-moneymotion-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[MoneyMotion] Get status error:", response.status, errorText);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data: CheckoutStatusResponse = await response.json();
    const sessionData = data?.result?.data?.json;

    if (!sessionData) {
      console.error("[MoneyMotion] No session data:", data);
      return {
        success: false,
        error: "Invalid API response",
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
      error: "Failed to get checkout status",
    };
  }
}

// Webhook signature verification
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
