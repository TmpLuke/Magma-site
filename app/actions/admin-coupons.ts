"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createCoupon(data: {
  code: string;
  discount_percent: number;
  max_uses: number | null;
  valid_until: string | null;
}) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from("coupons").insert({
      code: data.code.toUpperCase(),
      discount_percent: data.discount_percent,
      max_uses: data.max_uses,
      current_uses: 0,
      is_active: true,
      valid_until: data.valid_until,
    });

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Create coupon error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCoupon(id: string, data: {
  code: string;
  discount_percent: number;
  max_uses: number | null;
  valid_until: string | null;
  is_active: boolean;
}) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("coupons")
      .update({
        code: data.code.toUpperCase(),
        discount_percent: data.discount_percent,
        max_uses: data.max_uses,
        valid_until: data.valid_until,
        is_active: data.is_active,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Update coupon error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCoupon(id: string) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Delete coupon error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleCouponStatus(id: string, currentStatus: boolean) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Toggle coupon status error:", error);
    return { success: false, error: error.message };
  }
}
