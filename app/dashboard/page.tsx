"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}

