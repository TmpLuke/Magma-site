"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";

export type OrderStatus = "pending" | "completed" | "failed" | "refunded" | "paid";

export interface OrderRow {
  id: string;
  order_number: string;
  customer_email: string;
  product_id: string | null;
  product_name: string;
  duration: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends OrderRow {
  license?: {
    id: string;
    license_key: string;
    status: string;
    expires_at: string | null;
    created_at: string;
  } | null;
}

export async function getOrders(statusFilter?: OrderStatus | "all"): Promise<{
  success: boolean;
  error?: string;
  data?: OrderRow[];
}> {
  try {
    await requirePermission("manage_orders");
    const supabase = createAdminClient();
    let q = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (statusFilter && statusFilter !== "all") {
      q = q.eq("status", statusFilter);
    }
    const { data, error } = await q;
    if (error) throw error;
    const rows = (data ?? []).map((o) => ({
      ...o,
      amount: Number(o.amount),
    })) as OrderRow[];
    return { success: true, data: rows };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? "")) {
      return { success: false, error: "You don't have permission to do this.", data: [] };
    }
    console.error("[Admin Orders] getOrders error:", e);
    return { success: false, error: err?.message ?? "Failed to load orders", data: [] };
  }
}

export async function getOrderDetail(orderId: string): Promise<{
  success: boolean;
  error?: string;
  data?: OrderDetail;
}> {
  try {
    await requirePermission("manage_orders");
    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (error || !order) {
      return { success: false, error: "Order not found" };
    }
    const { data: licenses } = await supabase
      .from("licenses")
      .select("id, license_key, status, expires_at, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1);
    const license = licenses?.[0] ?? null;
    const detail: OrderDetail = {
      ...order,
      amount: Number(order.amount),
      license: license ? {
        id: license.id,
        license_key: license.license_key,
        status: license.status,
        expires_at: license.expires_at,
        created_at: license.created_at,
      } : null,
    };
    return { success: true, data: detail };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? "")) {
      return { success: false, error: "You don't have permission to do this." };
    }
    console.error("[Admin Orders] getOrderDetail error:", e);
    return { success: false, error: err?.message ?? "Failed to load order" };
  }
}

function generateLicenseKey(productName: string, duration: string): string {
  const prefix = productName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X");
  const durationCode = duration.includes("30") ? "30D" : duration.includes("7") ? "7D" : "1D";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `MGMA-${prefix}-${durationCode}-${r()}-${r()}`;
}

function expiresAtFromDuration(duration: string): string {
  const now = new Date();
  if (duration.includes("30")) {
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
  if (duration.includes("7")) {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("manage_orders");
    const supabase = createAdminClient();
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (fetchErr || !order) {
      return { success: false, error: "Order not found" };
    }

    const { error: updateErr } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (updateErr) throw updateErr;

    if (newStatus === "completed") {
      const existing = await supabase
        .from("licenses")
        .select("id")
        .eq("order_id", orderId)
        .maybeSingle();
      if (!existing.data) {
        const licenseKey = generateLicenseKey(order.product_name, order.duration);
        const expiresAt = expiresAtFromDuration(order.duration);
        await supabase.from("licenses").insert({
          license_key: licenseKey,
          order_id: order.id,
          product_id: order.product_id,
          product_name: order.product_name,
          customer_email: order.customer_email,
          status: "active",
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        });
      }
    } else if (newStatus === "refunded") {
      await supabase
        .from("licenses")
        .update({ status: "revoked", updated_at: new Date().toISOString() })
        .eq("order_id", orderId);
    }

    revalidatePath("/mgmt-x9k2m7/orders");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? "")) {
      return { success: false, error: "You don't have permission to do this." };
    }
    console.error("[Admin Orders] updateOrderStatus error:", e);
    return { success: false, error: err?.message ?? "Failed to update order" };
  }
}
