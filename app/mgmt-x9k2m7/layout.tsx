import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/admin-auth";
import { getRequiredPermissionForPath } from "@/lib/admin-routes";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Management Panel | Magma",
  description: "Secure Management Dashboard",
  robots: "noindex, nofollow",
};

export default async function SecureAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isLoginPage = pathname.includes("/mgmt-x9k2m7/login");

  const ctx = await getAuthContext();

  if (!ctx && !isLoginPage) {
    redirect("/mgmt-x9k2m7/login");
  }

  if (ctx && isLoginPage) {
    redirect("/mgmt-x9k2m7");
  }

  if (ctx?.type === "staff" && !isLoginPage) {
    const required = getRequiredPermissionForPath(pathname);
    if (required && !ctx.permissions.includes(required)) {
      redirect("/mgmt-x9k2m7?error=forbidden");
    }
  }

  return <>{children}</>;
}
