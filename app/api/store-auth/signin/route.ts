import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/store-auth";
import { createStoreSession, COOKIE_NAME, MAX_AGE_SEC } from "@/lib/store-session";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const e = (email ?? "").toString().trim().toLowerCase();
    const pw = (password ?? "").toString();

    if (!e || !pw) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: user, error } = await supabase
      .from("store_users")
      .select("id, email, username, password_hash, created_at")
      .eq("email", e)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!verifyPassword(pw, user.password_hash)) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
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
    console.error("[Store Auth] Signin error:", err);
    return NextResponse.json({ success: false, error: "Sign in failed" }, { status: 500 });
  }
}
