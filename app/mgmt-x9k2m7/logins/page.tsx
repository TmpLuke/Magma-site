"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getStoreUsers,
  resetStoreUserPassword,
  getOrdersAndLicensesForEmail,
  type StoreUserWithCounts,
  type OrdersLicensesForEmail,
} from "@/app/actions/admin-logins";
import { useToast } from "@/hooks/use-toast";
import {
  UserCog,
  Mail,
  RefreshCw,
  Key,
  Eye,
  ShoppingCart,
  Package,
  Calendar,
  Hash,
  Filter,
  Phone,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManageLoginsPage() {
  const [users, setUsers] = useState<StoreUserWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [resetModal, setResetModal] = useState<StoreUserWithCounts | null>(null);
  const [viewModal, setViewModal] = useState<StoreUserWithCounts | null>(null);
  const [detail, setDetail] = useState<OrdersLicensesForEmail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const { toast } = useToast();
  const pageSize = 10;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const res = await getStoreUsers();
      if (!res.success) throw new Error(res.error);
      setUsers(res.data ?? []);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter.trim()
    ? users.filter((u) => u.email.toLowerCase().includes(filter.toLowerCase()) || u.username.toLowerCase().includes(filter.toLowerCase()))
    : users;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  async function openView(u: StoreUserWithCounts) {
    setViewModal(u);
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await getOrdersAndLicensesForEmail(u.email);
      if (res.success && res.data) setDetail(res.data);
    } catch {
      toast({ title: "Error", description: "Failed to load orders and licenses", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleReset() {
    if (!resetModal) return;
    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Invalid password", description: "Must be at least 6 characters", variant: "destructive" });
      return;
    }
    setResetting(true);
    try {
      const res = await resetStoreUserPassword(resetModal.id, newPassword);
      if (!res.success) throw new Error(res.error);
      toast({ title: "Password reset", description: `Password updated for ${resetModal.email}`, className: "border-green-500/20 bg-green-500/10" });
      setResetModal(null);
      setNewPassword("");
    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "Failed to reset password", variant: "destructive" });
    } finally {
      setResetting(false);
    }
  }

  return (
    <AdminShell title="Manage Logins" subtitle="Owner-only: view store accounts, reset passwords, and track orders & delivered goods.">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-white/50 mb-6">
        <Link href="/mgmt-x9k2m7" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-white/70">Manage Logins</span>
      </div>

      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl bg-[#dc2626]/10 border border-[#dc2626]/20 p-4">
        <UserCog className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-medium">Owner only</p>
          <p className="text-sm text-white/60 mt-0.5">
            You can manage all store logins, reset passwords for users who can&apos;t access their account, and view orders and delivered goods per email.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] p-4">
          <p className="text-white/50 text-sm font-medium">Total accounts</p>
          <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] p-4">
          <p className="text-white/50 text-sm font-medium">With orders</p>
          <p className="text-2xl font-bold text-white mt-1">{users.filter((u) => u.orders_count > 0).length}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] p-4">
          <p className="text-white/50 text-sm font-medium">With licenses</p>
          <p className="text-2xl font-bold text-white mt-1">{users.filter((u) => u.licenses_count > 0).length}</p>
        </div>
      </div>

      {/* Filter + Table */}
      <div className="rounded-xl border border-[#262626] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
        <div className="p-4 border-b border-[#262626] flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Filter by email or username"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 bg-[#0a0a0a] border-[#262626] text-white placeholder:text-white/40"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
            className="border-[#262626] text-white/80 hover:bg-[#262626] hover:text-white"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#dc2626]/30 border-t-[#dc2626] animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-[#262626]">
                    <th className="text-left py-4 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider w-14"> </th>
                    <th className="text-left py-4 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider min-w-[200px]">Email</th>
                    <th className="text-left py-4 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider min-w-[120px]">Username</th>
                    <th className="text-left py-4 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider w-24">Orders</th>
                    <th className="text-left py-4 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider w-24">Licenses</th>
                    <th className="text-left py-4 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider min-w-[100px]">Created</th>
                    <th className="text-right py-4 px-5 text-xs font-semibold text-white/50 uppercase tracking-wider min-w-[200px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-white/40">
                        No store accounts yet. Users will appear here after signing up.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((u) => (
                      <tr key={u.id} className="border-b border-[#262626]/50 hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-5">
                          <Avatar className="h-10 w-10 rounded-full ring-2 ring-[#262626]">
                            {u.avatar_url ? (
                              <AvatarImage src={u.avatar_url} alt={u.username} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-[#dc2626]/20 text-[#dc2626] font-semibold text-sm">
                              {(u.username || u.email)[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-white/40 flex-shrink-0" />
                            <a href={`mailto:${u.email}`} className="text-white font-medium hover:text-[#dc2626] transition-colors truncate max-w-[180px]" title={u.email}>
                              {u.email}
                            </a>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-white/70">{u.username}</td>
                        <td className="py-4 px-5">
                          <Badge variant="secondary" className={cn(
                            "bg-white/5 border border-white/10 text-white/80",
                            u.orders_count > 0 && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          )}>
                            {u.orders_count}
                          </Badge>
                        </td>
                        <td className="py-4 px-5">
                          <Badge variant="secondary" className={cn(
                            "bg-white/5 border border-white/10 text-white/80",
                            u.licenses_count > 0 && "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          )}>
                            {u.licenses_count}
                          </Badge>
                        </td>
                        <td className="py-4 px-5 text-white/50 text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white/70 hover:text-white hover:bg-white/10"
                              onClick={() => openView(u)}
                            >
                              <Eye className="w-4 h-4 mr-1.5" /> View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                              onClick={() => { setResetModal(u); setNewPassword(""); }}
                            >
                              <Key className="w-4 h-4 mr-1.5" /> Reset
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > pageSize && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#262626]">
                <p className="text-sm text-white/50">
                  Showing {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length} row(s)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="border-[#262626] text-white/80"
                  >
                    ←
                  </Button>
                  <span className="text-sm text-white/70">{page} of {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="border-[#262626] text-white/80"
                  >
                    →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reset password modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] shadow-xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Reset password</h3>
              <button
                onClick={() => { setResetModal(null); setNewPassword(""); }}
                className="text-white/50 hover:text-white"
              >
                ×
              </button>
            </div>
            <p className="text-white/60 text-sm mb-4">
              Set a new password for <span className="text-white font-medium">{resetModal.email}</span>. They can sign in with it immediately.
            </p>
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#262626] text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#dc2626]/50"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 border-[#262626] text-white/80" onClick={() => { setResetModal(null); setNewPassword(""); }}>
                Cancel
              </Button>
              <Button className="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white" onClick={handleReset} disabled={resetting}>
                {resetting ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View orders/licenses modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] shadow-xl p-6 sm:p-8 my-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 min-w-0">
                <Avatar className="h-14 w-14 rounded-xl ring-2 ring-[#262626] flex-shrink-0">
                  {viewModal.avatar_url ? (
                    <AvatarImage src={viewModal.avatar_url} alt={viewModal.username} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-[#dc2626]/20 text-[#dc2626] font-semibold text-lg rounded-xl">
                    {(viewModal.username || viewModal.email)[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-white truncate">{viewModal.username || "—"}</h3>
                  <p className="text-white/60 text-sm truncate">{viewModal.email}</p>
                  {viewModal.phone && (
                    <p className="text-white/50 text-sm flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5" /> {viewModal.phone}
                    </p>
                  )}
                  <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Joined {new Date(viewModal.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </p>
                </div>
              </div>
              <button onClick={() => { setViewModal(null); setDetail(null); }} className="text-white/50 hover:text-white p-1 text-2xl leading-none">×</button>
            </div>

            {detailLoading ? (
              <div className="py-16 flex justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-[#dc2626]/30 border-t-[#dc2626] animate-spin" />
              </div>
            ) : detail ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" /> Orders ({detail.orders.length})
                  </h4>
                  <div className="rounded-xl border border-[#262626] divide-y divide-[#262626] max-h-56 overflow-y-auto">
                    {detail.orders.length === 0 ? (
                      <div className="py-8 text-center text-white/40 text-sm">No orders</div>
                    ) : (
                      detail.orders.map((o) => (
                        <div key={o.id} className="p-4 flex flex-wrap items-center gap-3 text-sm">
                          <span className="text-white/50"><Hash className="w-4 h-4 inline" /></span>
                          <span className="font-mono text-white/80">{o.order_number}</span>
                          <span className="text-white font-medium">{o.product_name}</span>
                          <span className="text-white/50">{o.duration}</span>
                          <span className="text-emerald-400 font-semibold">${o.amount.toFixed(2)}</span>
                          <Badge variant="secondary" className="text-xs">{o.status}</Badge>
                          <span className="text-white/40 text-xs ml-auto">{new Date(o.created_at).toLocaleString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Licenses / delivered goods ({detail.licenses.length})
                  </h4>
                  <div className="rounded-xl border border-[#262626] divide-y divide-[#262626] max-h-56 overflow-y-auto">
                    {detail.licenses.length === 0 ? (
                      <div className="py-8 text-center text-white/40 text-sm">No licenses</div>
                    ) : (
                      detail.licenses.map((l) => (
                        <div key={l.id} className="p-4 flex flex-wrap items-center gap-3 text-sm">
                          <code className="px-3 py-1.5 rounded-lg bg-white/5 text-white/90 font-mono text-xs">{l.license_key}</code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-white/50 hover:text-white"
                            onClick={() => { navigator.clipboard.writeText(l.license_key); toast({ title: "Copied", description: "License key copied." }); }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <span className="text-white font-medium">{l.product_name}</span>
                          <Badge variant="secondary" className="text-xs">{l.status}</Badge>
                          {l.expires_at && (
                            <span className="text-white/40 text-xs flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Expires {new Date(l.expires_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-white/40 py-8">Could not load data.</p>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
