"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RefreshCw, Plus, Edit, Trash2, Package, AlertCircle, Check, X, Image as ImageIcon, Tag, Gamepad2, DollarSign, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createProduct, updateProduct, deleteProduct, forceDeleteProduct, getOrdersAndLicensesForProduct, getVariantsForProduct, createVariant, updateVariant, deleteVariant, type ProductBlockers, type ProductVariantRow } from "@/app/actions/admin-products";
import { ImageUploader } from "@/components/admin/image-uploader";
import { GalleryUploader } from "@/components/admin/gallery-uploader";

interface Product {
  id: string;
  name: string;
  slug: string;
  game: string;
  description: string | null;
  image: string | null;
  status: string;
  provider: string;
  features: string[];
  requirements: string[];
  gallery?: string[] | null;
  created_at: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  game: string;
  description: string;
  image: string;
  status: string;
  provider: string;
  features: string;
  requirements: string;
  gallery: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteBlockers, setDeleteBlockers] = useState<ProductBlockers | null>(null);
  const [deleteBlockersLoading, setDeleteBlockersLoading] = useState(false);
  const [variants, setVariants] = useState<ProductVariantRow[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [variantForm, setVariantForm] = useState({ duration: "", price: "" });
  const [editingVariant, setEditingVariant] = useState<ProductVariantRow | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    game: "",
    description: "",
    image: "",
    status: "active",
    provider: "Magma",
    features: "",
    requirements: "",
    gallery: [],
  });
  const [galleryInput, setGalleryInput] = useState("");
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
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProduct() {
    try {
      setProcessing("add");
      
      const result = await createProduct({
        name: formData.name,
        slug: formData.slug,
        game: formData.game,
        description: formData.description,
        image: formData.image,
        status: formData.status,
        provider: formData.provider,
        features: formData.features ? formData.features.split(",").map(f => f.trim()) : [],
        requirements: formData.requirements ? formData.requirements.split(",").map(r => r.trim()) : [],
        gallery: formData.gallery,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Product created successfully",
        className: "border-green-500/20 bg-green-500/10",
      });
      
      setShowAddModal(false);
      resetForm();
      await loadProducts();
    } catch (error: any) {
      console.error("Failed to add product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function handleEditProduct() {
    if (!selectedProduct) return;
    
    try {
      setProcessing("edit");
      
      const result = await updateProduct(selectedProduct.id, {
        name: formData.name,
        slug: formData.slug,
        game: formData.game,
        description: formData.description,
        image: formData.image,
        status: formData.status,
        provider: formData.provider,
        features: formData.features ? formData.features.split(",").map(f => f.trim()) : [],
        requirements: formData.requirements ? formData.requirements.split(",").map(r => r.trim()) : [],
        gallery: formData.gallery,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Product updated successfully",
        className: "border-blue-500/20 bg-blue-500/10",
      });
      
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      await loadProducts();
    } catch (error: any) {
      console.error("Failed to edit product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function handleDeleteProduct(force: boolean) {
    if (!selectedProduct) return;
    try {
      setProcessing("delete");
      const result = force ? await forceDeleteProduct(selectedProduct.id) : await deleteProduct(selectedProduct.id);
      if (!result.success) throw new Error(result.error);
      toast({
        title: "Success",
        description: "Product deleted successfully",
        className: "border-red-500/20 bg-red-500/10",
      });
      setShowDeleteModal(false);
      setSelectedProduct(null);
      setDeleteBlockers(null);
      await loadProducts();
    } catch (error: any) {
      console.error("Failed to delete product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }


  async function openEditModal(product: Product) {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      game: product.game,
      description: product.description || "",
      image: product.image || "",
      status: product.status,
      provider: product.provider,
      features: product.features?.join(", ") || "",
      requirements: product.requirements?.join(", ") || "",
      gallery: Array.isArray(product.gallery) ? product.gallery : [],
    });
    setGalleryInput("");
    setVariants([]);
    setEditingVariant(null);
    setVariantForm({ duration: "", price: "", stock: "0" });
    setShowEditModal(true);
    setVariantsLoading(true);
    try {
      const res = await getVariantsForProduct(product.id);
      if (res.success && res.data) setVariants(res.data);
    } catch {
      /* ignore */
    } finally {
      setVariantsLoading(false);
    }
  }

  async function openDeleteModal(product: Product) {
    setSelectedProduct(product);
    setShowDeleteModal(true);
    setDeleteBlockers(null);
    setDeleteBlockersLoading(true);
    try {
      const res = await getOrdersAndLicensesForProduct(product.id);
      if (res.success && res.data) setDeleteBlockers(res.data);
    } catch {
      /* ignore */
    } finally {
      setDeleteBlockersLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      slug: "",
      game: "",
      description: "",
      image: "",
      status: "active",
      provider: "Magma",
      features: "",
      requirements: "",
      gallery: [],
    });
    setGalleryInput("");
    setVariants([]);
    setVariantForm({ duration: "", price: "", stock: "0" });
    setEditingVariant(null);
  }

  function addGalleryImage() {
    const url = galleryInput.trim();
    if (!url) return;
    setFormData({ ...formData, gallery: [...formData.gallery, url] });
    setGalleryInput("");
  }

  function removeGalleryImage(index: number) {
    setFormData({
      ...formData,
      gallery: formData.gallery.filter((_, i) => i !== index),
    });
  }

  async function handleAddVariant() {
    if (!selectedProduct) return;
    const duration = variantForm.duration.trim() || "1 Day";
    const price = parseFloat(variantForm.price);
    if (isNaN(price) || price < 0) {
      toast({ title: "Invalid price", variant: "destructive" });
      return;
    }
    try {
      setProcessing("variant-add");
      const res = await createVariant({
        product_id: selectedProduct.id,
        duration,
        price,
      });
      if (!res.success) throw new Error(res.error);
      toast({ title: "Variant added", className: "border-green-500/20 bg-green-500/10" });
      setVariantForm({ duration: "", price: "" });
      const next = await getVariantsForProduct(selectedProduct.id);
      if (next.success && next.data) setVariants(next.data);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed to add variant", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  }

  async function handleUpdateVariant(v: ProductVariantRow, updates: { duration?: string; price?: number }) {
    try {
      setProcessing("variant-update");
      const res = await updateVariant(v.id, updates);
      if (!res.success) throw new Error(res.error);
      toast({ title: "Variant updated", className: "border-green-500/20 bg-green-500/10" });
      setEditingVariant(null);
      if (selectedProduct) {
        const next = await getVariantsForProduct(selectedProduct.id);
        if (next.success && next.data) setVariants(next.data);
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed to update variant", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  }

  async function handleDeleteVariant(v: ProductVariantRow) {
    try {
      setProcessing("variant-delete");
      const res = await deleteVariant(v.id);
      if (!res.success) throw new Error(res.error);
      toast({ title: "Variant removed", className: "border-red-500/20 bg-red-500/10" });
      setVariants((prev) => prev.filter((x) => x.id !== v.id));
      setEditingVariant(null);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed to delete variant", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  }

  const columns = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[#dc2626]/20 to-[#dc2626]/5 border border-[#dc2626]/10 flex items-center justify-center transition-all group-hover:border-[#dc2626]/30">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-5 h-5 text-[#dc2626]/50" />
            )}
          </div>
          <div>
            <p className="text-white font-semibold tracking-tight group-hover:text-[#dc2626] transition-colors">
              {product.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Gamepad2 className="w-3 h-3 text-white/40" />
              <p className="text-xs text-white/50 font-medium">{product.game}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-white/30" />
          <span className="px-2 py-1 bg-[#1a1a1a] rounded border border-[#262626] text-xs text-white/70">
            {product.slug}
          </span>
        </div>
      ),
    },
    {
      key: "provider",
      label: "Provider",
      sortable: true,
      render: (product: Product) => (
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-white/30" />
          <span className="text-white/70 font-medium">{product.provider}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (product: Product) => {
        const statusConfig = {
          active: {
            bg: "bg-emerald-500/10",
            text: "text-emerald-400",
            border: "border-emerald-500/30",
            icon: Check,
          },
          inactive: {
            bg: "bg-gray-500/10",
            text: "text-gray-400",
            border: "border-gray-500/30",
            icon: X,
          },
          maintenance: {
            bg: "bg-amber-500/10",
            text: "text-amber-400",
            border: "border-amber-500/30",
            icon: AlertCircle,
          },
        };
        const config = statusConfig[product.status as keyof typeof statusConfig];
        const Icon = config?.icon || AlertCircle;

        return (
          <Badge className={`${config?.bg} ${config?.text} ${config?.border} border font-medium px-2.5 py-1 flex items-center gap-1.5 w-fit`}>
            <Icon className="w-3 h-3" />
            <span className="capitalize">{product.status}</span>
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (product: Product) => (
        <span className="text-white/40 text-sm font-medium tabular-nums">
          {new Date(product.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminShell title="Products" subtitle="Manage your product catalog">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#dc2626]/20 border-t-[#dc2626] animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-[#dc2626]/5 blur-xl animate-pulse" />
          </div>
          <p className="text-white/40 text-sm font-medium">Loading products...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Products" subtitle="Manage your product catalog">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-[#dc2626]/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Products</p>
              <p className="text-2xl font-bold text-white mt-1">{products.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {products.filter(p => p.status === "active").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Maintenance</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {products.filter(p => p.status === "maintenance").length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => loadProducts()}
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
          Add Product
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={products}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search products..."
        actions={(product) => (
          <div className="flex gap-1.5">
            <Button
              onClick={() => openEditModal(product)}
              size="sm"
              variant="ghost"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
              title="Edit Product"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => openDeleteModal(product)}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      {/* Add Product Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#dc2626]" />
              </div>
              Add New Product
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Fill in the details below to create a new product
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Apex Legends Cheat"
                    className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-white/30 focus:border-[#dc2626]/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    placeholder="e.g., apex-legends"
                    className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-white/30 focus:border-[#dc2626]/50 font-mono transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">
                    Game <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    placeholder="e.g., Apex Legends"
                    className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-white/30 focus:border-[#dc2626]/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">Provider</label>
                  <Input
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="bg-[#1a1a1a] border-[#262626] text-white focus:border-[#dc2626]/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626]/50 transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <ImageUploader
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Cover Image (Front Cover)"
                description="This image appears on product cards and store listings"
              />
            </div>

            {/* Gallery Images - In-Game & Menu Images */}
            <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Gallery Images (In-Game & Menu)
              </h3>
              <GalleryUploader
                images={formData.gallery}
                onChange={(images) => setFormData({ ...formData, gallery: images })}
                maxImages={10}
                description="Add in-game screenshots and menu images. These appear on the product detail page."
              />
            </div>

            {/* Details */}
            <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Details
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your product..."
                  rows={3}
                  className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-white/30 focus:border-[#dc2626]/50 resize-none transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Features <span className="text-white/40 text-xs">(comma-separated)</span>
                </label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Aimbot, ESP, No Recoil, Radar"
                  rows={2}
                  className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-white/30 focus:border-[#dc2626]/50 resize-none transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Requirements <span className="text-white/40 text-xs">(comma-separated)</span>
                </label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Windows 10, Intel CPU, 8GB RAM"
                  rows={2}
                  className="bg-[#1a1a1a] border-[#262626] text-white placeholder:text-white/30 focus:border-[#dc2626]/50 resize-none transition-colors"
                />
              </div>
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
              onClick={handleAddProduct}
              disabled={processing === "add" || !formData.name || !formData.slug || !formData.game}
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
                  Create Product
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Edit className="w-4 h-4 text-blue-400" />
              </div>
              Edit Product
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Update the product details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#1a1a1a] border-[#262626] text-white focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="bg-[#1a1a1a] border-[#262626] text-white focus:border-blue-500/50 font-mono transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">
                    Game <span className="text-red-400">*</span>
                  </label>
                  <Input
                    value={formData.game}
                    onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                    className="bg-[#1a1a1a] border-[#262626] text-white focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">Provider</label>
                  <Input
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="bg-[#1a1a1a] border-[#262626] text-white focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white/70">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <ImageUploader
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
                label="Cover Image (Front Cover)"
                description="This image appears on product cards and store listings"
              />
            </div>

            {/* Gallery Images - In-Game & Menu Images */}
            <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Gallery Images (In-Game & Menu)
              </h3>
              <GalleryUploader
                images={formData.gallery}
                onChange={(images) => setFormData({ ...formData, gallery: images })}
                maxImages={10}
                description="Add in-game screenshots and menu images. These appear on the product detail page."
              />
            </div>

            {/* Variants & pricing */}
            {selectedProduct && (
              <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Variants & pricing
                </h3>
                {variantsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <RefreshCw className="w-5 h-5 animate-spin text-white/40" />
                  </div>
                ) : (
                  <>
                    <div className="rounded-lg border border-[#262626] divide-y divide-[#262626] max-h-48 overflow-y-auto">
                      {variants.length === 0 ? (
                        <div className="py-6 text-center text-white/40 text-sm">No variants. Add duration, price, and stock below.</div>
                      ) : (
                        variants.map((v) =>
                          editingVariant?.id === v.id ? (
                            <div key={v.id} className="p-3 flex flex-wrap items-center gap-2">
                              <Input
                                placeholder="Duration"
                                defaultValue={v.duration}
                                id={`edit-duration-${v.id}`}
                                className="w-28 bg-[#0a0a0a] border-[#262626] text-white text-sm"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Price"
                                defaultValue={v.price}
                                id={`edit-price-${v.id}`}
                                className="w-24 bg-[#0a0a0a] border-[#262626] text-white text-sm"
                              />
                              <div className="flex items-center gap-1 px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-md text-white/60 text-sm">
                                <span className="text-xs">Stock:</span>
                                <span className="font-medium">{v.stock}</span>
                              </div>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => {
                                const dur = (document.getElementById(`edit-duration-${v.id}`) as HTMLInputElement)?.value?.trim() || v.duration;
                                const pr = parseFloat((document.getElementById(`edit-price-${v.id}`) as HTMLInputElement)?.value ?? "0");
                                handleUpdateVariant(v, { duration: dur, price: isNaN(pr) ? v.price : pr });
                              }}>
                                <Check className="w-3 h-3 mr-1" /> Save
                              </Button>
                              <Button size="sm" variant="ghost" className="text-white/60" onClick={() => setEditingVariant(null)}>
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div key={v.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-white">{v.duration}</span>
                                <span className="text-emerald-400">${v.price.toFixed(2)}</span>
                                <span className="text-white/50 text-sm">stock {v.stock}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="text-blue-400 hover:bg-blue-500/10" onClick={() => setEditingVariant(v)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-500/10" onClick={() => handleDeleteVariant(v)} disabled={processing === "variant-delete"}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )
                        )
                      )}
                    </div>
                    <div className="flex flex-wrap items-end gap-2">
                      <Input
                        placeholder="e.g. 1 Day, 7 Days"
                        value={variantForm.duration}
                        onChange={(e) => setVariantForm({ ...variantForm, duration: e.target.value })}
                        className="w-32 bg-[#1a1a1a] border-[#262626] text-white"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={variantForm.price}
                        onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                        className="w-24 bg-[#1a1a1a] border-[#262626] text-white"
                      />
                      <Button size="sm" onClick={handleAddVariant} disabled={processing === "variant-add"} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {processing === "variant-add" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                        Add variant
                      </Button>
                      <p className="text-xs text-white/40">Stock is auto-calculated from license keys</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Details */}
            <div className="space-y-4 pt-4 border-t border-[#1a1a1a]">
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Details
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="bg-[#1a1a1a] border-[#262626] text-white focus:border-blue-500/50 resize-none transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Features <span className="text-white/40 text-xs">(comma-separated)</span>
                </label>
                <Textarea
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  rows={2}
                  className="bg-[#1a1a1a] border-[#262626] text-white focus:border-blue-500/50 resize-none transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/70">
                  Requirements <span className="text-white/40 text-xs">(comma-separated)</span>
                </label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={2}
                  className="bg-[#1a1a1a] border-[#262626] text-white focus:border-blue-500/50 resize-none transition-colors"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => { setShowEditModal(false); setSelectedProduct(null); resetForm(); }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditProduct}
              disabled={processing === "edit" || !formData.name || !formData.slug || !formData.game}
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
      <Dialog open={showDeleteModal} onOpenChange={(open) => { setShowDeleteModal(open); if (!open) { setSelectedProduct(null); setDeleteBlockers(null); } }}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              Delete Product
            </DialogTitle>
            <DialogDescription className="text-white/50">
              {selectedProduct?.name} • This cannot be undone
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
              <p className="text-white/70">
                Delete <span className="font-semibold text-white">{selectedProduct?.name}</span>? Product will be removed. Linked orders and licenses will be unlinked (not deleted).
              </p>
            </div>
            {deleteBlockersLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-white/40" />
              </div>
            ) : deleteBlockers && (deleteBlockers.orders.length > 0 || deleteBlockers.licenses.length > 0) ? (
              <div className="space-y-4">
                {deleteBlockers.orders.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Orders ({deleteBlockers.orders.length})</h4>
                    <div className="rounded-lg border border-[#262626] divide-y divide-[#262626] max-h-40 overflow-y-auto">
                      {deleteBlockers.orders.map((o) => (
                        <div key={o.id} className="px-4 py-2.5 flex flex-wrap items-center gap-2 text-sm">
                          <span className="font-mono text-white/80">{o.order_number}</span>
                          <span className="text-white/60">{o.customer_email}</span>
                          <span className="text-white">{o.product_name}</span>
                          <span className="text-white/50">{o.duration}</span>
                          <span className="text-emerald-400 font-medium">${o.amount.toFixed(2)}</span>
                          <span className="text-white/40">{new Date(o.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {deleteBlockers.licenses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Licenses ({deleteBlockers.licenses.length})</h4>
                    <div className="rounded-lg border border-[#262626] divide-y divide-[#262626] max-h-40 overflow-y-auto">
                      {deleteBlockers.licenses.map((l) => (
                        <div key={l.id} className="px-4 py-2.5 flex flex-wrap items-center gap-2 text-sm">
                          <code className="font-mono text-white/80">{l.license_key}</code>
                          <span className="text-white/60">{l.customer_email}</span>
                          <span className="text-white/40">{new Date(l.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); setDeleteBlockers(null); }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDeleteProduct(true)}
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
                  Force delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}