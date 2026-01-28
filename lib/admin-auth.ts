"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "MagmaSecure2024!@#";
const ADMIN_SESSION_NAME = "magma_admin_session";
const STAFF_SESSION_NAME = "staff-session";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

function generateSessionToken(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).substring(2, 15);
  return `${t}_${r}_${Math.random().toString(36).substring(2, 10)}`;
}

export type AuthContext =
  | { type: "admin" }
  | { type: "staff"; id: string; permissions: string[] }
  | null;

export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get(ADMIN_SESSION_NAME);
  if (adminSession?.value) return { type: "admin" };

  const staffId = cookieStore.get(STAFF_SESSION_NAME)?.value;
  if (!staffId) return null;

  const supabase = createAdminClient();
  const { data: member, error } = await supabase
    .from("team_members")
    .select("id, permissions")
    .eq("id", staffId)
    .eq("status", "active")
    .single();

  if (error || !member) return null;
  const permissions = Array.isArray(member.permissions) ? member.permissions : [];
  return { type: "staff", id: member.id, permissions };
}

export async function checkAdminSession(): Promise<boolean> {
  const ctx = await getAuthContext();
  return ctx !== null;
}

/** Use in server actions. Throws if caller lacks permission. Admin always allowed. */
export async function requirePermission(permission: string): Promise<void> {
  const ctx = await getAuthContext();
  if (!ctx) throw new Error("Unauthorized");
  if (ctx.type === "admin") return;
  if (ctx.type === "staff" && ctx.permissions.includes(permission)) return;
  throw new Error("Forbidden: insufficient permissions");
}

/** Owner-only. Throws if not admin (staff cannot access). */
export async function requireAdmin(): Promise<void> {
  const ctx = await getAuthContext();
  if (!ctx) throw new Error("Unauthorized");
  if (ctx.type !== "admin") throw new Error("Forbidden: owner only");
}

export async function verifyAdminPassword(
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (password !== ADMIN_PASSWORD) {
    return { success: false, error: "Invalid password" };
  }
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_SESSION_NAME);
  cookieStore.set(ADMIN_SESSION_NAME, generateSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });
  return { success: true };
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_NAME);
  cookieStore.delete(STAFF_SESSION_NAME);
}
