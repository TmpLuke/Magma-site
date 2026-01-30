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
  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar */}
      <div className="w-64 h-screen bg-gradient-to-b from-[#0a0a0a] to-[#000000] border-r border-[#1a1a1a] fixed left-0 top-0 z-40">
        <AdminSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a] flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}
