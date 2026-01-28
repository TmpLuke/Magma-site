"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: Date;
}

interface ProfileUpdate {
  username?: string;
  avatarUrl?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateProfile: (updates: ProfileUpdate) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseUser(r: { id: string; email: string; username: string; avatarUrl?: string; phone?: string; createdAt: string }): User {
  return {
    id: r.id,
    email: r.email,
    username: r.username,
    avatarUrl: r.avatarUrl,
    phone: r.phone,
    createdAt: new Date(r.createdAt),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/store-auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setUser(data.user ? parseUser(data.user) : null);
      })
      .catch(() => {
        if (!mounted) return;
        setUser(null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const signIn = useCallback(async (email: string, password: string, _remember: boolean): Promise<{ success: boolean; error?: string }> => {
    const res = await fetch("/api/store-auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Sign in failed" };
    setUser(parseUser(data.user));
    return { success: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    const res = await fetch("/api/store-auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Sign up failed" };
    setUser(parseUser(data.user));
    return { success: true };
  }, []);

  const signOut = useCallback(() => {
    fetch("/api/store-auth/signout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: ProfileUpdate): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "Not logged in" };
    const res = await fetch("/api/store-auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Update failed" };
    setUser(parseUser(data.user));
    return { success: true };
  }, [user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const res = await fetch("/api/store-auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || "Password update failed" };
    return { success: true };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
