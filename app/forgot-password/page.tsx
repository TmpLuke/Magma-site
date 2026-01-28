"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Flame, ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e2 = email.trim().toLowerCase();
    if (!e2) {
      toast({ title: "Email required", description: "Enter your account email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/store-auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e2 }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Could not send reset email.", variant: "destructive" });
        return;
      }
      setSent(true);
      toast({
        title: "Check your email",
        description: "If an account exists, we sent a reset link.",
        className: "border-green-500/20 bg-green-500/10",
      });
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
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
              <h1 className="text-xl font-bold text-white">Forgot password?</h1>
              <p className="text-sm text-white/50">We&apos;ll email you a reset link</p>
            </div>
          </div>
          {sent ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-sm text-white/80">
                  If an account exists for that email, you&apos;ll receive a link to reset your password. Check spam if you don&apos;t see it.
                </p>
              </div>
              <Link href="/">
                <Button className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white">Return to store</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white/70">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-10 bg-[#0a0a0a] border-[#262626] text-white"
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white">
                {submitting ? "Sending…" : "Send reset link"}
              </Button>
              <p className="text-center">
                <Link href="/" className="text-sm text-white/50 hover:text-[#dc2626] transition-colors">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
