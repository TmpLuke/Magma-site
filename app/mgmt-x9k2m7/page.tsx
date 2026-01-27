"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Users, Key, Package, TrendingUp, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/admin/stat-card";
import { useAdminStore } from "@/lib/admin-store";
import { getDashboardStats, getOrdersFromDB, getProductsFromDB, getLicensesFromDB } from "@/lib/admin-actions";
import { mockOrders, mockProducts, mockLicenseKeys } from "@/lib/admin-mock-data";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeLicenses: number;
  totalReviews: number;
  avgRating: string;
  revenueChange: string;
  ordersChange: string;
  usersChange: string;
  licensesChange: string;
}

function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
          <p className="text-sm text-white/50">Last 7 days</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
            <span className="text-xs text-white/50">Revenue</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111111",
                border: "1px solid #262626",
                borderRadius: "8px",
                color: "#fff",
              }}
              formatter={(value: number) => [`$${value}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#dc2626"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OrdersChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Orders</h3>
          <p className="text-sm text-white/50">Daily order count</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111111",
                border: "1px solid #262626",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Bar dataKey="orders" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecentOrders() {
  const { orders } = useAdminStore();
  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400";
      case "pending":
        return "bg-yellow-500/10 text-yellow-400";
      case "failed":
        return "bg-red-500/10 text-red-400";
      case "refunded":
        return "bg-purple-500/10 text-purple-400";
      default:
        return "bg-gray-500/10 text-gray-400";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
      <div className="p-4 border-b border-[#1a1a1a] flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
        <a
          href="/admin/orders"
          className="text-sm text-[#dc2626] hover:text-[#ef4444] transition-colors"
        >
          View all
        </a>
      </div>
      <div className="divide-y divide-[#1a1a1a]">
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-white/50">
            No orders yet
          </div>
        ) : (
          recentOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 flex items-center justify-between hover:bg-[#111111] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#dc2626]/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-[#dc2626]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-white/50">{order.customerEmail}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  ${order.total.toFixed(2)}
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-white/40">
                    {formatTime(order.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function QuickStats() {
  const { products, licenseKeys } = useAdminStore();

  const activeProducts = products.filter((p) => p.status === "active").length;
  const availableKeys = licenseKeys.filter((l) => l.status === "available").length;
  const lowStockProducts = products.filter((p) =>
    p.pricing.some((pr) => pr.stock < 5)
  ).length;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-[#dc2626]" />
            <span className="text-sm text-white/70">Active Products</span>
          </div>
          <span className="text-sm font-medium text-white">{activeProducts}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white/70">Available Keys</span>
          </div>
          <span className="text-sm font-medium text-white">{availableKeys}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-white/70">Low Stock Alerts</span>
          </div>
          <span className="text-sm font-medium text-yellow-400">
            {lowStockProducts}
          </span>
        </div>
      </div>
    </div>
  );
}

function ActivityLog() {
  const { orders } = useAdminStore();
  
  // Generate activity from recent orders
  const activities = orders.slice(0, 5).map((order) => ({
    id: order.id,
    username: order.customerEmail.split("@")[0],
    action: order.status === "completed" ? "order.completed" : `order.${order.status}`,
    details: `Order ${order.orderNumber} - ${order.productName}`,
    timestamp: order.createdAt,
  }));

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getActionColor = (action: string) => {
    if (action.includes("refund")) return "text-purple-400";
    if (action.includes("revoke") || action.includes("failed")) return "text-red-400";
    if (action.includes("complete")) return "text-green-400";
    return "text-blue-400";
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
      <div className="p-4 border-b border-[#1a1a1a]">
        <h3 className="text-lg font-semibold text-white">Activity Log</h3>
      </div>
      <div className="divide-y divide-[#1a1a1a]">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-white/50">
            No recent activity
          </div>
        ) : (
          activities.map((log) => (
            <div key={log.id} className="p-4 hover:bg-[#111111] transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white">
                    <span className="font-medium">{log.username}</span>{" "}
                    <span className={getActionColor(log.action)}>
                      {log.action.replace(".", " ")}
                    </span>
                  </p>
                  <p className="text-xs text-white/50 mt-1">{log.details}</p>
                </div>
                <span className="text-xs text-white/40">
                  {formatTime(log.timestamp)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const { setOrders, setProducts, setLicenseKeys } = useAdminStore();

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        // Load stats and data in parallel
        const [statsResult, ordersResult, productsResult, licensesResult] = await Promise.all([
          getDashboardStats(),
          getOrdersFromDB(),
          getProductsFromDB(),
          getLicensesFromDB(),
        ]);

        if (statsResult.success) {
          setStats(statsResult.data);
        }

        // Generate chart data from orders
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split("T")[0];
        });

        const chartDataMap = new Map<string, { revenue: number; orders: number }>();
        last7Days.forEach((date) => {
          chartDataMap.set(date, { revenue: 0, orders: 0 });
        });

        if (ordersResult.data) {
          for (const order of ordersResult.data) {
            const orderDate = new Date(order.created_at).toISOString().split("T")[0];
            if (chartDataMap.has(orderDate)) {
              const current = chartDataMap.get(orderDate)!;
              current.orders += 1;
              if (order.status === "completed") {
                current.revenue += Number(order.amount) || 0;
              }
            }
          }
        }

        setChartData(
          last7Days.map((date) => ({
            date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
            ...chartDataMap.get(date)!,
          }))
        );

        // Update store with fetched data (convert DB format to store format)
        if (ordersResult.data && ordersResult.data.length > 0) {
          const formattedOrders = ordersResult.data.map((o) => ({
            id: o.id,
            orderNumber: o.order_number,
            customerName: o.customer_email.split("@")[0],
            customerEmail: o.customer_email,
            productId: o.product_id,
            productName: o.product_name,
            duration: o.duration,
            quantity: 1,
            subtotal: Number(o.amount),
            discount: 0,
            total: Number(o.amount),
            status: o.status as "pending" | "completed" | "failed" | "refunded",
            paymentMethod: o.payment_method,
            createdAt: new Date(o.created_at),
          }));
          setOrders(formattedOrders);
        } else {
          setOrders(mockOrders);
        }

        if (productsResult.data && productsResult.data.length > 0) {
          const formattedProducts = productsResult.data.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            game: p.game,
            description: p.description || "",
            image: p.image || "/images/apex-product.png",
            gallery: p.gallery || [],
            status: (p.status === "Undetected" ? "active" : "inactive") as "active" | "inactive" | "maintenance",
            pricing: p.pricing || [{ duration: "1 Day", price: 9.99, stock: 10 }],
            features: p.features || { aimbot: [], esp: [], misc: [] },
            requirements: p.requirements || { cpu: "Intel", windows: "10-11", cheatType: "External", controller: false },
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
          }));
          setProducts(formattedProducts);
        } else {
          setProducts(mockProducts);
        }

        if (licensesResult.data && licensesResult.data.length > 0) {
          const formattedLicenses = licensesResult.data.map((l) => ({
            id: l.id,
            key: l.license_key,
            productId: l.product_id,
            productName: l.product_name,
            status: (l.status === "unused" ? "available" : l.status) as "available" | "active" | "expired" | "revoked",
            duration: "30 Days",
            customerEmail: l.customer_email,
            hwid: l.hwid,
            activatedAt: l.created_at ? new Date(l.created_at) : undefined,
            expiresAt: l.expires_at ? new Date(l.expires_at) : undefined,
            createdAt: new Date(l.created_at),
          }));
          setLicenseKeys(formattedLicenses);
        } else {
          setLicenseKeys(mockLicenseKeys);
        }
      } catch (error) {
        console.error("[Admin] Error loading dashboard:", error);
        // Use mock data as fallback on error
        setOrders(mockOrders);
        setProducts(mockProducts);
        setLicenseKeys(mockLicenseKeys);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [setOrders, setProducts, setLicenseKeys]);

  if (loading) {
    return (
      <AdminShell title="Dashboard" subtitle="Welcome back, MagmaAdmin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard" subtitle="Welcome back, MagmaAdmin">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={(stats?.totalRevenue || 0).toLocaleString()}
          change={stats?.revenueChange || "+0%"}
          icon={DollarSign}
          prefix="$"
        />
        <StatCard
          title="Total Orders"
          value={(stats?.totalOrders || 0).toString()}
          change={stats?.ordersChange || "+0%"}
          icon={ShoppingCart}
        />
        <StatCard
          title="Active Users"
          value={(stats?.activeLicenses || 0).toString()}
          change={stats?.usersChange || "+0%"}
          icon={Users}
        />
        <StatCard
          title="Active Licenses"
          value={(stats?.activeLicenses || 0).toString()}
          change={stats?.licensesChange || "+0%"}
          icon={Key}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart data={chartData} />
        <OrdersChart data={chartData} />
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrders />
        </div>
        <div className="space-y-6">
          <QuickStats />
          <ActivityLog />
        </div>
      </div>
    </AdminShell>
  );
}
