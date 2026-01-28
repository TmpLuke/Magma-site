import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPassword, hashPassword } from "@/lib/store-auth";
import { verifyStoreSession, COOKIE_NAME } from "@/lib/store-session";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });

    const session = verifyStoreSession(token);
    if (!session) return NextResponse.json({ success: false, error: "Not signed in" }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Current and new password required" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: "New password must be at least 6 characters" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: user, error: fetchErr } = await supabase
      .from("store_users")
      .select("password_hash")
      .eq("id", session.userId)
      .single();

    if (fetchErr || !user) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 });
    }
    if (!verifyPassword(currentPassword, user.password_hash)) {
      return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 401 });
    }

    const password_hash = hashPassword(newPassword);
    const { error: updateErr } = await supabase
      .from("store_users")
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq("id", session.userId);

    if (updateErr) {
      console.error("[Store Auth] Change password error:", updateErr);
      return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Store Auth] Change password error:", err);
    return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
  }
}
