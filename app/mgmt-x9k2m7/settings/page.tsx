"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function SettingsPage() {
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
                defaultValue="Magma Cheats"
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Support Email
              </label>
              <input
                type="email"
                defaultValue="support@magmacheats.com"
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
                defaultValue="mk_live_wxqbJHDGKmtI291K6kHNYZ2Bb2jx1srg"
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Webhook Secret
              </label>
              <input
                type="password"
                defaultValue="201390195d17ee7f46c1dbb0b35e94de08582fa2b54662f295fd4dc528c23c0c"
                className="w-full px-4 py-2 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="bg-[#dc2626] hover:bg-[#ef4444] text-white">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </AdminShell>
  );
}
