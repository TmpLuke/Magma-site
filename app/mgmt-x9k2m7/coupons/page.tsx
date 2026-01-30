"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RefreshCw, Plus, Edit, Trash2, Power, Tag, Percent, Users, Calendar, AlertCircle, Check, X, Ticket, TrendingUp, Infinity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } from "@/app/actions/admin-coupons";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface CouponFormData {
  code: string;
  discount_percent: string;
  max_uses: string;
  valid_until: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    discount_percent: "",
    max_uses: "",
    valid_until: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Failed to load coupons:", error);
      toast({
        title: "Error",
        description: "Failed to load coupons. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCoupon() {
    try {
      setProcessing("add");
      
      const result = await createCoupon({
        code: formData.code.toUpperCase(),
        discount_percent: parseInt(formData.discount_percent),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Coupon created successfully",
        className: "border-green-500/20 bg-green-500/10",
      });
      
      setShowAddModal(false);
      resetForm();
      await loadCoupons();
    } catch (error: any) {
      console.error("Failed to add coupon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function handleEditCoupon() {
    if (!selectedCoupon) return;
    
    try {
      setProcessing("edit");
      
      const result = await updateCoupon(selectedCoupon.id, {
        code: formData.code.toUpperCase(),
        discount_percent: parseInt(formData.discount_percent),
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Coupon updated successfully",
        className: "border-blue-500/20 bg-blue-500/10",
      });
      
      setShowEditModal(false);
      setSelectedCoupon(null);
      resetForm();
      await loadCoupons();
    } catch (error: any) {
      console.error("Failed to edit coupon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function handleDeleteCoupon() {
    if (!selectedCoupon) return;
    
    try {
      setProcessing("delete");
      
      const result = await deleteCoupon(selectedCoupon.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Coupon deleted successfully",
        className: "border-red-500/20 bg-red-500/10",
      });
      
      setShowDeleteModal(false);
      setSelectedCoupon(null);
      await loadCoupons();
    } catch (error: any) {
      console.error("Failed to delete coupon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function handleToggleStatus(coupon: Coupon) {
    try {
      setProcessing(coupon.id);
      
      const result = await toggleCouponStatus(coupon.id, coupon.is_active);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: `Coupon ${!coupon.is_active ? "activated" : "deactivated"}`,
        className: !coupon.is_active ? "border-green-500/20 bg-green-500/10" : "border-gray-500/20 bg-gray-500/10",
      });
      
      await loadCoupons();
    } catch (error: any) {
      console.error("Failed to toggle coupon status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon status.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  function openEditModal(coupon: Coupon) {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_percent: coupon.discount_value.toString(),
      max_uses: coupon.max_uses?.toString() || "",
      valid_until: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : "",
    });
    setShowEditModal(true);
  }

  function openDeleteModal(coupon: Coupon) {
    setSelectedCoupon(coupon);
    setShowDeleteModal(true);
  }

  function resetForm() {
    setFormData({
      code: "",
      discount_percent: "",
      max_uses: "",
      valid_until: "",
    });
  }

  // Calculate stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.is_active).length;
  const totalUses = coupons.reduce((sum, c) => sum + c.current_uses, 0);
  const avgDiscount = coupons.length > 0 
    ? Math.round(coupons.reduce((sum, c) => sum + c.discount_value, 0) / coupons.length)
    : 0;

  const columns = [
    {
      key: "code",
      label: "Coupon Code",
      sortable: true,
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#dc2626]/20 to-[#dc2626]/5 border border-[#dc2626]/10 flex items-center justify-center group-hover:border-[#dc2626]/30 transition-all">
            <Ticket className="w-5 h-5 text-[#dc2626]/70" />
          </div>
          <div>
            <code className="font-mono text-white font-bold tracking-wide text-sm group-hover:text-[#dc2626] transition-colors">
              {coupon.code}
            </code>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Percent className="w-3 h-3 text-white/40" />
              <p className="text-xs text-white/50 font-medium">{coupon.discount_value}% off</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "discount_percent",
      label: "Discount",
      sortable: true,
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <span className="text-emerald-400 font-bold text-sm">{coupon.discount_value}%</span>
          </div>
        </div>
      ),
    },
    {
      key: "current_uses",
      label: "Usage",
      sortable: true,
      render: (coupon: Coupon) => {
        const percentage = coupon.max_uses 
          ? Math.round((coupon.current_uses / coupon.max_uses) * 100)
          : 0;
        const isNearLimit = coupon.max_uses && percentage >= 80;
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-white/30" />
              <span className="text-white/70 font-medium tabular-nums">
                {coupon.current_uses} / {coupon.max_uses || <Infinity className="w-3.5 h-3.5 inline text-white/40" />}
              </span>
            </div>
            {coupon.max_uses && (
              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    isNearLimit ? "bg-amber-500" : "bg-[#dc2626]"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (coupon: Coupon) => {
        const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
        const status = isExpired ? "expired" : (coupon.is_active ? "active" : "inactive");
        
        const statusConfig = {
          active: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
            border: "border-emerald-500/30",
            icon: Check,
            label: "Active",
          },
          inactive: {
            bg: "bg-gray-500/10",
            text: "text-gray-400",
            border: "border-gray-500/30",
            icon: X,
            label: "Inactive",
          },
          expired: {
            bg: "bg-red-500/10",
            text: "text-red-400",
            border: "border-red-500/30",
            icon: AlertCircle,
            label: "Expired",
          },
        };
        
        const config = statusConfig[status];
        const Icon = config.icon;
        
        return (
          <Badge className={`${config.bg} ${config.text} ${config.border} border font-medium px-2.5 py-1 flex items-center gap-1.5 w-fit`}>
            <Icon className="w-3 h-3" />
            <span>{config.label}</span>
          </Badge>
        );
      },
    },
    {
      key: "valid_until",
      label: "Expires",
      sortable: true,
      render: (coupon: Coupon) => {
        const isExpired = coupon.valid_until && new Date(coupon.valid_until) < new Date();
        const isExpiringSoon = coupon.valid_until && 
          new Date(coupon.valid_until) > new Date() && 
          new Date(coupon.valid_until) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-white/30" />
            <span className={`text-sm font-medium tabular-nums ${
              isExpired ? "text-red-400" : 
              isExpiringSoon ? "text-amber-400" : 
              "text-white/50"
            }`}>
              {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }) : "Never"}
            </span>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <AdminShell title="Coupons" subtitle="Manage discount codes and promotions">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#dc2626]/20 border-t-[#dc2626] animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-[#dc2626]/5 blur-xl animate-pulse" />
          </div>
          <p className="text-white/40 text-sm font-medium">Loading coupons...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Coupons" subtitle="Manage discount codes and promotions">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-[#dc2626]/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Coupons</p>
              <p className="text-2xl font-bold text-white mt-1">{totalCoupons}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
              <Tag className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{activeCoupons}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Uses</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{totalUses}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Avg Discount</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{avgDiscount}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Percent className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => loadCoupons()}
            variant="outline"
            size="sm"
            disabled={loading}
            className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] hover:border-[#dc2626]/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          size="sm"
          className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={coupons}
        columns={columns}
        searchKey="code"
        searchPlaceholder="Search coupons..."
        actions={(coupon) => (
          <div className="flex gap-1.5">
            <Button
              onClick={() => handleToggleStatus(coupon)}
              size="sm"
              variant="ghost"
              disabled={processing === coupon.id}
              className={`
                ${coupon.is_active 
                  ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10" 
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"}
                transition-all
              `}
              title={coupon.is_active ? "Deactivate" : "Activate"}
            >
              {processing === coupon.id ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Power className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={() => openEditModal(coupon)}
              size="sm"
              variant="ghost"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => openDeleteModal(coupon)}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      {/* Add Coupon Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#dc2626]" />
              </div>
              Create New Coupon
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Add a new discount coupon for your customers
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">
                Coupon Code <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER25"
                  className="bg-[#1a1a1a] border-[#262626] text-white font-mono uppercase pl-10 focus:border-[#dc2626]/50 transition-colors"
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-white/40">Use uppercase letters and numbers only</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Discount % <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    placeholder="25"
                    className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-[#dc2626]/50 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">Max Uses</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Unlimited"
                    className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-[#dc2626]/50 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">Expiration Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-[#dc2626]/50 transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <p className="text-xs text-white/40">Leave empty for no expiration</p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => { setShowAddModal(false); resetForm(); }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddCoupon}
              disabled={processing === "add" || !formData.code || !formData.discount_percent}
              className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {processing === "add" ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Coupon
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Edit className="w-4 h-4 text-blue-400" />
              </div>
              Edit Coupon
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Update coupon details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">
                Coupon Code <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="bg-[#1a1a1a] border-[#262626] text-white font-mono uppercase pl-10 focus:border-blue-500/50 transition-colors"
                  maxLength={20}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Discount % <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">Max Uses</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Unlimited"
                    className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">Expiration Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-blue-500/50 transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => { setShowEditModal(false); setSelectedCoupon(null); resetForm(); }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCoupon}
              disabled={processing === "edit" || !formData.code || !formData.discount_percent}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {processing === "edit" ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              Delete Coupon
            </DialogTitle>
            <DialogDescription className="text-white/50">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <p className="text-white/70">
                Are you sure you want to delete coupon{" "}
                <code className="font-mono font-bold text-white bg-red-500/10 px-2 py-0.5 rounded">
                  {selectedCoupon?.code}
                </code>?
              </p>
              <p className="text-white/50 text-sm mt-2">
                This coupon has been used <span className="font-semibold text-white">{selectedCoupon?.current_uses}</span> times.
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => { setShowDeleteModal(false); setSelectedCoupon(null); }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCoupon}
              disabled={processing === "delete"}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {processing === "delete" ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Coupon
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}