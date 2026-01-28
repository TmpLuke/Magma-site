"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RefreshCw, XCircle, Plus, Package, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addLicenseStock, deleteLicenseStock } from "@/app/actions/admin-license-stock";

interface License {
  id: string;
  license_key: string;
  product_id: string | null;
  product_name: string;
  customer_email: string;
  status: string;
  expires_at: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [licenseKeysInput, setLicenseKeysInput] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    await Promise.all([loadLicenses(), loadProducts()]);
  }

  async function loadLicenses() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLicenses(data || []);
    } catch (error) {
      console.error("Failed to load licenses:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  }

  async function revokeLicense(licenseId: string) {
    try {
      setRevoking(licenseId);
      const supabase = createClient();
      const { error } = await supabase
        .from("licenses")
        .update({ status: "revoked", updated_at: new Date().toISOString() })
        .eq("id", licenseId);

      if (error) throw error;
      
      toast({
        title: "✅ Success",
        description: "License revoked successfully",
      });
      
      await loadLicenses();
    } catch (error) {
      console.error("Failed to revoke license:", error);
      toast({
        title: "❌ Error",
        description: "Failed to revoke license",
        variant: "destructive",
      });
    } finally {
      setRevoking(null);
    }
  }

  async function handleAddStock() {
    try {
      if (!selectedProductId || !licenseKeysInput.trim()) {
        toast({
          title: "❌ Error",
          description: "Please select a product and enter license keys",
          variant: "destructive",
        });
        return;
      }

      setProcessing(true);

      // Split by newlines and filter empty lines
      const keys = licenseKeysInput.split("\n").filter(k => k.trim().length > 0);

      if (keys.length === 0) {
        toast({
          title: "❌ Error",
          description: "No valid license keys entered",
          variant: "destructive",
        });
        return;
      }

      const result = await addLicenseStock({
        product_id: selectedProductId,
        variant_id: null,
        license_keys: keys,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "✅ Success",
        description: `Added ${keys.length} license key(s) to stock`,
      });

      setShowAddStockModal(false);
      setSelectedProductId("");
      setLicenseKeysInput("");
      await loadLicenses();
    } catch (error: any) {
      console.error("Failed to add stock:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to add license stock",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteStock(licenseId: string) {
    try {
      setRevoking(licenseId);
      
      const result = await deleteLicenseStock(licenseId);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "✅ Success",
        description: "License key removed from stock",
      });

      await loadLicenses();
    } catch (error: any) {
      console.error("Failed to delete stock:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to delete license",
        variant: "destructive",
      });
    } finally {
      setRevoking(null);
    }
  }

  // Count stock by product
  const stockCounts = licenses.reduce((acc, license) => {
    if (license.status === "unused" && license.product_id) {
      const productName = products.find(p => p.id === license.product_id)?.name || "Unknown";
      acc[productName] = (acc[productName] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const columns = [
    {
      key: "license_key",
      label: "License Key",
      sortable: true,
      render: (license: License) => (
        <span className="text-white font-medium">{license.license_key}</span>
      ),
    },
    {
      key: "product_name",
      label: "Product",
      sortable: true,
      render: (license: License) => {
        const product = products.find(p => p.id === license.product_id);
        return (
          <span className="text-white/70">{product?.name || license.product_name || "N/A"}</span>
        );
      },
    },
    {
      key: "customer_email",
      label: "Customer",
      sortable: true,
      render: (license: License) => (
        <span className="text-white/70">{license.customer_email || "-"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (license: License) => {
        const statusColors = {
          active: "bg-green-500/10 text-green-400 border-green-500/20",
          unused: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          expired: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
          revoked: "bg-red-500/10 text-red-400 border-red-500/20",
        };
        return (
          <Badge className={statusColors[license.status as keyof typeof statusColors] || ""}>
            {license.status}
          </Badge>
        );
      },
    },
    {
      key: "expires_at",
      label: "Expires",
      sortable: true,
      render: (license: License) => (
        <span className="text-white/50 text-sm">
          {license.expires_at ? new Date(license.expires_at).toLocaleDateString() : "Never"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminShell title="License Keys" subtitle="Manage license keys and stock">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="License Keys" subtitle="Manage license keys and stock">
      {/* Stock Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(stockCounts).map(([productName, count]) => (
          <div key={productName} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-[#dc2626]" />
              <h3 className="text-sm font-medium text-white/70">Stock Available</h3>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{count}</p>
            <p className="text-xs text-white/50">{productName}</p>
          </div>
        ))}
        {Object.keys(stockCounts).length === 0 && (
          <div className="col-span-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-8 text-center">
            <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 mb-2">No license keys in stock</p>
            <p className="text-sm text-white/30">Add license keys to get started</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setShowAddStockModal(true)}
          className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add License Stock
        </Button>
        <Button
          onClick={() => loadLicenses()}
          variant="outline"
          disabled={loading}
          className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Licenses Table */}
      <DataTable
        data={licenses}
        columns={columns}
        searchKey="customer_email"
        searchPlaceholder="Search by email or license key..."
        actions={(license) => (
          <div className="flex gap-2">
            {license.status === "active" && (
              <Button
                onClick={() => revokeLicense(license.id)}
                size="sm"
                variant="ghost"
                disabled={revoking === license.id}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                title="Revoke License"
              >
                {revoking === license.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </Button>
            )}
            {license.status === "unused" && (
              <Button
                onClick={() => handleDeleteStock(license.id)}
                size="sm"
                variant="ghost"
                disabled={revoking === license.id}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                title="Delete from Stock"
              >
                {revoking === license.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        )}
      />

      {/* Add License Stock Modal */}
      <Dialog open={showAddStockModal} onOpenChange={setShowAddStockModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#dc2626]" />
              </div>
              Add License Keys to Stock
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626]"
              >
                <option value="">Choose a product...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                License Keys (one per line)
              </label>
              <Textarea
                value={licenseKeysInput}
                onChange={(e) => setLicenseKeysInput(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX&#10;YYYY-YYYY-YYYY-YYYY&#10;ZZZZ-ZZZZ-ZZZZ-ZZZZ"
                className="bg-[#1a1a1a] border-[#262626] text-white min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-white/40 mt-2">
                {licenseKeysInput.split("\n").filter(k => k.trim()).length} key(s) entered
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setShowAddStockModal(false);
                setSelectedProductId("");
                setLicenseKeysInput("");
              }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStock}
              disabled={processing || !selectedProductId || !licenseKeysInput.trim()}
              className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Stock
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
