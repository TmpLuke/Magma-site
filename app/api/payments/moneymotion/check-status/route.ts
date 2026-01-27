import { NextRequest, NextResponse } from "next/server";
import { paymentSessions } from "../create-session/route";
import type { MoneyMotionSessionStatus } from "@/lib/moneymotion-types";

const MONEYMOTION_API_URL = "https://api.moneymotion.io";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.MONEYMOTION_API_KEY;

    // Mock mode if no API key
    if (!apiKey) {
      const session = paymentSessions.get(sessionId);
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: "Session not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        sessionId: session.session_id,
        status: session.status,
        paid: session.status === "completed",
        amount: session.amount,
        currency: session.currency,
        customer_email: session.customer_email,
        paid_at: session.paid_at,
        metadata: {
          order_id: session.order_id,
          product_id: session.product_id,
          license_duration: session.license_duration,
        },
        mock_mode: true,
      });
    }

    // Real API call to check session status
    const response = await fetch(`${MONEYMOTION_API_URL}/checkoutSessions/${sessionId}`, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: "Session not found" },
          { status: 404 }
        );
      }
      
      console.error("[v0] MoneyMotion status check error:", response.status);
      return NextResponse.json(
        { success: false, error: "Failed to check payment status" },
        { status: 500 }
      );
    }

    const result: MoneyMotionSessionStatus = await response.json();

    // Update local cache if we have it
    if (result.sessionId) {
      const localSession = paymentSessions.get(result.sessionId);
      if (localSession && result.status) {
        localSession.status = result.status;
        if (result.paid_at) {
          localSession.paid_at = result.paid_at;
        }
        localSession.updated_at = new Date().toISOString();
        paymentSessions.set(result.sessionId, localSession);
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: result.sessionId,
      status: result.status,
      paid: result.paid || result.status === "completed",
      amount: result.amount,
      currency: result.currency,
      customer_email: result.customer_email,
      paid_at: result.paid_at,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error("[v0] Error checking session status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
