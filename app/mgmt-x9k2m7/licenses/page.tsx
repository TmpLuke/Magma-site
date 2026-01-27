"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface License {
  id: string;
  license_key: string;
  product_name: string;
  customer_email: string;
  status: string;
  expires_at: string | null;
  created_at: string;
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLicenses();
  }, []);

  async function loadLicenses() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("licenses")
        .select("*")
        .order("created_at", { ascending: false});

      if (error) throw error;
      setLicenses(data || []);
    } catch (error) {
      console.error("Failed to load licenses:", error);
      toast({
        title: "Error",
        description: "Failed to load licenses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        title: "Success",
        description: "License revoked successfully.",
      });
      
      await loadLicenses();
    } catch (error) {
      console.error("Failed to revoke license:", error);
      toast({
        title: "Error",
        description: "Failed to revoke license. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRevoking(null);
    }
  }

  const columns = [
    {
      key: "license_key",
      label: "License Key",
      sortable: true,
      render: (license: License) => (
        <span className="font-mono text-white">{license.license_key}</span>
      ),
    },
    {
      key: "product_name",
      label: "Product",
      sortable: true,
      render: (license: License) => (
        <span className="text-white/70">{license.product_name}</span>
      ),
    },
    {
      key: "customer_email",
      label: "Customer",
      sortable: true,
      render: (license: License) => (
        <span className="text-white/70">{license.customer_email}</span>
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
      <AdminShell title="License Keys" subtitle="Manage license keys">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="License Keys" subtitle="Manage license keys">
      <div className="mb-6">
        <Button
          onClick={() => loadLicenses()}
          variant="outline"
          size="sm"
          disabled={loading}
          className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <DataTable
        data={licenses}
        columns={columns}
        searchKey="customer_email"
        searchPlaceholder="Search by email..."
        actions={(license) => (
          <div className="flex gap-2">
            {license.status === "active" && (
              <Button
                onClick={() => revokeLicense(license.id)}
                size="sm"
                variant="ghost"
                disabled={revoking === license.id}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                {revoking === license.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        )}
      />
    </AdminShell>
  );
}
