"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { placeOrder, getShippingQuote, validateCartApi } from "../utils/api";
import { fishOrderApi } from "../utils/fishApi";
import { logger } from "../utils/logger";
import { handleApiError, retryWithBackoff } from "../utils/errorHandler";
import { formatCurrency, formatPhone } from "@/app/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";
import CheckoutProgress from "@/components/CheckoutProgress";
import type { CartItem, SizeCategory } from "@/types/models";

type Zone = "inside_dhaka" | "outside_dhaka" | null;

interface ValidationItem {
  available: boolean;
  finalQty?: number;
  requestedQty?: number;
  [key: string]: unknown;
}

interface OrderResponse {
  _id?: string;
  order?: { _id?: string };
  data?: { order?: { _id?: string }; fishOrder?: { _id?: string } };
  fishOrder?: { _id?: string };
  [key: string]: unknown;
}

function CheckoutContent() {
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

  const isFish = (item: CartItem): boolean =>
    Boolean(item?.isFishProduct === true ||
    (item?.sizeCategories && Array.isArray(item.sizeCategories) && item.sizeCategories.length > 0));

  const fishProducts = useMemo(() => cart.filter((i) => isFish(i)), [cart]);
  const regularProducts = useMemo(() => cart.filter((i) => !isFish(i)), [cart]);

  // Auto-select Inside Dhaka if fish products are in cart
  useEffect(() => {
    if (fishProducts.length > 0 && selectedZone !== "inside_dhaka") {
      setSelectedZone("inside_dhaka");
      setMessage(null); // Clear any previous messages
    }
  }, [fishProducts.length, selectedZone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch shipping quote when zone is selected and cart has items
  useEffect(() => {
    const fetchShippingQuote = async () => {
      if (!selectedZone || cart.length === 0) {
        setShippingFee(0);
        return;
      }
      
      // If fish products are in cart, force Inside Dhaka
      if (fishProducts.length > 0) {
        if (selectedZone !== "inside_dhaka") {
          setSelectedZone("inside_dhaka");
          return; // Will re-trigger this effect with correct zone
        }
      }

      // Always use placeholder address for quote calculation
      // Shipping cost is based on zone and product weight, not the specific address
      // Actual address is only needed when placing the order, not for quote calculation
      const placeholderAddress = {
        address: selectedZone === "inside_dhaka" ? "Dhaka" : "Outside Dhaka",
        ...(selectedZone === "outside_dhaka" && {
          division: "Dhaka",
          district: "Dhaka",
          upazila: "Dhaka",
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
      } catch (err) {
        logger.warn("Failed to get shipping quote, using fallback rates:", err);
        // Fallback to flat rates if quote fails
        setShippingFee(selectedZone === "inside_dhaka" ? 80 : 150);
      } finally {
        setShippingLoading(false);
      }
    };

    fetchShippingQuote();
  }, [selectedZone, cart.length, fishProducts.length]); // Only depend on zone and cart, not address fields

  const total = cartTotal + shippingFee;

  async function handlePlaceOrder() {
    setMessage(null);
    setValidationChanges(null);
    if (!selectedZone) {
      setMessage("Select delivery zone (Inside Dhaka or Outside Dhaka).");
      return;
    }
    
    // Fish products can only be ordered to Inside Dhaka
    if (fishProducts.length > 0 && selectedZone !== "inside_dhaka") {
      setMessage("Fish products can only be delivered to Inside Dhaka. Please select 'Inside Dhaka' or remove fish products from your cart.");
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

      // Final validation: Fish products require Inside Dhaka
      if (fishProducts.length > 0 && selectedZone !== "inside_dhaka") {
        setMessage("Fish products can only be delivered to Inside Dhaka. Please select 'Inside Dhaka' as your delivery zone.");
        setIsSubmitting(false);
        return;
      }

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
        logger.warn("Failed to get final shipping quote, using cached value:", err);
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
        const items = (validation.items || []) as ValidationItem[];
        const unavailable = items.filter((i: ValidationItem) => !i.available);
        const reduced = items.filter((i: ValidationItem) => i.available && i.finalQty !== i.requestedQty);
        let msg = "We updated your cart:";
        if (unavailable.length > 0) {
          msg += ` ${unavailable.length} item(s) unavailable.`;
        }
        if (reduced.length > 0) {
          msg += ` Quantities adjusted for ${reduced.length} item(s).`;
        }
        setValidationChanges(msg);
      }

      // Calculate totals separately for regular and fish products
      const regularProductsTotal = regularProducts.reduce(
        (sum, item) => {
          const price = item.variantSnapshot?.price || item.price || 0;
          const quantity = item.quantity || 0;
          return sum + (Number(price) || 0) * (Number(quantity) || 0);
        },
        0
      );
      const fishProductsTotal = fishProducts.reduce(
        (sum, item) => {
          const price = item.variantSnapshot?.price || item.price || 0;
          const quantity = item.quantity || 0;
          return sum + (Number(price) || 0) * (Number(quantity) || 0);
        },
        0
      );

      // Validate that we have valid totals
      if (regularProducts.length > 0 && regularProductsTotal <= 0) {
        throw new Error("Invalid product prices detected. Please refresh the page and try again.");
      }
      if (fishProducts.length > 0 && fishProductsTotal <= 0) {
        throw new Error("Invalid fish product prices detected. Please refresh the page and try again.");
      }

      // Use validated total if available, otherwise use calculated totals
      const validatedTotal =
        typeof validation?.totalPrice === "number" && validation.totalPrice > 0
          ? validation.totalPrice
          : cartTotal;
      
      // Adjust validated total proportionally if validation changed prices
      // Handle division by zero: if cartTotal is 0, use 1 (no adjustment)
      const validationAdjustment =
        cartTotal > 0 && validatedTotal !== cartTotal
          ? Math.max(0, validatedTotal / cartTotal) // Ensure non-negative
          : 1;

      // Ensure adjustment is valid (not NaN or Infinity)
      const safeValidationAdjustment = Number.isFinite(validationAdjustment) ? validationAdjustment : 1;

      if (regularProducts.length > 0) {
        const regularOrderTotalPrice = regularProductsTotal * safeValidationAdjustment;

        // Validate totalPrice before sending
        if (!Number.isFinite(regularOrderTotalPrice) || regularOrderTotalPrice <= 0) {
          logger.error("Invalid regular order total price:", {
            regularProductsTotal,
            safeValidationAdjustment,
            regularOrderTotalPrice,
            cartTotal,
            validatedTotal,
          });
          throw new Error(
            "Invalid order total calculated. Please refresh the page and try again. If the problem persists, contact support."
          );
        }

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
        const regularRes = await placeOrder(regularOrderData) as OrderResponse;
        // Extract order ID from nested response
        regularOrderId = regularRes._id || regularRes.order?._id || regularRes.data?.order?._id || null;
      }

      if (fishProducts.length > 0) {
        const fishOrderItems = fishProducts.map((item: CartItem) => {
          let sizeCategoryId = item.variantId || (item.variantSnapshot as { _id?: string })?._id;
          if (!sizeCategoryId && item.sizeCategories && Array.isArray(item.sizeCategories)) {
            const def =
              item.sizeCategories.find((sc: SizeCategory) => sc.isDefault) || item.sizeCategories[0];
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

        // Use the pre-calculated fish products total, adjusted by validation if needed
        const fishOrderTotalPrice = fishProductsTotal * safeValidationAdjustment;

        // Validate totalPrice before sending
        if (!Number.isFinite(fishOrderTotalPrice) || fishOrderTotalPrice <= 0) {
          logger.error("Invalid fish order total price:", {
            fishProductsTotal,
            safeValidationAdjustment,
            fishOrderTotalPrice,
            cartTotal,
            validatedTotal,
          });
          throw new Error(
            "Invalid fish order total calculated. Please refresh the page and try again. If the problem persists, contact support."
          );
        }

        // Don't calculate shipping fee or totalAmount - let backend calculate it
        // Backend will calculate shipping fee based on zone and add it to totalPrice to get totalAmount
        // This ensures server-authoritative pricing and prevents mismatches

        // Ensure shipping zone is set correctly for fish products
        const finalFishZone = selectedZone || "inside_dhaka";
        
        // Validate fish order items before sending
        for (const item of fishOrderItems) {
          if (!item.fishProduct || !item.sizeCategoryId) {
            throw new Error(`Invalid fish order item: missing fishProduct or sizeCategoryId`);
          }
          if (!item.requestedWeight || item.requestedWeight <= 0) {
            throw new Error(`Invalid requested weight for ${item.notes || 'fish product'}`);
          }
        }

        const fishOrderData = {
          orderItems: fishOrderItems,
          shippingAddress,
          paymentMethod: selectedPayment === "cod" ? "Cash on Delivery" : "Online Payment",
          totalPrice: fishOrderTotalPrice,
          // Don't send totalAmount - backend calculates it (totalPrice + shippingFee)
          // Don't send shippingFee - backend calculates it based on zone
          shippingZone: finalFishZone,
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
        
        try {
          const fishRes = await fishOrderApi.create(fishOrderData) as OrderResponse;
          // Extract order ID from nested response
          fishOrderId = fishRes?._id || fishRes?.fishOrder?._id || fishRes?.data?.fishOrder?._id || null;
          
          if (!fishOrderId) {
            logger.warn("Fish order created but no ID returned:", fishRes);
          }
        } catch (fishErr: any) {
          logger.error("Failed to create fish order:", fishErr);
          const errorMsg = fishErr?.response?.data?.message || fishErr?.message || "Failed to create fish order";
          throw new Error(`Fish order failed: ${Array.isArray(errorMsg) ? errorMsg.join(", ") : errorMsg}`);
        }
      }

      // Handle multiple orders - show both order IDs if both were created
      const orderIds: string[] = [];
      if (regularOrderId) orderIds.push(regularOrderId);
      if (fishOrderId) orderIds.push(fishOrderId);
      
      const primaryOrderId = regularOrderId || fishOrderId;

      // Only COD is available, so proceed directly to success

      clearCart();
      setMessage("Order placed successfully.");
      
      if (orderIds.length > 0) {
        // If both orders were created, pass both IDs (comma-separated)
        // The success page can handle showing both orders
        const orderIdsParam = orderIds.join(',');
        window.location.href = `/order/success?orderId=${orderIdsParam}`;
      }
    } catch (err) {
      const errorMessage = handleApiError(err, "Checkout");
      logger.error("Checkout error:", err);
      
      // Handle specific error cases
      if (
        errorMessage.includes("Total price must be greater than 0") ||
        errorMessage.includes("price must be greater") ||
        errorMessage.includes("Invalid order total") ||
        errorMessage.includes("Invalid product prices") ||
        errorMessage.includes("Invalid fish order")
      ) {
        setMessage(
          "There was a price calculation error. Please refresh the page and try again. If the problem persists, contact support."
        );
      } else if (errorMessage.includes("Price mismatch") || errorMessage.includes("price")) {
        setMessage(
          "There was a price calculation error. Please refresh the page and try again. If the problem persists, contact support."
        );
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Determine current step
  const getCurrentStep = () => {
    if (!selectedZone) return 1;
    if (!address.name || !address.phone || !address.address) return 2;
    return 3;
  };

  const currentStep = getCurrentStep();
  const checkoutSteps = ["Zone", "Address", "Review"];

  return (
    <div className="min-h-screen bg-white py-8 pb-24 md:pb-20">
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

        {/* Progress Indicator */}
        <CheckoutProgress currentStep={currentStep} steps={checkoutSteps} />

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
                {fishProducts.length > 0 && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 font-medium">
                      ⚠️ Fish products can only be delivered to Inside Dhaka
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => setSelectedZone("inside_dhaka")}
                    className={`rounded-xl px-5 py-4 text-base font-semibold transition-all shadow-sm min-h-[44px] touch-manipulation active:scale-95 ${
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
                    onClick={() => {
                      if (fishProducts.length > 0) {
                        setMessage("Fish products can only be delivered to Inside Dhaka. Please remove fish products to order to Outside Dhaka.");
                        return;
                      }
                      setSelectedZone("outside_dhaka");
                    }}
                    disabled={fishProducts.length > 0}
                    className={`rounded-xl px-5 py-4 text-base font-semibold transition-all shadow-sm min-h-[44px] touch-manipulation active:scale-95 ${
                      fishProducts.length > 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                        : selectedZone === "outside_dhaka"
                        ? "bg-green-50 text-green-800 ring-2 ring-green-500 ring-offset-2"
                        : "hover:bg-green-50/50 bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="text-lg font-bold">Outside Dhaka</div>
                    <div className="text-sm font-normal text-gray-600 mt-1">
                      {shippingLoading && selectedZone === "outside_dhaka" ? (
                        <span className="flex items-center gap-1">
                          <LoadingSpinner size="sm" />
                          Calculating...
                        </span>
                      ) : (
                        "From ৳150"
                      )}
                    </div>
                    {fishProducts.length > 0 && (
                      <div className="text-xs text-red-600 mt-1 font-normal">Not available for fish</div>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  {fishProducts.length > 0 
                    ? "Fish products require Inside Dhaka delivery. Regular products can be delivered anywhere."
                    : "Shipping calculated based on product weight. Fish and regular items are handled automatically."}
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
                      inputMode="text"
                      autoComplete="name"
                    />
                    <Input
                      label="Phone Number"
                      required
                      type="tel"
                      placeholder="Phone number"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      inputMode="tel"
                      autoComplete="tel"
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
                      inputMode="text"
                      autoComplete="street-address"
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
                        inputMode="text"
                        autoComplete="address-level1"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          label="District"
                          required
                          placeholder="District"
                          value={address.district}
                          onChange={(e) => setAddress({ ...address, district: e.target.value })}
                          inputMode="text"
                          autoComplete="address-level2"
                        />
                        <Input
                          label="Upazila/Thana"
                          required
                          placeholder="Upazila/Thana"
                          value={address.upazila}
                          onChange={(e) => setAddress({ ...address, upazila: e.target.value })}
                          inputMode="text"
                          autoComplete="address-level3"
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
              <Card padding="lg" variant="elevated" className="shadow-lg hidden md:block">
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
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(cartTotal)}</p>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <p className="text-base text-gray-600">Shipping</p>
                    <p className="text-lg font-bold text-gray-900">
                      {shippingLoading ? (
                        <span className="flex items-center gap-2 text-gray-400">
                          <LoadingSpinner size="sm" />
                          Calculating...
                        </span>
                      ) : selectedZone ? (
                        formatCurrency(shippingFee)
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
                          <span className="flex items-center gap-2 text-gray-400">
                            <LoadingSpinner size="sm" />
                            Calculating...
                          </span>
                        ) : (
                          formatCurrency(total)
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

        {/* Sticky Checkout Summary & Button - Mobile Only */}
        {cart.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 z-[60] md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {shippingLoading ? (
                      <span className="text-gray-400">Calculating...</span>
                    ) : (
                      formatCurrency(total)
                    )}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-shrink-0 font-bold text-base px-6 py-3 min-h-[44px]"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting || !selectedZone || cart.length === 0 || shippingLoading}
                  isLoading={isSubmitting}
                >
                  Place Order
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">Secure checkout</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ErrorBoundary>
      <CheckoutContent />
    </ErrorBoundary>
  );
}
