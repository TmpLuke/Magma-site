"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  status: string;
  provider: string;
  created_at: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: "name",
      label: "Product Name",
      sortable: true,
      render: (product: Product) => (
        <div>
          <p className="text-white font-medium">{product.name}</p>
          <p className="text-xs text-white/50">{product.game}</p>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      sortable: true,
      render: (product: Product) => (
        <span className="font-mono text-white/70">{product.slug}</span>
      ),
    },
    {
      key: "provider",
      label: "Provider",
      sortable: true,
      render: (product: Product) => (
        <span className="text-white/70">{product.provider}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (product: Product) => {
        const statusColors = {
          Undetected: "bg-green-500/10 text-green-400 border-green-500/20",
          Updating: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          Detected: "bg-red-500/10 text-red-400 border-red-500/20",
        };
        return (
          <Badge className={statusColors[product.status as keyof typeof statusColors] || ""}>
            {product.status}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (product: Product) => (
        <span className="text-white/50 text-sm">
          {new Date(product.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminShell title="Products" subtitle="Manage your products">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Products" subtitle="Manage your products">
      <div className="mb-6">
        <Button
          onClick={() => loadProducts()}
          variant="outline"
          size="sm"
          className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <DataTable
        data={products}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search products..."
      />
    </AdminShell>
  );
}
