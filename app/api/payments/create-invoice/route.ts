import { NextRequest, NextResponse } from "next/server";
import type {
  BrickPayInvoiceRequest,
  BrickPayInvoiceResponse,
  CreateInvoiceRequest,
  PaymentOrder,
} from "@/lib/brickpay-types";

// In-memory store for demo (replace with database in production)
const paymentOrders: Map<string, PaymentOrder> = new Map();

// Export for use in other routes
export { paymentOrders };

export async function POST(request: NextRequest) {
  try {
    const body: CreateInvoiceRequest = await request.json();
    const { amount, currency = "USD", customer_email, description, order_id, product_id, license_duration } = body;

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

    // Convert to cents
    const amount_cents = Math.round(amount * 100);

    const apiKey = process.env.BRICKPAY_API_KEY;
    const apiUrl = process.env.BRICKPAY_API_URL || "https://brickpay.io/api";

    // If no API key or in development mode, use mock mode for demo
    if (!apiKey || process.env.NODE_ENV === "development") {
      console.log("[v0] BrickPay running in mock mode - no API key configured or in development");
      
      const mockInvoiceId = Math.floor(Math.random() * 1000000);
      const mockPublicToken = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const mockOrder: PaymentOrder = {
        id: order_id,
        brickpay_invoice_id: mockInvoiceId,
        brickpay_public_token: mockPublicToken,
        amount_cents,
        currency,
        status: "pending",
        customer_email,
        description,
        external_id: order_id,
        product_id: product_id || null,
        license_duration: license_duration || null,
        payment_id: null,
        paid_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      paymentOrders.set(mockPublicToken, mockOrder);

      return NextResponse.json({
        success: true,
        invoice_id: mockInvoiceId,
        payment_link: `/payment/checkout?token=${mockPublicToken}`,
        public_token: mockPublicToken,
        mock_mode: true,
      });
    }

    // Real BrickPay API call
    const invoiceRequest: BrickPayInvoiceRequest = {
      amount_cents,
      currency,
      customer_email,
      description,
      external_id: order_id,
    };

    const response = await fetch(`${apiUrl}/create_invoice.php`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[v0] BrickPay API error:", response.status, errorText);
      
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

    const invoice: BrickPayInvoiceResponse = await response.json();

    // Store in database (using in-memory for demo)
    const order: PaymentOrder = {
      id: order_id,
      brickpay_invoice_id: invoice.id,
      brickpay_public_token: invoice.public_token,
      amount_cents: invoice.amount_cents,
      currency: invoice.currency,
      status: invoice.status,
      customer_email,
      description,
      external_id: order_id,
      product_id: product_id || null,
      license_duration: license_duration || null,
      payment_id: null,
      paid_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    paymentOrders.set(invoice.public_token, order);

    return NextResponse.json({
      success: true,
      invoice_id: invoice.id,
      payment_link: invoice.payment_link,
      public_token: invoice.public_token,
    });
  } catch (error) {
    console.error("[v0] Error creating invoice:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
