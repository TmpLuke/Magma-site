import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/moneymotion-client";
import { createClient } from "@/lib/supabase/server";

// Disable body parsing to get raw body for signature verification
export const runtime = 'nodejs';

interface WebhookPayload {
  checkoutSession: {
    id: string;
    status: 'completed' | 'refunded' | 'expired' | 'disputed';
    totalInCents: number;
    storeId: string;
  };
  event: 'checkout_session:new' | 'checkout_session:complete' | 'checkout_session:refunded' | 'checkout_session:expired' | 'checkout_session:disputed';
  customer: {
    email: string;
    paymentMethodInfo?: {
      type: string;
      lastFourDigits?: string;
      cardBrand?: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-moneymotion-signature");
    const webhookSecret = process.env.MONEYMOTION_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Webhook] No webhook secret configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (!signature) {
      console.error("[Webhook] No signature header");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    const payload: WebhookPayload = JSON.parse(rawBody);
    console.log("[Webhook] Received event:", payload.event, "for session:", payload.checkoutSession.id);

    const supabase = await createClient();

    // Handle different webhook events
    switch (payload.event) {
      case "checkout_session:complete": {
        // Payment completed successfully
        const { checkoutSession, customer } = payload;

        // Find the order by looking up the checkout session ID
        // We need to store the session ID when creating the order
        const { data: orders, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("payment_method", "moneymotion")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(10);

        if (orderError || !orders || orders.length === 0) {
          console.error("[Webhook] No pending orders found");
          return NextResponse.json({ received: true });
        }

        // Find matching order by email
        const order = orders.find(o => o.customer_email === customer.email);

        if (!order) {
          console.error("[Webhook] No matching order found for email:", customer.email);
          return NextResponse.json({ received: true });
        }

        // Update order status to completed
        await supabase
          .from("orders")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        // Generate license key
        const licenseKey = generateLicenseKey(order.product_name, order.duration);
        const expiresAt = calculateExpiryDate(order.duration);

        // Create license
        await supabase
          .from("licenses")
          .insert({
            license_key: licenseKey,
            order_id: order.id,
            product_id: order.product_id,
            product_name: order.product_name,
            customer_email: order.customer_email,
            status: "active",
            expires_at: expiresAt.toISOString(),
          });

        console.log("[Webhook] Order completed:", order.order_number, "License:", licenseKey);
        break;
      }

      case "checkout_session:refunded": {
        // Payment was refunded
        const { customer } = payload;

        const { data: orders } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_email", customer.email)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1);

        if (orders && orders.length > 0) {
          const order = orders[0];

          // Update order status
          await supabase
            .from("orders")
            .update({
              status: "refunded",
              updated_at: new Date().toISOString(),
            })
            .eq("id", order.id);

          // Revoke associated licenses
          await supabase
            .from("licenses")
            .update({
              status: "revoked",
              updated_at: new Date().toISOString(),
            })
            .eq("order_id", order.id);

          console.log("[Webhook] Order refunded:", order.order_number);
        }
        break;
      }

      case "checkout_session:expired": {
        // Checkout session expired without payment
        console.log("[Webhook] Session expired:", payload.checkoutSession.id);
        break;
      }

      case "checkout_session:disputed": {
        // Payment disputed
        console.log("[Webhook] Session disputed:", payload.checkoutSession.id);
        break;
      }

      default:
        console.log("[Webhook] Unhandled event:", payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Helper functions
function generateLicenseKey(productName: string, duration: string): string {
  const prefix = productName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
  const durationCode = duration.includes("30") ? "30D" : duration.includes("7") ? "7D" : "1D";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomPart = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const randomPart2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `MGMA-${prefix}-${durationCode}-${randomPart}-${randomPart2}`;
}

function calculateExpiryDate(duration: string): Date {
  const now = new Date();
  if (duration.includes("30")) {
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (duration.includes("7")) {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}
