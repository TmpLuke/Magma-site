import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { paymentSessions } from "../create-session/route";
import type { MoneyMotionWebhookPayload } from "@/lib/moneymotion-types";

// Generate a unique license key
function generateLicenseKey(productSlug: string, duration: string): string {
  const prefix = productSlug.slice(0, 4).toUpperCase();
  const durationCode = duration.includes("Lifetime") ? "LT" : duration.includes("30") ? "30D" : duration.includes("7") ? "7D" : "1D";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomPart = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const randomPart2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `MGMA-${prefix}-${durationCode}-${randomPart}-${randomPart2}`;
}

// Calculate expiry date based on duration
function calculateExpiryDate(duration: string): Date {
  const now = new Date();
  if (duration.includes("Lifetime")) {
    return new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000);
  } else if (duration.includes("30")) {
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (duration.includes("7")) {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: MoneyMotionWebhookPayload = await request.json();
    const supabase = await createClient();

    console.log("[MoneyMotion Webhook] Event received:", payload.event);

    // Update local session cache
    if (payload.sessionId) {
      const session = paymentSessions.get(payload.sessionId);
      if (session) {
        switch (payload.event) {
          case "checkout.completed":
            session.status = "completed";
            session.paid_at = payload.paid_at || new Date().toISOString();
            break;
          case "checkout.expired":
            session.status = "expired";
            break;
          case "checkout.cancelled":
            session.status = "cancelled";
            break;
        }
        session.updated_at = new Date().toISOString();
        paymentSessions.set(payload.sessionId, session);
      }
    }

    switch (payload.event) {
      case "checkout.completed": {
        const orderId = payload.metadata?.order_id;
        if (!orderId) {
          console.error("[MoneyMotion Webhook] No order ID in metadata");
          return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
        }

        // Get the order from database
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*, products:product_id(slug)")
          .eq("order_number", orderId)
          .single();

        if (orderError || !order) {
          console.error("[MoneyMotion Webhook] Order not found:", orderId);
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
        const { data: existingLicense } = await supabase
          .from("licenses")
          .select("license_key")
          .eq("customer_email", order.customer_email)
          .eq("product_id", order.product_id)
          .single();

        let licenseKey = existingLicense?.license_key;
        const expiresAt = calculateExpiryDate(order.duration);

        if (!licenseKey) {
          const productSlug = order.products?.slug || "prod";
          licenseKey = generateLicenseKey(productSlug, order.duration);

          // Create license
          await supabase.from("licenses").insert({
            license_key: licenseKey,
            product_id: order.product_id,
            product_name: order.product_name,
            customer_email: order.customer_email,
            status: "unused",
            expires_at: expiresAt.toISOString(),
          });
        }

        // Queue confirmation email
        await supabase.from("outbound_emails").insert({
          order_id: order.id,
          to_email: order.customer_email,
          subject: `Your Magma Cheats Order - ${order.order_number}`,
          template: "purchase_confirmation",
          template_data: {
            orderNumber: order.order_number,
            productName: order.product_name,
            duration: order.duration,
            licenseKey: licenseKey,
            expiresAt: expiresAt.toISOString(),
            totalPaid: order.amount.toFixed(2),
          },
          status: "pending",
        });

        // Trigger email processing
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
          
          fetch(`${baseUrl}/api/email/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }).catch(() => {});
        } catch {
          // Email will be processed by scheduled job
        }

        console.log("[MoneyMotion Webhook] Payment completed for order:", order.order_number);
        break;
      }

      case "checkout.expired": {
        const orderId = payload.metadata?.order_id;
        if (orderId) {
          await supabase
            .from("orders")
            .update({ status: "expired", updated_at: new Date().toISOString() })
            .eq("order_number", orderId);
        }
        console.log("[MoneyMotion Webhook] Checkout expired for order:", orderId);
        break;
      }

      case "checkout.cancelled": {
        const orderId = payload.metadata?.order_id;
        if (orderId) {
          await supabase
            .from("orders")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("order_number", orderId);
        }
        console.log("[MoneyMotion Webhook] Checkout cancelled for order:", orderId);
        break;
      }

      default:
        console.log("[MoneyMotion Webhook] Unknown event:", payload.event);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("[MoneyMotion Webhook] Error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
