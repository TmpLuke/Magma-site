"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Eye,
  Mail,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { useAdminStore } from "@/lib/admin-store";
import { getTeamMembersFromDB } from "@/lib/admin-actions";
import { mockTeamMembers } from "@/lib/admin-mock-data";
import type { TeamMember } from "@/lib/admin-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function RoleBadge({ role }: { role: TeamMember["role"] }) {
  const styles = {
    admin: "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20",
    support: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    viewer: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  const icons = {
    admin: Shield,
    support: Users,
    viewer: Eye,
  };

  const Icon = icons[role];

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border inline-flex items-center gap-1.5",
        styles[role]
      )}
    >
      <Icon className="w-3 h-3" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function InviteMemberModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addTeamMember, isLoading } = useAdminStore();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<TeamMember["role"]>("viewer");
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInvite = async () => {
    if (!email || !username) return;

    setCreating(true);
    setSuccess(false);

    try {
      const newMember: TeamMember = {
        id: `tm_${Date.now()}`,
        userId: `user_${Date.now()}`,
        email,
        username,
        role,
        permissions: role === "admin" ? ["all"] : role === "support" 
          ? ["orders.view", "orders.refund", "licenses.view", "licenses.manage", "customers.view"]
          : ["dashboard.view", "orders.view", "products.view"],
        avatar: username.substring(0, 2).toUpperCase(),
        invitedBy: "MagmaAdmin",
        joinedAt: new Date(),
        lastActive: new Date(),
      };

      await addTeamMember(newMember);
      setSuccess(true);
      
      setTimeout(() => {
        setEmail("");
        setUsername("");
        setRole("viewer");
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("[Admin] Error inviting team member:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Invite Team Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Invitation sent successfully!
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              disabled={creating}
              className="w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="NewMember"
              disabled={creating}
              className="w-full px-4 py-2.5 bg-[#111111] border border-[#262626] rounded-lg text-white focus:outline-none focus:border-[#dc2626] transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["admin", "support", "viewer"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  disabled={creating}
                  className={cn(
                    "px-3 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
                    role === r
                      ? "bg-[#dc2626] text-white"
                      : "bg-[#111111] border border-[#262626] text-white/70 hover:border-[#dc2626]"
                  )}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-2">
              {role === "admin" && "Full access to all features and settings."}
              {role === "support" && "Can manage orders, licenses, and view customers."}
              {role === "viewer" && "Read-only access to dashboard and data."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleInvite}
            disabled={!email || !username || creating || isLoading}
            className="w-full px-4 py-2.5 bg-[#dc2626] hover:bg-[#ef4444] disabled:bg-[#dc2626]/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Invite"
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TeamMemberCard({ member, onRemove, isLoading }: { 
  member: TeamMember; 
  onRemove: () => void;
  isLoading: boolean;
}) {
  const formatTimeAgo = (date?: Date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Online";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const isOnline = member.lastActive && 
    (new Date().getTime() - member.lastActive.getTime()) < 60 * 60 * 1000;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 hover:border-[#262626] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center text-white font-bold">
              {member.avatar || member.username.substring(0, 2).toUpperCase()}
            </div>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
            )}
          </div>
          <div>
            <h3 className="text-white font-medium flex items-center gap-2">
              {member.username}
              {isLoading && <Loader2 className="w-3 h-3 animate-spin text-white/50" />}
            </h3>
            <p className="text-sm text-white/50">{member.email}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4 text-white/60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#111111] border-[#262626]">
            <DropdownMenuItem className="text-white/70 focus:bg-[#1a1a1a] focus:text-white">
              <Edit className="w-4 h-4 mr-2" />
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem className="text-white/70 focus:bg-[#1a1a1a] focus:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </DropdownMenuItem>
            {member.role !== "admin" && (
              <>
                <DropdownMenuSeparator className="bg-[#262626]" />
                <DropdownMenuItem
                  onClick={onRemove}
                  disabled={isLoading}
                  className="text-red-400 focus:bg-[#1a1a1a] focus:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Member
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
        <RoleBadge role={member.role} />
        <span className="text-xs text-white/40">
          Last active: {formatTimeAgo(member.lastActive)}
        </span>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { teamMembers, removeTeamMember, setTeamMembers, isLoading } = useAdminStore();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load team members from database on mount
  useEffect(() => {
    async function loadTeamMembers() {
      setPageLoading(true);
      try {
        const result = await getTeamMembersFromDB();
        if (result.success && result.data && result.data.length > 0) {
          const formattedMembers = result.data.map((m) => ({
            id: m.id,
            userId: m.user_id || m.id,
            email: m.email,
            username: m.name,
            role: (m.role === "Admin" ? "admin" : m.role === "Support" ? "support" : "viewer") as "admin" | "support" | "viewer",
            permissions: m.role === "Admin" ? ["all"] : ["dashboard.view"],
            avatar: m.avatar || m.name.substring(0, 2).toUpperCase(),
            invitedBy: "MagmaAdmin",
            joinedAt: new Date(m.created_at),
            lastActive: m.last_active ? new Date(m.last_active) : new Date(),
          }));
          setTeamMembers(formattedMembers);
        } else {
          setTeamMembers(mockTeamMembers);
        }
      } catch (error) {
        console.error("[Admin] Error loading team members:", error);
        setTeamMembers(mockTeamMembers);
      } finally {
        setPageLoading(false);
      }
    }

    loadTeamMembers();
  }, [setTeamMembers]);

  const handleRemoveMember = async (memberId: string) => {
    setActionLoadingId(memberId);
    await removeTeamMember(memberId);
    setActionLoadingId(null);
  };

  const roleGroups = {
    admin: teamMembers.filter((m) => m.role === "admin"),
    support: teamMembers.filter((m) => m.role === "support"),
    viewer: teamMembers.filter((m) => m.role === "viewer"),
  };

  if (pageLoading) {
    return (
      <AdminShell title="Team" subtitle="Manage team members and permissions">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Team" subtitle="Manage team members and permissions">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-white/60">
              {teamMembers.filter((m) => 
                m.lastActive && (new Date().getTime() - m.lastActive.getTime()) < 60 * 60 * 1000
              ).length} Online
            </span>
          </div>
          <span className="text-white/30">|</span>
          <span className="text-sm text-white/60">
            {teamMembers.length} Total Members
          </span>
        </div>

        <button
          type="button"
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] hover:bg-[#ef4444] text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Team Members by Role */}
      <div className="space-y-8">
        {(["admin", "support", "viewer"] as const).map((role) => (
          roleGroups[role].length > 0 && (
            <div key={role}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                {role === "admin" && <Shield className="w-5 h-5 text-[#dc2626]" />}
                {role === "support" && <Users className="w-5 h-5 text-blue-400" />}
                {role === "viewer" && <Eye className="w-5 h-5 text-gray-400" />}
                {role.charAt(0).toUpperCase() + role.slice(1)}s
                <span className="text-sm font-normal text-white/50">
                  ({roleGroups[role].length})
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleGroups[role].map((member) => (
                  <TeamMemberCard 
                    key={member.id} 
                    member={member} 
                    onRemove={() => handleRemoveMember(member.id)}
                    isLoading={actionLoadingId === member.id}
                  />
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Empty State */}
      {teamMembers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
          <Users className="w-12 h-12 text-white/20 mb-4" />
          <p className="text-white/50">No team members yet</p>
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="mt-4 text-[#dc2626] hover:text-[#ef4444] transition-colors"
          >
            Invite your first team member
          </button>
        </div>
      )}

      {/* Invite Modal */}
      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
      />
    </AdminShell>
  );
}
