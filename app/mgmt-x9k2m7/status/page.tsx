"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle, Wrench, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateProductStatus } from "@/app/actions/admin-status";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  status: string;
  image: string | null;
  updated_at: string;
}

export default function AdminStatusPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, game, status, image, updated_at")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(productId: string, newStatus: string) {
    try {
      setUpdating(productId);
      
      const result = await updateProductStatus(productId, newStatus);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "✅ Status Updated",
        description: `Product status changed to ${getStatusText(newStatus)}`,
      });

      await loadProducts();
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Online";
      case "inactive":
        return "Offline";
      case "maintenance":
        return "Updating";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5" />;
      case "inactive":
        return <AlertCircle className="w-5 h-5" />;
      case "maintenance":
        return <Wrench className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "inactive":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "maintenance":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  if (loading) {
    return (
      <AdminShell title="Product Status" subtitle="Manage product detection status">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Product Status" subtitle="Manage product detection status in real-time">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-sm text-white/50">
            {products.filter(p => p.status === "active").length} Online • {products.filter(p => p.status === "maintenance").length} Updating • {products.filter(p => p.status === "inactive").length} Offline
          </p>
        </div>
        <Button
          onClick={loadProducts}
          variant="outline"
          size="sm"
          disabled={loading}
          className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Products Yet</h3>
          <p className="text-white/50 mb-6">Add products to manage their status</p>
          <Button
            onClick={() => window.location.href = "/mgmt-x9k2m7/products"}
            className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
          >
            Go to Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#262626] transition-all duration-200 group"
            >
              <div className="p-6">
                {/* Product Header */}
                <div className="flex items-start gap-4 mb-6">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#262626] flex-shrink-0 group-hover:border-[#dc2626]/30 transition-colors">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-[#dc2626] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-white/50 mb-2">{product.game}</p>
                    
                    {/* Current Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor(product.status)}`}>
                      {getStatusIcon(product.status)}
                      <span className="text-sm font-medium">
                        {getStatusText(product.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Change Buttons */}
                <div className="space-y-2">
                  <p className="text-xs text-white/40 mb-3 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#dc2626]" />
                    Quick Status Change
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleStatusChange(product.id, "active")}
                      disabled={product.status === "active" || updating === product.id}
                      className={`relative px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        product.status === "active"
                          ? "bg-green-500/20 text-green-400 border-2 border-green-500/40 cursor-default shadow-lg shadow-green-500/10"
                          : "bg-[#111111] text-white/70 border-2 border-[#262626] hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30 hover:scale-105"
                      } ${updating === product.id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {updating === product.id && product.status !== "active" ? (
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-xs">Online</span>
                        </div>
                      )}
                      {product.status === "active" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      )}
                    </button>

                    <button
                      onClick={() => handleStatusChange(product.id, "maintenance")}
                      disabled={product.status === "maintenance" || updating === product.id}
                      className={`relative px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        product.status === "maintenance"
                          ? "bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/40 cursor-default shadow-lg shadow-yellow-500/10"
                          : "bg-[#111111] text-white/70 border-2 border-[#262626] hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/30 hover:scale-105"
                      } ${updating === product.id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {updating === product.id && product.status !== "maintenance" ? (
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Wrench className="w-5 h-5" />
                          <span className="text-xs">Updating</span>
                        </div>
                      )}
                      {product.status === "maintenance" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                      )}
                    </button>

                    <button
                      onClick={() => handleStatusChange(product.id, "inactive")}
                      disabled={product.status === "inactive" || updating === product.id}
                      className={`relative px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                        product.status === "inactive"
                          ? "bg-red-500/20 text-red-400 border-2 border-red-500/40 cursor-default shadow-lg shadow-red-500/10"
                          : "bg-[#111111] text-white/70 border-2 border-[#262626] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 hover:scale-105"
                      } ${updating === product.id ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {updating === product.id && product.status !== "inactive" ? (
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-xs">Offline</span>
                        </div>
                      )}
                      {product.status === "inactive" && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Last Updated */}
                <p className="text-xs text-white/30 mt-4 pt-4 border-t border-[#1a1a1a]">
                  Last updated: {new Date(product.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Legend */}
      <div className="mt-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <div className="w-1 h-4 bg-[#dc2626] rounded-full" />
          Status Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3 bg-[#111111] rounded-lg border border-[#262626]">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Online (Undetected)</p>
              <p className="text-xs text-white/50">Product is working perfectly and undetected</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#111111] rounded-lg border border-[#262626]">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Updating (Maintenance)</p>
              <p className="text-xs text-white/50">Under maintenance or being updated</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-[#111111] rounded-lg border border-[#262626]">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-1">Offline (Detected)</p>
              <p className="text-xs text-white/50">Currently not working or detected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tip */}
      <div className="mt-4 bg-gradient-to-r from-[#dc2626]/10 to-transparent border border-[#dc2626]/20 rounded-xl p-4">
        <p className="text-sm text-white/70">
          💡 <span className="font-semibold">Tip:</span> Status changes are reflected immediately on your public status page at <code className="px-2 py-0.5 bg-[#0a0a0a] rounded text-[#dc2626]">/status</code>
        </p>
      </div>
    </AdminShell>
  );
}
