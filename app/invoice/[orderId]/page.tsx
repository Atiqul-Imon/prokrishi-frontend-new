"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import Invoice from "@/components/Invoice";

export default function InvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const orderType = (searchParams.get("type") || "regular") as "regular" | "fish";

  if (!orderId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Invalid order ID</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Invoice orderId={orderId} orderType={orderType} />
      </div>
    </div>
  );
}

