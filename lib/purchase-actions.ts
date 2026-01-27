"use server";

import { createClient } from "@/lib/supabase/server";

// Generate a unique license key
function generateLicenseKey(productSlug: string, duration: string): string {
  const prefix = productSlug.slice(0, 4).toUpperCase();
  const durationCode = duration.includes("Lifetime") ? "LT" : duration.includes("30") ? "30D" : duration.includes("7") ? "7D" : "1D";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const randomPart = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const randomPart2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `MGMA-${prefix}-${durationCode}-${randomPart}-${randomPart2}`;
}

// Generate order number
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const orderNum = Math.floor(Math.random() * 9000) + 1000;
  return `MC-${year}-${orderNum}`;
}

// Calculate expiry date based on duration
function calculateExpiryDate(duration: string): Date {
  const now = new Date();
  if (duration.includes("Lifetime")) {
    return new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years
  } else if (duration.includes("30")) {
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (duration.includes("7")) {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  } else {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
  }
}

export interface PurchaseData {
  productId: string;
  productName: string;
  productSlug: string;
  duration: string;
  price: number;
  customerEmail: string;
  couponCode?: string;
}

export interface PurchaseResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  licenseKey?: string;
  checkoutUrl?: string;
  sessionId?: string;
  error?: string;
}

// Main purchase function - Creates checkout session for card payment
export async function processPurchase(data: PurchaseData): Promise<PurchaseResult> {
  try {
    const supabase = await createClient();
    
    // Look up the real product UUID by slug (in case mock data ID was passed)
    let realProductId = data.productId;
    
    // Check if the productId is not a valid UUID (mock ID like "prod_14")
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(data.productId)) {
      // Look up by slug to get real UUID
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("id")
        .eq("slug", data.productSlug)
        .single();
      
      if (productError || !product) {
        console.error("[Purchase] Product not found by slug:", data.productSlug, productError);
        return { success: false, error: "Product not found" };
      }
      
      realProductId = product.id;
    }
    
    // Generate order number
    const orderNumber = generateOrderNumber();
    
    // Calculate discount if coupon is provided
    let discount = 0;
    if (data.couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", data.couponCode.toUpperCase())
        .eq("is_active", true)
        .single();
      
      if (coupon) {
        discount = (data.price * coupon.discount_percent) / 100;
        
        // Update coupon usage count
        await supabase
          .from("coupons")
          .update({ current_uses: (coupon.current_uses || 0) + 1 })
          .eq("id", coupon.id);
      }
    }
    
    const finalPrice = data.price - discount;
    
    // Create the order as pending (will be completed after payment)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_email: data.customerEmail,
        product_id: realProductId,
        product_name: data.productName,
        duration: data.duration,
        amount: finalPrice,
        status: "pending",
        payment_method: "card",
      })
      .select()
      .single();
    
    if (orderError) {
      console.error("[Purchase] Order creation error:", orderError);
      return { success: false, error: "Failed to create order" };
    }
    
    // Create Money Motion checkout session
    const apiKey = process.env.MONEYMOTION_API_KEY;
    
    if (!apiKey) {
      // Mock mode - redirect to our own checkout page
      const mockSessionId = `mm_sess_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      await supabase.from("orders").update({
        payment_method: "moneymotion",
      }).eq("id", order.id);
      
      const checkoutUrl = `/payment/checkout?session=${mockSessionId}&order=${orderNumber}`;
      
      return {
        success: true,
        orderId: order.id,
        orderNumber,
        checkoutUrl,
        sessionId: mockSessionId,
      };
    }
    
    // Real MoneyMotion API integration
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      
      const moneyMotionResponse = await fetch("https://api.moneymotion.io/createCheckoutSession", {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: finalPrice,
          currency: "USD",
          customer_email: data.customerEmail,
          description: `${data.productName} - ${data.duration}`,
          metadata: {
            order_id: orderNumber,
            product_id: realProductId,
            license_duration: data.duration,
          },
          success_url: `${baseUrl}/payment/success?order=${orderNumber}`,
          cancel_url: `${baseUrl}/payment/cancelled?order=${orderNumber}`,
        }),
      });
      
      if (!moneyMotionResponse.ok) {
        const errorText = await moneyMotionResponse.text();
        console.error("[Purchase] MoneyMotion API error:", moneyMotionResponse.status, errorText);
        
        // Clean up the pending order
        await supabase.from("orders").delete().eq("id", order.id);
        
        return { 
          success: false, 
          error: `Payment service error: ${moneyMotionResponse.status}` 
        };
      }
      
      const moneyMotionResult = await moneyMotionResponse.json();
      
      if (!moneyMotionResult.success || !moneyMotionResult.sessionId || !moneyMotionResult.checkoutUrl) {
        // Clean up the pending order
        await supabase.from("orders").delete().eq("id", order.id);
        
        return { 
          success: false, 
          error: moneyMotionResult.error || "Failed to create checkout session" 
        };
      }
      
      // Update order with session ID
      await supabase.from("orders").update({
        payment_method: "moneymotion",
      }).eq("id", order.id);
      
      return {
        success: true,
        orderId: order.id,
        orderNumber,
        checkoutUrl: moneyMotionResult.checkoutUrl, // This will be like: https://moneymotion.io/checkout/SESSION_ID
        sessionId: moneyMotionResult.sessionId,
      };
      
    } catch (error) {
      console.error("[Purchase] MoneyMotion error:", error);
      
      // Clean up the pending order
      await supabase.from("orders").delete().eq("id", order.id);
      
      return { 
        success: false, 
        error: "Failed to create checkout session" 
      };
    }
    
  } catch (error) {
    console.error("[Purchase] Error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Email sending function (stores in database and triggers email send)
async function sendPurchaseEmail(data: {
  customerEmail: string;
  orderNumber: string;
  productName: string;
  duration: string;
  licenseKey: string;
  expiresAt: Date;
  totalPaid: number;
  orderId?: string;
}) {
  try {
    const supabase = await createClient();
    
    // Store email in outbound_emails table
    const { error } = await supabase
      .from("outbound_emails")
      .insert({
        order_id: data.orderId || null,
        to_email: data.customerEmail,
        subject: `Your Magma Cheats Order - ${data.orderNumber}`,
        template: "purchase_confirmation",
        template_data: {
          orderNumber: data.orderNumber,
          productName: data.productName,
          duration: data.duration,
          licenseKey: data.licenseKey,
          expiresAt: data.expiresAt.toISOString(),
          totalPaid: data.totalPaid.toFixed(2),
        },
        status: "pending",
      });
    
    if (error) {
      console.log("[Email] Could not queue email:", error.message);
      return false;
    }
    
    // Trigger email processing immediately (fire and forget)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : "http://localhost:3000";
      
      fetch(`${baseUrl}/api/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {
        // Silently fail - email will be processed by next cron job or manual trigger
      });
    } catch {
      // Ignore errors in triggering - email is queued and will be processed
    }
    
    return true;
  } catch (error) {
    console.error("[Email] Error queueing email:", error);
    return false;
  }
}

