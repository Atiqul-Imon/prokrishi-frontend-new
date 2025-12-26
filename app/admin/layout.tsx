"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import dynamic from "next/dynamic";
import AdminSidebar from "./components/Sidebar";
import AdminHeader from "../admin/components/Header";
import { ErrorBoundary } from "../components/ErrorBoundary";

// Lazy load admin header for code splitting
const AdminHeaderLazy = dynamic(() => import("../admin/components/Header"), {
  ssr: true,
  loading: () => (
    <div className="h-16 bg-white border-b border-slate-200 animate-pulse" />
  ),
});

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Only redirect if we're sure user is not authenticated
    // Don't block on loading - use cached user for immediate render
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=" + encodeURIComponent(pathname));
      } else if (user && !isAdmin) {
        router.push("/unauthorized");
      }
    }
  }, [user, isAdmin, loading, router, pathname]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Show loading only if we have no cached user and still loading
  // This allows optimistic rendering with cached user
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Only hide if we're sure user is not admin (after loading completes)
  if (!loading && (!user || !isAdmin)) {
    return null;
  }

  // Optimistic render: Show page even if still loading (using cached user)
  // Auth check happens in background

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-64 transition-all duration-200">
          <AdminHeaderLazy onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="p-4 lg:p-6">
            <div className="max-w-[1600px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

