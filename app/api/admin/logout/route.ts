import { logoutAdmin } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await logoutAdmin();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