// Validate coupon code
export async function validateCoupon(code: string, productId?: string): Promise<{
  valid: boolean;
  discount?: number;
  type?: "percentage" | "fixed";
  message?: string;
}> {
  try {
    const supabase = await createClient();
    
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();
    
    if (error || !coupon) {
      return { valid: false, message: "Invalid coupon code" };
    }
    
    // Check if coupon has reached max uses
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return { valid: false, message: "Coupon has been fully redeemed" };
    }
    
    // Check expiry
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return { valid: false, message: "Coupon has expired" };
    }
    
    return {
      valid: true,
      discount: coupon.discount_percent,
      type: "percentage",
    };
    
  } catch (error) {
    console.error("[Coupon] Validation error:", error);
    return { valid: false, message: "Error validating coupon" };
  }
}

// Get order status
export async function getOrderStatus(orderNumber: string): Promise<{
  found: boolean;
  status?: string;
  licenseKey?: string;
}> {
  try {
    const supabase = await createClient();
    
    const { data: order } = await supabase
      .from("orders")
      .select("status, customer_email")
      .eq("order_number", orderNumber)
      .single();
    
    if (!order) {
      return { found: false };
    }
    
    // Get associated license
    const { data: license } = await supabase
      .from("licenses")
      .select("license_key")
      .eq("customer_email", order.customer_email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    return {
      found: true,
      status: order.status,
      licenseKey: license?.license_key,
    };
    
  } catch (error) {
    console.error("[Order] Status check error:", error);
    return { found: false };
  }
}
