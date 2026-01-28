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

export async function deleteProduct(id: string) {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();

    // Check for orders referencing this product
    const { count: orderCount, error: orderErr } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    if (orderErr) throw orderErr;
    if (orderCount != null && orderCount > 0) {
      return {
        success: false,
        error: "Cannot delete this product because it has existing orders. Set status to Inactive to hide it from the store instead.",
      };
    }

    // Check for licenses referencing this product
    const { count: licenseCount, error: licenseErr } = await supabase
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);

    if (licenseErr) throw licenseErr;
    if (licenseCount != null && licenseCount > 0) {
      return {
        success: false,
        error: "Cannot delete this product because it has linked license keys. Remove or reassign licenses first, or set status to Inactive instead.",
      };
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

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
