"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center bg-white rounded-xl shadow-sm p-8">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <FileQuestion className="text-slate-600" size={48} />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-lg font-bold text-amber-600">404</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-600 mb-6">
          The admin page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <Link href="/admin">
            <Button variant="primary" size="lg" className="w-full">
              <LayoutDashboard className="mr-2" size={20} />
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              <Home className="mr-2" size={20} />
              Go to Home
            </Button>
          </Link>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="mr-1" size={16} />
          Go Back
        </button>
      </div>
    </div>
  );
}

