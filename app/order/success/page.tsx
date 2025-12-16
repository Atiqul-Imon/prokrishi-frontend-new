"use client";

import { CheckCircle, ShoppingBag, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";

import { useCart } from "@/app/context/CartContext";
import { logger } from "@/app/utils/logger";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function OrderSuccessPage({ searchParams }: Props) {
  // Initialize animation state to true for immediate animation on mount
  const [isAnimated] = useState(true);
  // Unwrap the Promise using React.use() for Next.js 15+
  const params = use(searchParams);
  const orderIdParam = params?.orderId;
  const orderId = Array.isArray(orderIdParam) ? orderIdParam[0] : orderIdParam || "";
  const { cart, clearCart } = useCart();

  useEffect(() => {
    // Safety check: Clear cart if it still has items (handles edge cases)
    // This ensures cart is cleared even if checkout didn't complete the clearing
    if (cart && cart.length > 0) {
      logger.info("Cart still has items on success page, clearing now");
      clearCart().catch((error) => {
        logger.error("Error clearing cart on success page:", error);
      });
    }
  }, [cart, clearCart]);

  // Calculate estimated delivery (2-3 days for Inside Dhaka, 4-5 days for Outside)
  const estimatedDelivery = "2-3 business days";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 via-white to-gray-50/30 flex items-center justify-center px-4 py-8">
      <Card 
        padding="lg" 
        className={`max-w-lg w-full shadow-2xl border border-gray-100 transition-all duration-500 ${
          isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="text-center">
          {/* Animated Success Icon */}
          <div className="mb-8 relative">
            <div 
              className={`mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl transition-all duration-700 ${
                isAnimated ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <CheckCircle 
                className={`h-12 w-12 text-white transition-all duration-500 ${
                  isAnimated ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
                style={{ transitionDelay: "500ms" }}
              />
            </div>
            {/* Ripple effect */}
            {isAnimated && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDelay: "800ms" }} />
              </div>
            )}
          </div>

          {/* Success Message */}
          <h2 className={`text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight transition-all duration-500 ${
            isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`} style={{ transitionDelay: "600ms" }}>
            Order Placed Successfully!
          </h2>

          <p className={`text-base text-gray-600 mb-6 font-medium transition-all duration-500 ${
            isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`} style={{ transitionDelay: "700ms" }}>
            Thank you for your order. We will confirm and process it shortly.
          </p>

          {/* Order Details Card */}
          {orderId && (
            <div className={`mb-6 transition-all duration-500 ${
              isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`} style={{ transitionDelay: "800ms" }}>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-gray-500 font-medium">Order Reference</p>
                </div>
                <p className="text-lg font-extrabold text-gray-900 tracking-tight font-mono">
                  {orderId}
                </p>
              </div>
            </div>
          )}

          {/* Estimated Delivery */}
          <div className={`mb-8 transition-all duration-500 ${
            isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`} style={{ transitionDelay: "900ms" }}>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-800">
                Estimated delivery: <span className="font-extrabold">{estimatedDelivery}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`space-y-3 transition-all duration-500 ${
            isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`} style={{ transitionDelay: "1000ms" }}>
            <Link href="/" className="block">
              <Button variant="primary" size="lg" className="w-full shadow-lg hover:shadow-xl transition-all duration-200 group">
                <span className="flex items-center justify-center gap-2">
                  Continue Shopping
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>

            <Link href="/account" className="block">
              <Button variant="outline" size="lg" className="w-full border-2 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200">
                View Orders
                {orderId && <span className="ml-2 text-xs text-gray-500">(login required)</span>}
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <p className={`mt-6 text-xs text-gray-500 font-medium transition-all duration-500 ${
            isAnimated ? "opacity-100" : "opacity-0"
          }`} style={{ transitionDelay: "1100ms" }}>
            You will receive an order confirmation email shortly
          </p>
        </div>
      </Card>
    </div>
  );
}

