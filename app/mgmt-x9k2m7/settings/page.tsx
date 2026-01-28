"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { RefreshCw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadSettings, saveSettings } from "@/app/actions/admin-settings";

interface Settings {
  site_name: string;
  site_description: string;
  support_email: string;
  maintenance_mode: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    site_name: "Magma Cheats",
    site_description: "Premium undetected cheats for all games",
    support_email: "support@magma.local",
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettingsData();
  }, []);

  async function loadSettingsData() {
    try {
      setLoading(true);
      const result = await loadSettings();

      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.settings) {
        setSettings(result.settings);
      }
    } catch (error: any) {
      console.error("Failed to load settings:", error);
      toast({
        title: "❌ Error",
        description: "Failed to load settings. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);

      const result = await saveSettings(settings);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "✅ Success",
        description: "Settings saved to database!",
      });
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell title="Settings" subtitle="Configure your admin panel">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Settings" subtitle="Configure your admin panel">
      <div className="max-w-4xl space-y-6">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Site Description
              </label>
              <input
                type="text"
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors"
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#111111] border border-[#262626] rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Maintenance Mode</p>
                <p className="text-xs text-white/50">Temporarily disable the site for maintenance</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenance_mode ? "bg-[#dc2626]" : "bg-[#262626]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.maintenance_mode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Payment Settings</h2>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-400">
                <strong>Note:</strong> API keys and webhook secrets should be managed through environment variables (.env file) for security. 
                Contact your system administrator to update these values.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                MoneyMotion API Key
              </label>
              <input
                type="password"
                value="mk_live_***********************************"
                disabled
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white/50 cursor-not-allowed font-mono"
              />
              <p className="text-xs text-white/40 mt-1">
                Configured via MONEYMOTION_API_KEY environment variable
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Webhook Secret
              </label>
              <input
                type="password"
                value="********************************"
                disabled
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white/50 cursor-not-allowed font-mono"
              />
              <p className="text-xs text-white/40 mt-1">
                Configured via MONEYMOTION_WEBHOOK_SECRET environment variable
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button
            onClick={() => loadSettingsData()}
            variant="outline"
            size="sm"
            disabled={loading}
            className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Reset
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
