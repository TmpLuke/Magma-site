"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_until: string | null;
  created_at: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Failed to load coupons:", error);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true,
      render: (coupon: Coupon) => (
        <span className="font-mono text-white font-semibold">{coupon.code}</span>
      ),
    },
    {
      key: "discount_percent",
      label: "Discount",
      sortable: true,
      render: (coupon: Coupon) => (
        <span className="text-white/70">{coupon.discount_percent}%</span>
      ),
    },
    {
      key: "current_uses",
      label: "Usage",
      sortable: true,
      render: (coupon: Coupon) => (
        <span className="text-white/70">
          {coupon.current_uses} / {coupon.max_uses || "∞"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (coupon: Coupon) => (
        <Badge className={coupon.is_active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}>
          {coupon.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "valid_until",
      label: "Expires",
      sortable: true,
      render: (coupon: Coupon) => (
        <span className="text-white/50 text-sm">
          {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : "Never"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminShell title="Coupons" subtitle="Manage discount coupons">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Coupons" subtitle="Manage discount coupons">
      <div className="mb-6">
        <Button
          onClick={() => loadCoupons()}
          variant="outline"
          size="sm"
          className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <DataTable
        data={coupons}
        columns={columns}
        searchKey="code"
        searchPlaceholder="Search coupons..."
      />
    </AdminShell>
  );
}
