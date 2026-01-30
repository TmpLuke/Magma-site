"use server";

import { createClient } from "./server";

// Helper to transform database product with related data
function transformProduct(product: any, pricing: any[], features: any[], requirements: any[]) {
  // Group features by category
  const featuresByCategory: { aimbot: string[]; esp: string[]; misc: string[] } = {
    aimbot: [],
    esp: [],
    misc: [],
  };
  
  features.forEach((f) => {
    if (!f || !f.name) return;
    const category = f.category?.toLowerCase() || "misc";
    if (category === "aimbot") featuresByCategory.aimbot.push(f.name);
    else if (category === "esp" || category === "visuals") featuresByCategory.esp.push(f.name);
    else featuresByCategory.misc.push(f.name);
  });

  // Transform requirements
  const req = requirements[0] || {};
  
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    game: product.game,
    description: product.description,
    image: product.image || `/images/${product.slug}.jpg`,
    status: product.status,
    pricing: pricing.map((p) => ({
      duration: p.duration,
      price: p.price,
      stock: p.stock ?? 100,
    })),
    features: featuresByCategory,
    requirements: {
      cpu: req.cpu || "Intel/AMD",
      windows: req.windows || "Windows 10/11",
      cheatType: req.cheat_type || "External",
      controller: req.controller ?? false,
    },
    gallery: product.gallery || [],
  };
}

// Products
export async function getProducts() {
  try {
    const supabase = await createClient();
    
    // Fetch all products with their related data
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .order("name");
    
    if (productsError) {
      console.error("[Products] Database error:", productsError.message);
      return [];
    }

    if (!products || products.length === 0) {
      // No products yet - return empty array (admin will add products)
      return [];
    }

    // Fetch pricing, features, requirements, and stock for all products
    const productIds = products.map((p) => p.id);
    
    const [pricingResult, featuresResult, requirementsResult, stockResult] = await Promise.all([
      supabase.from("product_pricing").select("*").in("product_id", productIds),
      supabase.from("product_features").select("*").in("product_id", productIds),
      supabase.from("product_requirements").select("*").in("product_id", productIds),
      supabase.from("licenses").select("product_id, variant_id").in("product_id", productIds).eq("status", "unused"),
    ]);

    // Calculate stock counts
    const stockMap = new Map<string, number>(); // variant_id -> count
    if (stockResult.data) {
      stockResult.data.forEach((l) => {
        if (l.variant_id) {
          stockMap.set(l.variant_id, (stockMap.get(l.variant_id) || 0) + 1);
        }
      });
    }

    // Transform products with their related data
    return products.map((product) => {
      let pricing = pricingResult.data?.filter((p) => p.product_id === product.id) || [];
      
      // Inject real stock counts
      pricing = pricing.map(p => ({
        ...p,
        stock: stockMap.get(p.id) || 0
      }));

      const features = featuresResult.data?.filter((f) => f.product_id === product.id) || [];
      const requirements = requirementsResult.data?.filter((r) => r.product_id === product.id) || [];
      
      return transformProduct(product, pricing, features, requirements);
    });
  } catch (e) {
    console.error("[Products] Exception:", e);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const supabase = await createClient();
    
    // Fetch product by slug
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single();

    if (productError || !product) {
      return null;
    }

    // Fetch related data
    const [pricingResult, featuresResult, requirementsResult, stockResult] = await Promise.all([
      supabase.from("product_pricing").select("*").eq("product_id", product.id),
      supabase.from("product_features").select("*").eq("product_id", product.id),
      supabase.from("product_requirements").select("*").eq("product_id", product.id),
      supabase.from("licenses").select("variant_id").eq("product_id", product.id).eq("status", "unused"),
    ]);

    // Calculate stock counts
    const stockMap = new Map<string, number>();
    if (stockResult.data) {
      stockResult.data.forEach((l) => {
        if (l.variant_id) {
          stockMap.set(l.variant_id, (stockMap.get(l.variant_id) || 0) + 1);
        }
      });
    }

    let pricing = pricingResult.data || [];
    // Inject real stock counts
    pricing = pricing.map(p => ({
      ...p,
      stock: stockMap.get(p.id) || 0
    }));

    return transformProduct(
      product,
      pricing,
      featuresResult.data || [],
      requirementsResult.data || []
    );
  } catch (e) {
    console.error("[Products] Exception fetching product:", e);
    return null;
  }
}

