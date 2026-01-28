"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";

export async function updateProductStatus(productId: string, newStatus: string) {
  try {
    await requirePermission("manage_products");
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("products")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString() 
      })
      .eq("id", productId);

    if (error) throw error;

    revalidatePath("/status");
    revalidatePath("/mgmt-x9k2m7");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Update product status error:", error);
    return { success: false, error: error.message };
  }
}
