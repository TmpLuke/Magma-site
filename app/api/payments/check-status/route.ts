import { NextRequest, NextResponse } from "next/server";
import type { BrickPayStatusResponse, PaymentOrder } from "@/lib/brickpay-types";

// In-memory store for demo (shared with create-invoice route)
// In production, this would be a database query
const paymentOrders: Map<string, PaymentOrder> = new Map();

// Helper to get orders from the create-invoice module
async function getPaymentOrder(token: string): Promise<PaymentOrder | undefined> {
  // Try local store first
  if (paymentOrders.has(token)) {
    return paymentOrders.get(token);
  }
  
  // In production, query database here
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ success: false, error: "Token required" }, { status: 400 });
    }

    const apiKey = process.env.BRICKPAY_API_KEY;
    const apiUrl = process.env.BRICKPAY_API_URL || "https://brickpay.io/api";

    // Mock mode for demo or development
    if (!apiKey || token.startsWith("mock_") || process.env.NODE_ENV === "development") {
      console.log("[v0] BrickPay status check in mock mode");
      
      // Simulate payment completion after a few checks (for demo purposes)
      // In real implementation, this would be based on actual payment status
      const mockCompleted = Math.random() > 0.5; // 50% chance of completion per check
      
      return NextResponse.json({
        success: true,
        paid: mockCompleted,
        status: mockCompleted ? "completed" : "pending",
        amount_cents: 790, // Default mock amount
        currency: "USD",
        paid_at: mockCompleted ? new Date().toISOString() : null,
        payment_id: mockCompleted ? Math.floor(Math.random() * 1000000) : null,
        mock_mode: true,
      });
    }

    // Real BrickPay API call (public token, no API key needed for status)
    const response = await fetch(`${apiUrl}/invoice_status.php?token=${token}`);

    if (!response.ok) {
      console.error("[v0] BrickPay status API error:", response.status);
      
      if (response.status === 429) {
        return NextResponse.json(
          { success: false, error: "Rate limit exceeded. Please try again." },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Status check failed: ${response.status}` },
        { status: 500 }
      );
    }

    const status: BrickPayStatusResponse = await response.json();

    // Update database if paid
    if (status.paid) {
      const order = await getPaymentOrder(token);
      if (order) {
        order.status = "completed";
        order.payment_id = status.payment_id;
        order.paid_at = status.paid_at;
        order.updated_at = new Date().toISOString();
        paymentOrders.set(token, order);
      }
    }

    return NextResponse.json({
      success: true,
      paid: status.paid,
      status: status.status,
      amount_cents: status.amount_cents,
      currency: status.currency,
      paid_at: status.paid_at,
      payment_id: status.payment_id,
    });
  } catch (error) {
    console.error("[v0] Error checking status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check status" },
      { status: 500 }
    );
  }
}
