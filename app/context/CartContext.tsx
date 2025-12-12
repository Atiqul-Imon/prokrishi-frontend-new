"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import type { CartContextType } from "@/types/context";
import type { CartItem, Product } from "@/types/models";
import { useAuth } from "./AuthContext";
import { getCart, addToCart as addToCartAPI, updateCartItem as updateCartItemAPI, removeCartItem as removeCartItemAPI, clearCartBackend } from "../utils/api";
import { logger } from "../utils/logger";

// Type for backend cart item response (matches CartResponse from api.ts)
interface BackendCartItem {
  _id: string;
  product: Product | string;
  quantity: number;
  price: number;
  variant?: {
    variantId?: string | { _id: string };
    _id?: string;
    label?: string;
    price?: number;
    [key: string]: unknown;
  };
}

function normalizeMeasurement(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 1;
  return value > 0 ? value : 1;
}

function getMeasurementInfo(product: Product | CartItem, variantId?: string) {
  if (product.hasVariants && variantId) {
    const variant = product.variants?.find((v) => v._id === variantId) || (product as CartItem).variantSnapshot;
    if (variant) {
      const unit = variant.unit || product.unit;
      const measurementIncrement =
        variant.measurementIncrement ??
        (unit === "pcs" ? 1 : product.measurementIncrement ?? (unit === "kg" || unit === "g" ? 0.01 : 1));
      return {
        measurement: normalizeMeasurement(variant.measurement),
        unit,
        measurementIncrement,
      };
    }
  }
  return {
    measurement: normalizeMeasurement(product.measurement),
    unit: product.unit,
    measurementIncrement:
      product.measurementIncrement ??
      (product.unit === "pcs" ? 1 : product.unit === "kg" || product.unit === "g" ? 0.01 : 1),
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Load cart from backend if user is logged in, otherwise from localStorage
  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      try {
        if (user) {
          // Load from backend
          try {
            const response = await getCart();
            if (response.cart && response.cart.items) {
              // Convert backend cart items to frontend format
              const convertedCart: CartItem[] = response.cart.items.map((item) => {
                const backendItem = item as BackendCartItem;
                const product = typeof backendItem.product === 'string' 
                  ? { _id: backendItem.product } as Product
                  : backendItem.product;
                const variantId = typeof backendItem.variant?.variantId === 'object' 
                  ? backendItem.variant.variantId._id 
                  : backendItem.variant?.variantId || backendItem.variant?._id;
                return {
                  ...product,
                  id: product._id || product.id,
                  _id: product._id,
                  quantity: backendItem.quantity,
                  price: backendItem.price || product.price,
                  variantId,
                  variantSnapshot: backendItem.variant as CartItem['variantSnapshot'],
                } as CartItem;
              });
              setCart(convertedCart);
            }
          } catch (error) {
            logger.error("Error loading cart from backend:", error);
            // Fallback to localStorage if backend fails
            const stored = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
            if (stored) setCart(JSON.parse(stored) as CartItem[]);
          }
        } else {
          // Load from localStorage for guest users
          const stored = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
          if (stored) setCart(JSON.parse(stored) as CartItem[]);
        }
      } catch (error) {
        logger.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, [user]);

  // Save cart to localStorage for guest users (don't sync to backend here to avoid too many API calls)
  useEffect(() => {
    if (!loading && !user) {
      // Save to localStorage for guest users
      try {
        localStorage.setItem("cart", JSON.stringify(cart));
      } catch (error) {
        logger.error("Error saving cart to localStorage:", error);
      }
    }
    // Note: Backend sync happens in addToCart, updateQuantity, removeFromCart functions
    // to avoid too many API calls
  }, [cart, loading, user]);

  const addToCart = useCallback(async (product: Product, qty = 1, variantId?: string) => {
    try {
      const id = product.id || product._id;
      
      // If user is logged in, sync with backend
      if (user) {
        try {
          await addToCartAPI(id, qty, variantId);
          // Reload cart from backend
          const response = await getCart();
          if (response.cart && response.cart.items) {
            const convertedCart: CartItem[] = response.cart.items.map((item) => {
              const backendItem = item as BackendCartItem;
              const prod = typeof backendItem.product === 'string' 
                ? { _id: backendItem.product } as Product
                : backendItem.product;
              const variantId = typeof backendItem.variant?.variantId === 'object' 
                ? backendItem.variant.variantId._id 
                : backendItem.variant?.variantId || backendItem.variant?._id;
              return {
                ...prod,
                id: prod._id || prod.id,
                _id: prod._id,
                quantity: backendItem.quantity,
                price: backendItem.price || prod.price,
                variantId,
                variantSnapshot: backendItem.variant as CartItem['variantSnapshot'],
              } as CartItem;
            });
            setCart(convertedCart);
          }
        } catch (error) {
          logger.error("Error adding to cart via API:", error);
          // Fallback to local state update
        }
      }

      // Update local state (works for both logged in and guest users)
      setCart((prev) => {
        const measurementInfo = getMeasurementInfo(product, variantId);
        const isFishProduct =
          product.isFishProduct === true ||
          (product.sizeCategories && Array.isArray(product.sizeCategories) && product.sizeCategories.length > 0);

        const idx = prev.findIndex((item) => {
          const itemId = item.id || item._id;
          const itemVariantId = item.variantId;
          if (itemId !== id) return false;
          if (isFishProduct) return itemVariantId === variantId;
          if (product.hasVariants) return itemVariantId === variantId;
          return !itemVariantId;
        });

        if (idx > -1) {
          const updated = [...prev];
          updated[idx].quantity += qty;
          if (measurementInfo) {
            updated[idx].totalMeasurement = (updated[idx].totalMeasurement || 0) + measurementInfo.measurement * qty;
          }
          return updated;
        }

        const newItem: CartItem = {
          ...product,
          id,
          quantity: qty,
          totalMeasurement: measurementInfo ? measurementInfo.measurement * qty : qty,
          unitWeightKg: product.unitWeightKg,
          measurementIncrement: measurementInfo?.measurementIncrement,
          ...(product.isFishProduct !== undefined && { isFishProduct: product.isFishProduct }),
          ...(product.sizeCategories !== undefined && { sizeCategories: product.sizeCategories }),
        };

        if (isFishProduct && variantId && product.sizeCategories) {
          const sizeCategory = product.sizeCategories.find((sc) => sc._id === variantId);
          if (sizeCategory) {
            newItem.variantId = variantId;
            newItem.variantSnapshot = {
              _id: sizeCategory._id,
              label: sizeCategory.label,
              price: sizeCategory.pricePerKg,
              stock: sizeCategory.stock || 0,
              measurement: 1,
              unit: "kg",
              status: sizeCategory.status,
              isDefault: sizeCategory.isDefault,
            };
            newItem.price = sizeCategory.pricePerKg;
            newItem.stock = sizeCategory.stock || 0;
            newItem.measurement = 1;
            newItem.unit = "kg";
            newItem.measurementIncrement = sizeCategory.measurementIncrement ?? 0.25;
          }
        } else if (product.hasVariants && variantId) {
          const variant = product.variants?.find((v) => v._id === variantId);
          if (variant) {
            newItem.variantId = variantId;
            newItem.variantSnapshot = variant;
            newItem.price = variant.price;
            newItem.stock = variant.stock;
            newItem.measurement = variant.measurement;
            newItem.unit = variant.unit;
            newItem.measurementIncrement =
              variant.measurementIncrement ??
              (variant.unit === "pcs" ? 1 : variant.unit === "kg" || variant.unit === "g" ? 0.01 : 1);
            newItem.unitWeightKg = variant.unitWeightKg ?? product.unitWeightKg;
          }
        }

        return [...prev, newItem];
      });
      setIsSidebarOpen(true);
    } catch (error) {
      logger.error("Error adding to cart:", error);
    }
  }, [user]);

  const updateQuantity = useCallback(async (id: string, quantity: number, variantId?: string) => {
    try {
      if (quantity < 1) {
        await removeFromCart(id, variantId);
        return;
      }

      // If user is logged in, sync with backend
      if (user) {
        try {
          await updateCartItemAPI(id, quantity, variantId);
          // Reload cart from backend
          const response = await getCart();
          if (response.cart && response.cart.items) {
            const convertedCart: CartItem[] = response.cart.items.map((item) => {
              const backendItem = item as BackendCartItem;
              const prod = typeof backendItem.product === 'string' 
                ? { _id: backendItem.product } as Product
                : backendItem.product;
              const variantId = typeof backendItem.variant?.variantId === 'object' 
                ? backendItem.variant.variantId._id 
                : backendItem.variant?.variantId || backendItem.variant?._id;
              return {
                ...prod,
                id: prod._id || prod.id,
                _id: prod._id,
                quantity: backendItem.quantity,
                price: backendItem.price || prod.price,
                variantId,
                variantSnapshot: backendItem.variant as CartItem['variantSnapshot'],
              } as CartItem;
            });
            setCart(convertedCart);
            return;
          }
        } catch (error) {
          logger.error("Error updating cart via API:", error);
          // Fallback to local state update
        }
      }

      // Update local state
      setCart((prev) =>
        prev.map((item) => {
          const itemId = item.id || item._id;
          const itemVariantId = item.variantId;
          if (itemId === id && itemVariantId === variantId) {
            const measurementInfo = getMeasurementInfo(item, variantId);
            return {
              ...item,
              quantity,
              totalMeasurement: measurementInfo ? measurementInfo.measurement * quantity : quantity,
            };
          }
          return item;
        }),
      );
    } catch (error) {
      logger.error("Error updating quantity:", error);
    }
  }, [user]);

  const removeFromCart = useCallback(async (id: string, variantId?: string) => {
    try {
      // If user is logged in, sync with backend
      if (user) {
        try {
          await removeCartItemAPI(id, variantId);
          // Reload cart from backend
          const response = await getCart();
          if (response.cart && response.cart.items) {
            const convertedCart: CartItem[] = response.cart.items.map((item) => {
              const backendItem = item as BackendCartItem;
              const prod = typeof backendItem.product === 'string' 
                ? { _id: backendItem.product } as Product
                : backendItem.product;
              const variantId = typeof backendItem.variant?.variantId === 'object' 
                ? backendItem.variant.variantId._id 
                : backendItem.variant?.variantId || backendItem.variant?._id;
              return {
                ...prod,
                id: prod._id || prod.id,
                _id: prod._id,
                quantity: backendItem.quantity,
                price: backendItem.price || prod.price,
                variantId,
                variantSnapshot: backendItem.variant as CartItem['variantSnapshot'],
              } as CartItem;
            });
            setCart(convertedCart);
            return;
          }
        } catch (error) {
          logger.error("Error removing from cart via API:", error);
          // Fallback to local state update
        }
      }

      // Update local state
      setCart((prev) =>
        prev.filter((item) => {
          const itemId = item.id || item._id;
          const itemVariantId = item.variantId;
          if (itemId !== id) return true;
          return itemVariantId !== variantId;
        }),
      );
    } catch (error) {
      logger.error("Error removing from cart:", error);
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    try {
      // If user is logged in, sync with backend
      if (user) {
        try {
          await clearCartBackend();
        } catch (error) {
          logger.error("Error clearing cart via API:", error);
        }
      }
      setCart([]);
    } catch (error) {
      logger.error("Error clearing cart:", error);
    }
  }, [user]);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => (sum + (item.variantSnapshot?.price || item.price) * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const getItemDisplayQuantity = useCallback((item: CartItem) => {
    const info = getMeasurementInfo(item, item.variantId);
    const totalMeasurement = item.totalMeasurement ?? info.measurement * item.quantity;
    const unitLabel = info.unit || "unit";
    return {
      value: totalMeasurement,
      unit: unitLabel,
      displayText: `${totalMeasurement} ${unitLabel}`,
    };
  }, []);

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const contextValue = useMemo(
    () => ({
      cart,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount,
      getItemDisplayQuantity,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
    }),
    [cart, loading, cartTotal, cartCount, isSidebarOpen, getItemDisplayQuantity, addToCart, updateQuantity, removeFromCart, clearCart, openSidebar, closeSidebar],
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

