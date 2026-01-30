import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, consumeLicenseFromStock } from "@/lib/moneymotion";
import { createClient } from "@/lib/supabase/server";
import { sendPurchaseEmail } from "@/lib/email";

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
    const rawBody = await request.text();
    const signature = request.headers.get("x-moneymotion-signature");
    const webhookSecret = process.env.MONEYMOTION_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Webhook] No webhook secret configured");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    if (!signature) {
      console.error("[Webhook] No signature header");
      return NextResponse.json({ error: "No signature provided" }, { status: 401 });
    }

    // Verify signature
    const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload: WebhookPayload = JSON.parse(rawBody);
    console.log("[Webhook] Event:", payload.event, "Session:", payload.checkoutSession.id);

    const supabase = await createClient();

    switch (payload.event) {
      case "checkout_session:complete": {
        const { customer } = payload;

        // Find pending order by email
        const { data: orders } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_email", customer.email)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(1);

        if (!orders || orders.length === 0) {
          console.error("[Webhook] No pending order found for:", customer.email);
          return NextResponse.json({ received: true });
        }

        const order = orders[0];

        // Update order to completed
        await supabase
          .from("orders")
          .update({ status: "completed", updated_at: new Date().toISOString() })
          .eq("id", order.id);

        // Try to find variant_id from product_pricing
        let variantId: string | null = null;
        if (order.product_id && order.duration) {
          const { data: variant } = await supabase
            .from("product_pricing")
            .select("id")
            .eq("product_id", order.product_id)
            .eq("duration", order.duration)
            .single();
            
          if (variant) {
            variantId = variant.id;
          }
        }

        // Get a license key from stock and remove it
        const licenseResult = await consumeLicenseFromStock({
          product_id: order.product_id,
          variant_id: variantId,
        });

        const expiresAt = calculateExpiryDate(order.duration);
        const licenseKey = licenseResult.license_key || generateLicenseKey(order.product_name, order.duration);
        
        console.log("[Webhook] Order completed:", order.order_number, "License:", licenseKey);

        // Send purchase confirmation email
        const emailResult = await sendPurchaseEmail({
          customerEmail: order.customer_email,
          orderNumber: order.order_number,
          productName: order.product_name,
          duration: order.duration,
          licenseKey,
          expiresAt,
          totalPaid: order.amount,
        });

        if (!emailResult.success) {
          console.error("[Webhook] Failed to send email:", emailResult.error);
          // Don't fail the webhook - order is still completed
        } else {
          console.log("[Webhook] Email sent successfully:", emailResult.emailId);
        }

        break;
      }

      case "checkout_session:refunded": {
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

          await supabase
            .from("orders")
            .update({ status: "refunded", updated_at: new Date().toISOString() })
            .eq("id", order.id);

          await supabase
            .from("licenses")
            .update({ status: "revoked", updated_at: new Date().toISOString() })
            .eq("order_id", order.id);

          console.log("[Webhook] Order refunded:", order.order_number);
        }
        break;
      }

      default:
        console.log("[Webhook] Unhandled event:", payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function generateLicenseKey(productName: string, duration: string): string {
  const prefix = productName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
  const durationCode = duration.includes("30") ? "30D" : duration.includes("7") ? "7D" : "1D";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const random2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `MGMA-${prefix}-${durationCode}-${random1}-${random2}`;
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
