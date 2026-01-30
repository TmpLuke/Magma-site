"use client";

import React from "react"

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  Shield,
  LogOut,
  Package,
  Clock,
  CheckCircle2,
  Eye,
  Camera,
  Save,
  ChevronRight,
  Key,
  Mail,
  Phone,
  Menu,
  X,
  Receipt,
  Calendar,
  CreditCard,
  Hash,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Download,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

type TabType = "dashboard" | "orders" | "delivered" | "profile" | "security";

interface Order {
  id: string;
  order_number: string;
  date: string;
  status: string;
  total: number;
  product: string;
  duration: string;
  paymentMethod?: string;
  licenseKey?: string;
}

interface License {
  id: string;
  license_key: string;
  product_name: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  order_id: string | null;
}


export default function AccountPage() {
  const { user, signOut, isLoading, updateProfile, changePassword } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.avatarUrl || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [ordersLicensesLoading, setOrdersLicensesLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({ fullName: user.username ?? "", email: user.email ?? "", phone: user.phone ?? "" });
      setProfileImage(user.avatarUrl ?? null);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setOrdersLicensesLoading(true);
    fetch("/api/store-auth/orders-licenses")
      .then((r) => r.json())
      .then((data) => {
        const rawOrders = data.orders ?? [];
        const rawLicenses = data.licenses ?? [];
        setLicenses(rawLicenses);
        const byOrderId = new Map<string, License>();
        rawLicenses.forEach((l: License) => { if (l.order_id) byOrderId.set(l.order_id, l); });
        setOrders(
          rawOrders.map((o: { id: string; order_number: string; product_name: string; duration: string; amount: number; status: string; created_at: string }) => ({
            id: o.id,
            order_number: o.order_number,
            date: o.created_at,
            status: o.status,
            total: o.amount,
            product: o.product_name,
            duration: o.duration,
            licenseKey: byOrderId.get(o.id)?.license_key,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setOrdersLicensesLoading(false));
  }, [user]);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // Security form state
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setRedirecting(true);
      router.replace("/");
    }
  }, [isLoading, user]);

  if (redirecting || (!isLoading && !user)) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#1a1a1a] rounded-full animate-spin" />
          <div className="w-16 h-16 border-t-4 border-[#dc2626] rounded-full animate-spin absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#1a1a1a] rounded-full animate-spin" />
          <div className="w-16 h-16 border-t-4 border-[#dc2626] rounded-full animate-spin absolute top-0 left-0" />
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut();
    router.push("/");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    const result = await updateProfile({
      username: profileForm.fullName,
      avatarUrl: profileImage || undefined,
      phone: profileForm.phone,
    });
    
    setIsSaving(false);
    
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation
    if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
      setPasswordError("Please fill in all fields");
      return;
    }

    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (securityForm.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);

    const result = await changePassword(securityForm.currentPassword, securityForm.newPassword);

    setIsChangingPassword(false);

    if (result.success) {
      setPasswordSuccess(true);
      setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(false), 5000);
    } else {
      setPasswordError(result.error || "Failed to change password");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case "pending":
      case "paid":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-0 flex items-center gap-1.5">
            <Clock className="w-3 h-3 animate-pulse" />
            In Progress
          </Badge>
        );
      case "failed":
      case "refunded":
        return (
          <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0">
            {status}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-0">
            {status}
          </Badge>
        );
    }
  };

  const stats = {
    totalOrders: orders.length,
    inProgress: orders.filter((o) => o.status === "pending" || o.status === "paid").length,
    completed: orders.filter((o) => o.status === "completed").length,
    deliveredCount: licenses.length,
  };

  const navItems = [
    { id: "dashboard" as TabType, icon: LayoutDashboard, label: "Dashboard" },
    { id: "orders" as TabType, icon: ShoppingBag, label: "Orders" },
    { id: "delivered" as TabType, icon: Package, label: "Delivered" },
    { id: "profile" as TabType, icon: User, label: "Profile" },
    { id: "security" as TabType, icon: Shield, label: "Security" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Enhanced Welcome Header */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-[#dc2626]/10">
                        <Sparkles className="w-5 h-5 text-[#dc2626]" />
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold text-white">
                        Welcome back, {user?.username || "User"}!
                      </h1>
                    </div>
                    <p className="text-white/60 mt-2">
                      Here&apos;s what&apos;s happening with your account
                    </p>
                  </div>
                  <div className="hidden md:block p-3 rounded-xl bg-[#dc2626]/10">
                    <TrendingUp className="w-8 h-8 text-[#dc2626]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { 
                  icon: Package, 
                  label: "Total Orders", 
                  value: stats.totalOrders, 
                  gradient: "from-[#dc2626]/20 to-transparent",
                  iconBg: "bg-[#dc2626]/10",
                  iconColor: "text-[#dc2626]"
                },
                { 
                  icon: Clock, 
                  label: "In Progress", 
                  value: stats.inProgress,
                  gradient: "from-yellow-500/20 to-transparent",
                  iconBg: "bg-yellow-500/10",
                  iconColor: "text-yellow-500"
                },
                { 
                  icon: CheckCircle2, 
                  label: "Completed", 
                  value: stats.completed,
                  gradient: "from-green-500/20 to-transparent",
                  iconBg: "bg-green-500/10",
                  iconColor: "text-green-500"
                },
                { 
                  icon: Key, 
                  label: "License Keys", 
                  value: stats.deliveredCount,
                  gradient: "from-blue-500/20 to-transparent",
                  iconBg: "bg-blue-500/10",
                  iconColor: "text-blue-500"
                },
              ].map((stat, index) => (
                <div key={index} className="group relative" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`} />
                  <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-[#dc2626]/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                      </div>
                      <TrendingUp className="w-4 h-4 text-green-400 opacity-50" />
                    </div>
                    <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Recent Orders */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardHeader className="flex flex-row items-center justify-between border-b border-[#1a1a1a]">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#dc2626]" />
                    Recent Orders
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                    className="text-[#dc2626] hover:text-[#ef4444] hover:bg-[#dc2626]/10"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  {ordersLicensesLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-[#1a1a1a] rounded-full animate-spin" />
                        <div className="w-12 h-12 border-t-4 border-[#dc2626] rounded-full animate-spin absolute top-0 left-0" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 3).map((order, index) => (
                        <div
                          key={order.id}
                          className="group/item relative"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-xl blur opacity-0 group-hover/item:opacity-100 transition duration-300" />
                          <div className="relative flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-xl bg-[#dc2626]/10 group-hover/item:scale-110 transition-transform">
                                <Package className="w-5 h-5 text-[#dc2626]" />
                              </div>
                              <div>
                                <p className="font-semibold text-white">{order.product}</p>
                                <p className="text-sm text-white/50 font-mono">
                                  {order.order_number} • {order.duration}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(order.status)}
                              <p className="text-sm text-white/60 mt-1 font-semibold">${order.total.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!ordersLicensesLoading && orders.length === 0 && (
                        <div className="py-12 text-center">
                          <div className="w-16 h-16 rounded-full bg-[#dc2626]/10 flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8 text-[#dc2626]" />
                          </div>
                          <p className="text-white/60">No orders yet</p>
                          <p className="text-white/40 text-sm mt-1">Your orders will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#dc2626]/10">
                    <ShoppingBag className="w-6 h-6 text-[#dc2626]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Your Orders</h1>
                    <p className="text-white/60 mt-1">View and manage your order history</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardContent className="p-0">
                  {ordersLicensesLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-[#1a1a1a] rounded-full animate-spin" />
                        <div className="w-12 h-12 border-t-4 border-[#dc2626] rounded-full animate-spin absolute top-0 left-0" />
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                            <TableHead className="text-white/60 font-semibold">Order ID</TableHead>
                            <TableHead className="text-white/60 font-semibold">Product</TableHead>
                            <TableHead className="text-white/60 font-semibold">Date</TableHead>
                            <TableHead className="text-white/60 font-semibold">Status</TableHead>
                            <TableHead className="text-white/60 font-semibold">Total</TableHead>
                            <TableHead className="text-white/60 font-semibold text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id} className="border-[#1a1a1a] hover:bg-[#0a0a0a]/50 group/row transition-colors">
                              <TableCell className="font-mono text-white/80">{order.order_number}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-semibold text-white group-hover/row:text-[#dc2626] transition-colors">{order.product}</p>
                                  <p className="text-sm text-white/50">{order.duration}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-white/70">
                                {new Date(order.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="font-bold text-white">${order.total.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewOrder(order)}
                                  className="text-[#dc2626] hover:text-[#ef4444] hover:bg-[#dc2626]/10"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {orders.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="py-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#dc2626]/10 flex items-center justify-center mx-auto mb-4">
                                  <ShoppingBag className="w-8 h-8 text-[#dc2626]" />
                                </div>
                                <p className="text-white/60">No orders yet</p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "delivered":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#dc2626]/10">
                    <Package className="w-6 h-6 text-[#dc2626]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Delivered Licenses</h1>
                    <p className="text-white/60 mt-1">
                      Licenses for purchases under your account email
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardContent className="p-0">
                  {ordersLicensesLoading ? (
                    <div className="py-12 flex justify-center">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-[#1a1a1a] rounded-full animate-spin" />
                        <div className="w-12 h-12 border-t-4 border-[#dc2626] rounded-full animate-spin absolute top-0 left-0" />
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                            <TableHead className="text-white/60 font-semibold">Product</TableHead>
                            <TableHead className="text-white/60 font-semibold">License Key</TableHead>
                            <TableHead className="text-white/60 font-semibold">Status</TableHead>
                            <TableHead className="text-white/60 font-semibold">Expires</TableHead>
                            <TableHead className="text-white/60 font-semibold text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {licenses.map((l) => (
                            <TableRow key={l.id} className="border-[#1a1a1a] hover:bg-[#0a0a0a]/50 group/row transition-colors">
                              <TableCell className="font-semibold text-white">{l.product_name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <code className="font-mono text-sm text-white/80 bg-black/30 px-3 py-1.5 rounded-lg">
                                    {l.license_key}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(l.license_key, l.id)}
                                    className="opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-[#dc2626]/10"
                                  >
                                    {copiedKey === l.id ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-white/60" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={l.status === "active" ? "bg-green-500/20 text-green-400 border-0" : "bg-white/10 text-white/60 border-0"}>
                                  {l.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-white/70">
                                {l.expires_at ? new Date(l.expires_at).toLocaleDateString("en-US") : "Never"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/your-invite-code', '_blank')}
                                  className="text-[#dc2626] hover:text-[#ef4444] hover:bg-[#dc2626]/10"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {licenses.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="py-16 text-center">
                                <div className="w-16 h-16 rounded-full bg-[#dc2626]/10 flex items-center justify-center mx-auto mb-4">
                                  <Key className="w-8 h-8 text-[#dc2626]" />
                                </div>
                                <p className="text-white/60">No licenses yet</p>
                                <p className="text-white/40 text-sm mt-1">Orders completed under your account email will appear here</p>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#dc2626]/10">
                    <User className="w-6 h-6 text-[#dc2626]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                    <p className="text-white/60 mt-1">Manage your personal information</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Enhanced Avatar Upload */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#1a1a1a]">
                      <div className="relative group/avatar">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626] to-[#ef4444] rounded-full blur opacity-0 group-hover/avatar:opacity-75 transition duration-500" />
                        <Avatar className="relative w-28 h-28 border-4 border-[#1a1a1a] group-hover/avatar:border-[#dc2626]/50 transition-colors">
                          <AvatarImage src={profileImage || undefined} alt="Profile" />
                          <AvatarFallback className="bg-[#dc2626]/20 text-[#dc2626] text-3xl font-bold">
                            {user?.username?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer"
                        >
                          <Camera className="w-8 h-8 text-white" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg mb-1">Profile Picture</h3>
                        <p className="text-sm text-white/60 mb-3">
                          Click on the avatar to upload a new image
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/50">Max size: 5MB</span>
                          <span className="text-white/30">•</span>
                          <span className="text-xs text-white/50">Formats: JPG, PNG</span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Form Fields */}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2 group/input">
                        <Label htmlFor="fullName" className="text-white font-medium">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#dc2626] transition-colors" />
                          <Input
                            id="fullName"
                            value={profileForm.fullName}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, fullName: e.target.value })
                            }
                            className="pl-11 bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 group/input">
                        <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <Input
                            id="email"
                            value={profileForm.email}
                            readOnly
                            className="pl-11 bg-[#0a0a0a]/50 border-[#1a1a1a] text-white/50 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-white/40">Email cannot be changed</p>
                      </div>

                      <div className="space-y-2 sm:col-span-2 group/input">
                        <Label htmlFor="phone" className="text-white font-medium">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#dc2626] transition-colors" />
                          <Input
                            id="phone"
                            value={profileForm.phone}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, phone: e.target.value })
                            }
                            className="pl-11 bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                            placeholder="+1 (555) 000-0000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Save Button */}
                    <div className="flex items-center gap-4 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="relative bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white shadow-lg shadow-[#dc2626]/30 hover:shadow-xl hover:shadow-[#dc2626]/50 transition-all overflow-hidden group/btn"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      {saveSuccess && (
                        <span className="text-green-400 text-sm flex items-center gap-2 animate-fade-in">
                          <CheckCircle2 className="w-5 h-5" />
                          Changes saved successfully!
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur-xl" />
              <div className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#dc2626]/10">
                    <Shield className="w-6 h-6 text-[#dc2626]" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">Security Settings</h1>
                    <p className="text-white/60 mt-1">Manage your account security</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardHeader className="border-b border-[#1a1a1a]">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Key className="w-5 h-5 text-[#dc2626]" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6 max-w-md">
                    <div className="space-y-2 group/input">
                      <Label htmlFor="currentPassword" className="text-white font-medium">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={securityForm.currentPassword}
                        onChange={(e) =>
                          setSecurityForm({ ...securityForm, currentPassword: e.target.value })
                        }
                        className="bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2 group/input">
                      <Label htmlFor="newPassword" className="text-white font-medium">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={securityForm.newPassword}
                        onChange={(e) =>
                          setSecurityForm({ ...securityForm, newPassword: e.target.value })
                        }
                        className="bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2 group/input">
                      <Label htmlFor="confirmPassword" className="text-white font-medium">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={securityForm.confirmPassword}
                        onChange={(e) =>
                          setSecurityForm({ ...securityForm, confirmPassword: e.target.value })
                        }
                        className="bg-[#0a0a0a] border-[#1a1a1a] text-white focus:border-[#dc2626] focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                      />
                    </div>

                    {passwordError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-shake">
                        {passwordError}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2">
                      <Button 
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="relative bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white shadow-lg shadow-[#dc2626]/30 hover:shadow-xl hover:shadow-[#dc2626]/50 transition-all overflow-hidden group/btn"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        {isChangingPassword ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                      {passwordSuccess && (
                        <span className="text-green-400 text-sm flex items-center gap-2 animate-fade-in">
                          <CheckCircle2 className="w-5 h-5" />
                          Password updated!
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 2FA Card */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                <CardHeader className="border-b border-[#1a1a1a]">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="w-5 h-5 text-[#dc2626]" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-lg mb-1">2FA Status</p>
                      <p className="text-sm text-white/60">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-0 px-4 py-2">
                      Not Enabled
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-6 bg-transparent border-[#1a1a1a] hover:bg-[#dc2626]/10 hover:border-[#dc2626] text-white transition-all"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Enable 2FA
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Header />

      <main className="relative pt-20 pb-32 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Enhanced Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <Card className="relative bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a]">
                    <CardContent className="p-6">
                      {/* Enhanced Profile Info */}
                      <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-[#1a1a1a]">
                        <div className="relative group/avatar mb-4">
                          <div className="absolute -inset-1 bg-gradient-to-r from-[#dc2626] to-[#ef4444] rounded-full blur opacity-75 group-hover/avatar:opacity-100 transition-opacity" />
                          <Avatar className="relative w-24 h-24 border-4 border-[#1a1a1a] ring-2 ring-[#dc2626]/20">
                            <AvatarImage src={profileImage || undefined} alt="Profile" />
                            <AvatarFallback className="bg-[#dc2626]/20 text-[#dc2626] text-2xl font-bold">
                              {user?.username?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <h3 className="font-bold text-white text-lg mb-1">{user?.username || "User"}</h3>
                        <p className="text-sm text-white/60 break-all">{user?.email}</p>
                        <div className="mt-3 px-3 py-1.5 bg-[#dc2626]/10 rounded-full">
                          <span className="text-xs text-[#dc2626] font-semibold">Premium Member</span>
                        </div>
                      </div>

                      {/* Enhanced Navigation */}
                      <nav className="space-y-1.5">
                        {navItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group/nav overflow-hidden ${
                              activeTab === item.id
                                ? "bg-[#dc2626]/10 text-[#dc2626]"
                                : "text-white/60 hover:bg-[#0a0a0a] hover:text-white"
                            }`}
                          >
                            {activeTab === item.id && (
                              <span className="absolute inset-0 bg-gradient-to-r from-[#dc2626]/20 to-transparent" />
                            )}
                            <item.icon className={`w-5 h-5 relative ${activeTab === item.id ? 'group-hover/nav:scale-110' : ''} transition-transform`} />
                            <span className="relative">{item.label}</span>
                            {activeTab === item.id && (
                              <ChevronRight className="w-4 h-4 ml-auto relative" />
                            )}
                          </button>
                        ))}

                        <div className="pt-4 mt-4 border-t border-[#1a1a1a]">
                          <button
                            onClick={handleSignOut}
                            className="relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all group/logout overflow-hidden"
                          >
                            <LogOut className="w-5 h-5 group-hover/logout:scale-110 transition-transform" />
                            Logout
                          </button>
                        </div>
                      </nav>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </aside>

            {/* Enhanced Mobile Bottom Tab Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#111111]/95 backdrop-blur-xl border-t border-[#1a1a1a] z-40 safe-area-pb">
              <div className="flex items-center justify-around px-2 py-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0 flex-1 active:scale-95 ${
                      activeTab === item.id
                        ? "text-[#dc2626]"
                        : "text-white/60"
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all ${
                      activeTab === item.id ? "bg-[#dc2626]/10 scale-110" : ""
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold truncate">{item.label.split(' ')[0]}</span>
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-0 flex-1 text-red-400 active:scale-95"
                >
                  <div className="p-2 rounded-xl">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold">Logout</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 pb-24 lg:pb-0">{renderContent()}</div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Enhanced Order Details Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#1a1a1a] max-w-lg p-0 overflow-hidden mx-4 sm:mx-auto rounded-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              {/* Enhanced Header with gradient */}
              <div className="relative bg-gradient-to-br from-[#dc2626]/20 via-[#dc2626]/10 to-transparent p-8 pb-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#dc2626]/10 rounded-full blur-3xl" />
                <DialogHeader className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-[#dc2626]/20 backdrop-blur-sm ring-2 ring-[#dc2626]/30">
                      <Receipt className="w-6 h-6 text-[#dc2626]" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-white">
                      Order Details
                    </DialogTitle>
                  </div>
                  <p className="text-sm text-white/70 font-mono bg-black/30 px-3 py-1.5 rounded-lg inline-block">
                    {selectedOrder.order_number}
                  </p>
                </DialogHeader>
              </div>

              {/* Content */}
              <div className="p-6 -mt-6">
                {/* Product Card */}
                <div className="bg-[#0a0a0a] rounded-2xl p-6 mb-6 border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-[#dc2626]/10 flex-shrink-0">
                        <Sparkles className="w-7 h-7 text-[#dc2626]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg mb-1">
                          {selectedOrder.product}
                        </h3>
                        <p className="text-sm text-white/60">{selectedOrder.duration}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right pl-14 sm:pl-0">
                      <p className="text-3xl font-bold text-[#dc2626]">${selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#0a0a0a]/50 rounded-xl p-4 border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#dc2626]" />
                      <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                        Date
                      </span>
                    </div>
                    <p className="font-semibold text-white">
                      {new Date(selectedOrder.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="bg-[#0a0a0a]/50 rounded-xl p-4 border border-[#1a1a1a] hover:border-[#dc2626]/30 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-[#dc2626]" />
                      <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                        Payment
                      </span>
                    </div>
                    <p className="font-semibold text-white">
                      {selectedOrder.paymentMethod || "Crypto"}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-[#0a0a0a]/50 rounded-xl p-4 mb-6 border border-[#1a1a1a]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-[#dc2626]" />
                      <span className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                        Status
                      </span>
                    </div>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>

                {/* License Key */}
                {selectedOrder.licenseKey && (
                  <div className="bg-gradient-to-r from-[#dc2626]/10 to-[#dc2626]/5 rounded-2xl p-5 border border-[#dc2626]/30 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Key className="w-5 h-5 text-[#dc2626]" />
                      <span className="text-xs text-[#dc2626] uppercase tracking-wider font-bold">
                        License Key
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-white bg-black/40 rounded-lg px-4 py-3 text-sm select-all break-all">
                        {selectedOrder.licenseKey}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(selectedOrder.licenseKey!, 'modal')}
                        className="flex-shrink-0 hover:bg-[#dc2626]/10"
                      >
                        {copiedKey === 'modal' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-white/60" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <Button
                  onClick={() => setOrderModalOpen(false)}
                  className="w-full py-6 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white font-bold text-lg shadow-lg shadow-[#dc2626]/30 hover:shadow-xl hover:shadow-[#dc2626]/50 transition-all rounded-xl"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}