"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";

// ================================================================================
//                              TYPE DEFINITIONS
// ================================================================================

export interface License {
  id: string;
  license_key: string;
  product_id: string | null;
  product_name: string | null;
  variant_id: string | null;
  created_at: string;
}

export interface StockSummary {
  total_stock: number;
  general_stock: number;
  product_specific: number;
  variant_specific: number;
  by_product: Array<{
    product_id: string;
    product_name: string;
    total_stock: number;
    variants: Array<{
      variant_id: string;
      duration: string;
      stock_count: number;
    }>;
  }>;
}

export interface AddStockResult {
  success: boolean;
  added: number;
  skipped: number;
  duplicates: string[];
  invalid: string[];
  error?: string;
}

// ================================================================================
//                              UTILITY FUNCTIONS
// ================================================================================

/**
 * Validates a license key format
 * Accepts any non-empty string
 */
function validateLicenseKey(key: string): boolean {
  const trimmed = key.trim();
  // Accept any non-empty string
  return trimmed.length > 0;
}

/**
 * Normalizes license key format
 */
function normalizeLicenseKey(key: string): string {
  return key.trim().toUpperCase();
}

// ================================================================================
//                              CORE STOCK FUNCTIONS
// ================================================================================

/**
 * Get all licenses in stock (simple inventory view)
 */
