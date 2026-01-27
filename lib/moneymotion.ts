import crypto from 'crypto';

const MONEYMOTION_API_BASE = 'https://api.moneymotion.io';

export interface LineItem {
  name: string;
  description: string;
  pricePerItemInCents: number;
  quantity: number;
}

export interface UserInfo {
  email: string;
}

export interface CheckoutSessionRequest {
  description: string;
  urls: {
    success: string;
    cancel: string;
    failure: string;
  };
  userInfo: UserInfo;
  lineItems: LineItem[];
}

export interface CheckoutSessionResponse {
  result: {
    data: {
      json: {
        checkoutSessionId: string;
      };
    };
  };
}

export interface CheckoutStatusResponse {
  result: {
    data: {
      json: {
        id: string;
        status: 'pending' | 'completed' | 'refunded' | 'expired' | 'disputed';
        checkoutSessionItems: any[];
        customerEmail: string;
        totalPrice: {
          amountInCents: number;
          currency: string;
        };
      };
    };
  };
}

export interface WebhookPayload {
  checkoutSession: {
    id: string;
    status: string;
    totalInCents: number;
    storeId: string;
  };
  event: string;
  customer: {
    email: string;
    paymentMethodInfo: {
      type: string;
      lastFourDigits: string;
      cardBrand: string;
    };
  };
}

// HMAC SHA512 signature functions
async function hmacSha512Sign(secret: string, data: string): Promise<string> {
  return crypto.createHmac("sha512", secret).update(data).digest("base64");
}

export async function verifyWebhookSignature(rawBody: string, signatureHeader: string, secret: string): Promise<boolean> {
  const computedHash = await hmacSha512Sign(secret, rawBody);
  return crypto.timingSafeEqual(
    Buffer.from(computedHash),
    Buffer.from(signatureHeader)
  );
}

// Create checkout session
export async function createCheckoutSession(
  lineItems: LineItem[],
  userInfo: UserInfo,
  description: string,
  successUrl?: string,
  cancelUrl?: string,
  failureUrl?: string
): Promise<string> {
  const apiKey = process.env.MONEYMOTION_API_KEY;
  if (!apiKey) {
    throw new Error('MoneyMotion API key not configured');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  const requestBody: CheckoutSessionRequest = {
    description,
    urls: {
      success: successUrl || `${siteUrl}/payment/success`,
      cancel: cancelUrl || `${siteUrl}/payment/cancel`,
      failure: failureUrl || `${siteUrl}/payment/failure`
    },
    userInfo,
    lineItems
  };

  try {
    const response = await fetch(`${MONEYMOTION_API_BASE}/checkoutSessions.createCheckoutSession`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ json: requestBody })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MoneyMotion API error: ${response.status} ${errorText}`);
    }

    const data: CheckoutSessionResponse = await response.json();
    return data.result.data.json.checkoutSessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Get checkout status
export async function getCheckoutStatus(checkoutId: string): Promise<CheckoutStatusResponse['result']['data']['json']> {
  const apiKey = process.env.MONEYMOTION_API_KEY;
  if (!apiKey) {
    throw new Error('MoneyMotion API key not configured');
  }

  try {
    const url = new URL(`${MONEYMOTION_API_BASE}/checkoutSessions.getCompletedOrPendingCheckoutSessionInfo`);
    url.searchParams.set('json.checkoutId', checkoutId);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MoneyMotion API error: ${response.status} ${errorText}`);
    }

    const data: CheckoutStatusResponse = await response.json();
    return data.result.data.json;
  } catch (error) {
    console.error('Error getting checkout status:', error);
    throw error;
  }
}