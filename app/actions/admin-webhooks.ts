"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createWebhook(data: {
  name: string;
  url: string;
  events: string[];
}) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from("webhooks").insert({
      name: data.name,
      url: data.url,
      events: data.events,
      is_active: true,
    });

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/webhooks");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Create webhook error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateWebhook(id: string, data: {
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
}) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("webhooks")
      .update({
        name: data.name,
        url: data.url,
        events: data.events,
        is_active: data.is_active,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/webhooks");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Update webhook error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteWebhook(id: string) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("webhooks")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/webhooks");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Delete webhook error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleWebhookStatus(id: string, currentStatus: boolean) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("webhooks")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/webhooks");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Toggle webhook status error:", error);
    return { success: false, error: error.message };
  }
}
