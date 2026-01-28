import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyStoreSession, COOKIE_NAME } from "@/lib/store-session";

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });

    const session = verifyStoreSession(token);
    if (!session) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });

    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.username === "string" && body.username.trim()) updates.username = body.username.trim();
    if (typeof body.avatarUrl === "string") updates.avatar_url = body.avatarUrl || null;
    if (typeof body.phone === "string") updates.phone = body.phone.trim() || null;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("store_users")
      .update(updates)
      .eq("id", session.userId)
      .select("id, email, username, avatar_url, phone, created_at")
      .single();

    if (error) {
      console.error("[Store Auth] Profile update error:", error);
      return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
        username: data.username,
        avatarUrl: data.avatar_url ?? undefined,
        phone: data.phone ?? undefined,
        createdAt: data.created_at,
      },
    });
  } catch (err: any) {
    console.error("[Store Auth] Profile error:", err);
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}
