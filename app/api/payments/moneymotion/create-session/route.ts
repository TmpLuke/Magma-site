import { NextRequest, NextResponse } from "next/server";
import type {
  MoneyMotionCheckoutRequest,
  MoneyMotionCheckoutResponse,
  CreateCheckoutRequest,
  PaymentSession,
} from "@/lib/moneymotion-types";

// In-memory store for demo (replace with database in production)
const paymentSessions: Map<string, PaymentSession> = new Map();

// Export for use in other routes
export { paymentSessions };

const MONEYMOTION_API_URL = "https://api.moneymotion.io";

export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutRequest = await request.json();
    const { 
      amount, 
      currency = "USD", 
      customer_email, 
      description = "", 
      order_id, 
      product_id, 
      license_duration,
      success_url,
      cancel_url
    } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid amount" }, { status: 400 });
    }

    if (!customer_email) {
      return NextResponse.json({ success: false, error: "Customer email required" }, { status: 400 });
    }

    if (!order_id) {
      return NextResponse.json({ success: false, error: "Order ID required" }, { status: 400 });
    }

    const apiKey = process.env.MONEYMOTION_API_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    // If no API key, use mock mode for demo
    if (!apiKey) {
      console.log("[v0] MoneyMotion running in mock mode - no API key configured");
      
      const mockSessionId = `mm_sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const mockSession: PaymentSession = {
        id: order_id,
        session_id: mockSessionId,
        amount,
        currency,
        status: "pending",
        customer_email,
        description,
        order_id,
        product_id: product_id || null,
        license_duration: license_duration || null,
        paid_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      paymentSessions.set(mockSessionId, mockSession);

      return NextResponse.json({
        success: true,
        sessionId: mockSessionId,
        checkoutUrl: `/payment/checkout?session=${mockSessionId}`,
        mock_mode: true,
      });
    }

    // Real Money Motion API call
    const checkoutRequest: MoneyMotionCheckoutRequest = {
      amount,
      currency,
      customer_email,
      description,
      metadata: {
        order_id,
        product_id: product_id || undefined,
        license_duration: license_duration || undefined,
      },
      success_url: success_url || `${baseUrl}/payment/success?session={SESSION_ID}`,
      cancel_url: cancel_url || `${baseUrl}/payment/cancelled?session={SESSION_ID}`,
    };

    const response = await fetch(`${MONEYMOTION_API_URL}/createCheckoutSession`, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[v0] MoneyMotion API error:", response.status, errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { success: false, error: "Invalid API key" },
          { status: 401 }
        );
      }
      
      if (response.status === 429) {
        return NextResponse.json(
          { success: false, error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Payment service error: ${response.status}` },
        { status: 500 }
      );
    }

    const result: MoneyMotionCheckoutResponse = await response.json();

    if (!result.success || !result.sessionId || !result.checkoutUrl) {
      return NextResponse.json(
        { success: false, error: result.error || result.message || "Failed to create checkout session" },
        { status: 500 }
      );
    }

    // Store session in memory (use database in production)
    const session: PaymentSession = {
      id: order_id,
      session_id: result.sessionId,
      amount,
      currency,
      status: "pending",
      customer_email,
      description,
      order_id,
      product_id: product_id || null,
      license_duration: license_duration || null,
      paid_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    paymentSessions.set(result.sessionId, session);

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      checkoutUrl: result.checkoutUrl,
    });
  } catch (error) {
    console.error("[v0] Error creating checkout session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
