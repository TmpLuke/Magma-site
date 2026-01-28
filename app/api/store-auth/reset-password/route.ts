import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/store-auth";

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();
    const t = (token ?? "").toString().trim();
    const pw = (newPassword ?? "").toString();

    if (!t) {
      return NextResponse.json({ success: false, error: "Invalid or expired reset link" }, { status: 400 });
    }
    if (!pw || pw.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: user, error: fetchErr } = await supabase
      .from("store_users")
      .select("id, password_reset_expires_at")
      .eq("password_reset_token", t)
      .maybeSingle();

    if (fetchErr || !user) {
      return NextResponse.json({ success: false, error: "Invalid or expired reset link" }, { status: 400 });
    }

    const expires = user.password_reset_expires_at ? new Date(user.password_reset_expires_at) : null;
    if (!expires || expires.getTime() < Date.now()) {
      await supabase
        .from("store_users")
        .update({
          password_reset_token: null,
          password_reset_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      return NextResponse.json({ success: false, error: "Reset link has expired. Please request a new one." }, { status: 400 });
    }

    const password_hash = hashPassword(pw);
    const { error: updateErr } = await supabase
      .from("store_users")
      .update({
        password_hash,
        password_reset_token: null,
        password_reset_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateErr) {
      console.error("[Store Auth] Reset password update error:", updateErr);
      return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[Store Auth] Reset password error:", err);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
