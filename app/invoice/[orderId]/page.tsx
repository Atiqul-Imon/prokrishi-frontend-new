"use client";

import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getUserOrders, getUserFishOrders } from "@/app/utils/api";
import OrderInvoice from "@/components/OrderInvoice";
import { logger } from "@/app/utils/logger";
import type { Order } from "@/types/models";

export default function InvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const orderType = (searchParams.get("type") || "regular") as "regular" | "fish";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Invalid order ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (orderType === "fish") {
          const result = await getUserFishOrders();
          const foundOrder = result.orders?.find((o: Order) => o._id === orderId);
          if (foundOrder) {
            setOrder({ ...foundOrder, orderType: "fish" } as Order);
          } else {
            setError("Fish order not found");
          }
        } else {
          const result = await getUserOrders();
          const foundOrder = result.orders?.find((o: Order) => o._id === orderId);
          if (foundOrder) {
            setOrder({ ...foundOrder, orderType: "regular" } as Order);
          } else {
            setError("Order not found");
          }
        }
      } catch (err) {
        logger.error("Failed to fetch order:", err);
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, orderType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Order not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:py-0">
      <div className="max-w-4xl mx-auto px-4 print:px-0">
        <OrderInvoice order={order} showActions={true} />
      </div>
    </div>
  );
}

