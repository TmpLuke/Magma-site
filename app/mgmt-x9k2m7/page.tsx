"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { DollarSign, ShoppingCart, Key, TrendingUp, ArrowUpRight, Package, Users, Activity, Clock, CheckCircle, XCircle, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    revenue: 0,
    revenueGrowth: 0,
    orders: 0,
    ordersGrowth: 0,
    licenses: 0,
    licensesGrowth: 0,
    overallGrowth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createClient();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        // Get current period revenue (last 30 days)
        const { data: currentOrders } = await supabase
          .from("orders")
          .select("amount")
          .eq("status", "completed")
          .gte("created_at", thirtyDaysAgo.toISOString());

        const currentRevenue = currentOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

        // Get previous period revenue (30-60 days ago)
        const { data: previousOrders } = await supabase
          .from("orders")
          .select("amount")
          .eq("status", "completed")
          .gte("created_at", sixtyDaysAgo.toISOString())
          .lt("created_at", thirtyDaysAgo.toISOString());

        const previousRevenue = previousOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;
        const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        // Get current period order count
        const { count: currentOrderCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString());

        // Get previous period order count
        const { count: previousOrderCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sixtyDaysAgo.toISOString())
          .lt("created_at", thirtyDaysAgo.toISOString());

        const ordersGrowth = previousOrderCount && previousOrderCount > 0 
          ? ((currentOrderCount || 0) - previousOrderCount) / previousOrderCount * 100 
          : 0;

        // Get current period license count
        const { count: currentLicenseCount } = await supabase
          .from("licenses")
          .select("*", { count: "exact", head: true })
          .gte("created_at", thirtyDaysAgo.toISOString());

        // Get previous period license count
        const { count: previousLicenseCount } = await supabase
          .from("licenses")
          .select("*", { count: "exact", head: true })
          .gte("created_at", sixtyDaysAgo.toISOString())
          .lt("created_at", thirtyDaysAgo.toISOString());

        const licensesGrowth = previousLicenseCount && previousLicenseCount > 0 
          ? ((currentLicenseCount || 0) - previousLicenseCount) / previousLicenseCount * 100 
          : 0;

        // Get total counts for display
        const { count: totalOrderCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true });

        const { count: totalLicenseCount } = await supabase
          .from("licenses")
          .select("*", { count: "exact", head: true });

        // Get all-time revenue
        const { data: allOrders } = await supabase
          .from("orders")
          .select("amount")
          .eq("status", "completed");

        const totalRevenue = allOrders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0;

        // Get recent activity (last 5 orders)
        const { data: recentOrders } = await supabase
          .from("orders")
          .select("id, customer_email, amount, status, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentActivity(recentOrders || []);

        // Calculate overall growth (average of all growth metrics)
        const overallGrowth = (revenueGrowth + ordersGrowth + licensesGrowth) / 3;

        setStats({
          revenue: totalRevenue,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          orders: totalOrderCount || 0,
          ordersGrowth: Math.round(ordersGrowth * 10) / 10,
          licenses: totalLicenseCount || 0,
          licensesGrowth: Math.round(licensesGrowth * 10) / 10,
          overallGrowth: Math.round(overallGrowth * 10) / 10,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.search.includes("error=forbidden")) {
      toast({
        title: "Access denied",
        description: "You don't have permission to view that page.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", "/mgmt-x9k2m7");
    }
  }, [toast]);

  if (loading) {
    return (
      <AdminShell title="Dashboard" subtitle="Welcome back, Admin">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#dc2626]/20 border-t-[#dc2626] animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-[#dc2626]/5 blur-xl animate-pulse" />
          </div>
          <p className="text-white/40 text-sm font-medium">Loading dashboard...</p>
        </div>
      </AdminShell>
    );
  }

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <AdminShell title="Dashboard" subtitle="Welcome back, Admin">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6 hover:border-emerald-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            {stats.revenueGrowth !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                stats.revenueGrowth > 0 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-red-500/10 text-red-400"
              }`}>
                <TrendingUp className={`w-3 h-3 ${stats.revenueGrowth < 0 ? "rotate-180" : ""}`} />
                <span className="text-xs font-bold">{Math.abs(stats.revenueGrowth)}%</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-white tabular-nums">${stats.revenue.toFixed(2)}</p>
            <p className="text-xs text-white/40 mt-2">All-time earnings</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6 hover:border-blue-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            {stats.ordersGrowth !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                stats.ordersGrowth > 0 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-red-500/10 text-red-400"
              }`}>
                <TrendingUp className={`w-3 h-3 ${stats.ordersGrowth < 0 ? "rotate-180" : ""}`} />
                <span className="text-xs font-bold">{Math.abs(stats.ordersGrowth)}%</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-white tabular-nums">{stats.orders}</p>
            <p className="text-xs text-white/40 mt-2">Completed purchases</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6 hover:border-purple-500/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Key className="w-6 h-6 text-white" />
            </div>
            {stats.licensesGrowth !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                stats.licensesGrowth > 0 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-red-500/10 text-red-400"
              }`}>
                <TrendingUp className={`w-3 h-3 ${stats.licensesGrowth < 0 ? "rotate-180" : ""}`} />
                <span className="text-xs font-bold">{Math.abs(stats.licensesGrowth)}%</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Active Licenses</p>
            <p className="text-3xl font-bold text-white tabular-nums">{stats.licenses}</p>
            <p className="text-xs text-white/40 mt-2">Generated keys</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-6 hover:border-[#dc2626]/30 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center shadow-lg shadow-[#dc2626]/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            {stats.overallGrowth !== 0 && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                stats.overallGrowth > 0 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-red-500/10 text-red-400"
              }`}>
                <TrendingUp className={`w-3 h-3 ${stats.overallGrowth < 0 ? "rotate-180" : ""}`} />
                <span className="text-xs font-bold">{Math.abs(stats.overallGrowth)}%</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Growth Rate</p>
            <p className="text-3xl font-bold text-white tabular-nums">{stats.overallGrowth}%</p>
            <p className="text-xs text-white/40 mt-2">Last 30 days avg</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - 2 columns */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0a0a0a] to-[#000000] border border-[#1a1a1a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#dc2626]" />
                Quick Actions
              </h2>
              <p className="text-sm text-white/40 mt-1">Shortcuts to common tasks</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/mgmt-x9k2m7/orders"
              className="group relative p-5 bg-gradient-to-br from-[#111111] to-[#0a0a0a] hover:from-[#1a1a1a] hover:to-[#111111] border border-[#262626] hover:border-blue-500/30 rounded-xl transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">Manage Orders</h3>
                  <p className="text-sm text-white/50">View and process customer orders</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </a>

            <a
              href="/mgmt-x9k2m7/products"
              className="group relative p-5 bg-gradient-to-br from-[#111111] to-[#0a0a0a] hover:from-[#1a1a1a] hover:to-[#111111] border border-[#262626] hover:border-purple-500/30 rounded-xl transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">Manage Products</h3>
                  <p className="text-sm text-white/50">Add or edit your products</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </a>

            <a
              href="/mgmt-x9k2m7/licenses"
              className="group relative p-5 bg-gradient-to-br from-[#111111] to-[#0a0a0a] hover:from-[#1a1a1a] hover:to-[#111111] border border-[#262626] hover:border-emerald-500/30 rounded-xl transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Key className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">License Keys</h3>
                  <p className="text-sm text-white/50">Manage and generate keys</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </a>

            <a
              href="/mgmt-x9k2m7/team"
              className="group relative p-5 bg-gradient-to-br from-[#111111] to-[#0a0a0a] hover:from-[#1a1a1a] hover:to-[#111111] border border-[#262626] hover:border-orange-500/30 rounded-xl transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-full blur-2xl group-hover:bg-orange-500/10 transition-all" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-orange-400 transition-colors">Team Members</h3>
                  <p className="text-sm text-white/50">Manage your admin team</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </a>
          </div>
        </div>

        {/* Recent Activity - 1 column */}
        <div className="bg-gradient-to-br from-[#0a0a0a] to-[#000000] border border-[#1a1a1a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#dc2626]" />
                Recent Activity
              </h2>
              <p className="text-xs text-white/40 mt-1">Latest orders</p>
            </div>
          </div>

          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((order) => (
                <div
                  key={order.id}
                  className="flex items-start gap-3 p-3 bg-[#111111] border border-[#262626] rounded-lg hover:border-[#dc2626]/30 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    order.status === "completed" 
                      ? "bg-emerald-500/10 border border-emerald-500/20" 
                      : order.status === "pending"
                      ? "bg-yellow-500/10 border border-yellow-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  }`}>
                    {order.status === "completed" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : order.status === "pending" ? (
                      <Clock className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate group-hover:text-[#dc2626] transition-colors">
                      {order.customer_email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-white/40 font-mono">${order.amount?.toFixed(2)}</span>
                      <span className="text-xs text-white/20">•</span>
                      <span className="text-xs text-white/40">{getTimeAgo(order.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">No recent activity</p>
              </div>
            )}
          </div>

          {recentActivity.length > 0 && (
            <a
              href="/mgmt-x9k2m7/orders"
              className="block mt-4 text-center text-sm text-[#dc2626] hover:text-[#ef4444] font-medium transition-colors"
            >
              View all orders →
            </a>
          )}
        </div>
      </div>
    </AdminShell>
  );
}