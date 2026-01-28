"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";

export async function createProduct(data: {
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: string;
  provider: string;
  features: string[];
  requirements: string[];
  gallery?: string[];
}) {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();
    
    const { error } = await supabase.from("products").insert({
      name: data.name,
      slug: data.slug,
      game: data.game,
      description: data.description || null,
      image: data.image || null,
      status: data.status,
      provider: data.provider,
      features: data.features,
      requirements: data.requirements,
      gallery: data.gallery || [],
    });

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/products");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Create product error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, data: {
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: string;
  provider: string;
  features: string[];
  requirements: string[];
  gallery?: string[];
}) {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("products")
      .update({
        name: data.name,
        slug: data.slug,
        game: data.game,
        description: data.description || null,
        image: data.image || null,
        status: data.status,
        provider: data.provider,
        features: data.features,
        requirements: data.requirements,
        gallery: data.gallery || [],
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/products");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Update product error:", error);
    return { success: false, error: error.message };
  }
}

export interface ProductBlockers {
  orders: { id: string; order_number: string; customer_email: string; product_name: string; duration: string; amount: number; status: string; created_at: string }[];
  licenses: { id: string; license_key: string; product_name: string; customer_email: string; status: string; created_at: string }[];
}

export async function getOrdersAndLicensesForProduct(
  productId: string
): Promise<{ success: boolean; error?: string; data?: ProductBlockers }> {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();
    const [ordersRes, licensesRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, customer_email, product_name, duration, amount, status, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false }),
      supabase
        .from("licenses")
        .select("id, license_key, product_name, customer_email, status, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false }),
    ]);
    if (ordersRes.error) throw ordersRes.error;
    if (licensesRes.error) throw licensesRes.error;
    const orders = (ordersRes.data ?? []).map((o) => ({ ...o, amount: Number(o.amount) }));
    return { success: true, data: { orders, licenses: licensesRes.data ?? [] } };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] getOrdersAndLicensesForProduct error:", e);
    return { success: false, error: err?.message ?? "Failed to load." };
  }
}

export async function deleteProduct(id: string) {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();

    const { count: orderCount, error: orderErr } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);
    if (orderErr) throw orderErr;
    const { count: licenseCount, error: licenseErr } = await supabase
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);
    if (licenseErr) throw licenseErr;

    if ((orderCount ?? 0) > 0 || (licenseCount ?? 0) > 0) {
      return {
        success: false,
        error: "This product has orders or licenses. Use Force delete in the delete modal to remove it anyway (orders/licenses will be unlinked).",
      };
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/mgmt-x9k2m7/products");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Delete product error:", error);
    return { success: false, error: error.message };
  }
}

export async function forceDeleteProduct(id: string) {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();

    await supabase.from("orders").update({ product_id: null }).eq("product_id", id);
    await supabase.from("licenses").update({ product_id: null }).eq("product_id", id);

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/mgmt-x9k2m7/products");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Force delete product error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleProductStatus(id: string, currentStatus: string) {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("products")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/mgmt-x9k2m7/products");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Toggle product status error:", error);
    return { success: false, error: error.message };
  }
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  duration: string;
  price: number;
  stock: number;
  created_at: string;
}

export async function getVariantsForProduct(
  productId: string
): Promise<{ success: boolean; error?: string; data?: ProductVariantRow[] }> {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("product_pricing")
      .select("id, product_id, duration, price, stock, created_at")
      .eq("product_id", productId)
      .order("duration");
    if (error) throw error;
    const rows = (data ?? []).map((r) => ({ ...r, price: Number(r.price), stock: Number(r.stock ?? 0) }));
    return { success: true, data: rows };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? ""))
      return { success: false, error: "You don't have permission." };
    console.error("[Admin] getVariantsForProduct error:", e);
    return { success: false, error: err?.message ?? "Failed to load variants." };
  }
}

export async function createVariant(data: {
  product_id: string;
  duration: string;
  price: number;
  stock?: number;
}) {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();
    const { error } = await supabase.from("product_pricing").insert({
      product_id: data.product_id,
      duration: (data.duration || "").trim() || "1 Day",
      price: Number(data.price) || 0,
      stock: Number(data.stock ?? 0) || 0,
    });
    if (error) throw error;
    revalidatePath("/mgmt-x9k2m7/products");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? ""))
      return { success: false, error: "You don't have permission." };
    console.error("[Admin] createVariant error:", e);
    return { success: false, error: err?.message ?? "Failed to add variant." };
  }
}

export async function updateVariant(
  id: string,
  data: { duration?: string; price?: number; stock?: number }
) {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();
    const payload: Record<string, unknown> = {};
    if (data.duration !== undefined) payload.duration = data.duration.trim() || "1 Day";
    if (data.price !== undefined) payload.price = Number(data.price);
    if (data.stock !== undefined) payload.stock = Number(data.stock);
    if (Object.keys(payload).length === 0) return { success: true };
    const { error } = await supabase.from("product_pricing").update(payload).eq("id", id);
    if (error) throw error;
    revalidatePath("/mgmt-x9k2m7/products");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? ""))
      return { success: false, error: "You don't have permission." };
    console.error("[Admin] updateVariant error:", e);
    return { success: false, error: err?.message ?? "Failed to update variant." };
  }
}

export async function deleteVariant(id: string) {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();
    const { error } = await supabase.from("product_pricing").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/mgmt-x9k2m7/products");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? ""))
      return { success: false, error: "You don't have permission." };
    console.error("[Admin] deleteVariant error:", e);
    return { success: false, error: err?.message ?? "Failed to delete variant." };
  }
}