export async function createProduct(product: {
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: string;
  pricing: any;
  features: any;
  requirements: any;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    return null;
  }
  return data;
}

export async function updateProduct(id: string, updates: Partial<{
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: string;
  pricing: any;
  features: any;
  requirements: any;
}>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    return null;
  }
  return data;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    return false;
  }
  return true;
}

// Orders
export async function getOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
  return data;
}

export async function createOrder(order: {
  product_id: string;
  product_name: string;
  customer_email: string;
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
    console.error("Error creating order:", error);
    return null;
  }
  return data;
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating order status:", error);
    return null;
  }
  return data;
}

// Licenses
export async function getLicenses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("licenses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching licenses:", error);
    return [];
  }
  return data;
}

export async function createLicense(license: {
  license_key: string;
  product_id: string;
  product_name: string;
  customer_email: string;
  status: string;
  expires_at: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("licenses")
    .insert(license)
    .select()
    .single();

  if (error) {
    console.error("Error creating license:", error);
    return null;
  }
  return data;
}

// Coupons
export async function getCoupons() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
  return data;
}

export async function getCouponByCode(code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .single();

  if (error) {
    return null;
  }
  return data;
}

export async function createCoupon(coupon: {
  code: string;
  discount_percent: number;
  max_uses: number;
  expires_at?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert(coupon)
    .select()
    .single();

  if (error) {
    console.error("Error creating coupon:", error);
    return null;
  }
  return data;
}

// Reviews
export async function getReviews() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("[Reviews] Database error:", error.message || error);
      // Return empty array if table doesn't exist or other error
      return [];
    }
    
    // Return real reviews from database, or empty array if none exist
    return data || [];
  } catch (e) {
    console.error("[Reviews] Exception:", e);
    return [];
  }
}

export async function createReview(review: {
  username: string;
  avatar: string;
  rating: number;
  text: string;
  verified: boolean;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .insert(review)
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    return null;
  }
  return data;
}

// Team Members
export async function getTeamMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
  return data;
}

// Webhooks
export async function getWebhooks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("webhooks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching webhooks:", error);
    return [];
  }
  return data;
}

// Settings
export async function getSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
  return data;
}

export async function updateSettings(updates: Record<string, any>) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("settings").select("id").single();
  
  if (existing) {
    const { data, error } = await supabase
      .from("settings")
      .update(updates)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating settings:", error);
      return null;
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from("settings")
      .insert(updates)
      .select()
      .single();

    if (error) {
      console.error("Error creating settings:", error);
      return null;
    }
    return data;
  }
}

// Stats
export async function getStats() {
  try {
    const supabase = await createClient();
    
    const [productsResult, ordersResult, licensesResult, reviewsResult] = await Promise.all([
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("orders").select("id, amount, status", { count: "exact" }),
      supabase.from("licenses").select("id, status", { count: "exact" }),
      supabase.from("reviews").select("id, rating", { count: "exact" }),
    ]);
    
    const totalRevenue = ordersResult.data
      ?.filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (o.amount || 0), 0) || 0;
    
    const activeLicenses = licensesResult.data?.filter((l) => l.status === "active").length || 0;
    const avgRating = reviewsResult.data?.length
      ? (reviewsResult.data.reduce((sum, r) => sum + r.rating, 0) / reviewsResult.data.length).toFixed(1)
      : "0";
    
    return {
      totalProducts: productsResult.count || 0,
      totalOrders: ordersResult.count || 0,
      totalRevenue: totalRevenue,
      activeLicenses: activeLicenses,
      totalReviews: reviewsResult.count || 0,
      avgRating,
    };
  } catch (e) {
    console.error("[Stats] Exception:", e);
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      activeLicenses: 0,
      totalReviews: 0,
      avgRating: "0",
    };
  }
}
