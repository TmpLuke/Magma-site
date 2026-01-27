"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWebhooks();
  }, []);

  async function loadWebhooks() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error("Failed to load webhooks:", error);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (webhook: Webhook) => (
        <span className="text-white font-medium">{webhook.name}</span>
      ),
    },
    {
      key: "url",
      label: "URL",
      sortable: true,
      render: (webhook: Webhook) => (
        <span className="font-mono text-white/70 text-sm">{webhook.url}</span>
      ),
    },
    {
      key: "events",
      label: "Events",
      render: (webhook: Webhook) => (
        <div className="flex flex-wrap gap-1">
          {webhook.events.slice(0, 2).map((event) => (
            <Badge key={event} className="bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20 text-xs">
              {event}
            </Badge>
          ))}
          {webhook.events.length > 2 && (
            <Badge className="bg-[#262626] text-white/50 border-[#262626] text-xs">
              +{webhook.events.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      sortable: true,
      render: (webhook: Webhook) => (
        <Badge className={webhook.is_active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}>
          {webhook.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminShell title="Webhooks" subtitle="Manage webhook integrations">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Webhooks" subtitle="Manage webhook integrations">
      <div className="mb-6">
        <Button
          onClick={() => loadWebhooks()}
          variant="outline"
          size="sm"
          className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <DataTable
        data={webhooks}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search webhooks..."
      />
    </AdminShell>
  );
}
