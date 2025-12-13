"use client";

import React, { useState, useRef } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/app/utils";
import { triggerHaptic, HapticType } from "@/app/utils/haptics";
import type { CartItem } from "@/types/models";

interface SwipeableCartItemProps {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (delta: number) => void;
  formatCurrency: (amount: number) => string;
}

export default function SwipeableCartItem({
  item,
  onRemove,
  onUpdateQuantity,
  formatCurrency,
}: SwipeableCartItemProps) {
  const [swipeStart, setSwipeStart] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const minSwipeDistance = 80; // Minimum distance to trigger delete
  const deleteThreshold = 100; // Distance to show delete action

  const handleTouchStart = (e: React.TouchEvent) => {
    setSwipeStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeStart === null) return;
    const currentX = e.touches[0].clientX;
    const diff = swipeStart - currentX;

    // Only allow left swipe (negative diff)
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, deleteThreshold));
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset >= minSwipeDistance) {
      // Trigger delete
      onRemove();
      setSwipeOffset(0);
    } else {
      // Snap back
      setSwipeOffset(0);
    }
    setSwipeStart(null);
  };

  const handleQuantityChange = (delta: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateQuantity(delta);
  };


  return (
    <div className="relative overflow-hidden">
      {/* Delete Action Background */}
      <div
        className={`absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-center transition-all duration-300 z-10 ${
          swipeOffset > 0 ? "w-20" : "w-0"
        }`}
      >
        <Trash2 className="w-6 h-6 text-white" />
      </div>

      {/* Cart Item */}
      <div
        ref={itemRef}
        className="relative transition-transform duration-300 touch-manipulation"
        style={{
          transform: `translateX(-${swipeOffset}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Card padding="lg" variant="elevated" className="hover:shadow-lg transition-shadow">
          <div className="flex gap-5">
            {/* Item Image - Larger on Mobile */}
            <div className="w-32 h-32 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 mb-1.5 leading-tight">
                {item.name}
              </h3>
              {item.variantSnapshot && (
                <p className="text-sm text-gray-600 mb-2">
                  {item.variantSnapshot.label || item.variantSnapshot.unit} —{" "}
                  {formatCurrency(item.variantSnapshot.price)}
                </p>
              )}
              {(item as any).isFishProduct && (
                <Badge variant="warning" size="sm" className="mb-3">
                  Fish product
                </Badge>
              )}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      triggerHaptic(HapticType.SELECTION);
                      handleQuantityChange(-1, e);
                    }}
                    className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-lg bg-gray-100 hover:bg-green-50 flex items-center justify-center transition-colors shadow-sm touch-manipulation active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-gray-700" />
                  </button>
                  <span className="px-4 py-2 rounded-lg bg-gray-50 text-base font-bold min-w-[3.5rem] text-center text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={(e) => {
                      triggerHaptic(HapticType.SELECTION);
                      handleQuantityChange(1, e);
                    }}
                    className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-lg bg-gray-100 hover:bg-green-50 flex items-center justify-center transition-colors shadow-sm touch-manipulation active:scale-95"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 mb-1">
                    {formatCurrency(
                      (item.variantSnapshot?.price || item.price) * item.quantity
                    )}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic(HapticType.MEDIUM);
                      onRemove();
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors min-h-[44px] px-2 touch-manipulation active:scale-95"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

