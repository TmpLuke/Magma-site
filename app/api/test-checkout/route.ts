import { NextRequest, NextResponse } from "next/server";

// Test endpoint to create a mock payment and redirect to checkout
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testAmount = searchParams.get("amount") || "7.90";
    const testEmail = searchParams.get("email") || "test@example.com";
    const testOrderId = searchParams.get("order_id") || `test_order_${Date.now()}`;

    // Create a mock payment
    const createInvoiceResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payments/create-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: parseFloat(testAmount),
        currency: "USD",
        customer_email: testEmail,
        description: "Test payment for checkout verification",
        order_id: testOrderId,
      }),
    });

    if (!createInvoiceResponse.ok) {
      throw new Error("Failed to create test invoice");
    }

    const invoiceData = await createInvoiceResponse.json();

    if (invoiceData.success) {
      // Redirect to checkout
      return NextResponse.redirect(new URL(invoiceData.payment_link, request.url));
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Failed to create test payment",
        details: invoiceData.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[v0] Test checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Test checkout failed" },
      { status: 500 }
    );
  }
}