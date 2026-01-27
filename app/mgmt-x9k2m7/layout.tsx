import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { checkAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Management Panel | Magma",
  description: "Secure Management Dashboard",
  robots: "noindex, nofollow", // Prevent search engines from indexing
};

export default async function SecureAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated (skip for login page)
  const isAuthenticated = await checkAdminSession();
  
  return <>{children}</>;
}
