"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Flame, Mail, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleLogin() {
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        router.push("/mgmt-x9k2m7");
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0808] via-[#0a0a0a] to-[#0a0a0a]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#dc2626]/5 blur-[100px] rounded-full" />

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      {/* Login Card */}
      <div className="relative bg-[#111111] border border-[#262626] rounded-xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#dc2626]/30">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Staff Login</h1>
          <p className="text-white/60 text-sm">Access your team dashboard</p>
        </div>

        {/* Login Form */}
        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-white mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="your.email@example.com"
              className="bg-[#1a1a1a] border-[#262626] text-white h-12"
            />
          </div>
          <div>
            <Label className="text-white mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              className="bg-[#1a1a1a] border-[#262626] text-white h-12"
            />
          </div>
        </div>

        {/* Login Button */}
        <Button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full bg-[#dc2626] hover:bg-[#ef4444] text-white h-12 text-base font-semibold mb-4"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Admin Login Link */}
        <div className="text-center pt-4 border-t border-[#262626]">
          <p className="text-white/40 text-sm mb-2">Are you an administrator?</p>
          <Link
            href="/mgmt-x9k2m7/login"
            className="text-[#dc2626] hover:text-[#ef4444] text-sm font-medium transition-colors"
          >
            Admin Login →
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          Don't have access? Contact your administrator.
        </p>
      </div>
    </main>
  );
}
