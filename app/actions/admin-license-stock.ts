"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";

export async function addLicenseStock(data: {
  product_id: string;
  variant_id: string | null;
  license_keys: string[];
}) {
  try {
    await requirePermission("stock_keys");
    const supabase = createAdminClient();
    
    // Insert all license keys as "unused" stock
    const licenseRecords = data.license_keys.map(key => ({
      license_key: key.trim(),
      product_id: data.product_id,
      variant_id: data.variant_id,
      status: "unused",
      customer_email: "",
      product_name: "",
    }));

    const { error } = await supabase
      .from("licenses")
      .insert(licenseRecords);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/licenses");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Add license stock error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteLicenseStock(licenseId: string) {
  try {
    await requirePermission("stock_keys");
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("licenses")
      .delete()
      .eq("id", licenseId)
      .eq("status", "unused"); // Only delete unused keys

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/licenses");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Delete license stock error:", error);
    return { success: false, error: error.message };
  }
}

export async function getStockCountByProduct(productId: string, variantId: string | null = null) {
  try {
    await requirePermission("stock_keys");
    const supabase = createAdminClient();
    
    let query = supabase
      .from("licenses")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId)
      .eq("status", "unused");

    if (variantId) {
      query = query.eq("variant_id", variantId);
    }

    const { count, error } = await query;

    if (error) throw error;

    return { success: true, count: count || 0 };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this.", count: 0 };
    console.error("[Admin] Get stock count error:", error);
    return { success: false, error: error.message, count: 0 };
  }
}

export async function assignLicenseFromStock(data: {
  product_id: string;
  variant_id: string | null;
  product_name: string;
  customer_email: string;
  order_id: string;
  expires_at: string | null;
}) {
  try {
    const supabase = createAdminClient();
    
    // Find an unused license key for this product/variant
    let query = supabase
      .from("licenses")
      .select("*")
      .eq("product_id", data.product_id)
      .eq("status", "unused")
      .limit(1)
      .single();

    if (data.variant_id) {
      query = query.eq("variant_id", data.variant_id);
    }

    const { data: license, error: fetchError } = await query;

    if (fetchError || !license) {
      throw new Error("No license keys available in stock for this product");
    }

    // Update the license with customer info
    const { error: updateError } = await supabase
      .from("licenses")
      .update({
        status: "active",
        customer_email: data.customer_email,
        product_name: data.product_name,
        order_id: data.order_id,
        expires_at: data.expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", license.id);

    if (updateError) throw updateError;

    revalidatePath("/mgmt-x9k2m7/licenses");
    return { success: true, license_key: license.license_key };
  } catch (error: any) {
    console.error("[Admin] Assign license from stock error:", error);
    return { success: false, error: error.message };
  }
}
