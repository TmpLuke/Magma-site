"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================================
// PRODUCTS
// ============================================================================

export async function getProductsFromDB() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin] Error fetching products:", error);
    return { success: false, error: error.message, data: [] };
  }
  return { success: true, data: data || [] };
}

export async function createProductInDB(product: {
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: string;
  pricing: { duration: string; price: number; stock: number }[];
  features: { aimbot: string[]; esp: string[]; misc: string[] };
  requirements: { cpu: string; windows: string; cheatType: string; controller: boolean };
  gallery?: string[];
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      slug: product.slug,
      game: product.game,
      description: product.description,
      image: product.image,
      status: product.status,
      pricing: product.pricing,
      features: product.features,
      requirements: product.requirements,
      gallery: product.gallery || [],
    })
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error creating product:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/products");
  revalidatePath("/store");
  return { success: true, data };
}

export async function updateProductInDB(
  id: string,
  updates: Partial<{
    name: string;
    slug: string;
    game: string;
    description: string;
    image: string;
    status: string;
    pricing: { duration: string; price: number; stock: number }[];
    features: { aimbot: string[]; esp: string[]; misc: string[] };
    requirements: { cpu: string; windows: string; cheatType: string; controller: boolean };
    gallery?: string[];
  }>
) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error updating product:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/products");
  revalidatePath("/store");
  return { success: true, data };
}

export async function deleteProductFromDB(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[Admin] Error deleting product:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/products");
  revalidatePath("/store");
  return { success: true };
}

// ============================================================================
// ORDERS
// ============================================================================

export async function getOrdersFromDB() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin] Error fetching orders:", error);
    return { success: false, error: error.message, data: [] };
  }
  return { success: true, data: data || [] };
}

export async function updateOrderStatusInDB(id: string, status: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error updating order status:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/orders");
  return { success: true, data };
}

export async function createOrderInDB(order: {
  order_number: string;
  customer_email: string;
  product_id?: string;
  product_name: string;
  duration: string;
  amount: number;
  status: string;
  payment_method: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("orders")
    .insert(order)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error creating order:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/orders");
  return { success: true, data };
}

// ============================================================================
// LICENSES
// ============================================================================

export async function getLicensesFromDB() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("licenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin] Error fetching licenses:", error);
    return { success: false, error: error.message, data: [] };
  }
  return { success: true, data: data || [] };
}

export async function createLicenseInDB(license: {
  license_key: string;
  product_id?: string;
  product_name: string;
  customer_email: string;
  status: string;
  expires_at?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("licenses")
    .insert(license)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error creating license:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/licenses");
  return { success: true, data };
}

export async function updateLicenseStatusInDB(id: string, status: string, hwid?: string) {
  const supabase = await createClient();
  
  const updates: { status: string; updated_at: string; hwid?: string | null } = { 
    status, 
    updated_at: new Date().toISOString() 
  };
  
  // If resetting HWID, clear it
  if (hwid === null) {
    updates.hwid = null;
  }
  
  const { data, error } = await supabase
    .from("licenses")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error updating license:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/licenses");
  return { success: true, data };
}

export async function revokeLicenseInDB(id: string) {
  return updateLicenseStatusInDB(id, "revoked");
}

// ============================================================================
// COUPONS
// ============================================================================

export async function getCouponsFromDB() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin] Error fetching coupons:", error);
    return { success: false, error: error.message, data: [] };
  }
  return { success: true, data: data || [] };
}

export async function createCouponInDB(coupon: {
  code: string;
  discount_percent: number;
  max_uses?: number;
  valid_until?: string;
  is_active: boolean;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("coupons")
    .insert(coupon)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error creating coupon:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/coupons");
  return { success: true, data };
}

export async function updateCouponInDB(id: string, updates: Partial<{
  code: string;
  discount_percent: number;
  max_uses: number;
  is_active: boolean;
  valid_until: string;
}>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("coupons")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error updating coupon:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/coupons");
  return { success: true, data };
}

export async function deleteCouponFromDB(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("coupons")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[Admin] Error deleting coupon:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/coupons");
  return { success: true };
}

// ============================================================================
// WEBHOOKS
// ============================================================================

export async function getWebhooksFromDB() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin] Error fetching webhooks:", error);
    return { success: false, error: error.message, data: [] };
  }
  return { success: true, data: data || [] };
}

export async function createWebhookInDB(webhook: {
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("webhooks")
    .insert(webhook)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error creating webhook:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/webhooks");
  return { success: true, data };
}

export async function updateWebhookInDB(id: string, updates: Partial<{
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
}>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("webhooks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error updating webhook:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/webhooks");
  return { success: true, data };
}

export async function deleteWebhookFromDB(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("webhooks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[Admin] Error deleting webhook:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/webhooks");
  return { success: true };
}

// ============================================================================
// TEAM MEMBERS
// ============================================================================

export async function getTeamMembersFromDB() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin] Error fetching team members:", error);
    return { success: false, error: error.message, data: [] };
  }
  return { success: true, data: data || [] };
}

export async function createTeamMemberInDB(member: {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("team_members")
    .insert(member)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error creating team member:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/team");
  return { success: true, data };
}

export async function updateTeamMemberInDB(id: string, updates: Partial<{
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}>) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("team_members")
    .update({ ...updates, last_active: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error updating team member:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/team");
  return { success: true, data };
}

export async function deleteTeamMemberFromDB(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[Admin] Error deleting team member:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin/team");
  return { success: true };
}

// ============================================================================
// REVIEWS
// ============================================================================

export async function getReviewsFromDB() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Admin] Error fetching reviews:", error);
    return { success: false, error: error.message, data: [] };
  }
  return { success: true, data: data || [] };
}

export async function deleteReviewFromDB(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[Admin] Error deleting review:", error);
    return { success: false, error: error.message };
  }
  
  revalidatePath("/admin");
  return { success: true };
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export async function getDashboardStats() {
  const supabase = await createClient();
  
  try {
    const [productsResult, ordersResult, licensesResult, reviewsResult] = await Promise.all([
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("orders").select("id, amount, status", { count: "exact" }),
      supabase.from("licenses").select("id, status", { count: "exact" }),
      supabase.from("reviews").select("id, rating", { count: "exact" }),
    ]);

    const completedOrders = ordersResult.data?.filter(o => o.status === "completed") || [];
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const activeLicenses = licensesResult.data?.filter(l => l.status === "active").length || 0;
    const avgRating = reviewsResult.data?.length
      ? (reviewsResult.data.reduce((sum, r) => sum + r.rating, 0) / reviewsResult.data.length).toFixed(1)
      : "5.0";

    return {
      success: true,
      data: {
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue,
        activeLicenses,
        totalReviews: reviewsResult.count || 0,
        avgRating,
        // Calculate changes (would need historical data for real implementation)
        revenueChange: "+12.5%",
        ordersChange: "+8.2%",
        usersChange: "+15.3%",
        licensesChange: "+5.7%",
      },
    };
  } catch (error) {
    console.error("[Admin] Error fetching dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch stats",
      data: {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeLicenses: 0,
        totalReviews: 0,
        avgRating: "0",
        revenueChange: "0%",
        ordersChange: "0%",
        usersChange: "0%",
        licensesChange: "0%",
      },
    };
  }
}
