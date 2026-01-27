import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Payment webhook handler
// This endpoint receives callbacks when payment status changes

interface PaymentWebhookPayload {
  event: "payment.completed" | "payment.expired" | "payment.cancelled" | "payment.pending";
  invoice_id?: number;
  payment_id?: string;
  order_number?: string;
  external_id?: string;
  amount_cents?: number;
  currency?: string;
  paid_at?: string;
  customer_email?: string;
}

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
    const payload: PaymentWebhookPayload = await request.json();
    const supabase = await createClient();

    console.log("[Webhook] Payment event received:", payload.event);

    switch (payload.event) {
      case "payment.completed": {
        // Find the order by order_number or external_id
        const orderIdentifier = payload.order_number || payload.external_id;
        if (!orderIdentifier) {
          console.error("[Webhook] No order identifier provided");
          return NextResponse.json({ error: "Missing order identifier" }, { status: 400 });
        }

        // Get the order
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .select("*, products:product_id(slug)")
          .eq("order_number", orderIdentifier)
          .single();

        if (orderError || !order) {
          console.error("[Webhook] Order not found:", orderIdentifier);
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

        // Generate license key if not already created
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

        console.log("[Webhook] Payment completed for order:", order.order_number);
        break;
      }

      case "payment.expired": {
        const orderIdentifier = payload.order_number || payload.external_id;
        if (orderIdentifier) {
          await supabase
            .from("orders")
            .update({ status: "expired", updated_at: new Date().toISOString() })
            .eq("order_number", orderIdentifier);
        }
        console.log("[Webhook] Payment expired for order:", orderIdentifier);
        break;
      }

      case "payment.cancelled": {
        const orderIdentifier = payload.order_number || payload.external_id;
        if (orderIdentifier) {
          await supabase
            .from("orders")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("order_number", orderIdentifier);
        }
        console.log("[Webhook] Payment cancelled for order:", orderIdentifier);
        break;
      }

      default:
        console.log("[Webhook] Unknown event:", payload.event);
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
