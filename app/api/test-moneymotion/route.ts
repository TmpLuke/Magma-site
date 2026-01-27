import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.MONEYMOTION_API_KEY;
  const webhookSecret = process.env.MONEYMOTION_WEBHOOK_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  console.log("[Test] Environment check:");
  console.log("[Test] API Key exists:", !!apiKey);
  console.log("[Test] API Key length:", apiKey?.length);
  console.log("[Test] API Key first 10 chars:", apiKey?.substring(0, 10));
  console.log("[Test] Webhook Secret exists:", !!webhookSecret);
  console.log("[Test] Site URL:", siteUrl);

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: "MONEYMOTION_API_KEY not found in environment",
      env: {
        hasApiKey: false,
        hasWebhookSecret: !!webhookSecret,
        siteUrl,
      },
    });
  }

  // Test API call
  try {
    console.log("[Test] Making test API call to MoneyMotion...");
    
    const testBody = {
      json: {
        description: "Test checkout",
        urls: {
          success: `${siteUrl}/payment/success`,
          cancel: `${siteUrl}/payment/cancelled`,
          failure: `${siteUrl}/payment/cancelled`,
        },
        userInfo: {
          email: "test@example.com",
        },
        lineItems: [
          {
            name: "Test Product",
            description: "Test",
            pricePerItemInCents: 100,
            quantity: 1,
          },
        ],
      },
    };

    console.log("[Test] Request body:", JSON.stringify(testBody, null, 2));

    const response = await fetch(
      "https://api.moneymotion.io/checkoutSessions.createCheckoutSession",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-moneymotion-api-key": apiKey,
        },
        body: JSON.stringify(testBody),
      }
    );

    console.log("[Test] Response status:", response.status);
    console.log("[Test] Response headers:", Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log("[Test] Response body:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseData,
      env: {
        hasApiKey: true,
        apiKeyPrefix: apiKey.substring(0, 10),
        hasWebhookSecret: !!webhookSecret,
        siteUrl,
      },
    });
  } catch (error) {
    console.error("[Test] Exception:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
