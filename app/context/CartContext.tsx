"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import type { CartContextType } from "@/types/context";
import type { CartItem, Product } from "@/types/models";
import { useAuth } from "./AuthContext";
import { getCart, addToCart as addToCartAPI, updateCartItem as updateCartItemAPI, removeCartItem as removeCartItemAPI, clearCartBackend } from "../utils/api";

function normalizeMeasurement(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 1;
  return value > 0 ? value : 1;
}

function getMeasurementInfo(product: Product | CartItem, variantId?: string) {
  if (product.hasVariants && variantId) {
    const variant = product.variants?.find((v) => v._id === variantId) || (product as CartItem).variantSnapshot;
    if (variant) {
      return {
        measurement: normalizeMeasurement(variant.measurement),
        unit: variant.unit || product.unit,
      };
    }
  }
  return {
    measurement: normalizeMeasurement(product.measurement),
    unit: product.unit,
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
              const convertedCart: CartItem[] = response.cart.items.map((item: any) => {
                const product = item.product;
                return {
                  ...product,
                  id: product._id || product.id,
                  _id: product._id,
                  quantity: item.quantity,
                  price: item.price || product.price,
                  variantId: item.variant?.variantId?._id || item.variant?.variantId,
                  variantSnapshot: item.variant,
                } as CartItem;
              });
              setCart(convertedCart);
            }
          } catch (error) {
            console.error("Error loading cart from backend:", error);
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
        console.error("Error loading cart:", error);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, [user]);

  // Save cart to backend if user is logged in, otherwise to localStorage
  useEffect(() => {
    if (!loading && user) {
      // Sync with backend when cart changes (debounced)
      const timeoutId = setTimeout(async () => {
        try {
          // For now, we'll sync on add/update/remove operations instead of here
          // to avoid too many API calls
        } catch (error) {
          console.error("Error syncing cart to backend:", error);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (!loading && !user) {
      // Save to localStorage for guest users
      try {
        localStorage.setItem("cart", JSON.stringify(cart));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cart, loading, user]);

  async function addToCart(product: Product, qty = 1, variantId?: string) {
    try {
      const id = product.id || product._id;
      
      // If user is logged in, sync with backend
      if (user) {
        try {
          await addToCartAPI(id, qty, variantId);
          // Reload cart from backend
          const response = await getCart();
          if (response.cart && response.cart.items) {
            const convertedCart: CartItem[] = response.cart.items.map((item: any) => {
              const prod = item.product;
              return {
                ...prod,
                id: prod._id || prod.id,
                _id: prod._id,
                quantity: item.quantity,
                price: item.price || prod.price,
                variantId: item.variant?.variantId?._id || item.variant?.variantId,
                variantSnapshot: item.variant,
              } as CartItem;
            });
            setCart(convertedCart);
          }
        } catch (error) {
          console.error("Error adding to cart via API:", error);
          // Fallback to local state update
        }
      }

      // Update local state (works for both logged in and guest users)
      setCart((prev) => {
        const measurementInfo = getMeasurementInfo(product, variantId);
        const isFishProduct =
          (product as any).isFishProduct === true ||
          ((product as any).sizeCategories && Array.isArray((product as any).sizeCategories) && (product as any).sizeCategories.length > 0);

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
          ...((product as any).isFishProduct !== undefined && { isFishProduct: (product as any).isFishProduct }),
          ...((product as any).sizeCategories !== undefined && { sizeCategories: (product as any).sizeCategories }),
        };

        if (isFishProduct && variantId) {
          const sizeCategory = (product as any).sizeCategories?.find((sc: any) => sc._id === variantId);
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
            } as any;
            newItem.price = sizeCategory.pricePerKg;
            newItem.stock = sizeCategory.stock || 0;
            newItem.measurement = 1;
            newItem.unit = "kg";
            newItem.measurementIncrement = 0.5;
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
            newItem.measurementIncrement = variant.measurementIncrement;
            newItem.unitWeightKg = variant.unitWeightKg ?? product.unitWeightKg;
          }
        }

        return [...prev, newItem];
      });
      setIsSidebarOpen(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  }

  async function updateQuantity(id: string, quantity: number, variantId?: string) {
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
            const convertedCart: CartItem[] = response.cart.items.map((item: any) => {
              const prod = item.product;
              return {
                ...prod,
                id: prod._id || prod.id,
                _id: prod._id,
                quantity: item.quantity,
                price: item.price || prod.price,
                variantId: item.variant?.variantId?._id || item.variant?.variantId,
                variantSnapshot: item.variant,
              } as CartItem;
            });
            setCart(convertedCart);
            return;
          }
        } catch (error) {
          console.error("Error updating cart via API:", error);
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
      console.error("Error updating quantity:", error);
    }
  }

  async function removeFromCart(id: string, variantId?: string) {
    try {
      // If user is logged in, sync with backend
      if (user) {
        try {
          await removeCartItemAPI(id, variantId);
          // Reload cart from backend
          const response = await getCart();
          if (response.cart && response.cart.items) {
            const convertedCart: CartItem[] = response.cart.items.map((item: any) => {
              const prod = item.product;
              return {
                ...prod,
                id: prod._id || prod.id,
                _id: prod._id,
                quantity: item.quantity,
                price: item.price || prod.price,
                variantId: item.variant?.variantId?._id || item.variant?.variantId,
                variantSnapshot: item.variant,
              } as CartItem;
            });
            setCart(convertedCart);
            return;
          }
        } catch (error) {
          console.error("Error removing from cart via API:", error);
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
      console.error("Error removing from cart:", error);
    }
  }

  async function clearCart() {
    try {
      // If user is logged in, sync with backend
      if (user) {
        try {
          await clearCartBackend();
        } catch (error) {
          console.error("Error clearing cart via API:", error);
        }
      }
      setCart([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }

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
      openSidebar: () => setIsSidebarOpen(true),
      closeSidebar: () => setIsSidebarOpen(false),
    }),
    [cart, loading, cartTotal, cartCount, isSidebarOpen, getItemDisplayQuantity],
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

