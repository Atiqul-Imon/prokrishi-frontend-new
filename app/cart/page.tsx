"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "../context/CartContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartPage() {
  const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();

  const hasItems = cart.length > 0;

  const summary = useMemo(() => {
    return {
      subtotal: cartTotal,
      shippingHint: "Inside Dhaka: ৳80 · Outside Dhaka: ৳150",
    };
  }, [cartTotal]);

  return (
    <div className="min-h-screen bg-white py-8 pb-20">
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
                <Card key={`${item.id || item._id}-${item.variantId || "default"}`} padding="lg" variant="elevated" className="hover:shadow-lg transition-shadow">
                  <div className="flex gap-5">
                    {/* Item Image */}
                    <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
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
                      <h3 className="font-semibold text-lg text-gray-900 mb-1.5 leading-tight">{item.name}</h3>
                      {item.variantSnapshot && (
                        <p className="text-sm text-gray-600 mb-2">
                          {item.variantSnapshot.label || item.variantSnapshot.unit} — ৳{item.variantSnapshot.price.toLocaleString()}
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
                            onClick={() => updateQuantity(item.id || item._id, Math.max(1, item.quantity - 1), item.variantId)}
                            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-green-50 flex items-center justify-center transition-colors shadow-sm"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 text-gray-700" />
                          </button>
                          <span className="px-4 py-2 rounded-lg bg-gray-50 text-base font-bold min-w-[3.5rem] text-center text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id || item._id, item.quantity + 1, item.variantId)}
                            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-green-50 flex items-center justify-center transition-colors shadow-sm"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 mb-1">
                            ৳{((item.variantSnapshot?.price || item.price) * item.quantity).toLocaleString()}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id || item._id, item.variantId)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-4 h-fit">
              <Card padding="lg" variant="elevated" className="shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between py-2">
                    <p className="text-base text-gray-600">Items ({cartCount})</p>
                    <p className="text-base font-semibold text-gray-900">{cartCount}</p>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <p className="text-base text-gray-600">Subtotal</p>
                    <p className="text-lg font-bold text-gray-900">৳{summary.subtotal.toLocaleString()}</p>
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
