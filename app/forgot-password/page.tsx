"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, ArrowLeft, CheckCircle, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { requestPasswordReset } from "@/app/utils/api";
import { handleApiError } from "@/app/utils/errorHandler";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "success">("input");
  const [identifier, setIdentifier] = useState("");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!identifier.trim()) {
      setError("Please enter your email or phone number");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(identifier);
      setStep("success");
    } catch (err) {
      setError(handleApiError(err, "sending password reset link"));
    } finally {
      setLoading(false);
    }
  };

  const isEmail = identifier.includes("@");

  return (
    <div className="flex justify-center items-center min-h-screen bg-white py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-[var(--primary-green)]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p className="text-gray-600">
            {step === "input"
              ? "Enter your email or phone number to receive reset instructions"
              : "Check your email or phone for reset instructions"}
          </p>
        </div>

        {step === "input" ? (
          <Card padding="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identifier Input */}
              <div>
                <div className="relative">
                  {isEmail ? (
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  ) : (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  )}
                  <Input
                    id="identifier"
                    name="identifier"
                    type="text"
                    placeholder={isEmail ? "you@example.com" : "+880 1234 567890"}
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setMethod(e.target.value.includes("@") ? "email" : "phone");
                      setError("");
                    }}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Enter your registered email address or phone number
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !identifier.trim()}
                isLoading={loading}
                className="w-full"
                size="lg"
              >
                Send Reset Instructions
              </Button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-[var(--primary-green)] hover:text-[var(--primary-green)]/80 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </Card>
        ) : (
          <Card padding="lg">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Reset Link Sent!</h2>
              <p className="text-gray-600 mb-6">
                {method === "email"
                  ? "We've sent password reset instructions to your email address. Please check your inbox and follow the link to reset your password."
                  : "We've sent an OTP to your phone number. Please check your messages and use the OTP to reset your password."}
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => router.push("/login")}
                >
                  Back to Login
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep("input");
                    setIdentifier("");
                    setError("");
                  }}
                >
                  Send Again
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

