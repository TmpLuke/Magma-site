"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  display_order?: number;
}) {
  try {
    await requirePermission("manage_categories");
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("categories")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        display_order: data.display_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/categories");
    revalidatePath("/store");
    revalidatePath("/status");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Create category error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    display_order?: number;
  }
) {
  try {
    await requirePermission("manage_categories");
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("categories")
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        display_order: data.display_order || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/categories");
    revalidatePath("/store");
    revalidatePath("/status");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Update category error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requirePermission("manage_categories");
    const supabase = createAdminClient();

    // First check if category has products
    const { data: products, error: checkError } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (checkError) throw checkError;

    if (products && products.length > 0) {
      return {
        success: false,
        error: "Cannot delete category with existing products. Delete products first or reassign them.",
      };
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/categories");
    revalidatePath("/store");
    revalidatePath("/status");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Delete category error:", error);
    return { success: false, error: error.message };
  }
}

export async function getCategoriesWithProductCount() {
  try {
    await requirePermission("manage_categories");
    const supabase = createAdminClient();

    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (categoriesError) throw categoriesError;

    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count, error: countError } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id);

        if (countError) {
          console.error("Error counting products:", countError);
          return { ...category, product_count: 0 };
        }

        return { ...category, product_count: count || 0 };
      })
    );

    return { success: true, data: categoriesWithCounts };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this.", data: [] };
    console.error("[Admin] Get categories error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function getCategoryProducts(categoryId: string) {
  try {
    await requirePermission("manage_categories");
    const supabase = createAdminClient();

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .order("name");

    if (error) throw error;

    return { success: true, data: products || [] };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this.", data: [] };
    console.error("[Admin] Get category products error:", error);
    return { success: false, error: error.message, data: [] };
  }
}
