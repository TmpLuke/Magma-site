"use server";

import crypto from 'crypto';
import { createAdminClient } from "@/lib/supabase/admin";

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
    
    console.log("[MoneyMotion DEBUG] Starting checkout session creation");
    console.log("[MoneyMotion DEBUG] API Key exists:", !!apiKey);
    console.log("[MoneyMotion DEBUG] API Key length:", apiKey?.length);
    console.log("[MoneyMotion DEBUG] API Key first 10 chars:", apiKey?.substring(0, 10));
    
    if (!apiKey) {
      console.error("[MoneyMotion DEBUG] API key is missing!");
      return { success: false, error: "API key not configured" };
    }

    const requestBody = {
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
    };

    console.log("[MoneyMotion DEBUG] Request body:", JSON.stringify(requestBody, null, 2));

    const body = JSON.stringify(requestBody);

    const requestUrl = `${MONEYMOTION_API_URL}/checkoutSessions.createCheckoutSession`;
    console.log("[MoneyMotion DEBUG] Request URL:", requestUrl);
    console.log("[MoneyMotion DEBUG] Request headers:", {
      "Content-Type": "application/json",
      "x-api-key": `${apiKey.substring(0, 10)}...`,
      "x-currency": "USD",
    });

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "x-currency": "USD",
      },
      body,
    });

    console.log("[MoneyMotion DEBUG] Response status:", response.status);
    console.log("[MoneyMotion DEBUG] Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[MoneyMotion DEBUG] Error response body:", errorText);
      console.error("[MoneyMotion DEBUG] Full error details:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return {
        success: false,
        error: `API error: ${response.status} - ${errorText}`,
      };
    }

    const responseText = await response.text();
    console.log("[MoneyMotion DEBUG] Success response body:", responseText);

    let data: CheckoutSessionResponse;
    try {
      data = JSON.parse(responseText);
      console.log("[MoneyMotion DEBUG] Parsed response:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error("[MoneyMotion DEBUG] Failed to parse response:", parseError);
      return {
        success: false,
        error: "Invalid JSON response from API",
      };
    }

    const checkoutSessionId = data?.result?.data?.json?.checkoutSessionId;
    console.log("[MoneyMotion DEBUG] Extracted checkout session ID:", checkoutSessionId);

    if (!checkoutSessionId) {
      console.error("[MoneyMotion DEBUG] No checkout session ID in response");
      console.error("[MoneyMotion DEBUG] Full response structure:", JSON.stringify(data, null, 2));
      return {
        success: false,
        error: "Invalid API response - no session ID",
      };
    }

    const checkoutUrl = `https://moneymotion.io/checkout/${checkoutSessionId}`;
    console.log("[MoneyMotion DEBUG] Generated checkout URL:", checkoutUrl);

    return {
      success: true,
      checkoutSessionId,
      checkoutUrl,
    };
  } catch (error) {
    console.error("[MoneyMotion DEBUG] Exception caught:", error);
    console.error("[MoneyMotion DEBUG] Exception stack:", error instanceof Error ? error.stack : "No stack");
    return {
      success: false,
      error: `Exception: ${error instanceof Error ? error.message : String(error)}`,
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
        "x-api-key": apiKey,
        "x-currency": "USD",
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

/**
 * Get and consume a license key from stock
 * Removes it from inventory when purchased
 */
export async function consumeLicenseFromStock(data: {
  product_id: string;
  variant_id: string | null;
}): Promise<{ success: boolean; license_key?: string; error?: string }> {
  try {
    const supabase = createAdminClient();
    
    // Priority 1: Try exact product+variant match
    let license = null;
    if (data.variant_id) {
      const { data: exactMatch, error: exactError } = await supabase
        .from("licenses")
        .select("*")
        .eq("product_id", data.product_id)
        .eq("variant_id", data.variant_id)
        .limit(1)
        .single();
      
      if (exactError && exactError.code !== "PGRST116") {
        console.error("[MoneyMotion] Error finding exact match:", exactError);
      }
      license = exactMatch;
    }
    
    // Priority 2: Try product-only match (any variant)
    if (!license) {
      const { data: productMatch, error: productError } = await supabase
        .from("licenses")
        .select("*")
        .eq("product_id", data.product_id)
        .is("variant_id", null)
        .limit(1)
        .single();
      
      if (productError && productError.code !== "PGRST116") {
        console.error("[MoneyMotion] Error finding product match:", productError);
      }
      license = productMatch;
    }
    
    // Priority 3: Use general stock (no product/variant specified)
    if (!license) {
      const { data: generalStock, error: generalError } = await supabase
        .from("licenses")
        .select("*")
        .is("product_id", null)
        .is("variant_id", null)
        .limit(1)
        .single();
      
      if (generalError && generalError.code !== "PGRST116") {
        console.error("[MoneyMotion] Error finding general stock:", generalError);
      }
      license = generalStock;
    }

    if (!license) {
      return { success: false, error: "No license keys available in stock" };
    }

    // Delete the license from stock (consume it)
    const { error: deleteError } = await supabase
      .from("licenses")
      .delete()
      .eq("id", license.id);

    if (deleteError) {
      console.error("[MoneyMotion] Error consuming license:", deleteError);
      return { success: false, error: `Failed to consume license: ${deleteError.message}` };
    }

    return { success: true, license_key: license.license_key };
  } catch (error: any) {
    console.error("[MoneyMotion] Consume license error:", error);
    return { success: false, error: `Error: ${error?.message || "Unknown error"}` };
  }
}
