import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyStoreSession, COOKIE_NAME } from "@/lib/store-session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ orders: [], licenses: [] });

    const session = verifyStoreSession(token);
    if (!session) return NextResponse.json({ orders: [], licenses: [] });

    const supabase = createAdminClient();
    const [ordersRes, licensesRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, product_name, duration, amount, status, created_at")
        .eq("customer_email", session.email)
        .order("created_at", { ascending: false }),
      supabase
        .from("licenses")
        .select("id, license_key, product_name, status, expires_at, created_at, order_id")
        .eq("customer_email", session.email)
        .order("created_at", { ascending: false }),
    ]);

    const orders = (ordersRes.data ?? []).map((o) => ({ ...o, amount: Number(o.amount) }));
    const licenses = licensesRes.data ?? [];
    return NextResponse.json({ orders, licenses });
  } catch {
    return NextResponse.json({ orders: [], licenses: [] });
  }
}
