"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Plus,
  MoreHorizontal,
  Copy,
  Ban,
  RefreshCcw,
  Eye,
  Download,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { useAdminStore } from "@/lib/admin-store";
import { getLicensesFromDB, getProductsFromDB } from "@/lib/admin-actions";
import { mockLicenseKeys, mockProducts } from "@/lib/admin-mock-data";
import type { LicenseKey } from "@/lib/admin-types";
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

function LicenseStatusBadge({ status }: { status: LicenseKey["status"] }) {
  const styles = {
    available: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    expired: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    revoked: "bg-red-500/10 text-red-400 border-red-500/20",
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

function GenerateKeysModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { products, addLicenseKey, isLoading } = useAdminStore();
  const [productId, setProductId] = useState("");
  const [duration, setDuration] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);

  const generateKey = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const segments = 4;
    const segmentLength = 4;
    const parts = [];
    for (let i = 0; i < segments; i++) {
      let segment = "";
      for (let j = 0; j < segmentLength; j++) {
        segment += chars[Math.floor(Math.random() * chars.length)];
      }
      parts.push(segment);
    }
    return `MGMA-${parts.join("-")}`;
  };

  const handleGenerate = async () => {
    if (!productId || !duration) return;

    setGenerating(true);
    setSuccess(false);

    try {
      for (let i = 0; i < quantity; i++) {
        const newKey: LicenseKey = {
          id: `lic_${Date.now()}_${i}`,
          key: generateKey(),
          productId,
          productName: selectedProduct?.name || "",
          status: "available",
          duration,
          createdAt: new Date(),
        };
        await addLicenseKey(newKey);
      }

      setSuccess(true);
      setTimeout(() => {
        setProductId("");
        setDuration("");
        setQuantity(1);
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("[Admin] Error generating keys:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Generate License Keys
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Successfully generated {quantity} license key{quantity > 1 ? "s" : ""}!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Product
            </label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setDuration("");
              }}
              disabled={generating}
              className="w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
            >
              <option value="">Select a product</option>
              {products
                .filter((p) => p.status === "active")
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {product.game}
                  </option>
                ))}
            </select>
          </div>

          {selectedProduct && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={generating}
                className="w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
              >
                <option value="">Select duration</option>
                {selectedProduct.pricing.map((p) => (
                  <option key={p.duration} value={p.duration}>
                    {p.duration} (${p.price})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))
              }
              disabled={generating}
              className="w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!productId || !duration || generating || isLoading}
            className="w-full px-4 py-2.5 bg-[#dc2626] hover:bg-[#ef4444] disabled:bg-[#dc2626]/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate {quantity} Key{quantity > 1 ? "s" : ""}</>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LicenseDetailsModal({
  license,
  open,
  onClose,
}: {
  license: LicenseKey | null;
  open: boolean;
  onClose: () => void;
}) {
  const { revokeLicense, updateLicenseStatus, isLoading } = useAdminStore();
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!license) return null;

  const copyKey = () => {
    navigator.clipboard.writeText(license.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    setActionLoading("revoke");
    await revokeLicense(license.id);
    setActionLoading(null);
    onClose();
  };

  const handleResetHwid = async () => {
    setActionLoading("reset");
    await updateLicenseStatus(license.id, "active");
    setActionLoading(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">License Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Key */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">License Key</span>
              <button
                type="button"
                onClick={copyKey}
                className="text-[#dc2626] hover:text-[#ef4444] transition-colors text-sm flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="font-mono text-white mt-1 text-lg">{license.key}</p>
          </div>

          {/* Status & Product */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
              <span className="text-white/50 text-sm">Status</span>
              <div className="mt-1">
                <LicenseStatusBadge status={license.status} />
              </div>
            </div>
            <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
              <span className="text-white/50 text-sm">Duration</span>
              <p className="text-white mt-1">{license.duration}</p>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
            <span className="text-white/50 text-sm">Product</span>
            <p className="text-white mt-1">{license.productName}</p>
          </div>

          {/* Customer Info (if assigned) */}
          {license.customerEmail && (
            <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a] space-y-2">
              <span className="text-white/50 text-sm">Customer</span>
              <p className="text-white">{license.customerEmail}</p>
              {license.hwid && (
                <div className="pt-2 border-t border-[#262626]">
                  <span className="text-white/50 text-sm">HWID</span>
                  <p className="text-white font-mono text-xs mt-1">
                    {license.hwid}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {license.activatedAt && (
              <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
                <span className="text-white/50 text-sm">Activated</span>
                <p className="text-white mt-1 text-sm">
                  {license.activatedAt.toLocaleDateString()}
                </p>
              </div>
            )}
            {license.expiresAt && (
              <div className="p-4 bg-[#111111] rounded-lg border border-[#1a1a1a]">
                <span className="text-white/50 text-sm">Expires</span>
                <p className="text-white mt-1 text-sm">
                  {license.expiresAt.toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {license.status === "active" && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleResetHwid}
                disabled={isLoading || actionLoading === "reset"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#262626] disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {actionLoading === "reset" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
                Reset HWID
              </button>
              <button
                type="button"
                onClick={handleRevoke}
                disabled={isLoading || actionLoading === "revoke"}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 rounded-lg transition-colors"
              >
                {actionLoading === "revoke" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}
                Revoke License
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LicensesPage() {
  const { licenseKeys, revokeLicense, setLicenseKeys, setProducts, isLoading } = useAdminStore();
  const [selectedLicense, setSelectedLicense] = useState<LicenseKey | null>(null);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [filter, setFilter] = useState<LicenseKey["status"] | "all">("all");
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load licenses from database on mount
  useEffect(() => {
    async function loadData() {
      setPageLoading(true);
      try {
        const [licensesResult, productsResult] = await Promise.all([
          getLicensesFromDB(),
          getProductsFromDB(),
        ]);

        if (licensesResult.success && licensesResult.data && licensesResult.data.length > 0) {
          const formattedLicenses = licensesResult.data.map((l) => ({
            id: l.id,
            key: l.license_key,
            productId: l.product_id,
            productName: l.product_name,
            status: (l.status === "unused" ? "available" : l.status) as "available" | "active" | "expired" | "revoked",
            duration: "30 Days",
            customerEmail: l.customer_email,
            hwid: l.hwid,
            activatedAt: l.created_at ? new Date(l.created_at) : undefined,
            expiresAt: l.expires_at ? new Date(l.expires_at) : undefined,
            createdAt: new Date(l.created_at),
          }));
          setLicenseKeys(formattedLicenses);
        } else {
          setLicenseKeys(mockLicenseKeys);
        }

        if (productsResult.success && productsResult.data && productsResult.data.length > 0) {
          const formattedProducts = productsResult.data.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            game: p.game,
            description: p.description || "",
            image: p.image || "/images/apex-product.png",
            gallery: p.gallery || [],
            status: (p.status === "Undetected" ? "active" : "inactive") as "active" | "inactive" | "maintenance",
            pricing: p.pricing || [{ duration: "1 Day", price: 9.99, stock: 10 }],
            features: p.features || { aimbot: [], esp: [], misc: [] },
            requirements: p.requirements || { cpu: "Intel", windows: "10-11", cheatType: "External", controller: false },
            createdAt: new Date(p.created_at),
            updatedAt: new Date(p.updated_at),
          }));
          setProducts(formattedProducts);
        } else {
          setProducts(mockProducts);
        }
      } catch (error) {
        console.error("[Admin] Error loading licenses:", error);
        setLicenseKeys(mockLicenseKeys);
        setProducts(mockProducts);
      } finally {
        setPageLoading(false);
      }
    }

    loadData();
  }, [setLicenseKeys, setProducts]);

  const filteredLicenses =
    filter === "all"
      ? licenseKeys
      : licenseKeys.filter((l) => l.status === filter);

  const handleRevoke = async (licenseId: string) => {
    setActionLoadingId(licenseId);
    await revokeLicense(licenseId);
    setActionLoadingId(null);
  };

  const columns = [
    {
      key: "key",
      label: "License Key",
      render: (license: LicenseKey) => (
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[#dc2626]" />
          <span className="font-mono text-white text-sm">{license.key}</span>
        </div>
      ),
    },
    {
      key: "productName",
      label: "Product",
      render: (license: LicenseKey) => (
        <div>
          <p className="text-white">{license.productName}</p>
          <p className="text-xs text-white/50">{license.duration}</p>
        </div>
      ),
    },
    {
      key: "customerEmail",
      label: "Customer",
      render: (license: LicenseKey) => (
        <span className="text-white/70">
          {license.customerEmail || "Not assigned"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (license: LicenseKey) => (
        <div className="flex items-center gap-2">
          <LicenseStatusBadge status={license.status} />
          {actionLoadingId === license.id && (
            <Loader2 className="w-3 h-3 animate-spin text-white/50" />
          )}
        </div>
      ),
    },
    {
      key: "expiresAt",
      label: "Expires",
      render: (license: LicenseKey) => (
        <span className="text-white/70 text-sm">
          {license.expiresAt
            ? license.expiresAt.toLocaleDateString()
            : "N/A"}
        </span>
      ),
    },
  ];

  const actions = (license: LicenseKey) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-white/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#111111] border-[#262626]">
        <DropdownMenuItem
          onClick={() => setSelectedLicense(license)}
          className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(license.key)}
          className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Key
        </DropdownMenuItem>
        {license.status === "active" && (
          <>
            <DropdownMenuSeparator className="bg-[#262626]" />
            <DropdownMenuItem
              onClick={() => handleRevoke(license.id)}
              disabled={actionLoadingId === license.id}
              className="text-red-400 focus:bg-[#1a1a1a] focus:text-red-400"
            >
              <Ban className="w-4 h-4 mr-2" />
              Revoke License
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const statusCounts = {
    all: licenseKeys.length,
    available: licenseKeys.filter((l) => l.status === "available").length,
    active: licenseKeys.filter((l) => l.status === "active").length,
    expired: licenseKeys.filter((l) => l.status === "expired").length,
    revoked: licenseKeys.filter((l) => l.status === "revoked").length,
  };

  if (pageLoading) {
    return (
      <AdminShell title="License Keys" subtitle="Generate and manage license keys">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="License Keys"
      subtitle="Generate and manage license keys"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(["all", "available", "active", "expired", "revoked"] as const).map(
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

        {/* Generate Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            type="button"
            onClick={() => setGenerateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Keys
          </button>
        </div>
      </div>

      {/* Licenses Table */}
      <DataTable
        data={filteredLicenses}
        columns={columns}
        searchKey="key"
        searchPlaceholder="Search by key..."
        onRowClick={setSelectedLicense}
        actions={actions}
      />

      {/* Modals */}
      <GenerateKeysModal
        open={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
      />
      <LicenseDetailsModal
        license={selectedLicense}
        open={!!selectedLicense}
        onClose={() => setSelectedLicense(null)}
      />
    </AdminShell>
  );
}
