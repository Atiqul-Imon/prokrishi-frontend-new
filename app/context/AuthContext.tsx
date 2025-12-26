"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchProfile, loginUser, logoutUser, registerUser } from "../utils/api";
import type { AuthContextType } from "@/types/context";
import type { User } from "@/types/models";
import type { LoginRequest, RegisterRequest } from "@/types/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cached user immediately (non-blocking)
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Try to load from cache first for immediate render
      const cachedUser = localStorage.getItem("cachedUser");
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          setLoading(false); // Don't block - show page immediately
        } catch (e) {
          // Invalid cache, clear it
          localStorage.removeItem("cachedUser");
        }
      } else {
        setLoading(false); // No cache, but don't block
      }
    }
  }, []);

  // Refresh user from API in background (non-blocking)
  useEffect(() => {
    async function loadUser() {
      try {
        if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
          try {
            const data = await fetchProfile();
            setUser(data.user);
            // Cache user for next time
            if (data.user) {
              localStorage.setItem("cachedUser", JSON.stringify(data.user));
            }
            if (process.env.NODE_ENV === "development") {
              console.log("AuthContext: User loaded from token:", data.user);
            }
          } catch (error) {
            // Token might be invalid, clear it
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("cachedUser");
            setUser(null);
            if (process.env.NODE_ENV === "development") {
              console.error("AuthContext: Failed to fetch profile, clearing tokens:", error);
            }
          }
        } else {
          // No token, clear cache
          localStorage.removeItem("cachedUser");
          setUser(null);
        }
        setError(null);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("AuthContext: Error loading user:", error);
        }
        setUser(null);
      }
      setLoading(false);
    }
    // Small delay to let cached user render first
    const timer = setTimeout(loadUser, 100);
    return () => clearTimeout(timer);
  }, []);

  async function register(form: RegisterRequest) {
    setLoading(true);
    setError(null);
    try {
      const data = await registerUser(form);
      setUser(data.user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  }

  async function login(form: LoginRequest) {
    setLoading(true);
    setError(null);
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("AuthContext: Attempting login with:", { email: form.email, passwordLength: form.password?.length });
      }
      const data = await loginUser(form);
      if (process.env.NODE_ENV === "development") {
        console.log("AuthContext: Login response received:", data);
      }
      
      if (!data.user) {
        throw new Error("Login response missing user data");
      }
      
      setUser(data.user);
      // Cache user for next time
      if (data.user) {
        localStorage.setItem("cachedUser", JSON.stringify(data.user));
      }
      if (process.env.NODE_ENV === "development") {
        console.log("AuthContext: User state updated:", data.user);
      }
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err) {
      console.error("AuthContext: Login error:", err);
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  }

  function logout() {
    logoutUser();
    localStorage.removeItem("cachedUser"); // Clear cache on logout
    setUser(null);
    setError(null);
  }

  function updateUser(updatedUser: User) {
    setUser(updatedUser);
    // Update cache
    if (updatedUser) {
      localStorage.setItem("cachedUser", JSON.stringify(updatedUser));
    }
  }

  const isAdmin = useMemo(() => user?.role === "admin" || user?.role === "super_admin", [user]);

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      error,
      isAdmin,
      login,
      register,
      logout,
      updateUser,
    }),
    [user, loading, error, isAdmin],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

