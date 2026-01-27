"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DataTable } from "@/components/admin/data-table";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  created_at: string;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  async function loadTeam() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTeam(data || []);
    } catch (error) {
      console.error("Failed to load team:", error);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (member: TeamMember) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center text-white font-semibold text-sm">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-white font-medium">{member.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      render: (member: TeamMember) => (
        <span className="text-white/70">{member.email}</span>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (member: TeamMember) => {
        const roleColors = {
          Admin: "bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20",
          Support: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          Developer: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        };
        return (
          <Badge className={roleColors[member.role as keyof typeof roleColors] || ""}>
            {member.role}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: true,
      render: (member: TeamMember) => (
        <span className="text-white/50 text-sm">
          {new Date(member.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminShell title="Team" subtitle="Manage team members">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc2626]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Team" subtitle="Manage team members">
      <div className="mb-6">
        <Button
          onClick={() => loadTeam()}
          variant="outline"
          size="sm"
          className="bg-[#1a1a1a] border-[#262626] text-white hover:bg-[#262626]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <DataTable
        data={team}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search team members..."
      />
    </AdminShell>
  );
}
