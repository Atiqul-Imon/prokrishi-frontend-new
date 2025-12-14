"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/app/utils/api";
import { handleApiError } from "@/app/utils/errorHandler";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.name || form.name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      setLoading(false);
      return;
    }

    if (!form.phone || form.phone.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits)");
      setLoading(false);
      return;
    }

    if (form.email && !form.email.includes("@")) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (form.password.length < 4) {
      setError("Password must be at least 4 characters long");
      setLoading(false);
      return;
    }

    if (form.password.length > 50) {
      setError("Password must be less than 50 characters");
      setLoading(false);
      return;
    }

    try {
      // Remove email from payload if it's empty
      const registrationData = {
        name: form.name,
        phone: form.phone,
        password: form.password,
        ...(form.email && form.email.trim() !== '' ? { email: form.email.trim() } : {}),
      };
      
      const result = await registerUser(registrationData);
      if (result.success) {
        setSuccess(true);
        setError("");
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        setError("Registration failed");
      }
    } catch (err) {
      let errorMessage = handleApiError(err, "registering user");

      if (err instanceof Error && err.message) {
        if (err.message.includes("already exists")) {
          errorMessage = "An account with this phone number already exists";
        } else if (err.message.includes("email")) {
          errorMessage = "An account with this email already exists";
        } else if (err.message.includes("validation")) {
          errorMessage = "Please check your information and try again";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const getPasswordStrength = () => {
    const len = form.password.length;
    if (len === 0) return null;
    if (len < 4) return { text: "Too Short", color: "text-red-600", width: "25%" };
    if (len < 8) return { text: "Good", color: "text-amber-600", width: "66%" };
    return { text: "Strong", color: "text-green-600", width: "100%" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 py-8 md:py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 mb-4 md:mb-6 shadow-lg">
            <UserPlus className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">Create Account</h1>
          <p className="text-base md:text-lg text-gray-600">Join Prokrishi and start shopping fresh products</p>
        </div>

        {/* Register Form */}
        <Card padding="lg" variant="elevated" className="shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="pl-12 pr-4 py-3 md:py-3.5 text-base"
                  autoComplete="name"
                  inputMode="text"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className="pl-12 pr-4 py-3 md:py-3.5 text-base"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Required for order updates and delivery</p>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-12 pr-4 py-3 md:py-3.5 text-base"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
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
                  autoComplete="new-password"
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

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold ${passwordStrength.color}`}>
                      Password Strength: {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.text === "Weak" ? "bg-red-500" :
                        passwordStrength.text === "Medium" ? "bg-amber-500" : "bg-green-500"
                      }`}
                      style={{ width: passwordStrength.width }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-fade-in">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-800 mb-1">Registration Successful!</p>
                  <p className="text-sm text-green-700">Account created successfully. Redirecting...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-fade-in">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800 mb-1">Registration Failed</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-semibold py-3.5 md:py-4 text-base shadow-lg hover:shadow-xl transition-all duration-200 min-h-[52px]"
              size="lg"
            >
              {!loading && <UserPlus className="w-5 h-5 mr-2" />}
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 md:mt-8 text-center pt-6 border-t border-gray-200">
            <p className="text-sm md:text-base text-gray-600">
              Already have an account?{" "}
              <Link 
                href="/login" 
                className="text-emerald-700 hover:text-emerald-800 font-semibold transition-colors underline-offset-2 hover:underline"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </Card>

        {/* Additional Info */}
        <p className="text-center text-xs md:text-sm text-gray-500 mt-6 md:mt-8 px-4">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-emerald-700 hover:underline font-medium">Terms of Service</Link>
          {" "}and{" "}
          <Link href="/terms" className="text-emerald-700 hover:underline font-medium">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}

