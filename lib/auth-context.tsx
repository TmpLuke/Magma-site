"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface User {
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

// Simple in-memory user store (in production, this would be a database)
const users: Map<string, { id: string; email: string; username: string; password: string; avatarUrl?: string; phone?: string; createdAt: Date }> = new Map();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("magma_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Restore user to in-memory store if not present (for password changes to work after refresh)
        if (!users.has(parsedUser.email.toLowerCase())) {
          // Get saved password from localStorage or use a default placeholder
          const savedPassword = localStorage.getItem("magma_user_pw") || "password123";
          users.set(parsedUser.email.toLowerCase(), {
            id: parsedUser.id,
            email: parsedUser.email,
            username: parsedUser.username,
            password: savedPassword,
            avatarUrl: parsedUser.avatarUrl,
            phone: parsedUser.phone,
            createdAt: new Date(parsedUser.createdAt),
          });
        }
      } catch {
        localStorage.removeItem("magma_user");
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string, remember: boolean): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const storedUser = users.get(email.toLowerCase());
    
    if (!storedUser) {
      return { success: false, error: "No account found with this email" };
    }

    if (storedUser.password !== password) {
      return { success: false, error: "Incorrect password" };
    }

    const userData: User = {
      id: storedUser.id,
      email: storedUser.email,
      username: storedUser.username,
      createdAt: storedUser.createdAt,
    };

    setUser(userData);
    
    if (remember) {
      localStorage.setItem("magma_user", JSON.stringify(userData));
      localStorage.setItem("magma_user_pw", password);
    } else {
      sessionStorage.setItem("magma_user", JSON.stringify(userData));
    }

    return { success: true };
  };

  const signUp = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (users.has(email.toLowerCase())) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Check if username is taken
    for (const [, userData] of users) {
      if (userData.username.toLowerCase() === username.toLowerCase()) {
        return { success: false, error: "This username is already taken" };
      }
    }

    const newUser = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      username,
      password,
      createdAt: new Date(),
    };

    users.set(email.toLowerCase(), newUser);

    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      createdAt: newUser.createdAt,
    };

    setUser(userData);
    localStorage.setItem("magma_user", JSON.stringify(userData));
    localStorage.setItem("magma_user_pw", password);

    return { success: true };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("magma_user");
    localStorage.removeItem("magma_user_pw");
    sessionStorage.removeItem("magma_user");
  };

  const updateProfile = async (updates: ProfileUpdate): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Not logged in" };
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedUser: User = {
      ...user,
      ...updates,
    };

    // Update in-memory store
    const storedUser = users.get(user.email.toLowerCase());
    if (storedUser) {
      users.set(user.email.toLowerCase(), {
        ...storedUser,
        username: updates.username || storedUser.username,
        avatarUrl: updates.avatarUrl,
        phone: updates.phone,
      });
    }

    setUser(updatedUser);
    localStorage.setItem("magma_user", JSON.stringify(updatedUser));

    return { success: true };
  };

  const updatePassword = async (updates: {password: string}): Promise<{ success: boolean; error?: string; }> => {
    if (!user) {
      return { success: false, error: "Not logged in" };
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update in-memory store
    const storedUser = users.get(user.email.toLowerCase());
    if (storedUser) {
      users.set(user.email.toLowerCase(), {
        ...storedUser,
        password: updates.password,
      });
    }

    return { success: true };
  };



  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, updateProfile, updatePassword }}>
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
