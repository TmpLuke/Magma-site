"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { verifyInviteToken, acceptInvite } from "@/app/actions/admin-team-invites";
import { CheckCircle, AlertCircle, RefreshCw, Flame } from "lucide-react";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [valid, setValid] = useState(false);
  const [teamMember, setTeamMember] = useState<any>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setLoading(false);
    }
  }, [token]);

  async function verifyToken() {
    try {
      setVerifying(true);
      const result = await verifyInviteToken(token!);
      if (result.success && result.teamMember) {
        setValid(true);
        setTeamMember(result.teamMember);
      } else {
        setValid(false);
        toast({
          title: "Invalid Invitation",
          description: result.error || "This invitation link is not valid",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setValid(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (!password || password.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const result = await acceptInvite(token!, password);
      if (result.success) {
        toast({
          title: "Success!",
          description: "Your account has been activated",
        });
        setTimeout(() => {
          router.push("/staff/login");
        }, 1500);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || verifying) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#dc2626] animate-spin mx-auto mb-4" />
          <p className="text-white/60">Verifying invitation...</p>
        </div>
      </main>
    );
  }

  if (!token || !valid) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#111111] border border-[#262626] rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h1>
          <p className="text-white/60 mb-6">
            This invitation link is invalid or has expired. Please contact your administrator for a new invitation.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
          >
            Go to Homepage
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-[#262626] rounded-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center mx-auto mb-4">
            <Flame className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Magma</h1>
          <p className="text-white/60 text-sm">Complete your account setup</p>
        </div>

        {/* Team Member Info */}
        <div className="bg-[#1a1a1a] border border-[#262626] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-white/60">You're invited as</p>
              <p className="text-white font-semibold">{teamMember.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-sm text-white/60">Role</p>
              <p className="text-white font-semibold capitalize">{teamMember.role}</p>
            </div>
          </div>
        </div>

        {/* Password Form */}
        <div className="space-y-4 mb-6">
          <div>
            <Label className="text-white mb-2">Create Password *</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="bg-[#1a1a1a] border-[#262626] text-white"
            />
          </div>
          <div>
            <Label className="text-white mb-2">Confirm Password *</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="bg-[#1a1a1a] border-[#262626] text-white"
            />
          </div>
        </div>

        {/* Accept Button */}
        <Button
          onClick={handleAccept}
          disabled={submitting || !password || !confirmPassword}
          className="w-full bg-[#dc2626] hover:bg-[#ef4444] text-white h-12 text-base font-semibold"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Activating Account...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Accept & Activate Account
            </>
          )}
        </Button>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          By accepting, you agree to follow our team guidelines and policies.
        </p>
      </div>
    </main>
  );
}
