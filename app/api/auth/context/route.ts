import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/admin-auth";

export async function GET() {
  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return NextResponse.json({ isAdmin: false, permissions: [] });
    }
    if (ctx.type === "admin") {
      return NextResponse.json({ isAdmin: true, permissions: [] });
    }
    return NextResponse.json({
      isAdmin: false,
      permissions: ctx.permissions,
    });
  } catch (e) {
    return NextResponse.json({ isAdmin: false, permissions: [] });
  }
}
