"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getTeamMembers() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("team_members")
      .select("id, name, email, role, avatar, is_active, status, invite_token, invite_expires_at, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data ?? [] };
  } catch (error: any) {
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
    console.error("[Admin] Create team member error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTeamMember(id: string, data: {
  name: string;
  email: string;
  role: string;
}) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("team_members")
      .update({
        name: data.name,
        email: data.email,
        role: data.role,
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/team");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Update team member error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTeamMember(id: string) {
  try {
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/team");
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Delete team member error:", error);
    return { success: false, error: error.message };
  }
}
