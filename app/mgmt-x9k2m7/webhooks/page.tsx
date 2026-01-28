"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RefreshCw, Plus, Edit, Trash2, Webhook, Link2, Zap, Activity, Check, X, AlertCircle, Globe, CheckCircle2, Clock, DollarSign, Package, Key, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createWebhook, updateWebhook, deleteWebhook } from "@/app/actions/admin-webhooks";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

interface WebhookFormData {
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
}

const AVAILABLE_EVENTS = [
  { id: "payment.completed", label: "Payment Completed", icon: CheckCircle2, color: "emerald" },
  { id: "payment.failed", label: "Payment Failed", icon: AlertCircle, color: "red" },
  { id: "order.created", label: "Order Created", icon: ShoppingCart, color: "blue" },
  { id: "order.completed", label: "Order Completed", icon: Package, color: "green" },
  { id: "license.created", label: "License Created", icon: Key, color: "purple" },
  { id: "license.revoked", label: "License Revoked", icon: X, color: "orange" },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState<WebhookFormData>({
    name: "",
    url: "",
    events: ["payment.completed"],
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadWebhooks();
  }, []);

  async function loadWebhooks() {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("webhooks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error("Failed to load webhooks:", error);
      toast({
        title: "Error",
        description: "Failed to load webhooks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWebhook() {
    try {
      setProcessing("add");
      
      const result = await createWebhook({
        name: formData.name,
        url: formData.url,
        events: formData.events,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Webhook created successfully",
        className: "border-green-500/20 bg-green-500/10",
      });
      
      setShowAddModal(false);
      resetForm();
      await loadWebhooks();
    } catch (error: any) {
      console.error("Failed to add webhook:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create webhook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function handleEditWebhook() {
    if (!selectedWebhook) return;
    
    try {
      setProcessing("edit");
      
      const result = await updateWebhook(selectedWebhook.id, {
        name: formData.name,
        url: formData.url,
        events: formData.events,
        is_active: formData.is_active,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Webhook updated successfully",
        className: "border-blue-500/20 bg-blue-500/10",
      });
      
      setShowEditModal(false);
      setSelectedWebhook(null);
      resetForm();
      await loadWebhooks();
    } catch (error: any) {
      console.error("Failed to edit webhook:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update webhook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function handleDeleteWebhook() {
    if (!selectedWebhook) return;
    
    try {
      setProcessing("delete");
      
      const result = await deleteWebhook(selectedWebhook.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Webhook deleted successfully",
        className: "border-red-500/20 bg-red-500/10",
      });
      
      setShowDeleteModal(false);
      setSelectedWebhook(null);
      await loadWebhooks();
    } catch (error: any) {
      console.error("Failed to delete webhook:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete webhook. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  function openEditModal(webhook: Webhook) {
    setSelectedWebhook(webhook);
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      is_active: webhook.is_active,
    });
    setShowEditModal(true);
  }

  function openDeleteModal(webhook: Webhook) {
    setSelectedWebhook(webhook);
    setShowDeleteModal(true);
  }

  function resetForm() {
    setFormData({
      name: "",
      url: "",
      events: ["payment.completed"],
      is_active: true,
    });
  }

  function toggleEvent(event: string) {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  }

  // Calculate stats
  const totalWebhooks = webhooks.length;
  const activeWebhooks = webhooks.filter(w => w.is_active).length;
  const totalEvents = webhooks.reduce((sum, w) => sum + w.events.length, 0);

  const columns = [
    {
      key: "name",
      label: "Webhook",
      sortable: true,
      render: (webhook: Webhook) => (
        <div className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dc2626]/20 to-[#dc2626]/5 border border-[#dc2626]/10 flex items-center justify-center group-hover:border-[#dc2626]/30 transition-all">
              <Webhook className="w-5 h-5 text-[#dc2626]/70" />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${
              webhook.is_active ? "bg-emerald-500" : "bg-gray-500"
            }`} />
          </div>
          <div>
            <p className="text-white font-semibold tracking-tight group-hover:text-[#dc2626] transition-colors">
              {webhook.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Globe className="w-3 h-3 text-white/40" />
              <p className="text-xs text-white/50 font-mono truncate max-w-[200px]">
                {new URL(webhook.url).hostname}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "url",
      label: "Endpoint",
      sortable: true,
      render: (webhook: Webhook) => (
        <div className="flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
          <code className="px-2 py-1 bg-[#1a1a1a] rounded border border-[#262626] text-xs text-white/70 font-mono truncate max-w-[300px] block">
            {webhook.url}
          </code>
        </div>
      ),
    },
    {
      key: "events",
      label: "Events",
      render: (webhook: Webhook) => (
        <div className="flex flex-wrap gap-1.5">
          {webhook.events.slice(0, 2).map((event) => {
            const eventConfig = AVAILABLE_EVENTS.find(e => e.id === event);
            const Icon = eventConfig?.icon || Zap;
            const colorClass = {
              emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
              red: "bg-red-500/10 text-red-400 border-red-500/30",
              blue: "bg-blue-500/10 text-blue-400 border-blue-500/30",
              green: "bg-green-500/10 text-green-400 border-green-500/30",
              purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
              orange: "bg-orange-500/10 text-orange-400 border-orange-500/30",
            }[eventConfig?.color || "emerald"];
            
            return (
              <Badge key={event} className={`${colorClass} border text-xs font-medium px-2 py-0.5 flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {event.split('.')[0]}
              </Badge>
            );
          })}
          {webhook.events.length > 2 && (
            <Badge className="bg-[#262626] text-white/50 border-[#262626] text-xs font-medium px-2 py-0.5">
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
        <Badge className={`${
          webhook.is_active 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
            : "bg-gray-500/10 text-gray-400 border-gray-500/30"
        } border font-medium px-2.5 py-1 flex items-center gap-1.5 w-fit`}>
          <div className={`w-1.5 h-1.5 rounded-full ${webhook.is_active ? "bg-emerald-400 animate-pulse" : "bg-gray-400"}`} />
          <span>{webhook.is_active ? "Active" : "Inactive"}</span>
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (webhook: Webhook) => (
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-white/30" />
          <span className="text-white/40 text-sm font-medium tabular-nums">
            {new Date(webhook.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminShell title="Webhooks" subtitle="Manage webhook integrations and event notifications">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#dc2626]/20 border-t-[#dc2626] animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-[#dc2626]/5 blur-xl animate-pulse" />
          </div>
          <p className="text-white/40 text-sm font-medium">Loading webhooks...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Webhooks" subtitle="Manage webhook integrations and event notifications">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-[#dc2626]/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Webhooks</p>
              <p className="text-2xl font-bold text-white mt-1">{totalWebhooks}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
              <Webhook className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{activeWebhooks}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Events</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{totalEvents}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => loadWebhooks()}
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
          Add Webhook
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={webhooks}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search webhooks..."
        actions={(webhook) => (
          <div className="flex gap-1.5">
            <Button
              onClick={() => openEditModal(webhook)}
              size="sm"
              variant="ghost"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
              title="Edit Webhook"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => openDeleteModal(webhook)}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              title="Delete Webhook"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      {/* Add Webhook Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
                <Plus className="w-4 h-4 text-[#dc2626]" />
              </div>
              Add New Webhook
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Configure a webhook to receive real-time event notifications
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">
                Webhook Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Webhook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Discord Notifications"
                  className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-[#dc2626]/50 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">
                Webhook URL <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://your-webhook-url.com/endpoint"
                  className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-[#dc2626]/50 font-mono text-sm transition-colors"
                />
              </div>
              <p className="text-xs text-white/40">POST requests will be sent to this URL</p>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/70">
                Events to Listen <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_EVENTS.map((event) => {
                  const Icon = event.icon;
                  const isSelected = formData.events.includes(event.id);
                  const colorClasses = {
                    emerald: "border-emerald-500/50 bg-emerald-500/5",
                    red: "border-red-500/50 bg-red-500/5",
                    blue: "border-blue-500/50 bg-blue-500/5",
                    green: "border-green-500/50 bg-green-500/5",
                    purple: "border-purple-500/50 bg-purple-500/5",
                    orange: "border-orange-500/50 bg-orange-500/5",
                  }[event.color];
                  
                  return (
                    <label
                      key={event.id}
                      className={`flex items-center gap-3 p-3 bg-[#1a1a1a] border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? colorClasses 
                          : "border-[#262626] hover:border-[#dc2626]/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleEvent(event.id)}
                        className="w-4 h-4 rounded accent-[#dc2626]"
                      />
                      <Icon className={`w-4 h-4 ${isSelected ? `text-${event.color}-400` : "text-white/40"}`} />
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{event.label}</p>
                        <p className="text-xs text-white/40 font-mono">{event.id}</p>
                      </div>
                    </label>
                  );
                })}
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
              onClick={handleAddWebhook}
              disabled={processing === "add" || !formData.name || !formData.url || formData.events.length === 0}
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
                  Add Webhook
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Webhook Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Edit className="w-4 h-4 text-blue-400" />
              </div>
              Edit Webhook
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Update webhook configuration and events
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">
                Webhook Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Webhook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/70">
                Webhook URL <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-blue-500/50 font-mono text-sm transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/70">
                Events to Listen <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_EVENTS.map((event) => {
                  const Icon = event.icon;
                  const isSelected = formData.events.includes(event.id);
                  const colorClasses = {
                    emerald: "border-emerald-500/50 bg-emerald-500/5",
                    red: "border-red-500/50 bg-red-500/5",
                    blue: "border-blue-500/50 bg-blue-500/5",
                    green: "border-green-500/50 bg-green-500/5",
                    purple: "border-purple-500/50 bg-purple-500/5",
                    orange: "border-orange-500/50 bg-orange-500/5",
                  }[event.color];
                  
                  return (
                    <label
                      key={event.id}
                      className={`flex items-center gap-3 p-3 bg-[#1a1a1a] border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? colorClasses 
                          : "border-[#262626] hover:border-blue-500/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleEvent(event.id)}
                        className="w-4 h-4 rounded accent-blue-500"
                      />
                      <Icon className={`w-4 h-4 ${isSelected ? `text-${event.color}-400` : "text-white/40"}`} />
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{event.label}</p>
                        <p className="text-xs text-white/40 font-mono">{event.id}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-[#111111] border border-[#262626] rounded-lg">
              <div>
                <p className="text-sm font-medium text-white flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Active Status
                </p>
                <p className="text-xs text-white/50 mt-0.5">Enable or disable this webhook</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shadow-inner ${
                  formData.is_active ? "bg-emerald-500" : "bg-[#262626]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                    formData.is_active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => { setShowEditModal(false); setSelectedWebhook(null); resetForm(); }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditWebhook}
              disabled={processing === "edit" || !formData.name || !formData.url || formData.events.length === 0}
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
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              Delete Webhook
            </DialogTitle>
            <DialogDescription className="text-white/50">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <p className="text-white/70">
                Are you sure you want to delete webhook{" "}
                <span className="font-semibold text-white">{selectedWebhook?.name}</span>?
              </p>
              <p className="text-white/50 text-sm mt-2">
                This webhook is listening to{" "}
                <span className="font-semibold text-white">{selectedWebhook?.events.length}</span>{" "}
                {selectedWebhook?.events.length === 1 ? "event" : "events"}.
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => { setShowDeleteModal(false); setSelectedWebhook(null); }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteWebhook}
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
                  Delete Webhook
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}