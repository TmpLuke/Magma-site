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
  MapPin,
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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

type TabType = "dashboard" | "orders" | "delivered" | "profile" | "addresses" | "security";

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

// Mock addresses
const mockAddresses = [
  {
    id: "1",
    label: "Home",
    name: "John Doe",
    street: "123 Gaming Street",
    city: "Los Angeles",
    state: "CA",
    zip: "90001",
    country: "United States",
    isDefault: true,
  },
  {
    id: "2",
    label: "Work",
    name: "John Doe",
    street: "456 Tech Avenue",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    country: "United States",
    isDefault: false,
  },
];

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
      case "paid":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-0">
            <Clock className="w-3 h-3 mr-1" />
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
    { id: "delivered" as TabType, icon: Package, label: "Delivered goods" },
    { id: "profile" as TabType, icon: User, label: "Profile Settings" },
    { id: "addresses" as TabType, icon: MapPin, label: "Addresses" },
    { id: "security" as TabType, icon: Shield, label: "Security" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, {user?.username || "User"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Here&apos;s what&apos;s happening with your account
              </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-yellow-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-yellow-500/10">
                      <Clock className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-green-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Key className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivered goods</p>
                      <p className="text-2xl font-bold text-foreground">{stats.deliveredCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("orders")}
                  className="text-primary hover:text-primary/80 hover:bg-primary/10"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {ordersLicensesLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{order.product}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.order_number} • {order.duration}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <p className="text-sm text-muted-foreground mt-1">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {!ordersLicensesLoading && orders.length === 0 && (
                      <p className="py-6 text-center text-muted-foreground text-sm">No orders yet</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Your Orders</h1>
              <p className="text-muted-foreground mt-1">View and manage your order history</p>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-0">
                {ordersLicensesLoading ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-muted-foreground">Order ID</TableHead>
                          <TableHead className="text-muted-foreground">Product</TableHead>
                          <TableHead className="text-muted-foreground">Date</TableHead>
                          <TableHead className="text-muted-foreground">Status</TableHead>
                          <TableHead className="text-muted-foreground">Total</TableHead>
                          <TableHead className="text-muted-foreground text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id} className="border-border hover:bg-secondary/50">
                            <TableCell className="font-mono text-foreground">{order.order_number}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">{order.product}</p>
                                <p className="text-sm text-muted-foreground">{order.duration}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(order.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="font-medium text-foreground">${order.total.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                                className="text-primary hover:text-primary/80 hover:bg-primary/10"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {orders.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                              No orders yet
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
        );

      case "delivered":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Delivered goods</h1>
              <p className="text-muted-foreground mt-1">
                Licenses for purchases under your account email. Buy with this email to see them here.
              </p>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-0">
                {ordersLicensesLoading ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-muted-foreground">Product</TableHead>
                          <TableHead className="text-muted-foreground">License key</TableHead>
                          <TableHead className="text-muted-foreground">Status</TableHead>
                          <TableHead className="text-muted-foreground">Expires</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {licenses.map((l) => (
                          <TableRow key={l.id} className="border-border hover:bg-secondary/50">
                            <TableCell className="font-medium text-foreground">{l.product_name}</TableCell>
                            <TableCell className="font-mono text-sm text-foreground">{l.license_key}</TableCell>
                            <TableCell>
                              <Badge className={l.status === "active" ? "bg-green-500/20 text-green-400 border-0" : "bg-muted text-muted-foreground border-0"}>
                                {l.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {l.expires_at ? new Date(l.expires_at).toLocaleDateString("en-US") : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                        {licenses.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                              No delivered licenses yet. Orders completed under your account email will appear here.
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
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your personal information</p>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="space-y-8">
                  {/* Avatar Upload */}
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                      <Avatar className="w-24 h-24 border-2 border-border">
                        <AvatarImage src={profileImage || undefined} alt="Profile" />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <Camera className="w-6 h-6 text-white" />
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
                      <h3 className="font-medium text-foreground">Profile Picture</h3>
                      <p className="text-sm text-muted-foreground">
                        Click on the avatar to upload a new image
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          value={profileForm.fullName}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, fullName: e.target.value })
                          }
                          className="pl-10 bg-secondary border-border focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          value={profileForm.email}
                          readOnly
                          className="pl-10 bg-secondary/50 border-border text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          className="pl-10 bg-secondary border-border focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    {saveSuccess && (
                      <span className="text-green-500 text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Changes saved successfully
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "addresses":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Addresses</h1>
                <p className="text-muted-foreground mt-1">Manage your saved addresses</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Address
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {mockAddresses.map((address) => (
                <Card
                  key={address.id}
                  className={`bg-card border-border hover:border-primary/50 transition-colors ${
                    address.isDefault ? "ring-1 ring-primary/50" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">{address.label}</span>
                      </div>
                      {address.isDefault && (
                        <Badge className="bg-primary/20 text-primary border-0">Default</Badge>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="text-foreground font-medium">{address.name}</p>
                      <p>{address.street}</p>
                      <p>
                        {address.city}, {address.state} {address.zip}
                      </p>
                      <p>{address.country}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-border hover:bg-secondary hover:text-foreground"
                      >
                        Edit
                      </Button>
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent border-border hover:bg-secondary hover:text-foreground"
                        >
                          Set as Default
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Security</h1>
              <p className="text-muted-foreground mt-1">Manage your account security settings</p>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Key className="w-5 h-5 text-primary" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-foreground">
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) =>
                        setSecurityForm({ ...securityForm, currentPassword: e.target.value })
                      }
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-foreground">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={securityForm.newPassword}
                      onChange={(e) =>
                        setSecurityForm({ ...securityForm, newPassword: e.target.value })
                      }
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={(e) =>
                        setSecurityForm({ ...securityForm, confirmPassword: e.target.value })
                      }
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
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
                      <span className="text-green-500 text-sm flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Password updated successfully
                      </span>
                    )}
                  </div>
                  {passwordError && (
                    <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="w-5 h-5 text-primary" />
                  Two-Factor Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">2FA Status</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-0">Not Enabled</Badge>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent border-border hover:bg-secondary hover:text-foreground"
                >
                  Enable 2FA
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    {/* Profile Info */}
                    <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-border">
                      <Avatar className="w-20 h-20 mb-3 border-2 border-border">
                        <AvatarImage src={profileImage || undefined} alt="Profile" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-foreground">{user?.username || "User"}</h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                      {navItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            activeTab === item.id
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      ))}

                      <div className="pt-4 mt-4 border-t border-border">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <LogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </div>
                    </nav>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Mobile Bottom Tab Bar - Fixed at bottom */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40 safe-area-pb">
              <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-0 flex-1 active:scale-95 ${
                      activeTab === item.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-colors ${
                      activeTab === item.id ? "bg-primary/10" : ""
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-medium truncate">{item.label.split(' ')[0]}</span>
                  </button>
                ))}
                <button
                  onClick={handleSignOut}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-0 flex-1 text-red-500 active:scale-95"
                >
                  <div className="p-2 rounded-xl">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-medium">Logout</span>
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 pb-24 lg:pb-0">{renderContent()}</div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Order Details Modal */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="bg-card border-border max-w-lg p-0 overflow-hidden mx-4 sm:mx-auto rounded-2xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              {/* Header with gradient */}
              <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <DialogHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/20 backdrop-blur-sm">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-foreground">
                      Order Details
                    </DialogTitle>
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{selectedOrder.order_number}</p>
                </DialogHeader>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 pt-0 -mt-4">
                {/* Product Card */}
                <div className="bg-secondary/50 rounded-xl p-4 mb-4 sm:mb-6 border border-border">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 flex-shrink-0">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-base sm:text-lg">
                          {selectedOrder.product}
                        </h3>
                        <p className="text-sm text-muted-foreground">{selectedOrder.duration}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right pl-12 sm:pl-0">
                      <p className="text-xl sm:text-2xl font-bold text-primary">${selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-secondary/30 rounded-xl p-3 sm:p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                        Date
                      </span>
                    </div>
                    <p className="font-medium text-foreground text-sm sm:text-base">
                      {new Date(selectedOrder.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="bg-secondary/30 rounded-xl p-3 sm:p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                        Payment
                      </span>
                    </div>
                    <p className="font-medium text-foreground text-sm sm:text-base">
                      {selectedOrder.paymentMethod || "Crypto"}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-secondary/30 rounded-lg p-4 mb-6 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        Status
                      </span>
                    </div>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>

                {/* License Key */}
                {selectedOrder.licenseKey && (
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-3 sm:p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-primary" />
                      <span className="text-[10px] sm:text-xs text-primary uppercase tracking-wider font-medium">
                        License Key
                      </span>
                    </div>
                    <p className="font-mono text-foreground bg-black/30 rounded-lg px-3 py-2.5 text-xs sm:text-sm select-all break-all">
                      {selectedOrder.licenseKey}
                    </p>
                  </div>
                )}

                {/* Close Button */}
                <Button
                  onClick={() => setOrderModalOpen(false)}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
