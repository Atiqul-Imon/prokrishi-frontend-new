"use client";

import React, { useEffect, useState } from "react";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  MapPin,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { getUserOrders, getUserFishOrders } from "@/app/utils/api";
import { logger } from "@/app/utils/logger";
import { formatCurrency, formatDate } from "@/app/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/types/models";

const statusConfig = {
  processing: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    label: "Processing",
  },
  shipped: {
    icon: Truck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Shipped",
  },
  delivered: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Delivered",
  },
  cancelled: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Cancelled",
  },
};

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const [regularOrders, fishOrders] = await Promise.all([
          getUserOrders().catch(() => ({ success: false, orders: [] })),
          getUserFishOrders().catch(() => ({ success: false, orders: [] })),
        ]);

        interface OrderWithType extends Order {
          isFishOrder: boolean;
        }

        const allOrders: OrderWithType[] = [
          ...(regularOrders.orders || []).map((o: Order) => ({ ...o, isFishOrder: false })),
          ...(fishOrders.orders || []).map((o: Order) => ({ ...o, isFishOrder: true })),
        ].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date).getTime();
          const dateB = new Date(b.createdAt || b.date).getTime();
          return dateB - dateA;
        });

        setOrders(allOrders);
      } catch (error) {
        logger.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);


  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
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

      {/* Orders List */}
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
          {orders.map((order) => {
            const status = getStatusConfig(order.status || "processing");
            const StatusIcon = status.icon;
            const orderId = order._id || order.id;
            const orderItems = order.items || order.products || [];

            return (
              <Card key={orderId} padding="lg" variant="elevated" className="hover:shadow-lg transition-shadow">
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${status.bgColor} rounded-xl shadow-sm`}>
                      <StatusIcon size={22} className={status.color} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 mb-1">
                        Order #{order.invoiceNumber || orderId.slice(-8)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt || order.date || new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:text-left sm:ml-auto">
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      {formatCurrency(order.totalAmount || order.total || 0)}
                    </div>
                    <Badge variant={status.label === "Delivered" ? "success" : status.label === "Cancelled" ? "error" : "warning"} size="md">
                      {status.label}
                    </Badge>
                  </div>
                </div>

                {/* Order Items */}
                {orderItems.length > 0 && (
                  <div className="space-y-2.5 mb-5 bg-gray-50 rounded-lg p-4">
                    {orderItems.slice(0, 3).map((item: { name?: string; productName?: string; quantity?: number; price?: number }, itemIndex: number) => (
                      <div
                        key={itemIndex}
                        className="flex justify-between items-center text-base"
                      >
                        <span className="text-gray-700 font-medium">
                          {item.name || item.productName} × {item.quantity}
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {formatCurrency((item.price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    ))}
                    {orderItems.length > 3 && (
                      <p className="text-sm text-gray-600 font-medium pt-2 border-t border-gray-200">
                        +{orderItems.length - 3} more items
                      </p>
                    )}
                  </div>
                )}

                {/* Order Footer */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-5 border-t-2 border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="truncate max-w-[250px] font-medium">
                      {order.shippingAddress?.address || order.address || "Address not available"}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href={`/invoice/${orderId}?type=${order.isFishOrder ? "fish" : "regular"}`}
                    >
                      <Button variant="outline" size="sm" className="shadow-sm">
                        <FileText size={16} className="mr-2" />
                        Invoice
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedOrder(
                          selectedOrder === orderId ? null : orderId
                        )
                      }
                      className="shadow-sm"
                    >
                      <Eye size={16} className="mr-2" />
                      {selectedOrder === orderId ? "Hide" : "Details"}
                    </Button>
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                {selectedOrder === orderId && (
                  <div className="mt-5 pt-5 border-t-2 border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card padding="md" variant="default" className="bg-gray-50">
                        <h5 className="font-bold text-gray-900 mb-3 text-base">
                          Delivery Information
                        </h5>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Status:</span>
                            <Badge variant={status.label === "Delivered" ? "success" : status.label === "Cancelled" ? "error" : "warning"} size="sm">
                              {status.label}
                            </Badge>
                          </div>
                          {order.shippingAddress && (
                            <div className="text-gray-700">
                              <span className="font-medium">Address:</span> {order.shippingAddress.address}, {order.shippingAddress.upazila}, {order.shippingAddress.district}
                            </div>
                          )}
                          <div className="text-gray-700">
                            <span className="font-medium">Payment:</span> {order.paymentMethod || "Cash on Delivery"}
                          </div>
                        </div>
                      </Card>
                      <Card padding="md" variant="default" className="bg-gray-50">
                        <h5 className="font-bold text-gray-900 mb-3 text-base">
                          Order Summary
                        </h5>
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-900 font-semibold">
                              {formatCurrency(order.subtotal || order.totalAmount || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Delivery:</span>
                            <span className="text-green-600 font-semibold">
                              {formatCurrency(order.shippingCost || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t border-gray-300 text-base">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-green-600">
                              {formatCurrency(order.totalAmount || order.total || 0)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
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

