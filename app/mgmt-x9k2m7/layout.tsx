import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { checkAdminSession } from "@/lib/admin-auth";
import { headers } from "next/headers";

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
  // Get the current pathname
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Check if this is the login page
  const isLoginPage = pathname.includes("/login");
  
  // Check authentication
  const isAuthenticated = await checkAdminSession();
  
  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && !isLoginPage) {
    redirect("/mgmt-x9k2m7/login");
  }
  
  // If authenticated and on login page, redirect to dashboard
  if (isAuthenticated && isLoginPage) {
    redirect("/mgmt-x9k2m7");
  }
  
  return <>{children}</>;
}
