"use client";

import React from "react"
import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, Loader2, CheckCircle2, Sparkles, Mail, Lock, UserCircle, Shield, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

export function AuthDropdown() {
  const { user, isLoading, signIn, signUp, signOut } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    setShowLoadingScreen(true);

    const result = await signIn(email, password, rememberMe);
    
    if (result.success) {
      // Keep loading screen for smooth transition
      setTimeout(() => {
        setIsOpen(false);
        setEmail("");
        setPassword("");
        setShowLoadingScreen(false);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in. Enjoy!",
        });
      }, 800);
    } else {
      setError(result.error || "Sign in failed");
      setShowLoadingScreen(false);
    }
    
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }

    setIsSubmitting(true);
    setShowLoadingScreen(true);

    const result = await signUp(email, password, username);
    
    if (result.success) {
      // Keep loading screen for smooth transition
      setTimeout(() => {
        setIsOpen(false);
        setEmail("");
        setPassword("");
        setUsername("");
        setShowLoadingScreen(false);
        toast({
          title: "Account created!",
          description: "You have successfully registered. Thank you for joining us!",
        });
      }, 800);
    } else {
      setError(result.error || "Sign up failed");
      setShowLoadingScreen(false);
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#262626] animate-pulse" />
    );
  }

  // User is logged in - Enhanced profile dropdown
  if (user) {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] hover:from-[#262626] hover:to-[#1a1a1a] border border-[#262626] hover:border-[#dc2626]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#dc2626]/20"
        >
          <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center text-white text-sm font-bold overflow-hidden ring-2 ring-[#dc2626]/30 group-hover:ring-[#dc2626]/60 transition-all">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl || "/placeholder.svg"}
                alt={user.username}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              user.username[0].toUpperCase()
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <span className="text-white/90 text-sm font-medium hidden sm:block group-hover:text-white transition-colors">
            {user.username}
          </span>
          <ChevronDown className={`w-4 h-4 text-white/60 group-hover:text-white transition-all duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* User Info Header */}
            <div className="relative px-4 py-4 border-b border-[#1a1a1a] bg-gradient-to-br from-[#dc2626]/10 to-transparent">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#dc2626]/10 rounded-full blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#dc2626] to-[#ef4444] flex items-center justify-center text-white font-bold overflow-hidden ring-2 ring-[#dc2626]/30">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl || "/placeholder.svg"}
                      alt={user.username}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">{user.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{user.username}</p>
                  <p className="text-white/50 text-xs truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-[#dc2626]/10 flex items-center justify-center group-hover:bg-[#dc2626]/20 transition-colors">
                  <User className="w-4 h-4 text-[#dc2626]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">My Account</p>
                  <p className="text-xs text-white/40">View profile & orders</p>
                </div>
              </Link>

              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                  toast({
                    title: "Signed out successfully",
                    description: "See you next time!",
                  });
                }}
                className="group w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-[#dc2626] hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <LogOut className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">Sign Out</p>
                  <p className="text-xs text-white/40">Come back soon!</p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // User is not logged in - Enhanced auth forms
  return (
    <>
      {/* Beautiful Loading Screen */}
      {showLoadingScreen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#dc2626]/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ef4444]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#dc2626]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>

          {/* Loading content */}
          <div className="relative z-10 text-center">
            {/* Animated logo/icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#dc2626] to-[#ef4444] animate-spin" style={{ animationDuration: "3s" }}>
                <div className="absolute inset-2 rounded-full bg-black" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="w-12 h-12 text-[#dc2626] animate-pulse" />
              </div>
            </div>

            {/* Loading text */}
            <h3 className="text-2xl font-bold text-white mb-2 animate-pulse">
              {activeTab === "signin" ? "Signing you in..." : "Creating your account..."}
            </h3>
            <p className="text-white/60 text-sm mb-8">
              Please wait a moment
            </p>

            {/* Loading dots */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#dc2626] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#dc2626] animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 rounded-full bg-[#dc2626] animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>

            {/* Progress bar */}
            <div className="mt-8 w-64 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
              <div className="h-full bg-gradient-to-r from-[#dc2626] to-[#ef4444] animate-loading-bar" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Existing user? Sign In dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setActiveTab("signin");
              setIsOpen(!isOpen);
              setError("");
            }}
            className="group flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white text-sm font-medium transition-all duration-200 hover:bg-[#1a1a1a] rounded-lg"
          >
            <span>Existing user? Sign In</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen && activeTab === "signin" ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown positioned under Sign In button */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-96 bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#1a1a1a] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Enhanced Tabs */}
          <div className="relative flex border-b border-[#1a1a1a]">
            <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-[#dc2626] to-[#ef4444] transition-all duration-300"
              style={{
                width: "50%",
                transform: activeTab === "signup" ? "translateX(100%)" : "translateX(0)"
              }}
            />
            <button
              onClick={() => {
                setActiveTab("signin");
                setError("");
              }}
              className={`relative flex-1 px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                activeTab === "signin"
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              <span className="relative z-10">Sign In</span>
              {activeTab === "signin" && (
                <div className="absolute inset-0 bg-[#dc2626]/5" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setError("");
              }}
              className={`relative flex-1 px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                activeTab === "signup"
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              <span className="relative z-10">Sign Up</span>
              {activeTab === "signup" && (
                <div className="absolute inset-0 bg-[#dc2626]/5" />
              )}
            </button>
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-white font-bold text-xl mb-1">
                {activeTab === "signin" ? "Welcome Back" : "Create Account"}
              </h3>
              <p className="text-white/50 text-sm">
                {activeTab === "signin" 
                  ? "Sign in to access your account" 
                  : "Join us and start your journey"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={activeTab === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
              {/* Username (Sign Up only) */}
              {activeTab === "signup" && (
                <div className="group">
                  <label className="block text-white/70 text-sm font-medium mb-2">Username</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#dc2626] transition-colors" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="group">
                <label className="block text-white/70 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#dc2626] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#dc2626] transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none focus:ring-2 focus:ring-[#dc2626]/20 transition-all"
                  />
                </div>
                {activeTab === "signup" && (
                  <p className="text-white/40 text-xs mt-1.5">Must be at least 6 characters</p>
                )}
              </div>

              {/* Remember Me (Sign In only) */}
              {activeTab === "signin" && (
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-[#262626] bg-[#0a0a0a] text-[#dc2626] focus:ring-[#dc2626] focus:ring-offset-0"
                  />
                  <label htmlFor="remember" className="flex-1 cursor-pointer">
                    <span className="text-white text-sm">Remember me</span>
                    <p className="text-white/40 text-xs mt-0.5">Not recommended on shared devices</p>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full py-3.5 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white text-sm font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#dc2626]/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {activeTab === "signin" ? "Signing In..." : "Creating Account..."}
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      {activeTab === "signin" ? "Sign In" : "Create Account"}
                    </>
                  )}
                </span>
              </button>

              {/* Forgot Password Link (Sign In only) */}
              {activeTab === "signin" && (
                <Link
                  href="/forgot-password"
                  className="block text-center text-[#dc2626] hover:text-[#ef4444] text-sm font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Forgot your password?
                </Link>
              )}
            </form>

            {/* Benefits (Sign Up only) */}
            {activeTab === "signup" && (
              <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                <p className="text-white/50 text-xs mb-3">By signing up, you get:</p>
                <div className="space-y-2">
                  {[
                    "Instant access to all products",
                    "Order history & tracking",
                    "Exclusive member discounts"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-white/60 text-xs">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
          )}
        </div>

        {/* Sign Up button */}
        <button
          onClick={() => {
            setActiveTab("signup");
            setIsOpen(true);
            setError("");
          }}
          className="px-4 py-2 bg-gradient-to-r from-[#dc2626] to-[#ef4444] hover:from-[#ef4444] hover:to-[#dc2626] text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#dc2626]/50"
        >
          Sign Up
        </button>
      </div>
    </>
  );
}
