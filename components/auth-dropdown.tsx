"use client";

import React from "react"

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, Loader2, CheckCircle2, Sparkles } from "lucide-react";
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

    const result = await signIn(email, password, rememberMe);
    
    if (result.success) {
      setIsOpen(false);
      setEmail("");
      setPassword("");
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Welcome back!</span>
          </div>
        ),
        description: "You have successfully signed in. Enjoy!",
      });
    } else {
      setError(result.error || "Sign in failed");
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

    const result = await signUp(email, password, username);
    
    if (result.success) {
      setIsOpen(false);
      setEmail("");
      setPassword("");
      setUsername("");
      toast({
        title: (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#dc2626]" />
            <span>Account created!</span>
          </div>
        ),
        description: "You have successfully registered. Thank you for joining us!",
      });
    } else {
      setError(result.error || "Sign up failed");
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] animate-pulse" />
    );
  }

  // User is logged in
  if (user) {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#dc2626] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl || "/placeholder.svg"}
                alt={user.username}
                width={28}
                height={28}
                className="w-full h-full object-cover"
              />
            ) : (
              user.username[0].toUpperCase()
            )}
          </div>
          <span className="text-white/80 text-sm hidden sm:block">{user.username}</span>
          <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-[#111111] border border-[#1a1a1a] rounded-lg shadow-xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-[#1a1a1a]">
              <p className="text-white font-medium text-sm">{user.username}</p>
              <p className="text-white/50 text-xs truncate">{user.email}</p>
            </div>
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-white/70 hover:text-white hover:bg-[#1a1a1a] transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">My Account</span>
            </Link>
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-white/70 hover:text-[#dc2626] hover:bg-[#1a1a1a] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // User is not logged in
  return (
    <div ref={dropdownRef} className="relative">
      <div className="flex items-center">
        <button
          onClick={() => {
            setActiveTab("signin");
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-1 px-3 py-2 text-white/70 hover:text-white text-sm transition-colors"
        >
          Existing user? Sign In
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen && activeTab === "signin" ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={() => {
            setActiveTab("signup");
            setIsOpen(true);
            setError("");
          }}
          className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#262626] text-white text-sm font-medium rounded-lg transition-colors"
        >
          Sign Up
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-[#111111] border border-[#1a1a1a] rounded-lg shadow-xl overflow-hidden z-50">
          {/* Tabs */}
          <div className="flex border-b border-[#1a1a1a]">
            <button
              onClick={() => {
                setActiveTab("signin");
                setError("");
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "signin"
                  ? "text-white bg-[#1a1a1a]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setError("");
              }}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === "signup"
                  ? "text-white bg-[#1a1a1a]"
                  : "text-white/50 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-white font-semibold mb-4">
              {activeTab === "signin" ? "Sign In" : "Sign Up"}
            </h3>

            {error && (
              <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-400 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={activeTab === "signin" ? handleSignIn : handleSignUp}>
              {activeTab === "signup" && (
                <div className="mb-3">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div className="mb-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white text-sm placeholder:text-white/40 focus:border-[#dc2626] focus:outline-none transition-colors"
                />
              </div>

              {activeTab === "signin" && (
                <div className="mb-4">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-[#262626] bg-[#0a0a0a] text-[#dc2626] focus:ring-[#dc2626]"
                    />
                    <div>
                      <span className="text-white text-sm">Remember me</span>
                      <p className="text-white/40 text-xs">Not recommended on shared computers</p>
                    </div>
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#262626] hover:bg-[#333333] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {activeTab === "signin" ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  activeTab === "signin" ? "Sign In" : "Create Account"
                )}
              </button>

              {activeTab === "signin" && (
                <button
                  type="button"
                  className="w-full mt-3 text-[#dc2626] hover:text-[#ef4444] text-sm transition-colors"
                >
                  Forgot your password?
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
