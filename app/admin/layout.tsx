"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode, useState } from "react";
import AdminSidebar from "./components/Sidebar";
import AdminHeader from "../admin/components/Header";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=" + encodeURIComponent(pathname));
    } else if (!loading && user && !isAdmin) {
      router.push("/unauthorized");
    }
  }, [user, isAdmin, loading, router, pathname]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-slate-50 dark:bg-slate-950" : "bg-slate-50"
      } transition-colors duration-200 text-slate-900 dark:text-slate-100`}
    >
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`lg:pl-56 transition-all duration-200 ${
          isDark ? "bg-slate-50 dark:bg-slate-950" : "bg-slate-50"
        }`}
      >
        <AdminHeader onToggleSidebar={() => setSidebarOpen(true)} isDark={isDark} onThemeToggle={() => setIsDark(!isDark)} />
        <main className="p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

