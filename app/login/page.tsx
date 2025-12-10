"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error, user } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFormError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const { email, password } = form;

    if (!email || !password) {
      setFormError("Email and password are required.");
      return;
    }

    if (!email.includes("@") && !email.startsWith("+")) {
      setFormError("Please enter a valid email address or phone number.");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    const res = await login(form);
    if (res.success) {
      if (user?.role === "admin" || user?.role === "super_admin") {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } else {
      setFormError(res.message || "Login failed. Please check your credentials.");
    }
  }

  if (user) {
    if (user.role === "admin" || user?.role === "super_admin") {
      router.replace("/admin");
    } else {
      router.replace("/");
    }
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Prokrishi account</p>
        </div>

        {/* Login Form */}
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email or Phone Input */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="you@example.com or +880 1234 567890"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10"
                  autoComplete="username"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">You can sign in with email or phone number</p>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-2.5 bg-gray-50 rounded-lg focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white outline-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {(formError || error) && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Login Failed</p>
                  <p className="text-sm text-red-600 mt-1">{formError || error}</p>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-[var(--primary-green)] hover:text-[var(--primary-green)]/80 font-medium">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New to Prokrishi?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link href="/register">
            <Button variant="outline" className="w-full" size="lg">
              Create an Account
            </Button>
          </Link>
        </Card>

        {/* Additional Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

