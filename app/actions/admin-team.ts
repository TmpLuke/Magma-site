"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";

export async function getTeamMembers() {
  try {
    await requirePermission("manage_team");
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("id, name, email, username, role, avatar, is_active, status, invite_token, invite_expires_at, permissions, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this.", data: [] };
    console.error("[Admin] Get team members error:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function createTeamMember(data: {
  name: string;
  email: string;
  role: string;
}) {
  try {
    await requirePermission("manage_team");
    const supabase = createAdminClient();
    
    const { error } = await supabase.from("team_members").insert({
      name: data.name,
      email: data.email,
      role: data.role,
      is_active: true,
    });

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/team");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Create team member error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTeamMember(
  id: string,
  data: {
    name: string;
    email: string;
    username?: string;
    permissions?: string[];
  }
) {
  try {
    await requirePermission("manage_team");
    const supabase = createAdminClient();
    const payload: Record<string, unknown> = {
      name: data.name,
      email: data.email,
    };
    if (data.username !== undefined) {
      payload.username = data.username.trim().replace(/\s+/g, "_") || null;
    }
    if (Array.isArray(data.permissions)) {
      payload.permissions = data.permissions;
    }

    const { error } = await supabase.from("team_members").update(payload).eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/team");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Update team member error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTeamMember(id: string) {
  try {
    await requirePermission("manage_team");
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/team");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Delete team member error:", error);
    return { success: false, error: error.message };
  }
}
