import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyStoreSession, COOKIE_NAME } from "@/lib/store-session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ user: null });

    const session = verifyStoreSession(token);
    if (!session) return NextResponse.json({ user: null });

    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from("store_users")
      .select("id, email, username, avatar_url, phone, created_at")
      .eq("id", session.userId)
      .single();

    if (error || !user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url ?? undefined,
        phone: user.phone ?? undefined,
        createdAt: user.created_at,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
