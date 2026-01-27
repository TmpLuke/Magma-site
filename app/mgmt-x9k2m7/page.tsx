"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { DollarSign, ShoppingCart, Key, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    licenses: 0,
    growth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient();

        // Get total revenue
        const { data: orders } = await supabase
          .from("orders")
          .select("amount")
          .eq("status", "completed");

        const totalRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

        // Get order count
        const { count: orderCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        // Get license count
        const { count: licenseCount } = await supabase
          .from("licenses")
          .select("*", { count: "exact", head: true });

        setStats({
          revenue: totalRevenue,
          orders: orderCount || 0,
          licenses: licenseCount || 0,
          growth: 12.5,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <AdminShell title="Dashboard" subtitle="Welcome back, Admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard" subtitle="Welcome back, Admin">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          change={stats.growth}
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value={stats.orders.toString()}
          change={8.2}
          icon={ShoppingCart}
        />
        <StatCard
          title="Active Licenses"
          value={stats.licenses.toString()}
          change={15.3}
          icon={Key}
        />
        <StatCard
          title="Growth Rate"
          value={`${stats.growth}%`}
          change={stats.growth}
          icon={TrendingUp}
        />
      </div>

      <div className="mt-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/mgmt-x9k2m7/orders"
            className="p-4 bg-[#111111] hover:bg-[#1a1a1a] border border-[#262626] rounded-lg transition-colors"
          >
            <h3 className="font-semibold text-white mb-2">Manage Orders</h3>
            <p className="text-sm text-white/50">View and process customer orders</p>
          </a>
          <a
            href="/mgmt-x9k2m7/products"
            className="p-4 bg-[#111111] hover:bg-[#1a1a1a] border border-[#262626] rounded-lg transition-colors"
          >
            <h3 className="font-semibold text-white mb-2">Manage Products</h3>
            <p className="text-sm text-white/50">Add or edit products</p>
          </a>
          <a
            href="/mgmt-x9k2m7/licenses"
            className="p-4 bg-[#111111] hover:bg-[#1a1a1a] border border-[#262626] rounded-lg transition-colors"
          >
            <h3 className="font-semibold text-white mb-2">License Keys</h3>
            <p className="text-sm text-white/50">Manage license keys</p>
          </a>
        </div>
      </div>
    </AdminShell>
  );
}
