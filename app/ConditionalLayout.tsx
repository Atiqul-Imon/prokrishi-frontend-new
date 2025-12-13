"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCartButton from "@/components/FloatingCartButton";
import MobileBottomNav from "@/components/MobileBottomNav";
import { SkipLinks } from "@/components/SkipLinks";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // Don't render public header, footer, or floating cart in admin panel
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Render public layout for non-admin routes
  return (
    <div className="min-h-screen flex flex-col">
      <SkipLinks />
      <Header />
      <main id="main-content" className="flex-1 pb-16 md:pb-0 pt-16" role="main">{children}</main>
      <Footer />
      <FloatingCartButton />
      <MobileBottomNav />
      {/* ARIA live region for dynamic announcements */}
      <div id="aria-live-region" aria-live="polite" aria-atomic="true" className="sr-only"></div>
    </div>
  );
}

