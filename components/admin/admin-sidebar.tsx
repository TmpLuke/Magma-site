"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Key,
  Package,
  Tag,
  Webhook,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame,
  LogOut,
  CircleDot,
  Activity,
  FolderOpen,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/admin-store";

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; permission: string }[] = [
  { href: "/mgmt-x9k2m7", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard" },
  { href: "/mgmt-x9k2m7/status", label: "Product Status", icon: Activity, permission: "manage_products" },
  { href: "/mgmt-x9k2m7/categories", label: "Categories", icon: FolderOpen, permission: "manage_categories" },
  { href: "/mgmt-x9k2m7/orders", label: "Orders", icon: ShoppingCart, permission: "manage_orders" },
  { href: "/mgmt-x9k2m7/licenses", label: "License Keys", icon: Key, permission: "stock_keys" },
  { href: "/mgmt-x9k2m7/products", label: "Products", icon: Package, permission: "manage_products" },
  { href: "/mgmt-x9k2m7/coupons", label: "Coupons", icon: Tag, permission: "manage_coupons" },
  { href: "/mgmt-x9k2m7/webhooks", label: "Webhooks", icon: Webhook, permission: "manage_webhooks" },
  { href: "/mgmt-x9k2m7/team", label: "Team", icon: Users, permission: "manage_team" },
  { href: "/mgmt-x9k2m7/logins", label: "Manage Logins", icon: UserCog, permission: "manage_logins" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdminStore();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/auth/context")
      .then((r) => r.json())
      .then((d) => {
        setIsAdmin(!!d.isAdmin);
        setPermissions(Array.isArray(d.permissions) ? d.permissions : []);
      })
      .catch(() => { setIsAdmin(true); setPermissions([]); });
  }, []);

  const allowedNav = isAdmin
    ? navItems
    : navItems.filter((item) => permissions.includes(item.permission));
  const canSettings = isAdmin || permissions.includes("manage_settings");

  const isOpen = mounted ? sidebarOpen : true;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-[#0a0a0a] to-[#000000] border-r border-[#1a1a1a] transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1a1a1a] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626]/5 to-transparent opacity-50" />
        <Link href="/mgmt-x9k2m7" className="flex items-center gap-3 relative z-10 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dc2626] via-[#ef4444] to-[#991b1b] flex items-center justify-center shadow-lg shadow-[#dc2626]/30 group-hover:shadow-[#dc2626]/50 transition-all duration-300">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-[#dc2626] blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg tracking-tight">Magma</span>
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Admin Panel</span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="relative z-10 w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] border border-[#262626] hover:border-[#dc2626]/30 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 group"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1a1a1a]">
        {allowedNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/mgmt-x9k2m7" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group overflow-hidden",
                isActive
                  ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-lg shadow-[#dc2626]/20"
                  : "text-white/60 hover:bg-[#1a1a1a] hover:text-white"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626] to-[#ef4444] opacity-100" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
                </>
              )}
              
              {/* Hover effect */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              )}

              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 relative z-10 transition-all duration-200",
                  isActive 
                    ? "text-white drop-shadow-lg" 
                    : "text-white/60 group-hover:text-white group-hover:scale-110"
                )}
              />
              {isOpen && (
                <span className={cn(
                  "font-medium truncate relative z-10 transition-all duration-200",
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                )}>
                  {item.label}
                </span>
              )}
              
              {/* Active pulse indicator */}
              {isActive && isOpen && (
                <CircleDot className="w-2 h-2 text-white/80 ml-auto relative z-10 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-[#1a1a1a] space-y-1 bg-[#0a0a0a]/50 backdrop-blur-sm">
        {canSettings && (
        <Link
          href="/mgmt-x9k2m7/settings"
          className={cn(
            "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group overflow-hidden",
            pathname === "/mgmt-x9k2m7/settings"
              ? "bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white shadow-lg shadow-[#dc2626]/20"
              : "text-white/60 hover:bg-[#1a1a1a] hover:text-white"
          )}
        >
          {pathname === "/mgmt-x9k2m7/settings" && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626] to-[#ef4444]" />
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
            </>
          )}
          {!pathname.includes("/settings") && (
            <div className="absolute inset-0 bg-gradient-to-r from-[#dc2626]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          )}
          <Settings className={cn(
            "w-5 h-5 flex-shrink-0 relative z-10 transition-all duration-200",
            pathname === "/mgmt-x9k2m7/settings"
              ? "text-white"
              : "group-hover:scale-110 group-hover:rotate-90"
          )} />
          {isOpen && (
            <span className={cn(
              "font-medium relative z-10",
              pathname === "/mgmt-x9k2m7/settings" ? "text-white" : ""
          )}>
            Settings
            </span>
          )}
        </Link>
        )}
        
        <button
          type="button"
          onClick={async () => {
            try {
              const response = await fetch("/api/admin/logout", { method: "POST" });
              if (response.ok) {
                window.location.href = "/";
              }
            } catch (error) {
              console.error("Logout failed:", error);
              window.location.href = "/";
            }
          }}
          className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all duration-200 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <LogOut className="w-5 h-5 flex-shrink-0 relative z-10 transition-all duration-200 group-hover:scale-110" />
          {isOpen && (
            <span className="font-medium relative z-10">Exit Admin</span>
          )}
        </button>

        {/* Collapse hint when sidebar is open */}
        {isOpen && (
          <div className="pt-3 px-3">
            <div className="bg-[#1a1a1a]/50 border border-[#262626] rounded-lg p-2.5">
              <div className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-[#dc2626] mt-1.5 flex-shrink-0 animate-pulse" />
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Press <kbd className="px-1 py-0.5 bg-[#0a0a0a] border border-[#262626] rounded text-white/40">⌘</kbd> + <kbd className="px-1 py-0.5 bg-[#0a0a0a] border border-[#262626] rounded text-white/40">B</kbd> to toggle
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}