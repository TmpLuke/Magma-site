"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/admin-store";
import { logoutAdmin } from "@/lib/admin-auth";

const navItems = [
  { href: "/mgmt-x9k2m7", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mgmt-x9k2m7/orders", label: "Orders", icon: ShoppingCart },
  { href: "/mgmt-x9k2m7/licenses", label: "License Keys", icon: Key },
  { href: "/mgmt-x9k2m7/products", label: "Products", icon: Package },
  { href: "/mgmt-x9k2m7/coupons", label: "Coupons", icon: Tag },
  { href: "/mgmt-x9k2m7/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/mgmt-x9k2m7/team", label: "Team", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdminStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use default state during SSR to prevent hydration mismatch
  const isOpen = mounted ? sidebarOpen : true;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-[#0a0a0a] border-r border-[#1a1a1a] transition-all duration-300 flex flex-col",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1a1a1a]">
        <Link href="/mgmt-x9k2m7" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <span className="font-bold text-white text-lg">Magma</span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-8 h-8 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/mgmt-x9k2m7" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20"
                  : "text-white/60 hover:bg-[#1a1a1a] hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-white" : "text-white/60 group-hover:text-white"
                )}
              />
              {isOpen && (
                <span className="font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-[#1a1a1a] space-y-1">
        <Link
          href="/mgmt-x9k2m7/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
            pathname === "/mgmt-x9k2m7/settings"
              ? "bg-[#dc2626] text-white"
              : "text-white/60 hover:bg-[#1a1a1a] hover:text-white"
          )}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="font-medium">Settings</span>}
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:bg-[#1a1a1a] hover:text-white transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isOpen && <span className="font-medium">Exit Admin</span>}
        </Link>
      </div>
    </aside>
  );
}
