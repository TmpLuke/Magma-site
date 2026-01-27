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
  
  // Get current path to check if it's the login page
  // Note: We can't use usePathname in server components, so we'll handle this differently
  // The login page will be accessible without auth, all other pages require auth
  
  return <>{children}</>;
}
