"use client";

import Link from "next/link";
import { FileQuestion, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--primary-green)]/20 to-[var(--primary-amber)]/20 dark:from-[var(--primary-green)]/10 dark:to-[var(--primary-amber)]/10 flex items-center justify-center">
              <FileQuestion className="text-[var(--primary-green)] dark:text-[var(--primary-green)]" size={64} />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-[var(--primary-amber)]/20 dark:bg-[var(--primary-amber)]/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-[var(--primary-amber)]">404</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          It might have been moved, deleted, or the URL might be incorrect.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <Home className="mr-2" size={20} />
              Go to Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <Search className="mr-2" size={20} />
              Browse Products
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/products"
              className="text-[var(--primary-green)] hover:text-[var(--primary-green)]/80 dark:text-[var(--primary-green)] dark:hover:text-[var(--primary-green)]/80 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-[var(--primary-green)] hover:text-[var(--primary-green)]/80 dark:text-[var(--primary-green)] dark:hover:text-[var(--primary-green)]/80 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-[var(--primary-green)] hover:text-[var(--primary-green)]/80 dark:text-[var(--primary-green)] dark:hover:text-[var(--primary-green)]/80 transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/cart"
              className="text-[var(--primary-green)] hover:text-[var(--primary-green)]/80 dark:text-[var(--primary-green)] dark:hover:text-[var(--primary-green)]/80 transition-colors"
            >
              Cart
            </Link>
          </div>
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


