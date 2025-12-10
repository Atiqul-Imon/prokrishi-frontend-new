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

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
          const data = await fetchProfile();
          setUser(data.user);
        } else {
          setUser(null);
        }
        setError(null);
      } catch {
        setUser(null);
      }
      setLoading(false);
    }
    loadUser();
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
      const data = await loginUser(form);
      setUser(data.user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  }

  function logout() {
    logoutUser();
    setUser(null);
    setError(null);
  }

  function updateUser(updatedUser: User) {
    setUser(updatedUser);
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

