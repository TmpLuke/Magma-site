"use server";

import { createClient } from "@/lib/supabase/server";

// Product Actions
export async function createProductInDB(data: {
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: string;
  pricing: Record<string, number>;
  features: string[];
  requirements: string[];
  gallery: string[];
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").insert({
      name: data.name,
      slug: data.slug,
      game: data.game,
      description: data.description,
      image: data.image,
      provider: "Magma",
      status: data.status,
      features: data.features,
      requirements: data.requirements,
    });

    if (error) {
      console.error("[Admin] Create product error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Create product exception:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProductInDB(id: string, updates: {
  name?: string;
  slug?: string;
  game?: string;
  description?: string;
  image?: string;
  status?: string;
  features?: string[];
  requirements?: string[];
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("[Admin] Update product error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Update product exception:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProductFromDB(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("[Admin] Delete product error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Delete product exception:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

// Order Actions
export async function updateOrderStatusInDB(id: string, status: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[Admin] Update order error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Update order exception:", error);
    return { success: false, error: "Failed to update order" };
  }
}

// License Actions
export async function createLicenseInDB(data: {
  license_key: string;
  product_id: string;
  product_name: string;
  customer_email: string;
  status: string;
  expires_at?: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("licenses").insert(data);

    if (error) {
      console.error("[Admin] Create license error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Create license exception:", error);
    return { success: false, error: "Failed to create license" };
  }
}

export async function updateLicenseStatusInDB(id: string, status: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("licenses")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[Admin] Update license error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Update license exception:", error);
    return { success: false, error: "Failed to update license" };
  }
}

export async function revokeLicenseInDB(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("licenses")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[Admin] Revoke license error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Revoke license exception:", error);
    return { success: false, error: "Failed to revoke license" };
  }
}

// Coupon Actions
export async function createCouponInDB(data: {
  code: string;
  discount_percent: number;
  max_uses: number | null;
  valid_until?: string;
  is_active: boolean;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("coupons").insert(data);

    if (error) {
      console.error("[Admin] Create coupon error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Create coupon exception:", error);
    return { success: false, error: "Failed to create coupon" };
  }
}

export async function updateCouponInDB(id: string, updates: {
  discount_percent?: number;
  max_uses?: number | null;
  is_active?: boolean;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("coupons")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("[Admin] Update coupon error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Update coupon exception:", error);
    return { success: false, error: "Failed to update coupon" };
  }
}

export async function deleteCouponFromDB(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      console.error("[Admin] Delete coupon error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Delete coupon exception:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}

// Webhook Actions
export async function createWebhookInDB(data: {
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("webhooks").insert(data);

    if (error) {
      console.error("[Admin] Create webhook error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Create webhook exception:", error);
    return { success: false, error: "Failed to create webhook" };
  }
}

export async function updateWebhookInDB(id: string, updates: {
  name?: string;
  url?: string;
  events?: string[];
  is_active?: boolean;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("webhooks")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("[Admin] Update webhook error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Update webhook exception:", error);
    return { success: false, error: "Failed to update webhook" };
  }
}

export async function deleteWebhookFromDB(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("webhooks").delete().eq("id", id);

    if (error) {
      console.error("[Admin] Delete webhook error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Delete webhook exception:", error);
    return { success: false, error: "Failed to delete webhook" };
  }
}

// Team Member Actions
export async function createTeamMemberInDB(data: {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("team_members").insert(data);

    if (error) {
      console.error("[Admin] Create team member error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Create team member exception:", error);
    return { success: false, error: "Failed to create team member" };
  }
}

export async function updateTeamMemberInDB(id: string, updates: {
  name?: string;
  email?: string;
  role?: string;
}) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("team_members")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("[Admin] Update team member error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Update team member exception:", error);
    return { success: false, error: "Failed to update team member" };
  }
}

export async function deleteTeamMemberFromDB(id: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("team_members").delete().eq("id", id);

    if (error) {
      console.error("[Admin] Delete team member error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("[Admin] Delete team member exception:", error);
    return { success: false, error: "Failed to delete team member" };
  }
}
