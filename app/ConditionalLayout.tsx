"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCartButton from "@/components/FloatingCartButton";

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
      <Header />
      <main className="flex-1 pb-16">{children}</main>
      <Footer />
      <FloatingCartButton />
    </div>
  );
}

