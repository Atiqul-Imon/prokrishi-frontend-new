"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrder, createPaymentSession, getShippingQuote, validateCartApi } from "../utils/api";
import { fishOrderApi } from "../utils/fishApi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

type Zone = "inside_dhaka" | "outside_dhaka" | null;

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [selectedZone, setSelectedZone] = useState<Zone>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const selectedPayment = "cod"; // Only COD is available
  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    division: "",
    district: "",
    upazila: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [validationChanges, setValidationChanges] = useState<string | null>(null);

  const isFish = (item: any) =>
    item?.isFishProduct === true ||
    (item?.sizeCategories && Array.isArray(item.sizeCategories) && item.sizeCategories.length > 0);

  const fishProducts = useMemo(() => cart.filter((i) => isFish(i)), [cart]);
  const regularProducts = useMemo(() => cart.filter((i) => !isFish(i)), [cart]);

  // Fetch shipping quote when zone is selected and cart has items
  useEffect(() => {
    const fetchShippingQuote = async () => {
      if (!selectedZone || cart.length === 0) {
        setShippingFee(0);
        return;
      }

      // Need at least a basic address for shipping quote
      if (!address.address || address.address.trim().length < 2) {
        // Use a placeholder address for quote calculation
        const placeholderAddress = {
          address: selectedZone === "inside_dhaka" ? "Dhaka" : "Outside Dhaka",
          ...(selectedZone === "outside_dhaka" && {
            division: address.division || "Dhaka",
            district: address.district || "Dhaka",
            upazila: address.upazila || "Dhaka",
          }),
        };

        try {
          setShippingLoading(true);
          const quote = await getShippingQuote({
            orderItems: cart.map((item) => ({
              product: item.id || item._id,
              quantity: item.quantity,
              variantId: item.variantId,
            })),
            shippingAddress: {
              address: placeholderAddress.address,
              ...(placeholderAddress.division && {
                division: placeholderAddress.division,
                district: placeholderAddress.district,
                upazila: placeholderAddress.upazila,
              }),
            },
            shippingZone: selectedZone,
          });
          setShippingFee(quote.shippingFee || 0);
        } catch (err: any) {
          console.error("Failed to get shipping quote:", err);
          // Fallback to flat rates if quote fails
          setShippingFee(selectedZone === "inside_dhaka" ? 80 : 150);
        } finally {
          setShippingLoading(false);
        }
      } else {
        // Use actual address when available
        const shippingAddress =
          selectedZone === "inside_dhaka"
            ? {
                name: address.name || "Customer",
                phone: address.phone || "",
                address: address.address,
              }
            : {
                name: address.name || "Customer",
                phone: address.phone || "",
                address: address.address,
                division: address.division,
                district: address.district,
                upazila: address.upazila,
              };

        try {
          setShippingLoading(true);
          const quote = await getShippingQuote({
            orderItems: cart.map((item) => ({
              product: item.id || item._id,
              quantity: item.quantity,
              variantId: item.variantId,
            })),
            shippingAddress: {
              name: shippingAddress.name,
              phone: shippingAddress.phone,
              address: shippingAddress.address,
              ...(shippingAddress.division && {
                division: shippingAddress.division,
                district: shippingAddress.district,
                upazila: shippingAddress.upazila,
              }),
            },
            shippingZone: selectedZone,
          });
          setShippingFee(quote.shippingFee || 0);
        } catch (err: any) {
          console.error("Failed to get shipping quote:", err);
          // Fallback to flat rates if quote fails
          setShippingFee(selectedZone === "inside_dhaka" ? 80 : 150);
        } finally {
          setShippingLoading(false);
        }
      }
    };

    fetchShippingQuote();
  }, [selectedZone, cart, address.address, address.division, address.district, address.upazila]);

  const total = cartTotal + shippingFee;

  async function handlePlaceOrder() {
    setMessage(null);
    setValidationChanges(null);
    if (!selectedZone) {
      setMessage("Select delivery zone (Inside Dhaka or Outside Dhaka).");
      return;
    }
    // Validate required fields
    if (!address.name || !address.phone || !address.address) {
      setMessage("Please fill name, phone, and address.");
      return;
    }

    // Validate zone-specific fields
    if (selectedZone === "outside_dhaka") {
      if (!address.division || !address.district || !address.upazila) {
        setMessage("Please fill division, district, and upazila for outside Dhaka delivery.");
        return;
      }
    }
    setIsSubmitting(true);
    try {
      let regularOrderId: string | null = null;
      let fishOrderId: string | null = null;

      // Build shipping address based on selected zone
      const shippingAddress =
        selectedZone === "inside_dhaka"
          ? {
              name: address.name,
              phone: address.phone,
              address: address.address,
            }
          : {
              name: address.name,
              phone: address.phone,
              address: address.address,
              division: address.division,
              district: address.district,
              upazila: address.upazila,
            };

      // Get final shipping quote before placing order
      let finalShippingFee = shippingFee;
      try {
        const finalQuote = await getShippingQuote({
          orderItems: cart.map((item) => ({
            product: item.id || item._id,
            quantity: item.quantity,
            variantId: item.variantId,
          })),
          shippingAddress: {
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            address: shippingAddress.address,
            ...(shippingAddress.division && {
              division: shippingAddress.division,
              district: shippingAddress.district,
              upazila: shippingAddress.upazila,
            }),
          },
          shippingZone: selectedZone,
        });
        finalShippingFee = finalQuote.shippingFee || shippingFee;
      } catch (err) {
        console.error("Failed to get final shipping quote, using cached value:", err);
      }

      // Pre-validate cart server-side
      const validatePayload = {
        orderItems: cart.map((item) => ({
          product: item.id || item._id,
          quantity: item.quantity,
          variantId: item.variantId,
          name: item.name,
          price: item.variantSnapshot?.price || item.price,
        })),
      };
      const validation = await validateCartApi(validatePayload);
      if (validation?.hasChanges) {
        const unavailable = validation.items?.filter((i: any) => !i.available) || [];
        const reduced = validation.items?.filter((i: any) => i.available && i.finalQty !== i.requestedQty) || [];
        let msg = "We updated your cart:";
        if (unavailable.length > 0) {
          msg += ` ${unavailable.length} item(s) unavailable.`;
        }
        if (reduced.length > 0) {
          msg += ` Quantities adjusted for ${reduced.length} item(s).`;
        }
        setValidationChanges(msg);
      }

      const validatedTotal =
        typeof validation?.totalPrice === "number" ? validation.totalPrice : cartTotal;

      if (regularProducts.length > 0) {
        const regularOrderTotalPrice = validatedTotal;

        const regularOrderData = {
          orderItems: regularProducts.map((item) => ({
            product: item.id || item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.variantSnapshot?.price || item.price,
            variantId: item.variantId,
          })),
          shippingAddress,
          paymentMethod: selectedPayment === "cod" ? "Cash on Delivery" : "Online Payment",
          totalPrice: regularOrderTotalPrice,
          idempotencyKey: crypto.randomUUID(),
          // Don't send totalAmount - let backend calculate it
          // Don't send shippingFee - backend will recalculate based on weight
          shippingZone: selectedZone,
          ...(!user
            ? {
                guestInfo: {
                  name: address.name,
                  email: "",
                  phone: address.phone,
                },
              }
            : {}),
        };
        const regularRes: any = await placeOrder(regularOrderData);
        // Extract order ID from nested response
        regularOrderId = regularRes._id || regularRes.order?._id || regularRes.data?.order?._id || null;
      }

      if (fishProducts.length > 0) {
        const fishOrderItems = fishProducts.map((item) => {
          let sizeCategoryId = item.variantId || (item.variantSnapshot as any)?._id;
          if (!sizeCategoryId && (item as any).sizeCategories && Array.isArray((item as any).sizeCategories)) {
            const def =
              (item as any).sizeCategories.find((sc: any) => sc.isDefault) || (item as any).sizeCategories[0];
            if (def) sizeCategoryId = def._id;
          }
          if (!sizeCategoryId) throw new Error(`Size category missing for ${item.name}`);
          return {
            fishProduct: item.id || item._id,
            sizeCategoryId,
            requestedWeight: item.quantity,
            notes: item.name,
          };
        });

        const fishOrderTotalPrice = fishProducts.reduce(
          (sum, item) => sum + (item.variantSnapshot?.price || item.price) * item.quantity,
          0
        );

        // For fish orders, shipping is flat rate based on zone
        const fishShippingFee = selectedZone === "inside_dhaka" ? 80 : 150;

        const fishOrderData = {
          orderItems: fishOrderItems,
          shippingAddress,
          paymentMethod: selectedPayment === "cod" ? "Cash on Delivery" : "Online Payment",
          totalPrice: fishOrderTotalPrice,
          // Add totalAmount for fish orders (totalPrice + flat shipping fee)
          totalAmount: fishOrderTotalPrice + fishShippingFee,
          shippingZone: selectedZone,
          ...(!user
            ? {
                guestInfo: {
                  name: address.name,
                  email: "",
                  phone: address.phone,
                },
              }
            : {}),
        };
        const fishRes: any = await fishOrderApi.create(fishOrderData);
        // Extract order ID from nested response
        fishOrderId = fishRes?._id || fishRes?.fishOrder?._id || fishRes?.data?.fishOrder?._id || null;
      }

      const primaryOrderId = regularOrderId || fishOrderId;

      // Only COD is available, so proceed directly to success

      clearCart();
      setMessage("Order placed successfully.");
      if (primaryOrderId) {
        window.location.href = `/order/success?orderId=${primaryOrderId}`;
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to place order.";
      setMessage(errorMessage);
      // If price mismatch error, show helpful message
      if (errorMessage.includes("Price mismatch") || errorMessage.includes("price")) {
        setMessage(
          "There was a price calculation error. Please refresh the page and try again. If the problem persists, contact support."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white py-8 pb-20">
      <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600 text-base">Complete your order</p>
          </div>
          <Link href="/cart">
            <Button variant="ghost" size="sm">← Back to Cart</Button>
          </Link>
        </div>

        {cart.length === 0 && (
          <Card padding="lg" variant="elevated">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Your cart is empty.</p>
              <Link href="/products">
                <Button variant="primary">Browse Products</Button>
              </Link>
            </div>
          </Card>
        )}

        {cart.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              {/* Delivery Zone */}
              <Card padding="lg" variant="elevated" className="shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-amber-500 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Zone</h2>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => setSelectedZone("inside_dhaka")}
                    className={`rounded-xl px-5 py-4 text-base font-semibold transition-all shadow-sm ${
                      selectedZone === "inside_dhaka"
                        ? "bg-green-50 text-green-800 ring-2 ring-green-500 ring-offset-2"
                        : "hover:bg-green-50/50 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="text-lg font-bold">Inside Dhaka</div>
                    <div className="text-sm font-normal text-gray-600 mt-1">
                      {shippingLoading && selectedZone === "inside_dhaka" ? "Calculating..." : "From ৳80"}
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedZone("outside_dhaka")}
                    className={`rounded-xl px-5 py-4 text-base font-semibold transition-all shadow-sm ${
                      selectedZone === "outside_dhaka"
                        ? "bg-green-50 text-green-800 ring-2 ring-green-500 ring-offset-2"
                        : "hover:bg-green-50/50 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="text-lg font-bold">Outside Dhaka</div>
                    <div className="text-sm font-normal text-gray-600 mt-1">
                      {shippingLoading && selectedZone === "outside_dhaka" ? "Calculating..." : "From ৳150"}
                    </div>
                  </button>
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  Shipping calculated based on product weight. Fish and regular items are handled automatically.
                </p>
              </Card>

              {/* Shipping Address */}
              <Card padding="lg" variant="elevated" className="shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-amber-500 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Full Name"
                      required
                      placeholder="Full name"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                    />
                    <Input
                      label="Phone Number"
                      required
                      type="tel"
                      placeholder="Phone number"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    />
                  </div>

                  {selectedZone === "inside_dhaka" ? (
                    /* Inside Dhaka - Simple Address Field */
                    <Input
                      label="Full Address"
                      required
                      placeholder="Enter your complete address in Dhaka"
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                    />
                  ) : selectedZone === "outside_dhaka" ? (
                    /* Outside Dhaka - Full Address Form */
                    <>
                      <Input
                        label="Division"
                        required
                        placeholder="Division"
                        value={address.division}
                        onChange={(e) => setAddress({ ...address, division: e.target.value })}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="District"
                          required
                          placeholder="District"
                          value={address.district}
                          onChange={(e) => setAddress({ ...address, district: e.target.value })}
                        />
                        <Input
                          label="Upazila/Thana"
                          required
                          placeholder="Upazila/Thana"
                          value={address.upazila}
                          onChange={(e) => setAddress({ ...address, upazila: e.target.value })}
                        />
                      </div>
                      <Input
                        label="Street Address"
                        required
                        placeholder="House/Street address"
                        value={address.address}
                        onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      />
                    </>
                  ) : (
                    /* No Zone Selected - Show Message */
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800">
                        Please select a delivery zone first to enter your address.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Payment Method */}
              <Card padding="lg" variant="elevated" className="shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-amber-500 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-2xl">💵</span>
                    </div>
                    <div>
                      <div className="font-bold text-green-800 text-lg">Cash on Delivery</div>
                      <div className="text-sm text-green-700 mt-1">Pay when your order is delivered</div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-3">
                  We currently accept Cash on Delivery (COD) only. Payment will be collected when your order arrives.
                </p>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-4 h-fit">
              <Card padding="lg" variant="elevated" className="shadow-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <p className="text-base text-gray-600">Items</p>
                    <p className="text-base font-semibold text-gray-900">{cart.length}</p>
                  </div>
                  {regularProducts.length > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <p className="text-sm text-gray-500">Regular Products</p>
                      <p className="text-sm font-medium text-gray-700">{regularProducts.length}</p>
                    </div>
                  )}
                  {fishProducts.length > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <p className="text-sm text-gray-500">Fish Products</p>
                      <p className="text-sm font-medium text-gray-700">{fishProducts.length}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <p className="text-base text-gray-600">Subtotal</p>
                    <p className="text-lg font-bold text-gray-900">৳{cartTotal.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <p className="text-base text-gray-600">Shipping</p>
                    <p className="text-lg font-bold text-gray-900">
                      {shippingLoading ? (
                        <span className="text-gray-400">Calculating...</span>
                      ) : selectedZone ? (
                        `৳${shippingFee.toLocaleString()}`
                      ) : (
                        <span className="text-red-500">Select zone</span>
                      )}
                    </p>
                  </div>
                  <div className="pt-4 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between text-xl font-bold text-gray-900 mb-4">
                      <p>Total</p>
                      <p className="text-green-600">
                        {shippingLoading ? (
                          <span className="text-gray-400">Calculating...</span>
                        ) : (
                          `৳${total.toLocaleString()}`
                        )}
                      </p>
                    </div>
                  </div>
                  {message && (
                    <div
                      className={`p-4 rounded-lg text-sm font-medium ${
                        message.includes("success") || message.includes("successfully")
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {message}
                    </div>
                  )}
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full text-base py-3 mt-2"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || !selectedZone || cart.length === 0 || shippingLoading}
                    isLoading={isSubmitting}
                  >
                    Place Order
                  </Button>
                  <p className="text-xs text-gray-500 text-center">Secure checkout • Free returns</p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
