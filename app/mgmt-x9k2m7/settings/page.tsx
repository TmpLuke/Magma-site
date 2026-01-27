"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("Magma Cheats");
  const [supportEmail, setSupportEmail] = useState("support@magmacheats.com");
  const [apiKey, setApiKey] = useState("mk_live_wxqbJHDGKmtI291K6kHNYZ2Bb2jx1srg");
  const [webhookSecret, setWebhookSecret] = useState("201390195d17ee7f46c1dbb0b35e94de08582fa2b54662f295fd4dc528c23c0c");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function handleSave() {
    try {
      setSaving(true);
      
      // Simulate API call - in production, save to database or env
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Payment Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                MoneyMotion API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors font-mono"
              />
              <p className="text-xs text-white/40 mt-1">
                Note: API keys are stored in environment variables. Changes here are for display only.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Webhook Secret
              </label>
              <input
                type="password"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors font-mono"
              />
              <p className="text-xs text-white/40 mt-1">
                Note: Webhook secrets are stored in environment variables. Changes here are for display only.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
