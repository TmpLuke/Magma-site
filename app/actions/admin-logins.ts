"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/store-auth";

export interface StoreUserWithCounts {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  orders_count: number;
  licenses_count: number;
}

export async function getStoreUsers(): Promise<{ success: boolean; error?: string; data?: StoreUserWithCounts[] }> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { data: users, error } = await supabase
      .from("store_users")
      .select("id, email, username, avatar_url, phone, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const ordersRes = await supabase.from("orders").select("customer_email");
    const licensesRes = await supabase.from("licenses").select("customer_email");
    const ordersByEmail = new Map<string, number>();
    const licensesByEmail = new Map<string, number>();

    for (const o of ordersRes.data ?? []) {
      const e = (o.customer_email ?? "").toLowerCase();
      ordersByEmail.set(e, (ordersByEmail.get(e) ?? 0) + 1);
    }
    for (const l of licensesRes.data ?? []) {
      const e = (l.customer_email ?? "").toLowerCase();
      licensesByEmail.set(e, (licensesByEmail.get(e) ?? 0) + 1);
    }

    const withCounts: StoreUserWithCounts[] = (users ?? []).map((u) => ({
      ...u,
      avatar_url: u.avatar_url ?? null,
      phone: u.phone ?? null,
      orders_count: ordersByEmail.get(u.email.toLowerCase()) ?? 0,
      licenses_count: licensesByEmail.get(u.email.toLowerCase()) ?? 0,
    }));

    return { success: true, data: withCounts };
  } catch (e: any) {
    if (e?.message === "Unauthorized" || /Forbidden|owner only/i.test(e?.message ?? ""))
      return { success: false, error: "Owner only.", data: [] };
    console.error("[Admin Logins] getStoreUsers error:", e);
    return { success: false, error: e?.message ?? "Failed to load users", data: [] };
  }
}

export async function resetStoreUserPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    if (!newPassword || newPassword.length < 6)
      return { success: false, error: "Password must be at least 6 characters" };
    const supabase = createAdminClient();
    const password_hash = hashPassword(newPassword);
    const { error } = await supabase
      .from("store_users")
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) throw error;
    return { success: true };
  } catch (e: any) {
    if (e?.message === "Unauthorized" || /Forbidden|owner only/i.test(e?.message ?? ""))
      return { success: false, error: "Owner only." };
    console.error("[Admin Logins] resetStoreUserPassword error:", e);
    return { success: false, error: e?.message ?? "Failed to reset password" };
  }
}

export interface OrdersLicensesForEmail {
  orders: { id: string; order_number: string; product_name: string; duration: string; amount: number; status: string; created_at: string }[];
  licenses: { id: string; license_key: string; product_name: string; status: string; expires_at: string | null; created_at: string; order_id: string | null }[];
}

export async function getOrdersAndLicensesForEmail(
  email: string
): Promise<{ success: boolean; error?: string; data?: OrdersLicensesForEmail }> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const e = email.trim().toLowerCase();
    const [ordersRes, licensesRes] = await Promise.all([
      supabase.from("orders").select("id, order_number, product_name, duration, amount, status, created_at").eq("customer_email", e).order("created_at", { ascending: false }),
      supabase.from("licenses").select("id, license_key, product_name, status, expires_at, created_at, order_id").eq("customer_email", e).order("created_at", { ascending: false }),
    ]);
    if (ordersRes.error) throw ordersRes.error;
    if (licensesRes.error) throw licensesRes.error;
    return {
      success: true,
      data: {
        orders: (ordersRes.data ?? []).map((o) => ({ ...o, amount: Number(o.amount) })),
        licenses: licensesRes.data ?? [],
      },
    };
  } catch (e: any) {
    if (e?.message === "Unauthorized" || /Forbidden|owner only/i.test(e?.message ?? ""))
      return { success: false, error: "Owner only." };
    console.error("[Admin Logins] getOrdersAndLicensesForEmail error:", e);
    return { success: false, error: e?.message ?? "Failed to load data" };
  }
}
