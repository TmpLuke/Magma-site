"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function loadSettings() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("settings")
      .select("key, value");

    if (error) throw error;

    const settingsMap: Record<string, any> = {};
    data?.forEach((item) => {
      settingsMap[item.key] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
    });

    return { 
      success: true, 
      settings: {
        site_name: settingsMap.site_name || "Magma Cheats",
        site_description: settingsMap.site_description || "Premium undetected cheats for all games",
        support_email: settingsMap.support_email || "support@magma.local",
        maintenance_mode: settingsMap.maintenance_mode || false,
      }
    };
  } catch (error: any) {
    console.error("[Admin] Load settings error:", error);
    return { success: false, error: error.message };
  }
}

export async function saveSettings(settings: {
  site_name: string;
  site_description: string;
  support_email: string;
  maintenance_mode: boolean;
}) {
  try {
    const supabase = createAdminClient();

    const updates = [
      { key: "site_name", value: JSON.stringify(settings.site_name) },
      { key: "site_description", value: JSON.stringify(settings.site_description) },
      { key: "support_email", value: JSON.stringify(settings.support_email) },
      { key: "maintenance_mode", value: JSON.stringify(settings.maintenance_mode) },
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from("settings")
        .upsert(
          { key: update.key, value: update.value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );

      if (error) throw error;
    }

    revalidatePath("/mgmt-x9k2m7/settings");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Save settings error:", error);
    return { success: false, error: error.message };
  }
}
