"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/app/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import OrderItem from "./OrderItem";
import type { Order } from "@/types/models";

interface OrderCardProps {
  order: Order & { isFishOrder?: boolean };
  showDetails?: boolean;
  showInvoice?: boolean;
  showExpandableDetails?: boolean;
  onStatusChange?: (orderId: string, status: string) => void;
  className?: string;
}

const statusConfig = {
  processing: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    label: "Processing",
    badgeVariant: "warning" as const,
  },
  shipped: {
    icon: Truck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Shipped",
    badgeVariant: "warning" as const,
  },
  delivered: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Delivered",
    badgeVariant: "success" as const,
  },
  cancelled: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Cancelled",
    badgeVariant: "error" as const,
  },
};

/**
 * Reusable component for displaying an order card
 * Supports both customer-facing and admin views
 */
function getStatusConfig(status: string) {
  return (
    statusConfig[status as keyof typeof statusConfig] || statusConfig.processing
  );
}

export default function OrderCard({
  order,
  showDetails = true,
  showInvoice = true,
  showExpandableDetails = true,
  onStatusChange,
  className = "",
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const orderId = order._id || "";
  const orderItems = order.orderItems || [];
  const status = getStatusConfig(order.status || "processing");
  const StatusIcon = status.icon;

  return (
    <Card
      padding="lg"
      variant="elevated"
      className={`hover:shadow-lg transition-shadow ${className}`}
      aria-label={`Order ${order.invoiceNumber || orderId.slice(-8)}`}
    >
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div
            className={`p-3 ${status.bgColor} rounded-xl shadow-sm`}
            aria-hidden="true"
          >
            <StatusIcon size={22} className={status.color} />
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-900 mb-1">
              Order #{order.invoiceNumber || orderId.slice(-8)}
            </h4>
            <p className="text-sm text-gray-600">
              {formatDate(order.createdAt || new Date().toISOString())}
            </p>
          </div>
        </div>
        <div className="text-right sm:text-left sm:ml-auto">
          <div className="text-xl font-bold text-gray-900 mb-2">
            {formatCurrency(order.totalAmount || order.totalPrice || 0)}
          </div>
          <Badge variant={status.badgeVariant} size="md">
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Order Items */}
      {orderItems.length > 0 && (
        <div className="space-y-2.5 mb-5 bg-gray-50 rounded-lg p-4" role="list">
          {orderItems.slice(0, 3).map((item, index) => (
            <OrderItem
              key={index}
              name={item.name}
              quantity={item.quantity}
              price={item.price}
              className={index < orderItems.slice(0, 3).length - 1 ? "border-b border-gray-200 pb-2.5" : ""}
            />
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
        {showDetails && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <MapPin size={16} className="text-gray-500" aria-hidden="true" />
            <span className="truncate max-w-[250px] font-medium">
              {order.shippingAddress?.address || "Address not available"}
            </span>
          </div>
        )}
        <div className="flex gap-3">
          {showInvoice && (
            <Link
              href={`/invoice/${orderId}?type=${(order as Order & { isFishOrder?: boolean }).isFishOrder ? "fish" : "regular"}`}
              aria-label={`View invoice for order ${order.invoiceNumber || orderId.slice(-8)}`}
            >
              <Button variant="outline" size="sm" className="shadow-sm">
                <FileText size={16} className="mr-2" aria-hidden="true" />
                Invoice
              </Button>
            </Link>
          )}
          {showExpandableDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="shadow-sm"
              aria-expanded={isExpanded}
              aria-controls={`order-details-${orderId}`}
            >
              {isExpanded ? (
                <>
                  <EyeOff size={16} className="mr-2" aria-hidden="true" />
                  Hide
                </>
              ) : (
                <>
                  <Eye size={16} className="mr-2" aria-hidden="true" />
                  Details
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Order Details (Expandable) */}
      {showExpandableDetails && isExpanded && (
        <div
          id={`order-details-${orderId}`}
          className="mt-5 pt-5 border-t-2 border-gray-200"
          role="region"
          aria-label="Order details"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="md" variant="default" className="bg-gray-50">
              <h5 className="font-bold text-gray-900 mb-3 text-base">
                Delivery Information
              </h5>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={status.badgeVariant} size="sm">
                    {status.label}
                  </Badge>
                </div>
                {order.shippingAddress && (
                  <div className="text-gray-700">
                    <span className="font-medium">Address:</span>{" "}
                    {order.shippingAddress.address}, {order.shippingAddress.upazila},{" "}
                    {order.shippingAddress.district}
                  </div>
                )}
                <div className="text-gray-700">
                  <span className="font-medium">Payment:</span>{" "}
                  {order.paymentMethod || "Cash on Delivery"}
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
                    {formatCurrency(order.totalPrice || order.totalAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="text-green-600 font-semibold">
                    {formatCurrency(order.shippingFee || 0)}
                  </span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-gray-300 text-base">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-green-600">
                    {formatCurrency(order.totalAmount || order.totalPrice || 0)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </Card>
  );
}

