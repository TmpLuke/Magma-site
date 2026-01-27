"use server";

import { cookies } from "next/headers";

// Admin credentials - In production, use environment variables
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "MagmaSecure2024!@#";
const ADMIN_SESSION_NAME = "magma_admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Generate a simple hash for the session token
function generateSessionToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${random}_${Math.random().toString(36).substring(2, 10)}`;
}

export async function verifyAdminPassword(password: string): Promise<{ success: boolean; error?: string }> {
  if (password === ADMIN_PASSWORD) {
    // Create session
    const sessionToken = generateSessionToken();
    const cookieStore = await cookies();
    
    cookieStore.set(ADMIN_SESSION_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000, // Convert to seconds
      path: "/",
    });

    return { success: true };
  }

  return { success: false, error: "Invalid password" };
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_NAME);
  return !!session?.value;
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_NAME);
}
