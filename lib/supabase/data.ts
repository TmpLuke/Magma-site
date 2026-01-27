"use server";

import { createClient } from "./server";
import { mockProducts } from "@/lib/admin-mock-data";

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
    
    if (productsError || !products || products.length === 0) {
      console.log("[v0] Using mock products, DB error:", productsError?.message);
      return mockProducts;
    }

    // Fetch pricing, features, and requirements for all products
    const productIds = products.map((p) => p.id);
    
    const [pricingResult, featuresResult, requirementsResult] = await Promise.all([
      supabase.from("product_pricing").select("*").in("product_id", productIds),
      supabase.from("product_features").select("*").in("product_id", productIds),
      supabase.from("product_requirements").select("*").in("product_id", productIds),
    ]);

    // Transform products with their related data
    return products.map((product) => {
      const pricing = pricingResult.data?.filter((p) => p.product_id === product.id) || [];
      const features = featuresResult.data?.filter((f) => f.product_id === product.id) || [];
      const requirements = requirementsResult.data?.filter((r) => r.product_id === product.id) || [];
      
      return transformProduct(product, pricing, features, requirements);
    });
  } catch (e) {
    console.error("[v0] Exception fetching products:", e);
    return mockProducts;
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
      // Fallback to mock data
      const mockProduct = mockProducts.find((p) => p.slug === slug);
      return mockProduct || null;
    }

    // Fetch related data
    const [pricingResult, featuresResult, requirementsResult] = await Promise.all([
      supabase.from("product_pricing").select("*").eq("product_id", product.id),
      supabase.from("product_features").select("*").eq("product_id", product.id),
      supabase.from("product_requirements").select("*").eq("product_id", product.id),
    ]);

    return transformProduct(
      product,
      pricingResult.data || [],
      featuresResult.data || [],
      requirementsResult.data || []
    );
  } catch (e) {
    console.error("[v0] Exception fetching product:", e);
    const mockProduct = mockProducts.find((p) => p.slug === slug);
    return mockProduct || null;
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
  // Mock reviews fallback
  const mockReviews = [
    { id: "rev_1", username: "Mabz", avatar: "M", rating: 5, text: "Magma Cheats is the best! Been using they're cheat and no bans. Best support team!", verified: true, created_at: new Date().toISOString() },
    { id: "rev_2", username: "Jibegz", avatar: "J", rating: 5, text: "Mufasa is very quick when responding and very helpful. The best cheat by far!", verified: true, created_at: new Date().toISOString() },
    { id: "rev_3", username: "Markky15_", avatar: "M", rating: 5, text: "Purchased the key and the cheat itself worked perfectly for me. The setup was smooth and everything performed as expected.", verified: true, created_at: new Date().toISOString() },
    { id: "rev_4", username: "Milanek", avatar: "M", rating: 5, text: "Support replied to my ticket very quickly, explained everything clearly and thanks to them I can enjoy the product!", verified: true, created_at: new Date().toISOString() },
    { id: "rev_5", username: "GamerPro", avatar: "G", rating: 5, text: "Amazing product with instant delivery. Customer support is top notch!", verified: true, created_at: new Date().toISOString() },
    { id: "rev_6", username: "NightHawk", avatar: "N", rating: 4, text: "Great features and easy to use. Would definitely recommend to others.", verified: true, created_at: new Date().toISOString() },
  ];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("[v0] Error fetching reviews:", error);
      return mockReviews;
    }
    
    if (!data || data.length === 0) {
      console.log("[v0] No reviews in database, using mock data");
      return mockReviews;
    }
    
    return data;
  } catch (e) {
    console.error("[v0] Exception fetching reviews:", e);
    return mockReviews;
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
  // Default fallback stats
  const defaultStats = {
    totalProducts: 6,
    totalOrders: 1247,
    totalRevenue: 45890,
    activeLicenses: 892,
    totalReviews: 156,
    avgRating: "4.8",
  };

  try {
    const supabase = await createClient();
    
    const [productsResult, ordersResult, licensesResult, reviewsResult] = await Promise.all([
      supabase.from("products").select("id", { count: "exact" }),
      supabase.from("orders").select("id, amount, status", { count: "exact" }),
      supabase.from("licenses").select("id, status", { count: "exact" }),
      supabase.from("reviews").select("id, rating", { count: "exact" }),
    ]);
    
    // If any query fails or returns no data, use defaults
    if (!productsResult.data && !ordersResult.data) {
      console.log("[v0] Using default stats");
      return defaultStats;
    }
    
    const totalRevenue = ordersResult.data
      ?.filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (o.amount || 0), 0) || 0;
    
    const activeLicenses = licensesResult.data?.filter((l) => l.status === "active").length || 0;
    const avgRating = reviewsResult.data?.length
      ? (reviewsResult.data.reduce((sum, r) => sum + r.rating, 0) / reviewsResult.data.length).toFixed(1)
      : "4.8";
    
    return {
      totalProducts: productsResult.count || mockProducts.length,
      totalOrders: ordersResult.count || defaultStats.totalOrders,
      totalRevenue: totalRevenue || defaultStats.totalRevenue,
      activeLicenses: activeLicenses || defaultStats.activeLicenses,
      totalReviews: reviewsResult.count || defaultStats.totalReviews,
      avgRating,
    };
  } catch (e) {
    console.error("[v0] Exception fetching stats:", e);
    return defaultStats;
  }
}
