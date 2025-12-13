"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "../context/CartContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { Trash2, Plus, Minus } from "lucide-react";
import { formatCurrency } from "@/app/utils";
import SwipeableCartItem from "@/components/SwipeableCartItem";

function CartContent() {
  const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();

  const hasItems = cart.length > 0;

  const summary = useMemo(() => {
    return {
      subtotal: cartTotal,
      shippingHint: "Inside Dhaka: ৳80 · Outside Dhaka: ৳150",
    };
  }, [cartTotal]);

  return (
    <div className="min-h-screen bg-white py-8 pb-24 md:pb-20">
      <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Your Cart</h1>
            <p className="text-gray-600 text-base">Review your items before checkout</p>
          </div>
          {hasItems && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>

        {!hasItems && (
          <Card padding="lg" variant="elevated">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛒</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Start adding products to your cart</p>
              <Link href="/products">
                <Button variant="primary">Browse Products</Button>
              </Link>
            </div>
          </Card>
        )}

        {hasItems && (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Cart Items */}
            <div className="space-y-4">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Cart Items ({cartCount})</h2>
              </div>
              {cart.map((item) => (
                <SwipeableCartItem
                  key={`${item.id || item._id}-${item.variantId || "default"}`}
                  item={item}
                  onRemove={() => removeFromCart(item.id || item._id, item.variantId)}
                  onUpdateQuantity={(delta) => {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    updateQuantity(item.id || item._id, newQuantity, item.variantId);
                  }}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>

            {/* Sticky Order Summary - Mobile */}
            {hasItems && (
              <div className="fixed bottom-16 left-0 right-0 z-[60] md:hidden bg-white border-t border-gray-200 shadow-lg">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm text-gray-600">Subtotal ({cartCount} items)</p>
                      <p className="text-xl font-bold text-emerald-700">
                        {formatCurrency(summary.subtotal)}
                      </p>
                    </div>
                    <Link href="/checkout" className="flex-shrink-0">
                      <Button variant="primary" size="lg" className="font-bold text-base px-6 py-3 min-h-[44px]">
                        Checkout
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-gray-500 text-center">{summary.shippingHint}</p>
                </div>
              </div>
            )}

            {/* Order Summary - Desktop */}
            <div className="lg:sticky lg:top-4 h-fit hidden md:block">
              <Card padding="lg" variant="elevated" className="shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-2">
                    <p className="text-base text-gray-600">Items ({cartCount})</p>
                    <p className="text-base font-semibold text-gray-900">{cartCount}</p>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <p className="text-base text-gray-600">Subtotal</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(summary.subtotal)}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-green-50 to-amber-50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-gray-700 text-center">
                        {summary.shippingHint}
                      </p>
                    </div>
                  </div>
                  <Link href="/checkout" className="block">
                    <Button variant="primary" size="lg" className="w-full text-base py-3">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center">
                    Secure checkout • Free returns
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ErrorBoundary>
      <CartContent />
    </ErrorBoundary>
  );
}