export async function getLicenses() {
  try {
    await requirePermission("stock_keys");
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from("licenses")
      .select("id, license_key, product_id, product_name, variant_id, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this.", data: [] };
    console.error("[Admin] Get licenses error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Add license keys to stock inventory
 * Keys can be assigned to any product/variant when needed
 */
export async function addLicenseStock(data: {
  product_id?: string | null;
  variant_id?: string | null;
  license_keys: string[];
}): Promise<AddStockResult> {
  try {
    await requirePermission("stock_keys");
    const supabase = createAdminClient();
    
    if (!data.license_keys || data.license_keys.length === 0) {
      return {
        success: false,
        error: "No license keys provided",
        added: 0,
        skipped: 0,
        duplicates: [],
        invalid: []
      };
    }

    // Normalize and validate all keys
    const processedKeys: string[] = [];
    const invalidKeys: string[] = [];
    const duplicateInputs: string[] = [];
    const seenKeys = new Set<string>();

    for (const rawKey of data.license_keys) {
      const normalized = normalizeLicenseKey(rawKey);
      
      if (!normalized) continue;
      
      // Check for duplicates within input
      if (seenKeys.has(normalized)) {
        duplicateInputs.push(rawKey);
        continue;
      }
      seenKeys.add(normalized);
      
      // Validate format
      if (!validateLicenseKey(normalized)) {
        invalidKeys.push(rawKey);
        continue;
      }
      
      processedKeys.push(normalized);
    }

    if (processedKeys.length === 0) {
      return {
        success: false,
        error: `No valid license keys found. Invalid: ${invalidKeys.length}, Duplicates: ${duplicateInputs.length}`,
        added: 0,
        skipped: 0,
        duplicates: duplicateInputs,
        invalid: invalidKeys
      };
    }

    // Get product name if product_id is provided
    let productName: string | null = null;
    if (data.product_id) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("name")
        .eq("id", data.product_id)
        .single();
      
      if (productError) {
        console.error("[Admin] Error fetching product:", productError);
        return {
          success: false,
          error: `Product not found: ${productError.message}`,
          added: 0,
          skipped: 0,
          duplicates: [],
          invalid: []
        };
      }
      productName = product?.name || null;
    }

    // Insert ALL license keys (including duplicates)
    const licenseRecords = processedKeys.map(key => ({
      license_key: key,
      product_id: data.product_id || null,
      variant_id: data.variant_id || null,
      product_name: productName || "General Stock",
      customer_email: "", // Empty string for stock inventory
      status: "unused", // Explicitly set status to unused
    }));

    const { error: insertError } = await supabase
      .from("licenses")
      .insert(licenseRecords);

    if (insertError) {
      console.error("[Admin] Error inserting licenses:", insertError);
      return {
        success: false,
        error: `Failed to insert licenses: ${insertError.message}`,
        added: 0,
        skipped: 0,
        duplicates: [],
        invalid: []
      };
    }

    revalidatePath("/mgmt-x9k2m7/licenses");

    return {
      success: true,
      added: processedKeys.length,
      skipped: duplicateInputs.length + invalidKeys.length,
      duplicates: duplicateInputs,
      invalid: invalidKeys
    };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { 
        success: false, 
        error: "You don't have permission to add license stock",
        added: 0,
        skipped: 0,
        duplicates: [],
        invalid: []
      };
    console.error("[Admin] Add license stock error:", error);
    return { 
      success: false, 
      error: `Error: ${error?.message || "Unknown error occurred"}`,
      added: 0,
      skipped: 0,
      duplicates: [],
      invalid: []
    };
  }
}

/**
 * Delete a license key from stock (when it's used/sold)
 */
export async function deleteLicenseStock(licenseId: string) {
  try {
    await requirePermission("stock_keys");
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("licenses")
      .delete()
      .eq("id", licenseId);

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

// ================================================================================
//                              ASSIGNMENT & CONSUMPTION
// ================================================================================

/**
 * Get and consume a license key from stock
 * Removes it from inventory when purchased
 * Priority: exact variant match > product match > general stock
 */
export async function consumeLicenseFromStock(data: {
  product_id: string;
  variant_id: string | null;
}): Promise<{ success: boolean; license_key?: string; error?: string }> {
  try {
    const supabase = createAdminClient();
    
    // Priority 1: Try exact product+variant match
    let license = null;
    if (data.variant_id) {
      const { data: exactMatch, error: exactError } = await supabase
        .from("licenses")
        .select("*")
        .eq("product_id", data.product_id)
        .eq("variant_id", data.variant_id)
        .limit(1)
        .single();
      
      if (exactError && exactError.code !== "PGRST116") {
        console.error("[Admin] Error finding exact match:", exactError);
      }
      license = exactMatch;
    }
    
    // Priority 2: Try product-only match (any variant)
    if (!license) {
      const { data: productMatch, error: productError } = await supabase
        .from("licenses")
        .select("*")
        .eq("product_id", data.product_id)
        .is("variant_id", null)
        .limit(1)
        .single();
      
      if (productError && productError.code !== "PGRST116") {
        console.error("[Admin] Error finding product match:", productError);
      }
      license = productMatch;
    }
    
    // Priority 3: Use general stock (no product/variant specified)
    if (!license) {
      const { data: generalStock, error: generalError } = await supabase
        .from("licenses")
        .select("*")
        .is("product_id", null)
        .is("variant_id", null)
        .limit(1)
        .single();
      
      if (generalError && generalError.code !== "PGRST116") {
        console.error("[Admin] Error finding general stock:", generalError);
      }
      license = generalStock;
    }

    if (!license) {
      return { success: false, error: "No license keys available in stock for this product" };
    }

    // Delete the license from stock (consume it)
    const { error: deleteError } = await supabase
      .from("licenses")
      .delete()
      .eq("id", license.id);

    if (deleteError) {
      console.error("[Admin] Error consuming license:", deleteError);
      return { success: false, error: `Failed to consume license: ${deleteError.message}` };
    }

    revalidatePath("/mgmt-x9k2m7/licenses");
    return { success: true, license_key: license.license_key };
  } catch (error: any) {
    console.error("[Admin] Consume license from stock error:", error);
    return { success: false, error: `Error: ${error?.message || "Unknown error"}` };
  }
}

// ================================================================================
//                              STOCK ANALYTICS
// ================================================================================

/**
 * Get comprehensive stock summary with breakdown by product/variant
 */
export async function getStockSummary(): Promise<{ success: boolean; data?: StockSummary; error?: string }> {
  try {
    await requirePermission("stock_keys");
    const supabase = createAdminClient();
    
    // Get all licenses in stock
    const { data: licenses, error } = await supabase
      .from("licenses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const summary: StockSummary = {
      total_stock: licenses?.length || 0,
      general_stock: 0,
      product_specific: 0,
      variant_specific: 0,
      by_product: []
    };

    if (!licenses) return { success: true, data: summary };

    // Count different types of stock
    const productMap = new Map<string, any>();

    for (const license of licenses) {
      if (!license.product_id && !license.variant_id) {
        summary.general_stock++;
      } else if (license.product_id && !license.variant_id) {
        summary.product_specific++;
      } else if (license.variant_id) {
        summary.variant_specific++;
      }

      // Group by product
      if (license.product_id) {
        const productId = license.product_id;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            product_id: productId,
            product_name: license.product_name || "Unknown Product",
            total_stock: 0,
            variants: new Map()
          });
        }

        const product = productMap.get(productId);
        product.total_stock++;

        if (license.variant_id) {
          const variantId = license.variant_id;
          if (!product.variants.has(variantId)) {
            product.variants.set(variantId, {
              variant_id: variantId,
              duration: "Unknown",
              stock_count: 0
            });
          }
          product.variants.get(variantId).stock_count++;
        }
      }
    }

    // Convert maps to arrays
    summary.by_product = Array.from(productMap.values()).map(product => ({
      ...product,
      variants: Array.from(product.variants.values())
    }));

    return { success: true, data: summary };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Get stock summary error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get stock count for specific product/variant combination
 */
export async function getStockCountByProduct(productId?: string | null, variantId?: string | null) {
  try {
    await requirePermission("stock_keys");
    const supabase = createAdminClient();
    
    let query = supabase
      .from("licenses")
      .select("*", { count: "exact", head: true });

    if (productId) {
      query = query.eq("product_id", productId);
    } else {
      query = query.is("product_id", null);
    }

    if (variantId) {
      query = query.eq("variant_id", variantId);
    } else if (productId) {
      query = query.is("variant_id", null);
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

// ================================================================================
//                              BULK OPERATIONS
// ================================================================================

/**
 * Bulk delete licenses from stock
 */
export async function bulkDeleteLicenses(licenseIds: string[]) {
  try {
    await requirePermission("stock_keys");
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("licenses")
      .delete()
      .in("id", licenseIds);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/licenses");
    return { success: true, count: licenseIds.length };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Bulk delete licenses error:", error);
    return { success: false, error: error.message };
  }
}
