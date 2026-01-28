"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isResendConfigured, sendEmail } from "@/lib/resend";
import { getPermissionLabel } from "@/lib/team-permissions";
import { requirePermission } from "@/lib/admin-auth";

function inviteEmailHTML(params: {
  name: string;
  username: string;
  permissions: string[];
  inviteLink: string;
}) {
  const permList =
    params.permissions.length > 0
      ? params.permissions.map((id) => getPermissionLabel(id)).join(", ")
      : "No specific permissions (view-only)";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;width:60px;height:60px;background:linear-gradient(135deg,#dc2626 0%,#ef4444 100%);border-radius:16px;margin-bottom:20px;line-height:60px;color:white;font-size:32px;">🔥</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">Welcome to Magma</h1>
    </div>
    <div style="background:#111;border:1px solid #262626;border-radius:16px;padding:40px;">
      <h2 style="color:#fff;margin:0 0 20px;font-size:20px;">Hi ${params.name},</h2>
      <p style="color:#a3a3a3;line-height:1.6;margin:0 0 20px;">You've been invited to join the Magma admin team.</p>
      <p style="color:#a3a3a3;line-height:1.6;margin:0 0 8px;"><strong style="color:#fff;">Username:</strong> ${params.username || params.name}</p>
      <p style="color:#a3a3a3;line-height:1.6;margin:0 0 24px;"><strong style="color:#fff;">Permissions:</strong> ${permList}</p>
      <p style="color:#a3a3a3;line-height:1.6;margin:0 0 30px;">Click the button below to accept and set up your account:</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${params.inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#dc2626 0%,#ef4444 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:10px;font-weight:600;font-size:16px;">Accept Invitation</a>
      </div>
      <p style="color:#737373;font-size:14px;margin:20px 0 0;">This link expires in 7 days. If you didn't expect this, you can ignore this email.</p>
    </div>
    <p style="text-align:center;color:#525252;font-size:12px;margin:20px 0 0;">© ${new Date().getFullYear()} Magma. All rights reserved.</p>
  </div>
</body>
</html>`.trim();
}

function reminderEmailHTML(params: { name: string; inviteLink: string }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:40px;">
      <div style="display:inline-block;width:60px;height:60px;background:linear-gradient(135deg,#dc2626 0%,#ef4444 100%);border-radius:16px;margin-bottom:20px;line-height:60px;color:white;font-size:32px;">🔥</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:bold;">Invitation Reminder</h1>
    </div>
    <div style="background:#111;border:1px solid #262626;border-radius:16px;padding:40px;">
      <h2 style="color:#fff;margin:0 0 20px;font-size:20px;">Hi ${params.name},</h2>
      <p style="color:#a3a3a3;line-height:1.6;margin:0 0 20px;">This is a reminder to accept your invitation to join the Magma admin team.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${params.inviteLink}" style="display:inline-block;background:linear-gradient(135deg,#dc2626 0%,#ef4444 100%);color:white;text-decoration:none;padding:16px 32px;border-radius:10px;font-weight:600;font-size:16px;">Accept Invitation</a>
      </div>
      <p style="color:#737373;font-size:14px;margin:20px 0 0;">This link expires in 7 days.</p>
    </div>
    <p style="text-align:center;color:#525252;font-size:12px;margin:20px 0 0;">© ${new Date().getFullYear()} Magma. All rights reserved.</p>
  </div>
</body>
</html>`.trim();
}

export async function inviteTeamMember(data: {
  email: string;
  username?: string;
  name: string;
  permissions: string[];
}) {
  try {
    await requirePermission("manage_team");
    if (!isResendConfigured()) {
      return { success: false, error: "Email not configured. Add RESEND_API_KEY to your .env file." };
    }

    const supabase = createAdminClient();

    const email = data.email.trim();
    const username = (data.username || data.name || email).trim().replace(/\s+/g, "_");
    const { data: existing } = await supabase
      .from("team_members")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: "A team member with this email already exists. Use Resend if they have a pending invite, or use a different email.",
      };
    }

    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const permissions = Array.isArray(data.permissions) ? data.permissions : [];
    const role = "Support";

    const { data: teamMember, error: insertError } = await supabase
      .from("team_members")
      .insert({
        email,
        username,
        name: data.name.trim(),
        role,
        status: "pending",
        invite_token: inviteToken,
        invite_expires_at: expiresAt.toISOString(),
        permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505" || /unique|duplicate/i.test(insertError.message)) {
        return {
          success: false,
          error: "A team member with this email already exists. Use Resend for pending invites, or a different email.",
        };
      }
      throw insertError;
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/staff/accept-invite?token=${inviteToken}`;

    const emailResult = await sendEmail({
      to: email,
      subject: "You're invited to join Magma Admin Team",
      html: inviteEmailHTML({
        name: data.name.trim(),
        username,
        permissions,
        inviteLink,
      }),
    });

    const isResendTestModeError =
      !emailResult.success &&
      /only send testing emails|your own email|verify a domain|resend\.com\/domains/i.test(emailResult.error ?? "");

    if (!emailResult.success && !isResendTestModeError) {
      await supabase.from("team_members").delete().eq("id", teamMember.id);
      return { success: false, error: `Invite created but email failed: ${emailResult.error}` };
    }

    revalidatePath("/mgmt-x9k2m7/team");
    return {
      success: true,
      teamMember,
      inviteLink: isResendTestModeError ? inviteLink : undefined,
      emailSent: emailResult.success,
    };
  } catch (e: any) {
    if (e?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(e?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Invite team member error:", e);
    return { success: false, error: e?.message || "Failed to invite team member." };
  }
}

export async function resendInvite(teamMemberId: string) {
  try {
    await requirePermission("manage_team");
    if (!isResendConfigured()) {
      return { success: false, error: "Email not configured. Add RESEND_API_KEY to your .env file." };
    }

    const supabase = createAdminClient();

    const { data: teamMember, error: fetchError } = await supabase
      .from("team_members")
      .select("*")
      .eq("id", teamMemberId)
      .single();

    if (fetchError) throw fetchError;

    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error: updateError } = await supabase
      .from("team_members")
      .update({
        invite_token: inviteToken,
        invite_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", teamMemberId);

    if (updateError) throw updateError;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/staff/accept-invite?token=${inviteToken}`;

    const emailResult = await sendEmail({
      to: teamMember.email,
      subject: "Reminder: Join Magma Admin Team",
      html: reminderEmailHTML({ name: teamMember.name, inviteLink }),
    });

    if (!emailResult.success) {
      return { success: false, error: `Email failed: ${emailResult.error}` };
    }

    revalidatePath("/mgmt-x9k2m7/team");
    return { success: true };
  } catch (e: any) {
    if (e?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(e?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Resend invite error:", e);
    return { success: false, error: e?.message || "Failed to resend invite." };
  }
}

export async function verifyInviteToken(token: string) {
  try {
    const supabase = createAdminClient();

    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("invite_token", token)
      .single();

    if (error) throw error;

    const expiresAt = new Date(teamMember.invite_expires_at);
    if (expiresAt < new Date()) {
      return { success: false, error: "Invitation link has expired" };
    }

    if (teamMember.status === "active") {
      return { success: false, error: "Invitation has already been accepted" };
    }

    return { success: true, teamMember };
  } catch (e: any) {
    console.error("[Admin] Verify invite token error:", e);
    return { success: false, error: "Invalid invitation link" };
  }
}

export async function acceptInvite(token: string, password: string) {
  try {
    const verifyResult = await verifyInviteToken(token);
    if (!verifyResult.success || !verifyResult.teamMember) return verifyResult;

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("team_members")
      .update({
        status: "active",
        password_hash: password,
        invite_token: null,
        invite_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", verifyResult.teamMember.id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/team");
    return { success: true, teamMember: verifyResult.teamMember };
  } catch (e: any) {
    console.error("[Admin] Accept invite error:", e);
    return { success: false, error: e?.message || "Failed to accept invite." };
  }
}
