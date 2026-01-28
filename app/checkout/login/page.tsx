"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Loader2, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function CheckoutLoginPage() {
  const router = useRouter();
  const { user, signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign In Form
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Register Form
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerUsername, setRegisterUsername] = useState("");

  // If already signed in, redirect to checkout
  if (user) {
    router.push("/checkout/confirm");
    return null;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn(signInEmail, signInPassword, rememberMe);
      if (result.success) {
        router.push("/checkout/confirm");
      } else {
        setError(result.error || "Failed to sign in");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (registerPassword !== registerConfirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!registerUsername.trim()) {
      setError("Username is required");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(registerEmail, registerPassword, registerUsername);
      if (result.success) {
        router.push("/checkout/confirm");
      } else {
        setError(result.error || "Failed to create account");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestCheckout = () => {
    router.push("/checkout/guest");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#dc2626]/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Header />

      <div className="pt-24 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section with Animation */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc2626]/10 border border-[#dc2626]/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-[#dc2626]" />
              <span className="text-[#dc2626] text-sm font-semibold">Secure Checkout Process</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              A Powerful, Instant Way
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight">
              to Shop <span className="text-[#dc2626] relative">
                Without Limits.
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#dc2626] to-transparent" />
              </span>
            </h2>
            <p className="text-white/60 mt-6 text-lg max-w-2xl mx-auto">
              Join thousands of satisfied customers and experience seamless shopping
            </p>
          </div>

          {/* Enhanced Steps Indicator */}
          <div className="flex items-center justify-center gap-4 md:gap-8 mb-16">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#dc2626] blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#dc2626] to-[#ef4444] text-white flex items-center justify-center font-bold shadow-lg">
                  1
                </div>
              </div>
              <div>
                <p className="text-white font-semibold">Step 1</p>
                <p className="text-white/60 text-sm">Your Information</p>
              </div>
            </div>
            <div className="w-12 md:w-24 h-0.5 bg-gradient-to-r from-[#dc2626]/50 to-[#1a1a1a]" />
            <div className="flex items-center gap-3 group opacity-50">
              <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border-2 border-[#262626] text-white/40 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="text-white/40 font-semibold">Step 2</p>
                <p className="text-white/40 text-sm">Confirm & Pay</p>
              </div>
            </div>
          </div>

          {/* Main Content with Improved Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-8">
            {/* Returning Member - Sign In */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-[#111111] border border-[#1a1a1a] rounded-xl p-8 hover:border-[#dc2626]/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#dc2626]/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#dc2626]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Returning Member</h3>
                </div>

                <form onSubmit={handleSignIn} className="space-y-5">
                  {/* Email */}
                  <div className="group/input">
                    <label className="block text-white/80 text-sm mb-2 font-medium">
                      Email Address <span className="text-[#dc2626]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#dc2626] transition-colors" />
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="group/input">
                    <label className="block text-white/80 text-sm mb-2 font-medium">
                      Password <span className="text-[#dc2626]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#dc2626] transition-colors" />
                      <input
                        type="password"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-11 pr-4 py-3.5 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-[#1a1a1a] bg-[#1a1a1a] text-[#dc2626] focus:ring-[#dc2626] focus:ring-offset-0 cursor-pointer"
                      />
                      <label htmlFor="remember" className="text-white/70 text-sm cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-[#dc2626] hover:text-[#ef4444] text-sm font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Error Message */}
                  {error && activeTab === "signin" && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-shake">
                      {error}
                    </div>
                  )}

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-3.5 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#dc2626]/20 hover:shadow-xl hover:shadow-[#dc2626]/30 hover:-translate-y-0.5 active:translate-y-0 group/btn overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* New Members - Register */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-transparent to-[#dc2626]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-[#111111] border border-[#1a1a1a] rounded-xl p-8 hover:border-[#dc2626]/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-[#dc2626]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#dc2626]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">New Members</h3>
                </div>
                <p className="text-white/60 text-sm mb-6">
                  Don't have an account? Easily sign-up now to check out.
                </p>

                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Username */}
                  <div className="group/input">
                    <label className="block text-white/80 text-sm mb-2 font-medium">
                      Username <span className="text-[#dc2626]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#dc2626] transition-colors" />
                      <input
                        type="text"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        placeholder="Choose a username"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="group/input">
                    <label className="block text-white/80 text-sm mb-2 font-medium">
                      Email Address <span className="text-[#dc2626]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#dc2626] transition-colors" />
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="group/input">
                    <label className="block text-white/80 text-sm mb-2 font-medium">
                      Password <span className="text-[#dc2626]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#dc2626] transition-colors" />
                      <input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="group/input">
                    <label className="block text-white/80 text-sm mb-2 font-medium">
                      Confirm Password <span className="text-[#dc2626]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within/input:text-[#dc2626] transition-colors" />
                      <input
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg text-white placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && activeTab === "register" && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm animate-shake">
                      {error}
                    </div>
                  )}

                  {/* Register Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full py-3.5 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#dc2626]/20 hover:shadow-xl hover:shadow-[#dc2626]/30 hover:-translate-y-0.5 active:translate-y-0 group/btn overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Continue as New Member
                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Guest Checkout - Enhanced */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#dc2626]/10 via-transparent to-[#dc2626]/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-[#111111] border border-[#1a1a1a] rounded-xl p-8 text-center hover:border-[#dc2626]/20 transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#dc2626]/10 mb-4">
                  <User className="w-8 h-8 text-[#dc2626]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Continue as Guest</h3>
                <p className="text-white/60 mb-6 max-w-xl mx-auto">
                  Checkout without creating an account. You can still track your order via email.
                </p>
                <button
                  onClick={handleGuestCheckout}
                  className="px-8 py-3.5 bg-[#1a1a1a] hover:bg-[#262626] border border-[#262626] hover:border-[#dc2626]/30 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2 group/guest hover:-translate-y-0.5 active:translate-y-0"
                >
                  <User className="w-5 h-5" />
                  Continue as Guest
                  <ArrowRight className="w-5 h-5 group-hover/guest:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Payment Notice - Enhanced */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#dc2626]/20 rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#dc2626]/5 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#dc2626]/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#dc2626]" />
                  </div>
                  <h4 className="text-white font-bold text-lg">Payment Review Notice (IMPORTANT)</h4>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-[#0a0a0a]/50 rounded-lg border border-[#1a1a1a] hover:border-[#dc2626]/20 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/90 text-sm font-medium mb-1">Avoid Anonymous Tools</p>
                      <p className="text-white/60 text-xs">
                        Payments using anonymous tools may delay your order
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-[#0a0a0a]/50 rounded-lg border border-[#1a1a1a] hover:border-[#dc2626]/20 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/90 text-sm font-medium mb-1">Accurate Information</p>
                      <p className="text-white/60 text-xs">
                        Ensure billing info matches your card details
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-[#0a0a0a]/50 rounded-lg border border-[#1a1a1a] hover:border-[#dc2626]/20 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white/90 text-sm font-medium mb-1">Correct Name</p>
                      <p className="text-white/60 text-xs">
                        Use the name registered with your card issuer
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-white/50 text-xs mt-4 italic text-center">
                  ⚠️ Not following the steps above will cause your purchase to be declined
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </main>
  );
}