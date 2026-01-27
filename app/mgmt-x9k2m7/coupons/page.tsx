"use client";

import { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Power,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { useAdminStore } from "@/lib/admin-store";
import { getCouponsFromDB } from "@/lib/admin-actions";
import { mockCoupons } from "@/lib/admin-mock-data";
import type { Coupon } from "@/lib/admin-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function CouponStatusBadge({ status }: { status: Coupon["status"] }) {
  const styles = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    expired: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border",
        styles[status]
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CreateCouponModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addCoupon, isLoading } = useAdminStore();
  const [code, setCode] = useState("");
  const [type, setType] = useState<Coupon["type"]>("percentage");
  const [value, setValue] = useState(10);
  const [maxUses, setMaxUses] = useState(100);
  const [validDays, setValidDays] = useState(30);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCreate = async () => {
    if (!code) return;

    setCreating(true);
    setSuccess(false);

    try {
      const newCoupon: Coupon = {
        id: `coup_${Date.now()}`,
        code: code.toUpperCase(),
        type,
        value,
        maxUses,
        usedCount: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000),
        status: "active",
        createdAt: new Date(),
      };

      await addCoupon(newCoupon);
      setSuccess(true);
      
      setTimeout(() => {
        setCode("");
        setValue(10);
        setMaxUses(100);
        setValidDays(30);
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("[Admin] Error creating coupon:", error);
    } finally {
      setCreating(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    setCode(result);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Coupon</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Coupon created successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Coupon Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SUMMER20"
                disabled={creating}
                className="flex-1 px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white uppercase focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={generateCode}
                disabled={creating}
                className="px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Discount Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Coupon["type"])}
                disabled={creating}
                className="w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                  {type === "percentage" ? "%" : "$"}
                </span>
                <input
                  type="number"
                  min="1"
                  max={type === "percentage" ? 100 : 1000}
                  value={value}
                  onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                  disabled={creating}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Max Uses
              </label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                disabled={creating}
                className="w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Valid for (days)
              </label>
              <input
                type="number"
                min="1"
                value={validDays}
                onChange={(e) => setValidDays(parseInt(e.target.value) || 1)}
                disabled={creating}
                className="w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!code || creating || isLoading}
            className="w-full px-4 py-2.5 bg-[#dc2626] hover:bg-[#ef4444] disabled:bg-[#dc2626]/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Coupon"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CouponsPage() {
  const { coupons, updateCoupon, deleteCoupon, setCoupons, isLoading } = useAdminStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<Coupon["status"] | "all">("all");
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load coupons from database on mount
  useEffect(() => {
    async function loadCoupons() {
      setPageLoading(true);
      try {
        const result = await getCouponsFromDB();
        if (result.success && result.data && result.data.length > 0) {
          const formattedCoupons = result.data.map((c) => ({
            id: c.id,
            code: c.code,
            type: "percentage" as const,
            value: c.discount_percent,
            maxUses: c.max_uses,
            usedCount: c.current_uses || 0,
            validFrom: new Date(c.created_at),
            validUntil: c.valid_until ? new Date(c.valid_until) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: (c.is_active ? "active" : "inactive") as "active" | "inactive" | "expired",
            createdAt: new Date(c.created_at),
          }));
          setCoupons(formattedCoupons);
        } else {
          setCoupons(mockCoupons);
        }
      } catch (error) {
        console.error("[Admin] Error loading coupons:", error);
        setCoupons(mockCoupons);
      } finally {
        setPageLoading(false);
      }
    }

    loadCoupons();
  }, [setCoupons]);

  const filteredCoupons =
    filter === "all" ? coupons : coupons.filter((c) => c.status === filter);

  const handleToggleStatus = async (coupon: Coupon) => {
    setActionLoadingId(coupon.id);
    await updateCoupon(coupon.id, {
      status: coupon.status === "active" ? "inactive" : "active",
    });
    setActionLoadingId(null);
  };

  const handleDelete = async (couponId: string) => {
    setActionLoadingId(couponId);
    await deleteCoupon(couponId);
    setActionLoadingId(null);
  };

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#dc2626]" />
          <span className="font-mono font-medium text-white">{coupon.code}</span>
          {actionLoadingId === coupon.id && (
            <Loader2 className="w-3 h-3 animate-spin text-white/50" />
          )}
        </div>
      ),
    },
    {
      key: "value",
      label: "Discount",
      render: (coupon: Coupon) => (
        <span className="text-white font-medium">
          {coupon.type === "percentage"
            ? `${coupon.value}%`
            : `$${coupon.value.toFixed(2)}`}
        </span>
      ),
    },
    {
      key: "usedCount",
      label: "Usage",
      render: (coupon: Coupon) => (
        <div>
          <p className="text-white">
            {coupon.usedCount} / {coupon.maxUses || "∞"}
          </p>
          {coupon.maxUses && (
            <div className="w-20 h-1.5 bg-[#1a1a1a] rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-[#dc2626] rounded-full"
                style={{
                  width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "validUntil",
      label: "Expires",
      render: (coupon: Coupon) => (
        <span className="text-white/70 text-sm">
          {coupon.validUntil.toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (coupon: Coupon) => <CouponStatusBadge status={coupon.status} />,
    },
  ];

  const actions = (coupon: Coupon) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-white/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#111111] border-[#262626]">
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(coupon.code)}
          className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Code
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
          disabled={actionLoadingId === coupon.id}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Coupon
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleToggleStatus(coupon)}
          disabled={actionLoadingId === coupon.id}
          className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
        >
          <Power className="w-4 h-4 mr-2" />
          {coupon.status === "active" ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#262626]" />
        <DropdownMenuItem
          onClick={() => handleDelete(coupon.id)}
          disabled={actionLoadingId === coupon.id}
          className="text-red-400 focus:bg-[#1a1a1a] focus:text-red-400"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Coupon
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const statusCounts = {
    all: coupons.length,
    active: coupons.filter((c) => c.status === "active").length,
    inactive: coupons.filter((c) => c.status === "inactive").length,
    expired: coupons.filter((c) => c.status === "expired").length,
  };

  if (pageLoading) {
    return (
      <AdminShell title="Coupons" subtitle="Create and manage discount codes">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Coupons" subtitle="Create and manage discount codes">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(["all", "active", "inactive", "expired"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                filter === status
                  ? "bg-[#dc2626] text-white"
                  : "bg-[#1a1a1a] text-white/60 hover:text-white hover:bg-[#262626]"
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 px-1.5 py-0.5 rounded bg-black/20 text-xs">
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>

        {/* Create Button */}
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <DataTable
        data={filteredCoupons}
        columns={columns}
        searchKey="code"
        searchPlaceholder="Search by code..."
        actions={actions}
      />

      {/* Create Modal */}
      <CreateCouponModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </AdminShell>
  );
}
