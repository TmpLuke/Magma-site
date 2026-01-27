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
      <div className="mb-6 flex items-center justify-between">
        <Button
          onClick={() => loadProducts()}
          variant="outline"
          size="sm"
          className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        
        <div className="text-white/50 text-sm">
          To add products, use the Supabase dashboard or create an admin UI for product management.
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#dc2626]/10 mb-4">
            <svg className="w-8 h-8 text-[#dc2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Products Yet</h3>
          <p className="text-white/50 max-w-md mx-auto mb-6">
            Add your first product through the Supabase dashboard to get started.
          </p>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg transition-colors"
          >
            Open Supabase Dashboard
          </a>
        </div>
      ) : (
        <DataTable
          data={products}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Search products..."
        />
      )}
    </AdminShell>
  );
}
