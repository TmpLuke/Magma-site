"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RefreshCw, Plus, Edit, Trash2, Users, Shield, Crown, Wrench, MessageCircle, Code, Mail, User, AlertCircle, Check, UserPlus, AtSign, Key, Package, ShoppingCart, Tag, Webhook, FolderOpen, Settings, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTeamMembers, updateTeamMember, deleteTeamMember } from "@/app/actions/admin-team";
import { inviteTeamMember, resendInvite } from "@/app/actions/admin-team-invites";
import { TEAM_PERMISSIONS, PERMISSION_IDS, getPermissionLabel } from "@/lib/team-permissions";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  role: string;
  avatar: string | null;
  is_active: boolean;
  status?: string;
  invite_token?: string | null;
  invite_expires_at?: string | null;
  permissions?: string[];
  created_at: string;
}

interface TeamFormData {
  name: string;
  email: string;
  username: string;
  permissions: string[];
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    email: "",
    username: "",
    permissions: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    try {
      setLoading(true);
      const result = await getTeamMembers();
      if (!result.success) throw new Error(result.error);
      setTeam(result.data ?? []);
    } catch (error: any) {
      console.error("Failed to load team:", error);
      toast({
        title: "Error",
        description: error?.message ?? "Failed to load team members. Run scripts/setup_team_invites.sql in Supabase first.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMember() {
    try {
      setProcessing("add");
      
      const result = await inviteTeamMember({
        name: formData.name,
        email: formData.email,
        username: formData.username || undefined,
        permissions: formData.permissions,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      if (result.emailSent) {
        toast({
          title: "Invitation sent",
          description: `Email sent to ${formData.email}`,
          className: "border-green-500/20 bg-green-500/10",
        });
      } else if (result.inviteLink) {
        try {
          await navigator.clipboard.writeText(result.inviteLink);
        } catch {
          /* ignore */
        }
        toast({
          title: "Invite created",
          description: "Email couldn't be sent (Resend test mode: verify a domain to email others). Invite link copied to clipboard—share it with the invitee.",
          className: "border-amber-500/20 bg-amber-500/10",
        });
      } else {
        toast({
          title: "Invite created",
          description: `Team member added. Email sent to ${formData.email}.`,
          className: "border-green-500/20 bg-green-500/10",
        });
      }
      
      setShowAddModal(false);
      resetForm();
      await loadTeam();
    } catch (error: any) {
      console.error("Failed to invite team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function handleEditMember() {
    if (!selectedMember) return;
    
    try {
      setProcessing("edit");
      
      const result = await updateTeamMember(selectedMember.id, {
        name: formData.name,
        email: formData.email,
        username: formData.username || undefined,
        permissions: formData.permissions,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Team member updated successfully",
        className: "border-blue-500/20 bg-blue-500/10",
      });
      
      setShowEditModal(false);
      setSelectedMember(null);
      resetForm();
      await loadTeam();
    } catch (error: any) {
      console.error("Failed to edit team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  async function handleDeleteMember() {
    if (!selectedMember) return;
    
    try {
      setProcessing("delete");
      
      const result = await deleteTeamMember(selectedMember.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "Success",
        description: "Team member removed successfully",
        className: "border-red-500/20 bg-red-500/10",
      });
      
      setShowDeleteModal(false);
      setSelectedMember(null);
      await loadTeam();
    } catch (error: any) {
      console.error("Failed to delete team member:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  }

  function openEditModal(member: TeamMember) {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      username: member.username ?? "",
      permissions: Array.isArray(member.permissions) ? member.permissions : [],
    });
    setShowEditModal(true);
  }

  function openDeleteModal(member: TeamMember) {
    setSelectedMember(member);
    setShowDeleteModal(true);
  }

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      username: "",
      permissions: [],
    });
  }

  function togglePermission(id: string) {
    setFormData((prev) => {
      const next = prev.permissions.includes(id)
        ? prev.permissions.filter((p) => p !== id)
        : [...prev.permissions, id];
      return { ...prev, permissions: next };
    });
  }

  function setFullAccess(on: boolean) {
    setFormData((prev) => ({
      ...prev,
      permissions: on ? [...PERMISSION_IDS] : [],
    }));
  }

  const permIcons: Record<string, React.ElementType> = {
    dashboard: LayoutDashboard,
    stock_keys: Key,
    manage_products: Package,
    manage_orders: ShoppingCart,
    manage_coupons: Tag,
    manage_webhooks: Webhook,
    manage_team: Users,
    manage_categories: FolderOpen,
    manage_settings: Settings,
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role stats
  const roleStats = team.reduce((acc, member) => {
    acc[member.role] = (acc[member.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const columns = [
    {
      key: "name",
      label: "Member",
      sortable: true,
      render: (member: TeamMember) => {
        const roleConfig = {
          Owner: { bg: "from-[#dc2626] to-[#991b1b]", ring: "ring-[#dc2626]/30" },
          Admin: { bg: "from-orange-500 to-orange-600", ring: "ring-orange-500/30" },
          Moderator: { bg: "from-yellow-500 to-yellow-600", ring: "ring-yellow-500/30" },
          Support: { bg: "from-blue-500 to-blue-600", ring: "ring-blue-500/30" },
          Developer: { bg: "from-purple-500 to-purple-600", ring: "ring-purple-500/30" },
        };
        const config = roleConfig[member.role as keyof typeof roleConfig] || { bg: "from-gray-500 to-gray-600", ring: "ring-gray-500/30" };
        
        return (
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.bg} flex items-center justify-center text-white font-bold text-sm ring-2 ${config.ring} group-hover:ring-4 transition-all duration-200 shadow-lg`}>
                {getInitials(member.name)}
              </div>
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${config.bg} blur-md opacity-20 group-hover:opacity-40 transition-opacity`} />
            </div>
            <div>
              <p className="text-white font-semibold tracking-tight group-hover:text-[#dc2626] transition-colors">
                {member.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3 text-white/40" />
                <p className="text-xs text-white/50 font-medium">{member.email}</p>
              </div>
              {member.username && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <AtSign className="w-3 h-3 text-white/40" />
                  <p className="text-xs text-white/40 font-medium">{member.username}</p>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (member: TeamMember) => {
        const perms = Array.isArray(member.permissions) ? member.permissions : [];
        if (perms.length === 0) {
          return <span className="text-white/40 text-sm">—</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {perms.slice(0, 4).map((id) => (
              <span
                key={id}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-white/70"
              >
                {getPermissionLabel(id)}
              </span>
            ))}
            {perms.length > 4 && (
              <span className="px-2 py-0.5 rounded-md bg-[#dc2626]/10 border border-[#dc2626]/20 text-xs text-[#dc2626]">
                +{perms.length - 4}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (member: TeamMember) => {
        const roleConfig = {
          Owner: {
            bg: "bg-[#dc2626]/10",
            text: "text-[#dc2626]",
            border: "border-[#dc2626]/30",
            icon: Crown,
          },
          Admin: {
            bg: "bg-orange-500/10",
            text: "text-orange-400",
            border: "border-orange-500/30",
            icon: Shield,
          },
          Moderator: {
            bg: "bg-yellow-500/10",
            text: "text-yellow-400",
            border: "border-yellow-500/30",
            icon: Wrench,
          },
          Support: {
            bg: "bg-blue-500/10",
            text: "text-blue-400",
            border: "border-blue-500/30",
            icon: MessageCircle,
          },
          Developer: {
            bg: "bg-purple-500/10",
            text: "text-purple-400",
            border: "border-purple-500/30",
            icon: Code,
          },
        };
        const config = roleConfig[member.role as keyof typeof roleConfig] || {
          bg: "bg-gray-500/10",
          text: "text-gray-400",
          border: "border-gray-500/30",
          icon: User,
        };
        const Icon = config.icon;
        
        return (
          <Badge className={`${config.bg} ${config.text} ${config.border} border font-medium px-2.5 py-1 flex items-center gap-1.5 w-fit`}>
            <Icon className="w-3 h-3" />
            <span>{member.role}</span>
          </Badge>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (member: TeamMember) => {
        const isPending = member.status === "pending";
        return (
          <div className="flex items-center gap-2">
            <Badge className={`${
              isPending
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                : member.is_active 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                : "bg-gray-500/10 text-gray-400 border-gray-500/30"
            } border font-medium px-2.5 py-1 flex items-center gap-1.5 w-fit`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                isPending ? "bg-yellow-400 animate-pulse" : member.is_active ? "bg-emerald-400 animate-pulse" : "bg-gray-400"
              }`} />
              <span>{isPending ? "Pending Invite" : member.is_active ? "Active" : "Inactive"}</span>
            </Badge>
            {isPending && (
              <Button
                onClick={async () => {
                  setProcessing(member.id);
                  const result = await resendInvite(member.id);
                  if (result.success) {
                    toast({
                      title: "Invite Resent",
                      description: "Invitation email sent successfully",
                    });
                    loadTeam();
                  } else {
                    toast({
                      title: "Error",
                      description: result.error || "Failed to resend invite",
                      variant: "destructive",
                    });
                  }
                  setProcessing(null);
                }}
                disabled={processing === member.id}
                size="sm"
                variant="ghost"
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 h-8 px-2 text-xs"
              >
                <Mail className="w-3 h-3 mr-1" />
                Resend
              </Button>
            )}
          </div>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (member: TeamMember) => (
        <span className="text-white/40 text-sm font-medium tabular-nums">
          {new Date(member.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminShell title="Team" subtitle="Manage your team members and permissions">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#dc2626]/20 border-t-[#dc2626] animate-spin" />
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-[#dc2626]/5 blur-xl animate-pulse" />
          </div>
          <p className="text-white/40 text-sm font-medium">Loading team...</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Team" subtitle="Manage your team members and permissions">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-[#dc2626]/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Total Team</p>
              <p className="text-2xl font-bold text-white mt-1">{team.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-orange-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Admins</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{roleStats['Admin'] || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-yellow-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Moderators</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{roleStats['Moderator'] || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-blue-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Support</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{roleStats['Support'] || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] rounded-xl p-4 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Developers</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{roleStats['Developer'] || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Code className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => loadTeam()}
            variant="outline"
            size="sm"
            disabled={loading}
            className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] hover:border-[#dc2626]/30 transition-all"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          size="sm"
          className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20 transition-all"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        data={team}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search team members..."
        actions={(member) => (
          <div className="flex gap-1.5">
            <Button
              onClick={() => openEditModal(member)}
              size="sm"
              variant="ghost"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => openDeleteModal(member)}
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              title="Remove"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      {/* Add Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#dc2626]/10 border border-[#dc2626]/20 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-[#dc2626]" />
              </div>
              Invite Team Member
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Email, username, and permissions. An invitation will be sent to their email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <label className="block text-sm font-medium text-white/70">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-[#dc2626]/50 transition-colors w-full"
                  />
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                <label className="block text-sm font-medium text-white/70">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="johndoe (optional)"
                    className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-[#dc2626]/50 transition-colors w-full"
                  />
                </div>
                <p className="text-xs text-white/40">Optional; else derived from name. Used for login.</p>
              </div>
            </div>

            <div className="space-y-2 min-w-0">
              <label className="block text-sm font-medium text-white/70">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-[#dc2626]/50 transition-colors w-full"
                />
              </div>
            </div>

            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-white/70">Permissions</label>
                <button
                  type="button"
                  onClick={() => setFullAccess(formData.permissions.length < PERMISSION_IDS.length)}
                  className="text-xs font-medium text-[#dc2626] hover:text-[#ef4444] transition-colors"
                >
                  {formData.permissions.length >= PERMISSION_IDS.length ? "Clear all" : "Full access"}
                </button>
              </div>
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#111] border border-[#262626] max-h-64 overflow-y-auto">
                {TEAM_PERMISSIONS.map((p) => {
                  const Icon = permIcons[p.id];
                  const checked = formData.permissions.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePermission(p.id)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left transition-all w-full ${
                        checked
                          ? "bg-[#dc2626]/10 border-[#dc2626]/40 text-white"
                          : "bg-[#0a0a0a] border-[#262626] text-white/60 hover:border-[#262626] hover:text-white/80"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? "bg-[#dc2626] border-[#dc2626]" : "border-white/30"}`}>
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-white/50" />}
                      <span className="text-sm">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => { setShowAddModal(false); resetForm(); }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={processing === "add" || !formData.name || !formData.email}
              className="bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white shadow-lg shadow-[#dc2626]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {processing === "add" ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending invite...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Edit className="w-4 h-4 text-blue-400" />
              </div>
              Edit Team Member
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Update details and permissions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2 min-w-0">
                <label className="block text-sm font-medium text-white/70">Email <span className="text-red-400">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-blue-500/50 transition-colors w-full"
                  />
                </div>
              </div>
              <div className="space-y-2 min-w-0">
                <label className="block text-sm font-medium text-white/70">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="johndoe"
                    className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-blue-500/50 transition-colors w-full"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <label className="block text-sm font-medium text-white/70">Full Name <span className="text-red-400">*</span></label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#1a1a1a] border-[#262626] text-white pl-10 focus:border-blue-500/50 transition-colors w-full"
                />
              </div>
            </div>

            <div className="space-y-3 min-w-0">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-white/70">Permissions</label>
                <button
                  type="button"
                  onClick={() => setFullAccess(formData.permissions.length < PERMISSION_IDS.length)}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {formData.permissions.length >= PERMISSION_IDS.length ? "Clear all" : "Full access"}
                </button>
              </div>
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#111] border border-[#262626] max-h-64 overflow-y-auto">
                {TEAM_PERMISSIONS.map((p) => {
                  const Icon = permIcons[p.id];
                  const checked = formData.permissions.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePermission(p.id)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left transition-all w-full ${
                        checked
                          ? "bg-blue-500/10 border-blue-500/40 text-white"
                          : "bg-[#0a0a0a] border-[#262626] text-white/60 hover:border-[#262626] hover:text-white/80"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? "bg-blue-500 border-blue-500" : "border-white/30"}`}>
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {Icon && <Icon className="w-4 h-4 flex-shrink-0 text-white/50" />}
                      <span className="text-sm">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => { setShowEditModal(false); setSelectedMember(null); resetForm(); }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditMember}
              disabled={processing === "edit" || !formData.name || !formData.email}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {processing === "edit" ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              Remove Team Member
            </DialogTitle>
            <DialogDescription className="text-white/50">
              This action cannot be undone
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
              <p className="text-white/70">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-white">{selectedMember?.name}</span>{" "}
                ({selectedMember?.email}) from the team?
              </p>
              <p className="text-white/50 text-sm mt-2">
                They will lose access to all admin features immediately.
              </p>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => { setShowDeleteModal(false); setSelectedMember(null); }}
              variant="outline"
              className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626] transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteMember}
              disabled={processing === "delete"}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {processing === "delete" ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Member
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}