import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPassword } from "@/lib/store-auth";
import { createStoreSession, COOKIE_NAME, MAX_AGE_SEC } from "@/lib/store-session";

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();
    const e = (email ?? "").toString().trim().toLowerCase();
    const un = (username ?? "").toString().trim();
    const pw = (password ?? "").toString();

    if (!e || !pw || !un) {
      return NextResponse.json(
        { success: false, error: "Email, password, and username are required" },
        { status: 400 }
      );
    }
    if (pw.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }
    if (un.length < 3) {
      return NextResponse.json(
        { success: false, error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("store_users")
      .select("id")
      .eq("email", e)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const { data: byUsername } = await supabase
      .from("store_users")
      .select("id")
      .ilike("username", un)
      .maybeSingle();
    if (byUsername) {
      return NextResponse.json(
        { success: false, error: "This username is already taken" },
        { status: 409 }
      );
    }

    const password_hash = hashPassword(pw);
    const { data: user, error } = await supabase
      .from("store_users")
      .insert({ email: e, username: un, password_hash, updated_at: new Date().toISOString() })
      .select("id, email, username, created_at")
      .single();

    if (error) {
      console.error("[Store Auth] Signup error:", error);
      return NextResponse.json({ success: false, error: "Sign up failed" }, { status: 500 });
    }

    const token = createStoreSession({ userId: user.id, email: user.email });
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE_SEC,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.created_at,
      },
    });
  } catch (err: any) {
    console.error("[Store Auth] Signup error:", err);
    return NextResponse.json({ success: false, error: "Sign up failed" }, { status: 500 });
  }
}
