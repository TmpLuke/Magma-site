"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Flame, ArrowLeft, Key, CheckCircle } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (newPassword.length < 6) {
      toast({ title: "Invalid password", description: "Must be at least 6 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please confirm your new password.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/store-auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Could not reset password.", variant: "destructive" });
        return;
      }
      setSuccess(true);
      toast({ title: "Password updated", description: "You can sign in with your new password.", className: "border-green-500/20 bg-green-500/10" });
      setTimeout(() => router.replace("/"), 2000);
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] p-6 text-center">
          <p className="text-white/70 mb-4">Invalid or missing reset link. Request a new one.</p>
          <Link href="/forgot-password">
            <Button className="bg-[#dc2626] hover:bg-[#b91c1c] text-white">Request reset</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Password updated</h2>
          <p className="text-white/60 text-sm mb-4">Redirecting you to sign in…</p>
          <Link href="/">
            <Button variant="outline" className="border-[#262626] text-white/80">Go to store</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to store
        </Link>
        <div className="rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#991b1b] flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Set new password</h1>
              <p className="text-sm text-white/50">Choose a password (min 6 characters)</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="new" className="text-white/70">New password</Label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="new"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10 bg-[#0a0a0a] border-[#262626] text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="confirm" className="text-white/70">Confirm password</Label>
              <div className="relative mt-1">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="pl-10 bg-[#0a0a0a] border-[#262626] text-white"
                />
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white">
              {submitting ? "Updating…" : "Update password"}
            </Button>
            <p className="text-center">
              <Link href="/forgot-password" className="text-sm text-white/50 hover:text-[#dc2626] transition-colors">
                Request a new link
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#dc2626]/30 border-t-[#dc2626] rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
