"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import type { CartContextType } from "@/types/context";
import type { CartItem, Product, User } from "@/types/models";
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
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const [previousUser, setPreviousUser] = useState<User | null>(null);

  // Sync localStorage cart to backend when user logs in
  const syncLocalCartToBackend = useCallback(async (localCartItems: CartItem[]): Promise<{ success: number; failed: number; errors: string[] }> => {
    if (!user || localCartItems.length === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    setSyncing(true);
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      // First, get current backend cart to check for existing items
      let backendCart: CartItem[] = [];
      try {
        const response = await getCart();
        if (response.cart && response.cart.items) {
          backendCart = response.cart.items.map((item) => {
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
        }
      } catch (error) {
        logger.error("Error fetching backend cart for sync:", error);
      }

      // Sync each localStorage item to backend
      // Use Promise.allSettled to handle partial failures gracefully
      // Process in batches to avoid overwhelming the API
      const BATCH_SIZE = 5;
      const batches: CartItem[][] = [];
      for (let i = 0; i < localCartItems.length; i += BATCH_SIZE) {
        batches.push(localCartItems.slice(i, i + BATCH_SIZE));
      }

      for (const batch of batches) {
        const syncPromises = batch.map(async (item) => {
          try {
            const productId = item.id || item._id;
            if (!productId) {
              throw new Error("Product ID missing");
            }

            // Check if item already exists in backend cart
            const existingItem = backendCart.find((backendItem) => {
              const backendItemId = backendItem.id || backendItem._id;
              const backendVariantId = backendItem.variantId;
              
              if (backendItemId !== productId) return false;
              
              // For fish products or products with variants, match variant ID
              if (item.isFishProduct || item.hasVariants) {
                return backendVariantId === item.variantId;
              }
              
              // For regular products without variants, match if both have no variant
              return !backendVariantId && !item.variantId;
            });

            if (existingItem) {
              // Item exists in backend - merge quantities intelligently
              const newQuantity = existingItem.quantity + item.quantity;
              try {
                await updateCartItemAPI(productId, newQuantity, item.variantId);
                results.success++;
                logger.info(`Merged cart item: ${productId}, new quantity: ${newQuantity}`);
                // Update backendCart to reflect the change
                const updatedItem = backendCart.find((bi) => {
                  const biId = bi.id || bi._id;
                  const biVariantId = bi.variantId;
                  return biId === productId && biVariantId === item.variantId;
                });
                if (updatedItem) {
                  updatedItem.quantity = newQuantity;
                }
              } catch (error: any) {
                // If merge fails (e.g., stock limit), try adding remaining quantity
                const remainingQty = item.quantity;
                if (remainingQty > 0) {
                  try {
                    await addToCartAPI(productId, remainingQty, item.variantId);
                    results.success++;
                    logger.info(`Added remaining quantity after merge failed: ${productId}`);
                  } catch (retryError: any) {
                    results.failed++;
                    const errorMsg = retryError?.message || "Failed to sync item";
                    results.errors.push(`${item.name || productId}: ${errorMsg}`);
                    logger.error(`Failed to sync cart item: ${productId}`, retryError);
                  }
                } else {
                  results.failed++;
                  const errorMsg = error?.message || "Stock limit reached";
                  results.errors.push(`${item.name || productId}: ${errorMsg}`);
                  logger.error(`Failed to merge cart item: ${productId}`, error);
                }
              }
            } else {
              // Item doesn't exist in backend - add it
              try {
                await addToCartAPI(productId, item.quantity, item.variantId);
                results.success++;
                logger.info(`Synced new cart item: ${productId}`);
              } catch (error: any) {
                results.failed++;
                const errorMsg = error?.message || "Failed to sync item";
                // Only log user-friendly errors (not technical ones)
                if (errorMsg.includes("stock") || errorMsg.includes("available") || errorMsg.includes("not found")) {
                  results.errors.push(`${item.name || productId}: ${errorMsg}`);
                }
                logger.error(`Failed to sync cart item: ${productId}`, error);
              }
            }
          } catch (error: any) {
            results.failed++;
            const errorMsg = error?.message || "Unexpected error";
            results.errors.push(`${item.name || item.id || "Unknown item"}: ${errorMsg}`);
            logger.error("Error syncing cart item:", error);
          }
        });

        // Wait for batch to complete before processing next batch (with timeout per batch)
        await Promise.race([
          Promise.allSettled(syncPromises),
          new Promise((resolve) => setTimeout(resolve, 5000)), // 5 second timeout per batch
        ]);
        
        // Small delay between batches to avoid rate limiting
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      logger.info(`Cart sync completed: ${results.success} succeeded, ${results.failed} failed`);
    } catch (error) {
      logger.error("Error during cart sync:", error);
      results.errors.push("Cart sync encountered an unexpected error");
    } finally {
      setSyncing(false);
    }

    return results;
  }, [user]);

  // Load cart from backend if user is logged in, otherwise from localStorage
  useEffect(() => {
    async function loadCart() {
      setLoading(true);
      try {
        if (user) {
          // User just logged in - check if we need to sync localStorage cart
          const wasGuest = !previousUser && user;
          const localCartKey = "cart";
          const storedLocalCart = typeof window !== "undefined" ? localStorage.getItem(localCartKey) : null;
          
          // Load from backend first (non-blocking)
          try {
            const response = await getCart();
            if (response.cart && response.cart.items && response.cart.items.length > 0) {
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
              setLoading(false); // Set loading to false immediately after cart loads
              
              // Clear localStorage since backend has the source of truth
              const localCartKey = "cart";
              localStorage.removeItem(localCartKey);
              
              // Sync localStorage cart in background (non-blocking)
              if (wasGuest && storedLocalCart) {
                try {
                  const localCartItems = JSON.parse(storedLocalCart) as CartItem[];
                  if (Array.isArray(localCartItems) && localCartItems.length > 0) {
                    // Sync in background - don't block UI
                    syncLocalCartToBackend(localCartItems).then((syncResults) => {
                      // Clear localStorage only if sync was successful
                      if (syncResults.success > 0) {
                        localStorage.removeItem(localCartKey);
                        logger.info("Cleared localStorage cart after successful sync");
                        
                        // Reload cart after sync to get merged items
                        getCart().then((response) => {
                          if (response.cart && response.cart.items) {
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
                        }).catch((error) => {
                          logger.error("Error reloading cart after sync:", error);
                        });
                      }
                      
                      // Show user feedback if there were any failures
                      if (syncResults.failed > 0 && typeof window !== "undefined") {
                        console.warn(
                          `Cart sync: ${syncResults.success} items synced, ${syncResults.failed} items couldn't be added. ` +
                          `Some items may be unavailable or out of stock.`
                        );
                      }
                    }).catch((error) => {
                      logger.error("Error syncing localStorage cart:", error);
                    });
                  }
                } catch (error) {
                  logger.error("Error parsing localStorage cart:", error);
                }
              }
              return; // Exit early - cart loaded
            } else {
              // Backend cart is empty - check localStorage as backup
              // This handles cases where API sync failed but items were saved locally
              const localCartKey = "cart";
              const stored = typeof window !== "undefined" ? localStorage.getItem(localCartKey) : null;
              if (stored) {
                try {
                  const localCartItems = JSON.parse(stored) as CartItem[];
                  if (Array.isArray(localCartItems) && localCartItems.length > 0) {
                    logger.info("Backend cart empty but localStorage has items - syncing in background");
                    setCart(localCartItems); // Show localStorage items immediately
                    setLoading(false);
                    
                    // Sync localStorage items to backend in background
                    syncLocalCartToBackend(localCartItems).then((syncResults) => {
                      if (syncResults.success > 0) {
                        // Reload cart from backend after sync
                        getCart().then((response) => {
                          if (response.cart && response.cart.items && response.cart.items.length > 0) {
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
                            localStorage.removeItem(localCartKey);
                          }
                        }).catch((error) => {
                          logger.error("Error reloading cart after sync:", error);
                        });
                      }
                    }).catch((error) => {
                      logger.error("Error syncing localStorage cart to backend:", error);
                    });
                    return;
                  }
                } catch (parseError) {
                  logger.error("Error parsing localStorage cart:", parseError);
                }
              }
              setCart([]);
              setLoading(false);
            }
          } catch (error) {
            logger.error("Error loading cart from backend:", error);
            // Fallback to localStorage if backend fails
            const stored = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
            if (stored) {
              try {
                setCart(JSON.parse(stored) as CartItem[]);
              } catch (parseError) {
                logger.error("Error parsing localStorage cart:", parseError);
                setCart([]);
              }
            } else {
              setCart([]);
            }
            setLoading(false);
            return;
          }
        } else {
          // Load from localStorage for guest users
          const stored = typeof window !== "undefined" ? localStorage.getItem("cart") : null;
          if (stored) {
            try {
              setCart(JSON.parse(stored) as CartItem[]);
            } catch (error) {
              logger.error("Error parsing localStorage cart:", error);
              setCart([]);
            }
          } else {
            setCart([]);
          }
          setLoading(false);
        }
      } catch (error) {
        logger.error("Error loading cart:", error);
        setCart([]);
        setLoading(false);
      }
    }
    loadCart();
    
    // Update previousUser to track login state changes
    setPreviousUser(user);
  }, [user, syncLocalCartToBackend, previousUser]);

  // Save cart to localStorage for both guest and logged-in users (as backup)
  useEffect(() => {
    if (!loading) {
      // Save to localStorage as backup for both guest and logged-in users
      // For logged-in users, this ensures items persist if API sync fails
      try {
        localStorage.setItem("cart", JSON.stringify(cart));
      } catch (error) {
        logger.error("Error saving cart to localStorage:", error);
      }
    }
    // Note: Backend sync happens in addToCart, updateQuantity, removeFromCart functions
    // to avoid too many API calls
  }, [cart, loading]);

  const addToCart = useCallback(async (product: Product, qty = 1, variantId?: string) => {
    try {
      const id = product.id || product._id;
      
      // Optimistic update - update UI immediately for better UX
      const measurementInfo = getMeasurementInfo(product, variantId);
      const isFishProduct =
        product.isFishProduct === true ||
        (product.sizeCategories && Array.isArray(product.sizeCategories) && product.sizeCategories.length > 0);

      setCart((prev) => {
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

      // Sync with backend (non-blocking but track completion) if user is logged in
      if (user) {
        addToCartAPI(id, qty, variantId)
          .then(() => {
            logger.info("Successfully synced item to backend cart");
          })
          .catch((error) => {
            logger.error("Error adding to cart via API:", error);
            // Item is in localStorage as backup, will be synced on next page load
            // Don't revert optimistic update - user already sees the item
          });
      }
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

      // Optimistic update - update UI immediately
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

      // Sync with backend (non-blocking but track completion) if user is logged in
      if (user) {
        updateCartItemAPI(id, quantity, variantId)
          .then(() => {
            logger.info("Successfully updated item in backend cart");
          })
          .catch((error) => {
            logger.error("Error updating cart via API:", error);
            // Item is in localStorage as backup, will be synced on next page load
          });
      }
    } catch (error) {
      logger.error("Error updating quantity:", error);
    }
  }, [user]);

  const removeFromCart = useCallback(async (id: string, variantId?: string) => {
    try {
      // Optimistic update - update UI immediately
      setCart((prev) =>
        prev.filter((item) => {
          const itemId = item.id || item._id;
          const itemVariantId = item.variantId;
          return !(itemId === id && itemVariantId === variantId);
        }),
      );

      // Sync with backend (non-blocking but track completion) if user is logged in
      if (user) {
        removeCartItemAPI(id, variantId)
          .then(() => {
            logger.info("Successfully removed item from backend cart");
          })
          .catch((error) => {
            logger.error("Error removing from cart via API:", error);
            // Item is in localStorage as backup, will be synced on next page load
          });
      }
    } catch (error) {
      logger.error("Error removing from cart:", error);
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    try {
      // Clear frontend state immediately for better UX
      setCart([]);
      
      // Clear localStorage as backup (works for both logged-in and guest users)
      try {
        localStorage.removeItem("cart");
        logger.info("LocalStorage cart cleared");
      } catch (localStorageError) {
        logger.error("Error clearing localStorage cart:", localStorageError);
      }
      
      // If user is logged in, also clear backend cart
      if (user) {
        try {
          await clearCartBackend();
          logger.info("Backend cart cleared successfully");
        } catch (error) {
          logger.error("Error clearing cart via API:", error);
          // Don't throw - frontend state and localStorage are already cleared
          // This ensures cart is cleared even if backend call fails
        }
      }
    } catch (error) {
      logger.error("Error clearing cart:", error);
      // Ensure cart state is cleared even if there's an error
      setCart([]);
      try {
        localStorage.removeItem("cart");
      } catch (localStorageError) {
        logger.error("Error clearing localStorage cart in error handler:", localStorageError);
      }
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
      syncing,
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
    [cart, loading, syncing, cartTotal, cartCount, isSidebarOpen, getItemDisplayQuantity, addToCart, updateQuantity, removeFromCart, clearCart, openSidebar, closeSidebar],
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

