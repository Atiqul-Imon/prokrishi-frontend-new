"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <Card padding="lg" className="max-w-md w-full">
        <div className="text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Order placed successfully
          </h2>

          <p className="text-gray-600 mb-4">
            Thank you for your order. We will confirm and process it shortly.
          </p>

          {orderId && (
            <p className="text-sm text-gray-500 mb-6">
              Order reference: <span className="font-semibold">{orderId}</span>
            </p>
          )}

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button variant="primary" className="w-full">
                Continue shopping
              </Button>
            </Link>

            <Link href="/account" className="block">
              <Button variant="outline" className="w-full">
                View orders (login required)
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, FileText, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getOrderDetails } from "@/app/utils/api";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push("/");
      return;
    }

    async function loadOrder() {
      if (!orderId) return;
      try {
        const res = await getOrderDetails(orderId);
        setOrder(res.order || res);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId, router]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-12 pb-20">
      <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for your order. We've received it and will process it soon.
            </p>
          </div>

          {/* Order Details Card */}
          {loading ? (
            <Card padding="lg">
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 mt-4">Loading order details...</p>
              </div>
            </Card>
          ) : order ? (
            <Card padding="lg" variant="elevated" className="mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Number</p>
                    <p className="text-lg font-bold text-gray-900">
                      #{order.invoiceNumber || order._id?.slice(-8) || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-green-600">
                      ৳{(order.totalAmount || order.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {order.items.slice(0, 5).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">
                            {item.name || item.productName} × {item.quantity}
                          </span>
                          <span className="font-semibold text-gray-900">
                            ৳{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 5 && (
                        <p className="text-xs text-gray-500 pt-2">
                          +{order.items.length - 5} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {order.shippingAddress && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery Address</h3>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.address}, {order.shippingAddress.upazila}, {order.shippingAddress.district}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Payment Method: <span className="font-semibold text-gray-900">{order.paymentMethod || "Cash on Delivery"}</span>
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="lg">
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Order details not found.</p>
                <Link href="/account">
                  <Button variant="primary">View My Orders</Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href={`/invoice/${orderId}?type=regular`} className="block">
              <Button variant="outline" className="w-full" size="lg">
                <FileText className="w-5 h-5 mr-2" />
                View Invoice
              </Button>
            </Link>
            <Link href="/account" className="block">
              <Button variant="outline" className="w-full" size="lg">
                <ShoppingBag className="w-5 h-5 mr-2" />
                My Orders
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="primary" className="w-full" size="lg">
                <Home className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Additional Info */}
          <Card padding="md" variant="default" className="mt-6 bg-green-50">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">What's Next?</p>
                <p className="text-sm text-gray-700">
                  You will receive an order confirmation email shortly. We'll notify you once your order is shipped.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white py-12">
          <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

