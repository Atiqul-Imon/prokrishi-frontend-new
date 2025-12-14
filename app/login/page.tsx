"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { isValidEmail, isValidPhone } from "@/app/utils/validation";

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

  // Normalize phone number for backend (remove +, spaces, dashes, and normalize formats)
  function normalizePhone(phone: string): string {
    // Remove all non-digit characters
    let digits = phone.replace(/\D/g, "");
    
    // Normalize Bangladeshi phone numbers:
    // +8801712152055 or 8801712152055 -> 01712152055 (remove country code, add leading 0)
    // 01712152055 -> 01712152055 (keep as is)
    if (digits.length === 13 && digits.startsWith("880")) {
      // Remove country code 880 and add leading 0
      digits = "0" + digits.substring(3);
    } else if (digits.length === 12 && digits.startsWith("88")) {
      // Remove country code 88 and add leading 0
      digits = "0" + digits.substring(2);
    } else if (digits.length === 10 && digits.startsWith("1")) {
      // Add leading 0 if missing
      digits = "0" + digits;
    }
    
    return digits;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    let { email, password } = form;

    if (!email || !password) {
      setFormError("Email and password are required.");
      return;
    }

    // Validate email or phone number format
    const isEmail = isValidEmail(email);
    const isPhone = isValidPhone(email);
    
    if (!isEmail && !isPhone) {
      setFormError("Please enter a valid email address or phone number.");
      return;
    }

    // Normalize phone number if it's a phone (not email)
    if (isPhone && !isEmail) {
      email = normalizePhone(email);
    }

    if (password.length < 4) {
      setFormError("Password must be at least 4 characters long.");
      return;
    }

    try {
      const res = await login({ email, password });
      console.log("Login response:", res);
      
      if (res.success) {
        // Don't redirect here - let the component's user check handle it
        // The AuthContext will update the user state, triggering a re-render
        // and the redirect logic at the top of the component will handle it
        // This ensures user state is properly set before redirect
      } else {
        setFormError(res.message || "Login failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setFormError(error.message || "Login failed. Please check your credentials.");
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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 py-8 md:py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 mb-4 md:mb-6 shadow-lg">
            <LogIn className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">Welcome Back</h1>
          <p className="text-base md:text-lg text-gray-600">Sign in to your Prokrishi account</p>
        </div>

        {/* Login Form */}
        <Card padding="lg" variant="elevated" className="shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {/* Email or Phone Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Phone Number
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="pl-12 pr-4 py-3 md:py-3.5 text-base"
                  autoComplete="username"
                  inputMode="email"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">You can sign in with email or phone number</p>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 md:py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:bg-white outline-none transition-all text-base min-h-[48px]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation active:scale-95"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {(formError || error) && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 mb-1">Login Failed</p>
                  <p className="text-sm text-red-700">{formError || error}</p>
                </div>
              </div>
            )}

            {/* Forgot Password */}
            <div className="flex justify-end pt-2">
              <Link 
                href="/forgot-password" 
                className="text-sm text-emerald-700 hover:text-emerald-800 font-semibold transition-colors underline-offset-2 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-semibold py-3.5 md:py-4 text-base shadow-lg hover:shadow-xl transition-all duration-200 min-h-[52px]"
              size="lg"
            >
              {!loading && <LogIn className="w-5 h-5 mr-2" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 md:my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">New to Prokrishi?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link href="/register" className="block">
            <button 
              type="button"
              className="w-full font-bold py-3.5 md:py-4 px-6 text-base rounded-xl transition-all duration-200 min-h-[52px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 active:scale-95 touch-manipulation shadow-md hover:shadow-lg"
              style={{ 
                border: '2px solid #047857',
                color: '#047857',
                backgroundColor: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ecfdf5';
                e.currentTarget.style.borderColor = '#065f46';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#047857';
              }}
            >
              Create an Account
            </button>
          </Link>
        </Card>

        {/* Additional Info */}
        <p className="text-center text-xs md:text-sm text-gray-500 mt-6 md:mt-8 px-4">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-emerald-700 hover:underline font-medium">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/terms" className="text-emerald-700 hover:underline font-medium">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

