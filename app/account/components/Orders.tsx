"use client";

import React, { useEffect, useState } from "react";
import { Package, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getUserOrders, getUserFishOrders } from "@/app/utils/api";
import { logger } from "@/app/utils/logger";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TableSkeleton, Skeleton } from "@/components/ui/SkeletonLoader";
import OrderCard from "@/components/OrderCard";
import type { Order } from "@/types/models";

interface OrderWithType extends Order {
  isFishOrder: boolean;
}

export default function Orders() {
  const [orders, setOrders] = useState<OrderWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const [regularOrders, fishOrders] = await Promise.all([
          getUserOrders().catch((err) => {
            logger.error("Failed to fetch regular orders:", err);
            return { success: false, orders: [] };
          }),
          getUserFishOrders().catch((err) => {
            logger.error("Failed to fetch fish orders:", err);
            return { success: false, orders: [] };
          }),
        ]);

        const allOrders: OrderWithType[] = [
          ...(regularOrders.orders || []).map((o: Order) => ({ ...o, isFishOrder: false })),
          ...(fishOrders.orders || []).map((o: Order) => ({ ...o, isFishOrder: true })),
        ].sort((a, b) => {
          const dateA = new Date(a.createdAt || new Date().toISOString()).getTime();
          const dateB = new Date(b.createdAt || new Date().toISOString()).getTime();
          return dateB - dateA;
        });

        setOrders(allOrders);
        setError(null);
      } catch (error) {
        logger.error("Failed to fetch orders:", error);
        setOrders([]);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-2">
          <Skeleton variant="text" height={28} width={200} className="mb-1" />
          <Skeleton variant="text" height={20} width={300} />
        </div>
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Your Orders</h3>
        <p className="text-base text-gray-600">
          Track your orders and view order history
        </p>
      </div>

      {/* Error State */}
      {error && !loading && (
        <Card padding="lg">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Orders
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              variant="primary"
              onClick={() => {
                setError(null);
                setLoading(true);
                // Retry fetching
                const fetchOrders = async () => {
                  try {
                    const [regularOrders, fishOrders] = await Promise.all([
                      getUserOrders().catch((err) => {
                        logger.error("Failed to fetch regular orders:", err);
                        return { success: false, orders: [] };
                      }),
                      getUserFishOrders().catch((err) => {
                        logger.error("Failed to fetch fish orders:", err);
                        return { success: false, orders: [] };
                      }),
                    ]);

                    const allOrders: OrderWithType[] = [
                      ...(regularOrders.orders || []).map((o: Order) => ({ ...o, isFishOrder: false })),
                      ...(fishOrders.orders || []).map((o: Order) => ({ ...o, isFishOrder: true })),
                    ].sort((a, b) => {
                      const dateA = new Date(a.createdAt || new Date().toISOString()).getTime();
                      const dateB = new Date(b.createdAt || new Date().toISOString()).getTime();
                      return dateB - dateA;
                    });

                    setOrders(allOrders);
                    setError(null);
                  } catch (err) {
                    logger.error("Failed to fetch orders:", err);
                    setError("Failed to load orders. Please try again later.");
                  } finally {
                    setLoading(false);
                  }
                };
                fetchOrders();
              }}
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Orders List */}
      {!error && (
        <>
          {orders.length === 0 ? (
            <Card padding="lg">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start shopping to see your orders here
                </p>
                <Link href="/products">
                  <Button variant="primary">Start Shopping</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order._id || ""}
                  order={order}
                  showDetails={true}
                  showInvoice={true}
                  showExpandableDetails={true}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Order Statistics */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 border-t-2 border-gray-200">
          <Card padding="lg" variant="elevated" className="bg-gradient-to-br from-blue-50 to-white shadow-md">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {orders.length}
              </div>
              <div className="text-base font-semibold text-blue-700">Total Orders</div>
            </div>
          </Card>
          <Card padding="lg" variant="elevated" className="bg-gradient-to-br from-green-50 to-white shadow-md">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {orders.filter((o) => o.status === "delivered").length}
              </div>
              <div className="text-base font-semibold text-green-700">Delivered</div>
            </div>
          </Card>
          <Card padding="lg" variant="elevated" className="bg-gradient-to-br from-amber-50 to-white shadow-md">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-2">
                {
                  orders.filter(
                    (o) => o.status === "processing" || o.status === "shipped"
                  ).length
                }
              </div>
              <div className="text-base font-semibold text-amber-700">In Progress</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

