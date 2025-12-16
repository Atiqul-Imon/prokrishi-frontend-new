"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useFishCart } from "../context/FishCartContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import { Trash2, Plus, Minus, ShoppingCart, X } from "lucide-react";
import { formatCurrency } from "@/app/utils";

function CartContent() {
  const { cart, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const { fishCart, updateFishCartQuantity, removeFromFishCart, clearFishCart } = useFishCart();

  const hasItems = cart.length > 0 || fishCart.length > 0;

  const summary = useMemo(() => {
    return {
      subtotal: cartTotal,
      shippingHint: "Inside Dhaka: ৳80 · Outside Dhaka: ৳150",
    };
  }, [cartTotal]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white py-8 pb-24 md:pb-20 overflow-x-hidden w-full">
      <div className="w-full max-w-full mx-auto px-3 sm:px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
        {/* Header Section with Modern Design */}
        <div className="relative mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
                  Your Cart
                </h1>
                <p className="text-gray-600 text-base font-medium">Review your items before checkout</p>
              </div>
            </div>
            {hasItems && (
              <div className="flex gap-2">
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-all duration-200 border border-red-200/50 hover:border-red-300 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Regular Cart
                  </Button>
                )}
                {fishCart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFishCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-all duration-200 border border-red-200/50 hover:border-red-300 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Fish Cart
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {!hasItems && (
          <Card padding="lg" variant="elevated" className="shadow-md">
            <div className="text-center py-16">
              <div className="relative mx-auto mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <ShoppingCart className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-8 text-base">Start adding products to your cart to continue shopping</p>
              <Link href="/products">
                <Button variant="primary" size="lg" className="px-8">
                  Browse Products
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {hasItems && (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.length > 0 && (
                <>
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">Regular Products ({cart.length})</h2>
                  </div>
                  {cart.map((item) => (
                <Card key={`${item.id || item._id}-${item.variantId || "default"}`} padding="lg" variant="elevated" className="hover:shadow-xl transition-all duration-300 w-full max-w-full overflow-hidden border border-gray-100 hover:border-emerald-200">
                  <div className="flex gap-3 sm:gap-4 md:gap-5 w-full max-w-full">
                    {/* Item Image */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-md ring-1 ring-gray-200/50">
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
                    <div className="flex-1 min-w-0 max-w-full overflow-hidden pr-1 sm:pr-0">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 sm:mb-1.5 leading-tight break-words overflow-wrap-anywhere">
                        {item.name}
                      </h3>
                      {item.variantSnapshot && (
                        <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 break-words overflow-wrap-anywhere">
                          {item.variantSnapshot.label || item.variantSnapshot.unit} —{" "}
                          {formatCurrency(item.variantSnapshot.price)}
                        </p>
                      )}
                      {(item as any).isFishProduct && (
                        <Badge variant="warning" size="sm" className="mb-2 sm:mb-3">
                          Fish product
                        </Badge>
                      )}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mt-3 sm:mt-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={() => {
                              const newQuantity = Math.max(1, item.quantity - 1);
                              updateQuantity(item.id || item._id, newQuantity, item.variantId);
                            }}
                            className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg bg-gray-100 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent flex items-center justify-center transition-all duration-200 shadow-sm touch-manipulation active:scale-95"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                          </button>
                          <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 text-sm sm:text-base font-bold min-w-[2.5rem] sm:min-w-[3.5rem] text-center text-gray-900 ring-1 ring-gray-200/50">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              const newQuantity = item.quantity + 1;
                              updateQuantity(item.id || item._id, newQuantity, item.variantId);
                            }}
                            className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg bg-gray-100 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent flex items-center justify-center transition-all duration-200 shadow-sm touch-manipulation active:scale-95"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                          </button>
                        </div>
                        <div className="text-right w-full sm:w-auto">
                          <p className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-1.5">
                            {formatCurrency(
                              (item.variantSnapshot?.price || item.price) * item.quantity
                            )}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.id || item._id, item.variantId)}
                            className="group/remove text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium transition-all duration-200 min-h-[36px] sm:min-h-[44px] px-2 sm:px-3 py-1 rounded-md hover:bg-red-50 touch-manipulation active:scale-95 inline-flex items-center gap-1"
                          >
                            <X className="w-3 h-3 opacity-0 group-hover/remove:opacity-100 transition-opacity" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
                  ))}
                </>
              )}

              {/* Fish Cart Items */}
              {fishCart.length > 0 && (
                <>
                  <div className="mb-2 mt-6">
                    <h2 className="text-lg font-semibold text-gray-900">Fish Products ({fishCart.length})</h2>
                  </div>
                  {fishCart.map((item) => {
                    const fishProductId = typeof item.fishProduct === 'string' 
                      ? item.fishProduct 
                      : (item.fishProduct._id || item.fishProduct.id || '');
                    if (!fishProductId) return null; // Skip if no ID
                    
                    const fishProductImage = typeof item.fishProduct === 'string' 
                      ? undefined 
                      : (item.fishProduct.image || item.fishProduct.images?.[0]);
                    const fishProductName = typeof item.fishProduct === 'string' 
                      ? 'Fish Product' 
                      : (item.fishProduct.name || 'Fish Product');
                    return (
                      <Card key={`${fishProductId}-${item.sizeCategoryId}`} padding="lg" variant="elevated" className="hover:shadow-xl transition-all duration-300 w-full max-w-full overflow-hidden border border-amber-100 hover:border-amber-200">
                        <div className="flex gap-3 sm:gap-4 md:gap-5 w-full max-w-full">
                          {/* Item Image */}
                          <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-24 md:h-24 lg:w-28 lg:h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-md ring-1 ring-gray-200/50">
                            {fishProductImage ? (
                              <img
                                src={fishProductImage}
                                alt={fishProductName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0 max-w-full overflow-hidden pr-1 sm:pr-0">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 sm:mb-1.5 leading-tight break-words overflow-wrap-anywhere">
                              {fishProductName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 break-words overflow-wrap-anywhere">
                              {item.sizeCategoryLabel} — {formatCurrency(item.pricePerKg)}/kg
                            </p>
                            <Badge variant="warning" size="sm" className="mb-2 sm:mb-3">
                              🐟 Fish Product
                            </Badge>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-2">
                              <p className="text-xs text-gray-600 italic">
                                মাছের প্রকৃত ওজন হিসাবে মোট দাম জানানো হবে
                              </p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-2">
                              <p className="text-xs text-amber-800">
                                মাছ শুধুমাত্র ঢাকা শহরের ভিতরে ডেলিভারি করা হবে
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mt-3 sm:mt-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                  onClick={() => {
                                    const newQuantity = Math.max(1, (item.quantity || 1) - 1);
                                    updateFishCartQuantity(fishProductId, item.sizeCategoryId, newQuantity);
                                  }}
                                  className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg bg-gray-100 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent flex items-center justify-center transition-all duration-200 shadow-sm touch-manipulation active:scale-95"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                                </button>
                                <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 text-sm sm:text-base font-bold min-w-[2.5rem] sm:min-w-[3.5rem] text-center text-gray-900 ring-1 ring-gray-200/50">
                                  {item.quantity || 1}
                                </span>
                                <button
                                  onClick={() => {
                                    const newQuantity = (item.quantity || 1) + 1;
                                    updateFishCartQuantity(fishProductId, item.sizeCategoryId, newQuantity);
                                  }}
                                  className="w-9 h-9 sm:w-10 sm:h-10 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg bg-gray-100 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent flex items-center justify-center transition-all duration-200 shadow-sm touch-manipulation active:scale-95"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                                </button>
                              </div>
                              <div className="text-right w-full sm:w-auto">
                                <p className="text-xs sm:text-sm text-gray-500 italic mb-1 sm:mb-1.5">
                                  Price to be determined
                                </p>
                                <button
                                  onClick={() => removeFromFishCart(fishProductId, item.sizeCategoryId)}
                                  className="group/remove text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium transition-all duration-200 min-h-[36px] sm:min-h-[44px] px-2 sm:px-3 py-1 rounded-md hover:bg-red-50 touch-manipulation active:scale-95 inline-flex items-center gap-1"
                                >
                                  <X className="w-3 h-3 opacity-0 group-hover/remove:opacity-100 transition-opacity" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>

            {/* Sticky Order Summary - Mobile */}
            {hasItems && (
              <div className="fixed bottom-16 left-0 right-0 z-[60] md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-2xl w-full max-w-full overflow-x-hidden animate-in slide-in-from-bottom duration-300">
                <div className="px-3 sm:px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Subtotal ({cartCount} items)</p>
                      <p className="text-xl font-extrabold text-emerald-700 tracking-tight">
                        {formatCurrency(summary.subtotal)}
                      </p>
                      {fishCart.length > 0 && (
                        <p className="text-xs text-gray-500 italic mt-0.5">
                          + {fishCart.length} fish product(s) - price to be determined
                        </p>
                      )}
                    </div>
                    <Link href="/checkout" className="flex-shrink-0">
                      <Button variant="primary" size="lg" className="font-bold text-base px-6 py-3 min-h-[44px] shadow-lg hover:shadow-xl transition-shadow">
                        Checkout
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-gray-500 text-center font-medium">{summary.shippingHint}</p>
                </div>
              </div>
            )}

            {/* Order Summary - Desktop */}
            <div className="lg:sticky lg:top-4 h-fit hidden md:block">
              <Card padding="lg" variant="elevated" className="shadow-xl border border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6 tracking-tight">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-gray-50/50 transition-colors">
                    <p className="text-base text-gray-600 font-medium">Items ({cartCount + fishCart.length})</p>
                    <p className="text-base font-bold text-gray-900">{cartCount + fishCart.length}</p>
                  </div>
                  {cart.length > 0 && (
                    <div className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-gray-50/50 transition-colors">
                      <p className="text-base text-gray-600 font-medium">Regular Products</p>
                      <p className="text-base font-bold text-gray-900">{cart.length}</p>
                    </div>
                  )}
                  {fishCart.length > 0 && (
                    <>
                      <div className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-gray-50/50 transition-colors">
                        <p className="text-base text-gray-600 font-medium">Fish Products</p>
                        <p className="text-base font-bold text-gray-900">{fishCart.length}</p>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600 italic">
                          মাছের প্রকৃত ওজন হিসাবে মোট দাম জানানো হবে
                        </p>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-gray-50/50 transition-colors">
                    <p className="text-base text-gray-600 font-medium">Subtotal</p>
                    <p className="text-lg font-extrabold text-gray-900">{formatCurrency(summary.subtotal)}</p>
                  </div>
                  {fishCart.length > 0 && (
                    <div className="flex items-center justify-between py-2.5 px-1 rounded-lg">
                      <p className="text-sm text-gray-500 font-medium">Fish Products</p>
                      <p className="text-sm font-semibold text-gray-500 italic">Price to be determined</p>
                    </div>
                  )}
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-amber-50 rounded-xl p-4 mb-4 ring-1 ring-emerald-100/50">
                      <p className="text-sm font-semibold text-gray-700 text-center">
                        {summary.shippingHint}
                      </p>
                    </div>
                  </div>
                  <Link href="/checkout" className="block">
                    <Button variant="primary" size="lg" className="w-full text-base py-3 shadow-lg hover:shadow-xl transition-all duration-200">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center font-medium">
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
