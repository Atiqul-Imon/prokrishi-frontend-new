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

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (form.password.length > 50) {
      setError("Password must be less than 50 characters");
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser(form);
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
    if (len < 6) return { text: "Weak", color: "text-red-600", width: "33%" };
    if (len < 10) return { text: "Medium", color: "text-amber-600", width: "66%" };
    return { text: "Strong", color: "text-green-600", width: "100%" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="flex justify-center items-center min-h-screen bg-white py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Prokrishi and start shopping fresh products</p>
        </div>

        {/* Register Form */}
        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="pl-10"
                  autoComplete="name"
                  label="Full Name"
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+880 1234 567890"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  className="pl-10"
                  autoComplete="tel"
                  label="Phone Number"
                  helperText="Required for order updates and delivery"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10"
                  autoComplete="email"
                  label="Email Address (Optional)"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-2.5 bg-gray-50 rounded-lg focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white outline-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        passwordStrength.text === "Weak" ? "bg-red-600" :
                        passwordStrength.text === "Medium" ? "bg-amber-600" : "bg-green-600"
                      }`}
                      style={{ width: passwordStrength.width }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Success Message */}
            {success && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Registration Successful!</p>
                  <p className="text-sm text-green-600 mt-1">Account created successfully. Redirecting...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Registration Failed</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--primary-green)] hover:text-[var(--primary-green)]/80 font-semibold">
                Sign in instead
              </Link>
            </p>
          </div>
        </Card>

        {/* Additional Info */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

