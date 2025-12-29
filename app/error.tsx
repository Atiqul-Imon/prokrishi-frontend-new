"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Application error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center">
            <AlertCircle className="text-red-600 dark:text-red-400" size={64} />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          We encountered an unexpected error while processing your request.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          {error.message || "Please try again or contact support if the problem persists."}
        </p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && error.digest && (
          <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
              Error ID: {error.digest}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={reset}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2" size={20} />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <Home className="mr-2" size={20} />
              Go to Home
            </Button>
          </Link>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-[var(--primary-green)] dark:hover:text-[var(--primary-green)] transition-colors"
          >
            <ArrowLeft className="mr-1" size={16} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

