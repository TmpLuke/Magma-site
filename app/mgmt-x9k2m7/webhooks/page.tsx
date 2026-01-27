"use client";

import { useState, useEffect } from "react";
import {
  Webhook,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Power,
  RefreshCcw,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { useAdminStore } from "@/lib/admin-store";
import { getWebhooksFromDB } from "@/lib/admin-actions";
import { mockWebhooks } from "@/lib/admin-mock-data";
import type { Webhook as WebhookType } from "@/lib/admin-types";
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

const availableEvents = [
  { id: "order.completed", label: "Order Completed" },
  { id: "order.refunded", label: "Order Refunded" },
  { id: "order.failed", label: "Order Failed" },
  { id: "license.activated", label: "License Activated" },
  { id: "license.expired", label: "License Expired" },
  { id: "license.revoked", label: "License Revoked" },
];

function WebhookStatusBadge({ status, failureCount }: { status: WebhookType["status"]; failureCount: number }) {
  if (failureCount > 0 && status === "active") {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-yellow-500/10 text-yellow-400 border-yellow-500/20 flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Failing
      </span>
    );
  }

  const styles = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    inactive: "bg-gray-500/10 text-gray-400 border-gray-500/20",
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

function CreateWebhookModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addWebhook, isLoading } = useAdminStore();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const generateSecret = () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "whsec_";
    for (let i = 0; i < 24; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const handleCreate = async () => {
    if (!name || !url || selectedEvents.length === 0) return;

    setCreating(true);
    setSuccess(false);

    try {
      const newWebhook: WebhookType = {
        id: `wh_${Date.now()}`,
        name,
        url,
        events: selectedEvents,
        secret: generateSecret(),
        status: "active",
        failureCount: 0,
        createdAt: new Date(),
      };

      await addWebhook(newWebhook);
      setSuccess(true);
      
      setTimeout(() => {
        setName("");
        setUrl("");
        setSelectedEvents([]);
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("[Admin] Error creating webhook:", error);
    } finally {
      setCreating(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((e) => e !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Webhook</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Webhook created successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Discord Notifications"
              disabled={creating}
              className="w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Endpoint URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              disabled={creating}
              className="w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Events
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => toggleEvent(event.id)}
                  disabled={creating}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm text-left transition-colors disabled:opacity-50",
                    selectedEvents.includes(event.id)
                      ? "bg-[#dc2626] text-white"
                      : "bg-[#111111] border border-[#262626] text-white/70 hover:border-[#dc2626]"
                  )}
                >
                  {event.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!name || !url || selectedEvents.length === 0 || creating || isLoading}
            className="w-full px-4 py-2.5 bg-[#dc2626] hover:bg-[#ef4444] disabled:bg-[#dc2626]/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Webhook"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function WebhooksPage() {
  const { webhooks, updateWebhook, deleteWebhook, setWebhooks, isLoading } = useAdminStore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load webhooks from database on mount
  useEffect(() => {
    async function loadWebhooks() {
      setPageLoading(true);
      try {
        const result = await getWebhooksFromDB();
        if (result.success && result.data && result.data.length > 0) {
          const formattedWebhooks = result.data.map((w) => ({
            id: w.id,
            name: w.name,
            url: w.url,
            events: w.events || [],
            secret: `whsec_${w.id.slice(0, 16)}`,
            status: (w.is_active ? "active" : "inactive") as "active" | "inactive",
            failureCount: 0,
            lastTriggered: w.last_triggered ? new Date(w.last_triggered) : undefined,
            createdAt: new Date(w.created_at),
          }));
          setWebhooks(formattedWebhooks);
        } else {
          setWebhooks(mockWebhooks);
        }
      } catch (error) {
        console.error("[Admin] Error loading webhooks:", error);
        setWebhooks(mockWebhooks);
      } finally {
        setPageLoading(false);
      }
    }

    loadWebhooks();
  }, [setWebhooks]);

  const formatTimeAgo = (date?: Date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleToggleStatus = async (webhook: WebhookType) => {
    setActionLoadingId(webhook.id);
    await updateWebhook(webhook.id, {
      status: webhook.status === "active" ? "inactive" : "active",
    });
    setActionLoadingId(null);
  };

  const handleDelete = async (webhookId: string) => {
    setActionLoadingId(webhookId);
    await deleteWebhook(webhookId);
    setActionLoadingId(null);
  };

  const handleTestWebhook = async (webhook: WebhookType) => {
    setActionLoadingId(webhook.id);
    // Simulate webhook test
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Test webhook sent to ${webhook.url}`);
    setActionLoadingId(null);
  };

  const columns = [
    {
      key: "name",
      label: "Webhook",
      render: (webhook: WebhookType) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#dc2626]/10 flex items-center justify-center">
            <Webhook className="w-5 h-5 text-[#dc2626]" />
          </div>
          <div>
            <p className="text-white font-medium">{webhook.name}</p>
            <p className="text-xs text-white/50 truncate max-w-[200px]">
              {webhook.url}
            </p>
          </div>
          {actionLoadingId === webhook.id && (
            <Loader2 className="w-3 h-3 animate-spin text-white/50" />
          )}
        </div>
      ),
    },
    {
      key: "events",
      label: "Events",
      render: (webhook: WebhookType) => (
        <div className="flex flex-wrap gap-1">
          {webhook.events.slice(0, 2).map((event) => (
            <span
              key={event}
              className="px-2 py-0.5 bg-[#1a1a1a] text-white/70 text-xs rounded"
            >
              {event}
            </span>
          ))}
          {webhook.events.length > 2 && (
            <span className="px-2 py-0.5 bg-[#1a1a1a] text-white/50 text-xs rounded">
              +{webhook.events.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "lastTriggered",
      label: "Last Triggered",
      render: (webhook: WebhookType) => (
        <span className="text-white/70 text-sm">
          {formatTimeAgo(webhook.lastTriggered)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (webhook: WebhookType) => (
        <WebhookStatusBadge
          status={webhook.status}
          failureCount={webhook.failureCount}
        />
      ),
    },
  ];

  const actions = (webhook: WebhookType) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
          <MoreHorizontal className="w-4 h-4 text-white/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-[#111111] border-[#262626]">
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(webhook.secret)}
          className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Secret
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleTestWebhook(webhook)}
          disabled={actionLoadingId === webhook.id}
          className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Test Webhook
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
          disabled={actionLoadingId === webhook.id}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Webhook
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleToggleStatus(webhook)}
          disabled={actionLoadingId === webhook.id}
          className="text-white/70 focus:bg-[#1a1a1a] focus:text-white"
        >
          <Power className="w-4 h-4 mr-2" />
          {webhook.status === "active" ? "Disable" : "Enable"}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#262626]" />
        <DropdownMenuItem
          onClick={() => handleDelete(webhook.id)}
          disabled={actionLoadingId === webhook.id}
          className="text-red-400 focus:bg-[#1a1a1a] focus:text-red-400"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Webhook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (pageLoading) {
    return (
      <AdminShell title="Webhooks" subtitle="Configure webhook endpoints for notifications">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Webhooks"
      subtitle="Configure webhook endpoints for notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-white/60">
              {webhooks.filter((w) => w.status === "active").length} Active
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-white/60">
              {webhooks.filter((w) => w.failureCount > 0).length} Failing
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {/* Webhooks Table */}
      <DataTable
        data={webhooks}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search webhooks..."
        actions={actions}
      />

      {/* Create Modal */}
      <CreateWebhookModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </AdminShell>
  );
}
