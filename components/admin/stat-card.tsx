"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  prefix?: string;
}

export function StatCard({ title, value, change, icon: Icon, prefix }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6 hover:border-[#262626] transition-colors group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">
            {prefix}
            {value}
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#dc2626]/10 flex items-center justify-center group-hover:bg-[#dc2626]/20 transition-colors">
          <Icon className="w-6 h-6 text-[#dc2626]" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            isPositive
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {Math.abs(change)}%
        </div>
        <span className="text-xs text-white/40">vs last period</span>
      </div>
    </div>
  );
}
