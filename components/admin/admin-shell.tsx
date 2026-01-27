"use client";

import React, { useState, useEffect } from "react"

import { useAdminStore } from "@/lib/admin-store";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminShell({ children, title, subtitle }: AdminShellProps) {
  const { sidebarOpen } = useAdminStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <AdminSidebar />
      <AdminHeader title={title} subtitle={subtitle} />
      <main
        className={cn(
          "pt-16 min-h-screen transition-all duration-300",
          sidebarOpen ? "pl-64" : "pl-20"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
