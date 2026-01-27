"use client";

import { useState, useEffect } from "react";
import { Bell, Search, User, Check } from "lucide-react";
import { useAdminStore } from "@/lib/admin-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { sidebarOpen, notifications, markNotificationRead, markAllNotificationsRead } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use default state during SSR to prevent hydration mismatch
  const isOpen = mounted ? sidebarOpen : true;
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return "bg-green-500/20 text-green-400";
      case "license":
        return "bg-blue-500/20 text-blue-400";
      case "alert":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-[#dc2626]/20 text-[#dc2626]";
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a] z-30 flex items-center justify-between px-6 transition-all duration-300",
        isOpen ? "left-64" : "left-20"
      )}
    >
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#dc2626] transition-colors"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="relative w-10 h-10 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] rounded-full text-white text-xs font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-[#111111] border-[#262626]">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span className="text-white">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-xs text-[#dc2626] hover:text-[#ef4444] transition-colors"
                >
                  Mark all read
                </button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#262626]" />
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 cursor-pointer focus:bg-[#1a1a1a]",
                    !notification.read && "bg-[#dc2626]/5"
                  )}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      getNotificationIcon(notification.type)
                    )}
                  >
                    {notification.read ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-white/30 mt-1">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">MagmaAdmin</p>
                <p className="text-xs text-white/50">Administrator</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#111111] border-[#262626]">
            <DropdownMenuItem className="text-white/70 focus:bg-[#1a1a1a] focus:text-white">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white/70 focus:bg-[#1a1a1a] focus:text-white">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#262626]" />
            <DropdownMenuItem className="text-red-400 focus:bg-[#1a1a1a] focus:text-red-400">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
