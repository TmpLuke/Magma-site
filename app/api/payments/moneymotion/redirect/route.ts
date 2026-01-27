import { NextRequest, NextResponse } from "next/server";
import { paymentSessions } from "../create-session/route";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session");

    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Session ID required" }, { status: 400 });
    }

    // Get session from memory (in production, query database)
    const session = paymentSessions.get(sessionId);
    if (!session) {
      return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 });
    }

    const apiKey = process.env.MONEYMOTION_API_KEY;
    
    if (!apiKey) {
      // Mock mode - simulate redirect to payment processor
      console.log("[v0] MoneyMotion redirect in mock mode");
      
      // In mock mode, redirect back to checkout with success parameter
      return NextResponse.redirect(new URL(`/payment/checkout?session=${sessionId}&mock_success=true`, request.url));
    }

    // Real MoneyMotion API - get checkout URL
    const response = await fetch(`https://api.moneymotion.io/getCheckoutUrl?sessionId=${sessionId}`, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("[v0] MoneyMotion redirect error:", response.status);
      return NextResponse.json(
        { success: false, error: "Failed to get checkout URL" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (data.success && data.checkoutUrl) {
      // Redirect to MoneyMotion checkout
      return NextResponse.redirect(data.checkoutUrl);
    } else {
      return NextResponse.json(
        { success: false, error: data.error || "No checkout URL available" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[v0] Error redirecting to MoneyMotion:", error);
    return NextResponse.json(
      { success: false, error: "Redirect failed" },
      { status: 500 }
    );
  }
}