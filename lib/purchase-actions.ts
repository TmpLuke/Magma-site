"use server";

import { createClient } from "@/lib/supabase/server";

// Generate order number
function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const orderNum = Math.floor(Math.random() * 9000) + 1000;
  return `MC-${year}-${orderNum}`;
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
    
    // Create MoneyMotion checkout session
    const apiKey = process.env.MONEYMOTION_API_KEY;
    
    if (!apiKey) {
      console.error("[Purchase] MoneyMotion API key not configured");
      await supabase.from("orders").delete().eq("id", order.id);
      return { success: false, error: "Payment system not configured" };
    }
    
    // Real MoneyMotion integration
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      
      console.log("[Purchase DEBUG] Starting MoneyMotion checkout");
      console.log("[Purchase DEBUG] Base URL:", baseUrl);
      console.log("[Purchase DEBUG] Order details:", {
        orderNumber,
        orderId: order.id,
        productName: data.productName,
        duration: data.duration,
        finalPrice,
        customerEmail: data.customerEmail,
      });
      
      const { createCheckoutSession } = await import("@/lib/moneymotion");
      
      const checkoutParams = {
        description: `${data.productName} - ${data.duration}`,
        successUrl: `${baseUrl}/payment/success?order=${orderNumber}`,
        cancelUrl: `${baseUrl}/payment/cancelled?order=${orderNumber}`,
        failureUrl: `${baseUrl}/payment/cancelled?order=${orderNumber}`,
        customerEmail: data.customerEmail,
        lineItems: [
          {
            name: data.productName,
            description: `${data.productName} - ${data.duration}`,
            pricePerItemInCents: Math.round(finalPrice * 100),
            quantity: 1,
          },
        ],
      };
      
      console.log("[Purchase DEBUG] Checkout params:", JSON.stringify(checkoutParams, null, 2));
      
      const result = await createCheckoutSession(checkoutParams);
      
      console.log("[Purchase DEBUG] Checkout result:", JSON.stringify(result, null, 2));
      
      if (!result.success || !result.checkoutSessionId) {
        console.error("[Purchase DEBUG] Checkout failed, deleting order");
        await supabase.from("orders").delete().eq("id", order.id);
        return {
          success: false,
          error: result.error || "Failed to create checkout session",
        };
      }
      
      console.log("[Purchase DEBUG] Updating order with payment method");
      await supabase.from("orders").update({
        payment_method: "moneymotion",
      }).eq("id", order.id);
      
      console.log("[Purchase DEBUG] Checkout successful, returning URL:", result.checkoutUrl);
      
      return {
        success: true,
        orderId: order.id,
        orderNumber,
        checkoutUrl: result.checkoutUrl,
        sessionId: result.checkoutSessionId,
      };
    } catch (error) {
      console.error("[Purchase DEBUG] Exception in MoneyMotion integration:", error);
      console.error("[Purchase DEBUG] Exception stack:", error instanceof Error ? error.stack : "No stack");
      await supabase.from("orders").delete().eq("id", order.id);
      return {
        success: false,
        error: `Exception: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
    
  } catch (error) {
    console.error("[Purchase] Error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

// Validate coupon code
export async function validateCoupon(code: string): Promise<{
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
