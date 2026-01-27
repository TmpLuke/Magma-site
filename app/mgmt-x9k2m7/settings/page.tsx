"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Save,
  RefreshCcw,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "general", label: "General", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "localization", label: "Localization", icon: Globe },
  { id: "database", label: "Database", icon: Database },
];

function SettingToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[#1a1a1a] last:border-0">
      <div>
        <p className="text-white font-medium">{label}</p>
        <p className="text-sm text-white/50">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={cn(
          "w-12 h-6 rounded-full transition-colors relative",
          enabled ? "bg-[#dc2626]" : "bg-[#262626]"
        )}
      >
        <div
          className={cn(
            "w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all",
            enabled ? "left-6" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}

function SettingInput({
  label,
  description,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="py-4 border-b border-[#1a1a1a] last:border-0">
      <label className="block">
        <p className="text-white font-medium mb-1">{label}</p>
        <p className="text-sm text-white/50 mb-3">{description}</p>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors"
        />
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    siteName: "Magma Cheats",
    supportEmail: "support@magmacheats.com",
    emailNotifications: true,
    discordNotifications: true,
    lowStockAlerts: true,
    orderNotifications: true,
    twoFactorAuth: false,
    ipWhitelist: false,
    sessionTimeout: "24",
    theme: "dark",
    accentColor: "#dc2626",
    timezone: "UTC",
    currency: "USD",
    language: "en",
    autoBackup: true,
    backupFrequency: "daily",
  });

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    setHasChanges(false);
  };

  return (
    <AdminShell title="Settings" subtitle="Configure your admin panel">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-2 sticky top-24">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                  activeSection === section.id
                    ? "bg-[#dc2626] text-white"
                    : "text-white/60 hover:bg-[#1a1a1a] hover:text-white"
                )}
              >
                <section.icon className="w-5 h-5" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-6">
            {/* General Settings */}
            {activeSection === "general" && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">
                  General Settings
                </h3>
                <SettingInput
                  label="Site Name"
                  description="The name displayed throughout the admin panel."
                  value={settings.siteName}
                  onChange={(v) => updateSetting("siteName", v)}
                />
                <SettingInput
                  label="Support Email"
                  description="Primary email for customer support inquiries."
                  value={settings.supportEmail}
                  onChange={(v) => updateSetting("supportEmail", v)}
                  type="email"
                />
              </div>
            )}

            {/* Notification Settings */}
            {activeSection === "notifications" && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">
                  Notification Settings
                </h3>
                <SettingToggle
                  label="Email Notifications"
                  description="Receive order and license notifications via email."
                  enabled={settings.emailNotifications}
                  onChange={(v) => updateSetting("emailNotifications", v)}
                />
                <SettingToggle
                  label="Discord Notifications"
                  description="Send notifications to connected Discord webhooks."
                  enabled={settings.discordNotifications}
                  onChange={(v) => updateSetting("discordNotifications", v)}
                />
                <SettingToggle
                  label="Low Stock Alerts"
                  description="Get notified when license key stock is running low."
                  enabled={settings.lowStockAlerts}
                  onChange={(v) => updateSetting("lowStockAlerts", v)}
                />
                <SettingToggle
                  label="Order Notifications"
                  description="Receive notifications for new and updated orders."
                  enabled={settings.orderNotifications}
                  onChange={(v) => updateSetting("orderNotifications", v)}
                />
              </div>
            )}

            {/* Security Settings */}
            {activeSection === "security" && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">
                  Security Settings
                </h3>
                <SettingToggle
                  label="Two-Factor Authentication"
                  description="Require 2FA for all admin accounts."
                  enabled={settings.twoFactorAuth}
                  onChange={(v) => updateSetting("twoFactorAuth", v)}
                />
                <SettingToggle
                  label="IP Whitelist"
                  description="Only allow access from whitelisted IP addresses."
                  enabled={settings.ipWhitelist}
                  onChange={(v) => updateSetting("ipWhitelist", v)}
                />
                <SettingInput
                  label="Session Timeout (hours)"
                  description="Automatically log out users after inactivity."
                  value={settings.sessionTimeout}
                  onChange={(v) => updateSetting("sessionTimeout", v)}
                />
              </div>
            )}

            {/* Appearance Settings */}
            {activeSection === "appearance" && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">
                  Appearance Settings
                </h3>
                <div className="py-4 border-b border-[#1a1a1a]">
                  <p className="text-white font-medium mb-1">Theme</p>
                  <p className="text-sm text-white/50 mb-3">
                    Choose your preferred color scheme.
                  </p>
                  <div className="flex gap-2">
                    {["dark", "light", "system"].map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => updateSetting("theme", theme)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                          settings.theme === theme
                            ? "bg-[#dc2626] text-white"
                            : "bg-[#1a1a1a] text-white/60 hover:text-white"
                        )}
                      >
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <SettingInput
                  label="Accent Color"
                  description="Primary color used throughout the interface."
                  value={settings.accentColor}
                  onChange={(v) => updateSetting("accentColor", v)}
                />
              </div>
            )}

            {/* Localization Settings */}
            {activeSection === "localization" && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">
                  Localization Settings
                </h3>
                <div className="py-4 border-b border-[#1a1a1a]">
                  <p className="text-white font-medium mb-1">Timezone</p>
                  <p className="text-sm text-white/50 mb-3">
                    Default timezone for dates and times.
                  </p>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting("timezone", e.target.value)}
                    className="w-full max-w-md px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                  </select>
                </div>
                <div className="py-4 border-b border-[#1a1a1a]">
                  <p className="text-white font-medium mb-1">Currency</p>
                  <p className="text-sm text-white/50 mb-3">
                    Default currency for pricing display.
                  </p>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSetting("currency", e.target.value)}
                    className="w-full max-w-md px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (E)</option>
                    <option value="GBP">GBP (P)</option>
                    <option value="CAD">CAD ($)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Database Settings */}
            {activeSection === "database" && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">
                  Database Settings
                </h3>
                <SettingToggle
                  label="Automatic Backups"
                  description="Automatically backup database on a schedule."
                  enabled={settings.autoBackup}
                  onChange={(v) => updateSetting("autoBackup", v)}
                />
                <div className="py-4 border-b border-[#1a1a1a]">
                  <p className="text-white font-medium mb-1">Backup Frequency</p>
                  <p className="text-sm text-white/50 mb-3">
                    How often to run automatic backups.
                  </p>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => updateSetting("backupFrequency", e.target.value)}
                    disabled={!settings.autoBackup}
                    className="w-full max-w-md px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="py-4">
                  <p className="text-white font-medium mb-1">Manual Actions</p>
                  <p className="text-sm text-white/50 mb-3">
                    Run database maintenance tasks manually.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-lg transition-colors"
                    >
                      <Database className="w-4 h-4" />
                      Backup Now
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#262626] text-white rounded-lg transition-colors"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Optimize Tables
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="fixed bottom-6 right-6 z-50">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-[#dc2626] hover:bg-[#ef4444] text-white font-medium rounded-xl shadow-lg shadow-[#dc2626]/20 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
