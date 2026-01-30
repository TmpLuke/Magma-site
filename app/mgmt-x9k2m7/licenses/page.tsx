"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RefreshCw, Plus, Trash2, Key, Copy, BarChart3, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  addLicenseStock, 
  deleteLicenseStock, 
  getLicenses, 
  getStockSummary,
  type License,
  type StockSummary,
  type AddStockResult
} from "@/app/actions/admin-license-stock";
import { createClient } from "@/lib/supabase/client";
import { getVariantsForProduct } from "@/app/actions/admin-products";

interface Product {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  duration: string;
  price: number;
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stockSummary, setStockSummary] = useState<StockSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  // Form State
  const [stockType, setStockType] = useState<"general" | "product" | "variant">("general");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [keysInput, setKeysInput] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProduct && stockType !== "general") {
      loadVariants(selectedProduct);
    } else {
      setVariants([]);
      setSelectedVariant("");
    }
  }, [selectedProduct, stockType]);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadLicenses(),
        loadProducts(),
        loadStockSummary()
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function loadLicenses() {
    const result = await getLicenses();
    if (result.success && result.data) {
      setLicenses(result.data);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to load licenses",
        variant: "destructive",
      });
    }
  }

  async function loadProducts() {
    const supabase = createClient();
    const { data } = await supabase.from("products").select("id, name").order("name");
    if (data) setProducts(data);
  }

  async function loadStockSummary() {
    const result = await getStockSummary();
    if (result.success && result.data) {
      setStockSummary(result.data);
    }
  }

  async function loadVariants(productId: string) {
    setLoadingVariants(true);
    const result = await getVariantsForProduct(productId);
    setLoadingVariants(false);
    
    if (result.success && result.data) {
      setVariants(result.data);
    }
  }

  async function handleAddStock() {
    if (!keysInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one license key",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const keys = keysInput.split("\n").filter(k => k.trim().length > 0);
      
      const result: AddStockResult = await addLicenseStock({
        product_id: stockType === "general" ? null : selectedProduct || null,
        variant_id: stockType === "variant" ? selectedVariant || null : null,
        license_keys: keys
      });

      console.log("[License Add] Result:", result);

      if (result.success) {
        let message = `Added ${result.added} keys`;
        if (result.skipped > 0) {
          message += `, skipped ${result.skipped} duplicates`;
        }
        if (result.invalid.length > 0) {
          message += `, ${result.invalid.length} invalid format`;
        }

        toast({
          title: "Success",
          description: message,
        });
        
        setShowAddModal(false);
        setKeysInput("");
        setSelectedProduct("");
        setSelectedVariant("");
        setStockType("general");
        loadData();
      } else {
        console.error("[License Add] Error:", result.error);
        toast({
          title: "Failed to Add Licenses",
          description: result.error || "Unknown error occurred. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[License Add] Exception:", error);
      toast({
        title: "Error Adding Licenses",
        description: error instanceof Error ? error.message : "Something went wrong while adding licenses",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this license key from stock?")) return;
    
    const result = await deleteLicenseStock(id);
    if (result.success) {
      toast({ title: "Deleted", description: "License key removed from stock" });
      loadData();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  }

  const columns = [
    {
      key: "license_key",
      label: "License Key",
      render: (item: License) => (
        <div className="flex items-center gap-2 font-mono text-xs">
          <Key className="w-3 h-3 text-white/40" />
          <span className="text-white/80">{item.license_key}</span>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(item.license_key);
              toast({ title: "Copied", description: "License key copied to clipboard" });
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="w-3 h-3 text-white/40 hover:text-white" />
          </button>
        </div>
      ),
    },
    {
      key: "stock_type",
      label: "Stock Type",
      render: (item: License) => {
        if (!item.product_id && !item.variant_id) {
          return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 border">General</Badge>;
        } else if (item.product_id && !item.variant_id) {
          return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 border">Product</Badge>;
        } else if (item.variant_id) {
          return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 border">Variant</Badge>;
        }
        return null;
      },
    },
    {
      key: "product_name",
      label: "Product",
      render: (item: License) => {
        const product = products.find(p => p.id === item.product_id);
        return (
          <div className="text-sm text-white">
            {item.product_name || product?.name || (item.product_id ? "Unknown Product" : "Any Product")}
          </div>
        );
      }
    },
    {
      key: "created_at",
      label: "Added",
      render: (item: License) => (
        <div className="text-sm text-white/40">
          {new Date(item.created_at).toLocaleDateString()}
        </div>
      ),
    },
  ];

  return (
    <AdminShell title="License Key Inventory" subtitle="Manage your license key stock like a general inventory system">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">License Key Inventory</h1>
            <p className="text-gray-400">Manage your license key stock</p>
            {stockSummary && (
              <div className="flex gap-4 mt-3 text-sm">
                <span className="text-emerald-400">
                  {stockSummary.total_stock} total in stock
                </span>
                <span className="text-blue-400">
                  {stockSummary.general_stock} general
                </span>
                <span className="text-green-400">
                  {stockSummary.product_specific} product-specific
                </span>
                <span className="text-purple-400">
                  {stockSummary.variant_specific} variant-specific
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSummaryModal(true)}
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Stock Summary
            </Button>
            <Button
              variant="outline"
              onClick={loadData}
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </div>
        </div>

        <DataTable
          data={licenses}
          columns={columns}
          searchKey="license_key"
          searchPlaceholder="Search license keys..."
          actions={(item) => (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(item.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                title="Delete from Stock"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        />

        {/* Add Stock Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add License Keys to Stock</DialogTitle>
              <DialogDescription className="text-white/50">
                Add license keys to your inventory. Choose how they should be stocked.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Stock Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Stock Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setStockType("general")}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      stockType === "general"
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-[#262626] bg-[#1a1a1a] text-white/70 hover:bg-[#262626]"
                    }`}
                  >
                    <Package className="w-4 h-4 mb-1" />
                    <div className="text-sm font-medium">General Stock</div>
                    <div className="text-xs opacity-70">Can be used for any product</div>
                  </button>
                  <button
                    onClick={() => setStockType("product")}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      stockType === "product"
                        ? "border-green-500 bg-green-500/10 text-green-400"
                        : "border-[#262626] bg-[#1a1a1a] text-white/70 hover:bg-[#262626]"
                    }`}
                  >
                    <Key className="w-4 h-4 mb-1" />
                    <div className="text-sm font-medium">Product Stock</div>
                    <div className="text-xs opacity-70">For specific product only</div>
                  </button>
                  <button
                    onClick={() => setStockType("variant")}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      stockType === "variant"
                        ? "border-purple-500 bg-purple-500/10 text-purple-400"
                        : "border-[#262626] bg-[#1a1a1a] text-white/70 hover:bg-[#262626]"
                    }`}
                  >
                    <Package className="w-4 h-4 mb-1" />
                    <div className="text-sm font-medium">Variant Stock</div>
                    <div className="text-xs opacity-70">For specific variant only</div>
                  </button>
                </div>
              </div>

              {/* Product Selection */}
              {stockType !== "general" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Product</label>
                  <select
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded-md p-2 text-white"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Select a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Variant Selection */}
              {stockType === "variant" && selectedProduct && variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Variant (Duration)</label>
                  <select
                    className="w-full bg-[#1a1a1a] border border-[#262626] rounded-md p-2 text-white"
                    value={selectedVariant}
                    onChange={(e) => setSelectedVariant(e.target.value)}
                    disabled={loadingVariants}
                  >
                    <option value="">Select a variant...</option>
                    {variants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.duration} - ${v.price}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* License Keys Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">License Keys (One per line)</label>
                <Textarea
                  placeholder="Enter your license keys here&#10;One key per line&#10;Any format accepted"
                  className="bg-[#1a1a1a] border-[#262626] text-white min-h-[150px] font-mono text-sm"
                  value={keysInput}
                  onChange={(e) => setKeysInput(e.target.value)}
                />
                <div className="flex justify-between text-xs text-white/40">
                  <span>
                    {keysInput.split("\n").filter(k => k.trim().length > 0).length} keys to add
                  </span>
                  <span>
                    Any format accepted
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowAddModal(false)}
                className="text-white/70 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStock}
                disabled={processing || !keysInput.trim() || (stockType !== "general" && !selectedProduct) || (stockType === "variant" && !selectedVariant)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {processing ? "Adding..." : "Add to Stock"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock Summary Modal */}
        <Dialog open={showSummaryModal} onOpenChange={setShowSummaryModal}>
          <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Stock Summary</DialogTitle>
              <DialogDescription className="text-white/50">
                Overview of your license key inventory
              </DialogDescription>
            </DialogHeader>

            {stockSummary && (
              <div className="space-y-6 py-4">
                {/* Overall Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
                    <div className="text-2xl font-bold text-emerald-400">{stockSummary.total_stock}</div>
                    <div className="text-sm text-white/60">Total in Stock</div>
                  </div>
                  <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
                    <div className="text-2xl font-bold text-blue-400">{stockSummary.general_stock}</div>
                    <div className="text-sm text-white/60">General Stock</div>
                  </div>
                  <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
                    <div className="text-2xl font-bold text-green-400">{stockSummary.product_specific}</div>
                    <div className="text-sm text-white/60">Product-Specific</div>
                  </div>
                  <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
                    <div className="text-2xl font-bold text-purple-400">{stockSummary.variant_specific}</div>
                    <div className="text-sm text-white/60">Variant-Specific</div>
                  </div>
                </div>

                {/* Product Breakdown */}
                {stockSummary.by_product.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Stock by Product</h3>
                    <div className="space-y-3">
                      {stockSummary.by_product.map(product => (
                        <div key={product.product_id} className="bg-[#1a1a1a] p-4 rounded-lg border border-[#262626]">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium text-white">{product.product_name}</h4>
                            <Badge className="bg-green-500/10 text-green-400 border-green-500/20 border">
                              {product.total_stock} keys
                            </Badge>
                          </div>
                          {product.variants.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {product.variants.map(variant => (
                                <div key={variant.variant_id} className="bg-[#0a0a0a] p-2 rounded border border-[#262626]">
                                  <div className="text-sm text-white">{variant.duration}</div>
                                  <div className="text-xs text-white/60">{variant.stock_count} keys</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setShowSummaryModal(false)}
                className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  );
}