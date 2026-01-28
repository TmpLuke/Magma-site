import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, isResendConfigured } from "@/lib/resend";
import { randomBytes } from "crypto";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const e = (email ?? "").toString().trim().toLowerCase();
    if (!e) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    if (!isResendConfigured()) {
      return NextResponse.json(
        { success: false, error: "Password reset is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const supabase = createAdminClient();
    const { data: user, error: fetchErr } = await supabase
      .from("store_users")
      .select("id, email, username")
      .eq("email", e)
      .maybeSingle();

    if (fetchErr) {
      console.error("[Store Auth] Request reset fetch error:", fetchErr);
      return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const { error: updateErr } = await supabase
      .from("store_users")
      .update({
        password_reset_token: token,
        password_reset_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateErr) {
      console.error("[Store Auth] Request reset update error:", updateErr);
      return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
    }

    const resetLink = `${BASE_URL}/reset-password?token=${token}`;
    const sent = await sendEmail({
      to: user.email,
      subject: "Reset your Magma password",
      html: `
        <p>Hi ${user.username || "there"},</p>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <p><a href="${resetLink}" style="color:#dc2626;text-decoration:underline;">Reset password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        <p>— Magma</p>
      `,
    });

    if (!sent.success) {
      console.error("[Store Auth] Request reset email error:", sent.error);
      await supabase
        .from("store_users")
        .update({
          password_reset_token: null,
          password_reset_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      return NextResponse.json(
        { success: false, error: "Could not send reset email. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[Store Auth] Request reset error:", err);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
