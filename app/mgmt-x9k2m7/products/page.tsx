"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Power,
  X,
  Upload,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminStore } from "@/lib/admin-store";
import { getProductsFromDB } from "@/lib/admin-actions";
import { mockProducts } from "@/lib/admin-mock-data";
import type { Product } from "@/lib/admin-types";
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

function ProductStatusBadge({ status }: { status: Product["status"] }) {
  const styles = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    maintenance: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
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

function ProductCard({
  product,
  onEdit,
  onView,
}: {
  product: Product;
  onEdit: () => void;
  onView: () => void;
}) {
  const { updateProduct, deleteProduct } = useAdminStore();

  const toggleStatus = () => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    updateProduct(product.id, { status: newStatus });
  };

  const totalStock = product.pricing.reduce((sum, p) => sum + p.stock, 0);
  const lowestPrice = Math.min(...product.pricing.map((p) => p.price));

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl overflow-hidden hover:border-[#262626] transition-colors group">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-[#111111]">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3">
          <ProductStatusBadge status={product.status} />
        </div>
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors">
                <MoreHorizontal className="w-4 h-4 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#111111] border-[#262626]">
              <DropdownMenuItem
                onClick={onView}
                className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onEdit}
                className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={toggleStatus}
                className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
              >
                <Power className="w-4 h-4 mr-2" />
                {product.status === "active" ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#262626]" />
              <DropdownMenuItem
                onClick={() => deleteProduct(product.id)}
                className="text-red-400 focus:bg-[#1a1a1a] focus:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-white font-semibold">{product.name}</h3>
            <p className="text-sm text-white/50">{product.game}</p>
          </div>
          <span className="text-[#dc2626] font-bold">
            ${lowestPrice.toFixed(2)}+
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-white/40">Stock</p>
              <p
                className={cn(
                  "text-sm font-medium",
                  totalStock < 5 ? "text-yellow-400" : "text-white"
                )}
              >
                {totalStock} keys
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40">Type</p>
              <p className="text-sm font-medium text-white">
                {product.requirements.cheatType}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductDetailsModal({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            {product.name}
            <ProductStatusBadge status={product.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Image & Basic Info */}
          <div className="flex gap-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-[#111111] flex-shrink-0">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-white/50 text-sm mb-1">{product.game}</p>
              <p className="text-white/70 text-sm">{product.description}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <h4 className="font-medium text-white mb-3">Pricing & Stock</h4>
            <div className="grid grid-cols-3 gap-3">
              {product.pricing.map((tier) => (
                <div
                  key={tier.duration}
                  className="p-3 bg-[#0a0a0a] rounded-lg border border-[#262626]"
                >
                  <p className="text-xs text-white/50">{tier.duration}</p>
                  <p className="text-lg font-bold text-white">
                    ${tier.price.toFixed(2)}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      tier.stock < 5 ? "text-yellow-400" : "text-white/50"
                    )}
                  >
                    {tier.stock} in stock
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <h4 className="font-medium text-white mb-3">Requirements</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/50">CPU</span>
                <p className="text-white">{product.requirements.cpu}</p>
              </div>
              <div>
                <span className="text-white/50">Windows</span>
                <p className="text-white">{product.requirements.windows}</p>
              </div>
              <div>
                <span className="text-white/50">Cheat Type</span>
                <p className="text-white">{product.requirements.cheatType}</p>
              </div>
              <div>
                <span className="text-white/50">Controller</span>
                <p className="text-white">
                  {product.requirements.controller ? "Supported" : "Not Supported"}
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <h4 className="font-medium text-white mb-3">Features</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[#dc2626] font-medium text-sm mb-2">Aimbot</p>
                <ul className="space-y-1">
                  {product.features.aimbot.slice(0, 5).map((f) => (
                    <li key={f} className="text-xs text-white/60">
                      {f}
                    </li>
                  ))}
                  {product.features.aimbot.length > 5 && (
                    <li className="text-xs text-white/40">
                      +{product.features.aimbot.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-[#dc2626] font-medium text-sm mb-2">ESP</p>
                <ul className="space-y-1">
                  {product.features.esp.slice(0, 5).map((f) => (
                    <li key={f} className="text-xs text-white/60">
                      {f}
                    </li>
                  ))}
                  {product.features.esp.length > 5 && (
                    <li className="text-xs text-white/40">
                      +{product.features.esp.length - 5} more
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-[#dc2626] font-medium text-sm mb-2">Misc</p>
                <ul className="space-y-1">
                  {product.features.misc.map((f) => (
                    <li key={f} className="text-xs text-white/60">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ProductFormData {
  name: string;
  description: string;
  game: string;
  image: string;
  gallery: string[]; // Array of 3 in-game screenshot URLs
  status: Product["status"];
  pricing: { duration: string; price: number; stock: number }[];
  requirements: {
    cpu: string;
    windows: string;
    cheatType: string;
    controller: boolean;
  };
  features: {
    aimbot: string[];
    esp: string[];
    misc: string[];
  };
}

const defaultFormData: ProductFormData = {
  name: "",
  description: "",
  game: "",
  image: "/images/apex-product.png",
  gallery: ["", "", ""],
  status: "inactive",
  pricing: [
    { duration: "1 Day", price: 9.99, stock: 10 },
    { duration: "7 Days", price: 29.99, stock: 10 },
    { duration: "30 Days", price: 59.99, stock: 5 },
  ],
  requirements: {
    cpu: "Intel & AMD",
    windows: "10 - 11",
    cheatType: "External",
    controller: false,
  },
  features: {
    aimbot: ["Aimbot enable", "Aim key", "FOV adjustment"],
    esp: ["Enemy ESP", "Box ESP", "Health bars"],
    misc: ["Custom crosshair"],
  },
};

function ProductFormModal({
  product,
  open,
  onClose,
  onSave,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData, isEdit: boolean, productId?: string) => void;
}) {
  const isEdit = !!product;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getInitialFormData = useCallback((): ProductFormData => {
    if (product) {
      return {
        name: product.name,
        description: product.description,
        game: product.game,
        image: product.image,
        gallery: product.gallery ? [...product.gallery] : ["", "", ""],
        status: product.status,
        pricing: product.pricing.map(p => ({ ...p })),
        requirements: { ...product.requirements },
        features: {
          aimbot: [...product.features.aimbot],
          esp: [...product.features.esp],
          misc: [...product.features.misc],
        },
      };
    }
    return {
      ...defaultFormData,
      gallery: ["", "", ""],
      pricing: defaultFormData.pricing.map(p => ({ ...p })),
      requirements: { ...defaultFormData.requirements },
      features: {
        aimbot: [...defaultFormData.features.aimbot],
        esp: [...defaultFormData.features.esp],
        misc: [...defaultFormData.features.misc],
      },
    };
  }, [product]);
  
  const [formData, setFormData] = useState<ProductFormData>(getInitialFormData);

  // Reset form when modal opens or product changes
  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData());
      setError(null);
    }
  }, [open, getInitialFormData]);

  const handleSubmit = async () => {
    setError(null);

    // Validate required fields
    if (!formData.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!formData.game.trim()) {
      setError("Category/Game is required");
      return;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }
    if (formData.pricing.some((p) => p.price <= 0)) {
      setError("All prices must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      onSave(formData, isEdit, product?.id);
      onClose();
    } catch {
      setError("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updatePricing = (index: number, field: string, value: number) => {
    const newPricing = [...formData.pricing];
    newPricing[index] = { ...newPricing[index], [field]: value };
    setFormData({ ...formData, pricing: newPricing });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:border-[#dc2626] focus:outline-none transition-colors"
                placeholder="e.g., Armani"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Category/Game <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.game}
                onChange={(e) => setFormData({ ...formData, game: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:border-[#dc2626] focus:outline-none transition-colors"
                placeholder="e.g., Apex Legends"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:border-[#dc2626] focus:outline-none transition-colors resize-none"
                rows={3}
                placeholder="Product description..."
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-1.5">
                Status <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as Product["status"] })
                }
                className="w-full px-3 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:border-[#dc2626] focus:outline-none transition-colors"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Main Product Image */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <h4 className="font-medium text-white mb-3">Main Product Image</h4>
            <div className="flex items-start gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-[#0a0a0a] flex-shrink-0 border border-[#262626]">
                {formData.image ? (
                  <Image
                    src={formData.image || "/placeholder.svg"}
                    alt="Product"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white/30" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm focus:border-[#dc2626] focus:outline-none transition-colors"
                  placeholder="Main image URL"
                />
                <p className="text-xs text-white/40 mt-2">
                  This is the main product card image
                </p>
              </div>
            </div>
          </div>

          {/* Gallery Images - In-Game Screenshots */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <h4 className="font-medium text-white mb-1">In-Game Screenshots</h4>
            <p className="text-xs text-white/40 mb-4">
              Add up to 3 in-game screenshots to showcase the product features
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <div 
                    className={`relative aspect-video rounded-lg overflow-hidden bg-[#0a0a0a] border-2 transition-colors ${
                      formData.gallery[index] 
                        ? "border-[#dc2626]/50" 
                        : "border-[#262626] border-dashed hover:border-[#dc2626]/30"
                    }`}
                  >
                    {formData.gallery[index] ? (
                      <>
                        <Image
                          src={formData.gallery[index] || "/placeholder.svg"}
                          alt={`Screenshot ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newGallery = [...formData.gallery];
                            newGallery[index] = "";
                            setFormData({ ...formData, gallery: newGallery });
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-500 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <Upload className="w-5 h-5 text-white/30 mb-1" />
                        <span className="text-[10px] text-white/30">Image {index + 1}</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.gallery[index] || ""}
                    onChange={(e) => {
                      const newGallery = [...formData.gallery];
                      newGallery[index] = e.target.value;
                      setFormData({ ...formData, gallery: newGallery });
                    }}
                    className="w-full px-2 py-1.5 bg-[#0a0a0a] border border-[#262626] rounded text-white text-xs focus:border-[#dc2626] focus:outline-none transition-colors"
                    placeholder="Image URL"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <h4 className="font-medium text-white mb-3">Pricing & Stock</h4>
            <div className="space-y-3">
              {formData.pricing.map((tier, index) => (
                <div key={tier.duration} className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">{tier.duration}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tier.price}
                        onChange={(e) => updatePricing(index, "price", Number.parseFloat(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm focus:border-[#dc2626] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={tier.stock}
                      onChange={(e) => updatePricing(index, "stock", Number.parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm focus:border-[#dc2626] focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <h4 className="font-medium text-white mb-3">Requirements</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">CPU</label>
                <select
                  value={formData.requirements.cpu}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, cpu: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm focus:border-[#dc2626] focus:outline-none transition-colors"
                >
                  <option value="Intel only">Intel only</option>
                  <option value="AMD only">AMD only</option>
                  <option value="Intel & AMD">Intel & AMD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Windows</label>
                <select
                  value={formData.requirements.windows}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, windows: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm focus:border-[#dc2626] focus:outline-none transition-colors"
                >
                  <option value="10 only">10 only</option>
                  <option value="11 only">11 only</option>
                  <option value="10 - 11">10 - 11</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Cheat Type</label>
                <select
                  value={formData.requirements.cheatType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, cheatType: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm focus:border-[#dc2626] focus:outline-none transition-colors"
                >
                  <option value="External">External</option>
                  <option value="Internal">Internal</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Controller</label>
                <select
                  value={formData.requirements.controller ? "yes" : "no"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requirements: { ...formData.requirements, controller: e.target.value === "yes" },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm focus:border-[#dc2626] focus:outline-none transition-colors"
                >
                  <option value="yes">Supported</option>
                  <option value="no">Not Supported</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1a1a1a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1a1a1a] text-white/70 rounded-lg hover:bg-[#262626] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-lg hover:bg-[#ef4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? "Save Changes" : "Create Product"}
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProductsPage() {
  const { products, addProduct, updateProduct, setProducts, isLoading } = useAdminStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<Product["status"] | "all">("all");
  const [pageLoading, setPageLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load products from database on mount
  useEffect(() => {
    async function loadProducts() {
      setPageLoading(true);
      try {
        const result = await getProductsFromDB();
        if (result.success && result.data && result.data.length > 0) {
          const formattedProducts = result.data.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            game: p.game,
            description: p.description || "",
            image: p.image || "/images/apex-product.png",
            gallery: p.gallery || [],
            status: (p.status === "Undetected" ? "active" : p.status === "Updating" ? "maintenance" : "inactive") as "active" | "inactive" | "maintenance",
            pricing: p.pricing || [{ duration: "1 Day", price: 9.99, stock: 10 }],
            features: p.features || { aimbot: [], esp: [], misc: [] },
            requirements: p.requirements || { cpu: "Intel", windows: "10-11", cheatType: "External", controller: false },
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
          }));
          setProducts(formattedProducts);
        } else {
          // Use mock data as fallback when DB is empty
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error("[Admin] Error loading products:", error);
        // Use mock data as fallback on error
        setProducts(mockProducts);
      } finally {
        setPageLoading(false);
      }
    }

    loadProducts();
  }, [setProducts]);

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.status === filter);

  const statusCounts = {
    all: products.length,
    active: products.filter((p) => p.status === "active").length,
    inactive: products.filter((p) => p.status === "inactive").length,
    maintenance: products.filter((p) => p.status === "maintenance").length,
  };

  const handleSaveProduct = async (data: ProductFormData, isEdit: boolean, productId?: string) => {
    if (isEdit && productId) {
      // Update existing product
      await updateProduct(productId, {
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        description: data.description,
        game: data.game,
        image: data.image,
        gallery: data.gallery,
        status: data.status,
        pricing: data.pricing,
        requirements: data.requirements,
        features: data.features,
        updatedAt: new Date(),
      });
    } else {
      // Create new product
      const newProduct: Product = {
        id: `prod_${Date.now()}`,
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, "-"),
        description: data.description,
        game: data.game,
        image: data.image,
        gallery: data.gallery,
        status: data.status,
        pricing: data.pricing,
        requirements: data.requirements,
        features: data.features,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await addProduct(newProduct);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setEditingProduct(null);
    setShowAddModal(false);
  };

  if (pageLoading) {
    return (
      <AdminShell title="Products" subtitle="Manage your product catalog">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Products" subtitle="Manage your product catalog">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(["all", "active", "inactive", "maintenance"] as const).map(
            (status) => (
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
            )
          )}
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <Package className="w-12 h-12 text-white/20 mb-4" />
          <p className="text-white/50">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => setEditingProduct(product)}
              onView={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      {/* Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Add Product Modal */}
      <ProductFormModal
        product={null}
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveProduct}
      />

      {/* Edit Product Modal */}
      <ProductFormModal
        product={editingProduct}
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveProduct}
      />
    </AdminShell>
  );
}
