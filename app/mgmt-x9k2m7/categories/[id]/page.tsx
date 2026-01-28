"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  RefreshCw,
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  FolderOpen,
  Image as ImageIcon,
  DollarSign,
  Tag,
} from "lucide-react";
import { getCategoryProducts } from "@/app/actions/admin-categories";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  status: string;
  image: string | null;
  price: number;
  category_id: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  display_order: number;
}

export default function CategoryProductsPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (categoryId) {
      loadCategoryAndProducts();
    }
  }, [categoryId]);

  async function loadCategoryAndProducts() {
    try {
      setLoading(true);
      const supabase = createClient();

      // Load category details
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .single();

      if (categoryError) throw categoryError;
      setCategory(categoryData);

      // Load products in this category
      const result = await getCategoryProducts(categoryId);
      if (result.success) {
        setProducts(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "maintenance":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "maintenance":
        return "Maintenance";
      default:
        return status;
    }
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (product: Product) => (
        <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] overflow-hidden relative flex-shrink-0 border border-[#262626]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white/20" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Product Name",
      render: (product: Product) => (
        <div>
          <div className="font-semibold text-white">{product.name}</div>
          <div className="text-xs text-white/40">{product.game}</div>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (product: Product) => (
        <span className="px-2 py-1 bg-[#1a1a1a] rounded border border-[#262626] text-xs text-white/70">
          {product.slug}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (product: Product) => (
        <div className="flex items-center gap-1.5 text-white/80">
          <DollarSign className="w-4 h-4 text-green-400" />
          <span>${product.price.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (product: Product) => (
        <Badge className={`${getStatusColor(product.status)} border`}>
          {getStatusText(product.status)}
        </Badge>
      ),
    },
  ];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => router.push("/mgmt-x9k2m7/categories")}
            variant="outline"
            size="sm"
            className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Button>

          {category && (
            <div className="bg-gradient-to-r from-[#dc2626]/10 to-transparent border border-[#dc2626]/20 rounded-xl p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl bg-[#1a1a1a] overflow-hidden relative flex-shrink-0 border border-[#262626]">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-10 h-10 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">{category.name}</h1>
                  {category.description && (
                    <p className="text-white/60 text-sm mb-3">{category.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-white/40" />
                      <span className="text-white/60">
                        Slug: <span className="text-white/80">{category.slug}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-white/40" />
                      <span className="text-white/60">
                        Products: <span className="text-white/80">{products.length}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={loadCategoryAndProducts}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-[#dc2626]" />
              Products in this Category
            </h2>
            <Link href="/mgmt-x9k2m7/products">
              <Button
                size="sm"
                variant="outline"
                className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Manage Products
              </Button>
            </Link>
          </div>

          <DataTable
            columns={columns}
            data={products}
            loading={loading}
            emptyMessage="No products in this category yet"
            actions={(product) => (
              <div className="flex gap-1.5">
                <Link href={`/mgmt-x9k2m7/products`}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                    title="Edit Product"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          />
        </div>

        {/* Empty State */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12 bg-[#111111] border border-[#1a1a1a] rounded-xl">
            <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Products Yet</h3>
            <p className="text-white/50 mb-6">
              This category doesn't have any products assigned to it yet.
            </p>
            <Link href="/mgmt-x9k2m7/products">
              <Button className="bg-[#dc2626] hover:bg-[#ef4444] text-white">
                <Package className="w-4 h-4 mr-2" />
                Go to Products
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
