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
    const t = setTimeout(() => setMounted(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#262626] border-t-[#dc2626]" />
        <p className="text-white/40 text-sm">Loading…</p>
        <Toaster />
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
