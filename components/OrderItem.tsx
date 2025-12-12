"use client";

import React from "react";
import { formatCurrency } from "@/app/utils";

interface OrderItemProps {
  name: string;
  quantity: number;
  price: number;
  variantLabel?: string;
  className?: string;
}

/**
 * Reusable component for displaying a single order item
 */
function OrderItem({
  name,
  quantity,
  price,
  variantLabel,
  className = "",
}: OrderItemProps) {
  const totalPrice = price * quantity;

  return (
    <div
      className={`flex justify-between items-center text-base ${className}`}
      role="listitem"
    >
      <div className="flex-1 min-w-0">
        <span className="text-gray-700 font-medium block truncate">
          {name}
        </span>
        {variantLabel && (
          <span className="text-sm text-gray-500 mt-0.5 block">
            {variantLabel}
          </span>
        )}
        <span className="text-sm text-gray-500 mt-0.5">
          Quantity: {quantity}
        </span>
      </div>
      <div className="ml-4 text-right flex-shrink-0">
        <span className="text-gray-900 font-semibold block">
          {formatCurrency(totalPrice)}
        </span>
        <span className="text-xs text-gray-500">
          {formatCurrency(price)} each
        </span>
      </div>
    </div>
  );
}

export default React.memo(OrderItem);

