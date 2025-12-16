"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import type { FishCartItem, FishProduct, User, SizeCategory } from "@/types/models";
import { useAuth } from "./AuthContext";
import { getFishCart, addToFishCart as addToFishCartAPI, updateFishCartQuantity as updateFishCartQuantityAPI, removeFromFishCart as removeFromFishCartAPI, clearFishCartBackend } from "../utils/api";
import { logger } from "../utils/logger";

// Type for backend fish cart item response
interface BackendFishCartItem {
  _id: string;
  fishProduct: FishProduct | string;
  sizeCategoryId: string | { _id: string };
  sizeCategoryLabel: string;
  pricePerKg: number;
  quantity?: number;
}

interface FishCartContextType {
  fishCart: FishCartItem[];
  loading: boolean;
  syncing?: boolean;
  addToFishCart: (fishProduct: FishProduct, sizeCategoryId: string, quantity?: number) => Promise<void>;
  updateFishCartQuantity: (fishProductId: string, sizeCategoryId: string, quantity: number) => Promise<void>;
  removeFromFishCart: (fishProductId: string, sizeCategoryId: string) => Promise<void>;
  clearFishCart: () => Promise<void>;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const FishCartContext = createContext<FishCartContextType | undefined>(undefined);

interface FishCartProviderProps {
  children: ReactNode;
}

export function FishCartProvider({ children }: FishCartProviderProps) {
  const [fishCart, setFishCart] = useState<FishCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const [previousUser, setPreviousUser] = useState<User | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // Sync localStorage fish cart to backend when user logs in
  const syncLocalFishCartToBackend = useCallback(async (localFishCartItems: FishCartItem[]): Promise<{ success: number; failed: number; errors: string[] }> => {
    if (!user || localFishCartItems.length === 0) {
      return { success: 0, failed: 0, errors: [] };
    }

    setSyncing(true);
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      // First, get current backend fish cart to check for existing items
      let backendFishCart: FishCartItem[] = [];
      try {
        const response = await getFishCart();
        if (response.cart && response.cart.items) {
          backendFishCart = response.cart.items.map((item) => {
            const backendItem = item as BackendFishCartItem;
            const fishProduct = typeof backendItem.fishProduct === 'string' 
              ? { _id: backendItem.fishProduct } as FishProduct
              : backendItem.fishProduct;
            const sizeCategoryId = typeof backendItem.sizeCategoryId === 'object' 
              ? backendItem.sizeCategoryId._id 
              : backendItem.sizeCategoryId;
            return {
              _id: backendItem._id,
              fishProduct,
              sizeCategoryId,
              sizeCategoryLabel: backendItem.sizeCategoryLabel,
              pricePerKg: backendItem.pricePerKg,
              quantity: (backendItem as any).quantity || 1,
            } as FishCartItem;
          });
        }
      } catch (error) {
        logger.error("Error fetching backend fish cart for sync:", error);
      }

      // Sync each localStorage item to backend
      for (const item of localFishCartItems) {
        try {
          const fishProductId = typeof item.fishProduct === 'string' ? item.fishProduct : (item.fishProduct._id || item.fishProduct.id);
          if (!fishProductId) {
            throw new Error("Fish product ID missing");
          }

          // Check if item already exists in backend cart
          const existingItem = backendFishCart.find((backendItem) => {
            const backendFishProductId = typeof backendItem.fishProduct === 'string' 
              ? backendItem.fishProduct 
              : (backendItem.fishProduct._id || backendItem.fishProduct.id);
            return backendFishProductId === fishProductId && backendItem.sizeCategoryId === item.sizeCategoryId;
          });

          if (!existingItem) {
            // Item doesn't exist in backend - add it
            try {
              await addToFishCartAPI(fishProductId, item.sizeCategoryId);
              results.success++;
              logger.info(`Synced new fish cart item: ${fishProductId}`);
            } catch (error: any) {
              results.failed++;
              const errorMsg = error?.message || "Failed to sync item";
              results.errors.push(`${fishProductId}: ${errorMsg}`);
              logger.error(`Failed to sync fish cart item: ${fishProductId}`, error);
            }
          } else {
            // Item already exists - skip
            results.success++;
            logger.info(`Fish cart item already exists: ${fishProductId}`);
          }
        } catch (error: any) {
          results.failed++;
          const errorMsg = error?.message || "Unexpected error";
          results.errors.push(`${item.sizeCategoryLabel || "Unknown item"}: ${errorMsg}`);
          logger.error("Error syncing fish cart item:", error);
        }
      }

      logger.info(`Fish cart sync completed: ${results.success} succeeded, ${results.failed} failed`);
    } catch (error) {
      logger.error("Error during fish cart sync:", error);
      results.errors.push("Fish cart sync encountered an unexpected error");
    } finally {
      setSyncing(false);
    }

    return results;
  }, [user]);

  // Load fish cart from backend if user is logged in, otherwise from localStorage
  // Only load on initial mount or when user changes (login/logout), not on every render
  useEffect(() => {
    // Check if user changed (login/logout)
    const userChanged = previousUser !== null && user !== previousUser;
    
    // Reset hasLoadedOnce if user changed, so we reload the cart
    if (userChanged) {
      setHasLoadedOnce(false);
    }
    
    // Only load if we haven't loaded yet, or if user changed
    if (hasLoadedOnce && !userChanged) {
      return; // Don't reload if we've already loaded and user hasn't changed
    }
    
    async function loadFishCart() {
      setLoading(true);
      try {
        if (user) {
          // User just logged in - check if we need to sync localStorage fish cart
          const wasGuest = !previousUser && user;
          const localFishCartKey = "fishCart";
          const storedLocalFishCart = typeof window !== "undefined" ? localStorage.getItem(localFishCartKey) : null;
          
          // Load from backend first
          try {
            const response = await getFishCart();
            if (response.cart && response.cart.items && response.cart.items.length > 0) {
              // Convert backend fish cart items to frontend format
              const convertedFishCart: FishCartItem[] = response.cart.items.map((item) => {
                const backendItem = item as BackendFishCartItem;
                const fishProduct = typeof backendItem.fishProduct === 'string' 
                  ? { _id: backendItem.fishProduct } as FishProduct
                  : backendItem.fishProduct;
                const sizeCategoryId = typeof backendItem.sizeCategoryId === 'object' 
                  ? backendItem.sizeCategoryId._id 
                  : backendItem.sizeCategoryId;
                return {
                  _id: backendItem._id,
                  fishProduct,
                  sizeCategoryId,
                  sizeCategoryLabel: backendItem.sizeCategoryLabel,
                  pricePerKg: backendItem.pricePerKg,
                  quantity: (backendItem as any).quantity || 1,
                } as FishCartItem;
              });
              setFishCart(convertedFishCart);
              setLoading(false);
              setHasLoadedOnce(true);
              
              // Clear localStorage since backend has the source of truth
              localStorage.removeItem(localFishCartKey);
              
              // Sync localStorage fish cart in background (non-blocking)
              if (wasGuest && storedLocalFishCart) {
                try {
                  const localFishCartItems = JSON.parse(storedLocalFishCart) as FishCartItem[];
                  if (Array.isArray(localFishCartItems) && localFishCartItems.length > 0) {
                    syncLocalFishCartToBackend(localFishCartItems).then((syncResults) => {
                      if (syncResults.success > 0) {
                        localStorage.removeItem(localFishCartKey);
                        logger.info("Cleared localStorage fish cart after successful sync");
                        
                        // Reload fish cart after sync
                        getFishCart().then((response) => {
                          if (response.cart && response.cart.items) {
                            const convertedFishCart: FishCartItem[] = response.cart.items.map((item) => {
                              const backendItem = item as BackendFishCartItem;
                              const fishProduct = typeof backendItem.fishProduct === 'string' 
                                ? { _id: backendItem.fishProduct } as FishProduct
                                : backendItem.fishProduct;
                              const sizeCategoryId = typeof backendItem.sizeCategoryId === 'object' 
                                ? backendItem.sizeCategoryId._id 
                                : backendItem.sizeCategoryId;
                              return {
                                _id: backendItem._id,
                                fishProduct,
                                sizeCategoryId,
                                sizeCategoryLabel: backendItem.sizeCategoryLabel,
                                pricePerKg: backendItem.pricePerKg,
                                quantity: (backendItem as any).quantity || 1,
                              } as FishCartItem;
                            });
                            setFishCart(convertedFishCart);
                          }
                        }).catch((error) => {
                          logger.error("Error reloading fish cart after sync:", error);
                        });
                      }
                    }).catch((error) => {
                      logger.error("Error syncing localStorage fish cart:", error);
                    });
                  }
                } catch (error) {
                  logger.error("Error parsing localStorage fish cart:", error);
                }
              }
              return;
            } else {
              // Backend fish cart is empty - check localStorage as backup
              const localFishCartKey = "fishCart";
              const stored = typeof window !== "undefined" ? localStorage.getItem(localFishCartKey) : null;
              if (stored) {
                try {
                  const localFishCartItems = JSON.parse(stored) as FishCartItem[];
                  if (Array.isArray(localFishCartItems) && localFishCartItems.length > 0) {
                    logger.info("Backend fish cart empty but localStorage has items - syncing in background");
                    setFishCart(localFishCartItems);
                    setLoading(false);
                    setHasLoadedOnce(true);
                    
                    // Sync localStorage items to backend in background
                    syncLocalFishCartToBackend(localFishCartItems).then((syncResults) => {
                      if (syncResults.success > 0) {
                        // Reload fish cart from backend after sync
                        getFishCart().then((response) => {
                          if (response.cart && response.cart.items && response.cart.items.length > 0) {
                            const convertedFishCart: FishCartItem[] = response.cart.items.map((item) => {
                              const backendItem = item as BackendFishCartItem;
                              const fishProduct = typeof backendItem.fishProduct === 'string' 
                                ? { _id: backendItem.fishProduct } as FishProduct
                                : backendItem.fishProduct;
                              const sizeCategoryId = typeof backendItem.sizeCategoryId === 'object' 
                                ? backendItem.sizeCategoryId._id 
                                : backendItem.sizeCategoryId;
                              return {
                                _id: backendItem._id,
                                fishProduct,
                                sizeCategoryId,
                                sizeCategoryLabel: backendItem.sizeCategoryLabel,
                                pricePerKg: backendItem.pricePerKg,
                                quantity: (backendItem as any).quantity || 1,
                              } as FishCartItem;
                            });
                            setFishCart(convertedFishCart);
                            localStorage.removeItem(localFishCartKey);
                          }
                        }).catch((error) => {
                          logger.error("Error reloading fish cart after sync:", error);
                        });
                      }
                    }).catch((error) => {
                      logger.error("Error syncing localStorage fish cart to backend:", error);
                    });
                    return;
                  }
                } catch (parseError) {
                  logger.error("Error parsing localStorage fish cart:", parseError);
                }
              }
              setFishCart([]);
              setLoading(false);
              setHasLoadedOnce(true);
            }
          } catch (error) {
            logger.error("Error loading fish cart from backend:", error);
            // Fallback to localStorage if backend fails
            const stored = typeof window !== "undefined" ? localStorage.getItem("fishCart") : null;
            if (stored) {
              try {
                setFishCart(JSON.parse(stored) as FishCartItem[]);
              } catch (parseError) {
                logger.error("Error parsing localStorage fish cart:", parseError);
                setFishCart([]);
              }
            } else {
              setFishCart([]);
            }
            setLoading(false);
            setHasLoadedOnce(true);
            return;
          }
        } else {
          // Load from localStorage for guest users
          const stored = typeof window !== "undefined" ? localStorage.getItem("fishCart") : null;
          if (stored) {
            try {
              setFishCart(JSON.parse(stored) as FishCartItem[]);
            } catch (error) {
              logger.error("Error parsing localStorage fish cart:", error);
              setFishCart([]);
            }
          } else {
            setFishCart([]);
          }
          setLoading(false);
          setHasLoadedOnce(true);
        }
      } catch (error) {
        logger.error("Error loading fish cart:", error);
        setFishCart([]);
        setLoading(false);
        setHasLoadedOnce(true);
      }
    }
    loadFishCart();
  }, [user, previousUser, hasLoadedOnce]);
  
  // Update previousUser separately to avoid infinite loop
  useEffect(() => {
    setPreviousUser(user);
  }, [user]);

  // Save fish cart to localStorage for both guest and logged-in users (as backup)
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem("fishCart", JSON.stringify(fishCart));
      } catch (error) {
        logger.error("Error saving fish cart to localStorage:", error);
      }
    }
  }, [fishCart, loading]);

  const addToFishCart = useCallback(async (fishProduct: FishProduct, sizeCategoryId: string, quantity: number = 1) => {
    try {
      const fishProductId = fishProduct._id || fishProduct.id;
      if (!fishProductId) {
        throw new Error("Fish product ID is missing");
      }

      // Find size category
      const sizeCategory = fishProduct.sizeCategories?.find((sc) => sc._id === sizeCategoryId);
      if (!sizeCategory) {
        throw new Error("Size category not found");
      }

      // Optimistic update - update UI immediately
      setFishCart((prev) => {
        // Check if item already exists (same fish product + same size category)
        const existingIndex = prev.findIndex((item) => {
          const itemFishProductId = typeof item.fishProduct === 'string' 
            ? item.fishProduct 
            : (item.fishProduct._id || item.fishProduct.id);
          return itemFishProductId === fishProductId && item.sizeCategoryId === sizeCategoryId;
        });

        if (existingIndex > -1) {
          // Item already exists - increment quantity
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: (updated[existingIndex].quantity || 1) + quantity,
          };
          return updated;
        }

        // Add new item with quantity
        const newItem: FishCartItem = {
          fishProduct,
          sizeCategoryId,
          sizeCategoryLabel: sizeCategory.label,
          pricePerKg: sizeCategory.pricePerKg,
          quantity: quantity,
        };
        return [...prev, newItem];
      });
      setIsSidebarOpen(true);

      // Sync with backend (non-blocking) if user is logged in
      if (user) {
        addToFishCartAPI(fishProductId, sizeCategoryId, quantity)
          .then(() => {
            logger.info("Successfully synced fish product to backend fish cart");
          })
          .catch((error) => {
            logger.error("Error adding to fish cart via API:", error);
          });
      }
    } catch (error) {
      logger.error("Error adding to fish cart:", error);
    }
  }, [user]);

  const updateFishCartQuantity = useCallback(async (fishProductId: string, sizeCategoryId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        // If quantity is 0 or less, remove the item
        await removeFromFishCart(fishProductId, sizeCategoryId);
        return;
      }

      // Optimistic update
      setFishCart((prev) => {
        const updated = prev.map((item) => {
          const itemFishProductId = typeof item.fishProduct === 'string' 
            ? item.fishProduct 
            : (item.fishProduct._id || item.fishProduct.id);
          if (itemFishProductId === fishProductId && item.sizeCategoryId === sizeCategoryId) {
            return { ...item, quantity };
          }
          return item;
        });
        
        // Save to localStorage for guest users immediately
        if (!user && typeof window !== "undefined") {
          try {
            localStorage.setItem("fishCart", JSON.stringify(updated));
            logger.info("Saved updated fish cart to localStorage for guest user");
          } catch (error) {
            logger.error("Error saving fish cart to localStorage:", error);
          }
        }
        
        return updated;
      });

      // Sync with backend if user is logged in
      if (user) {
        // Use the update quantity endpoint to set the exact quantity
        try {
          const response = await updateFishCartQuantityAPI(fishProductId, sizeCategoryId, quantity);
          logger.info("Successfully updated fish cart quantity via API", { fishProductId, sizeCategoryId, quantity, response });
          
          // Handle different response structures from NestJS interceptor
          // Response could be: { success: true, data: { cart: {...} } } or { cart: {...} } or directly the cart
          let cartData: any = null;
          if (response) {
            if ((response as any).cart) {
              cartData = (response as any).cart;
            } else if ((response as any).data?.cart) {
              cartData = (response as any).data.cart;
            } else if ((response as any).data && (response as any).data.items) {
              // Response is directly the cart object
              cartData = (response as any).data;
            } else if ((response as any).items) {
              // Response is directly the cart object (no wrapper)
              cartData = response;
            }
          }
          
          if (cartData && cartData.items && Array.isArray(cartData.items)) {
            // Merge backend response with current state to preserve any optimistic updates
            setFishCart((currentCart) => {
              const convertedFishCart: FishCartItem[] = cartData.items.map((item: any) => {
                const backendItem = item as BackendFishCartItem;
                const fishProduct = typeof backendItem.fishProduct === 'string' 
                  ? { _id: backendItem.fishProduct } as FishProduct
                  : backendItem.fishProduct;
                const sizeCategoryId = typeof backendItem.sizeCategoryId === 'object' 
                  ? backendItem.sizeCategoryId._id 
                  : backendItem.sizeCategoryId;
                const backendQuantity = Number((backendItem as any).quantity) || 1;
                
                // Find matching item in current cart to preserve optimistic updates
                const currentItem = currentCart.find((ci) => {
                  const ciProductId = typeof ci.fishProduct === 'string' 
                    ? ci.fishProduct 
                    : (ci.fishProduct._id || ci.fishProduct.id);
                  return ciProductId === (typeof fishProduct === 'string' ? fishProduct : (fishProduct._id || fishProduct.id)) 
                    && ci.sizeCategoryId === sizeCategoryId;
                });
                
                // Use backend quantity, but if current cart has a higher quantity and we just updated, keep the higher one
                // This prevents race conditions where backend hasn't updated yet
                const currentQuantity = currentItem?.quantity || 1;
                const finalQuantity = (currentItem && currentQuantity > backendQuantity && currentQuantity === quantity)
                  ? currentQuantity  // Keep optimistic update if it matches what we just set
                  : backendQuantity;     // Otherwise use backend value
                
                logger.info(`Updated fish cart item quantity from backend: ${finalQuantity}`, { 
                  backendItem, 
                  rawQuantity: (backendItem as any).quantity,
                  backendQuantity,
                  currentQuantity: currentItem?.quantity,
                  requestedQuantity: quantity,
                  finalQuantity
                });
                
                return {
                  _id: backendItem._id,
                  fishProduct,
                  sizeCategoryId,
                  sizeCategoryLabel: backendItem.sizeCategoryLabel,
                  pricePerKg: backendItem.pricePerKg,
                  quantity: finalQuantity,
                } as FishCartItem;
              });
              logger.info("Fish cart state updated from backend response", { convertedFishCart, quantities: convertedFishCart.map(i => i.quantity) });
              return convertedFishCart;
            });
          } else {
            logger.warn("Backend response missing cart or items", { response, cartData });
          }
        } catch (error) {
          logger.error("Error updating fish cart quantity via API:", error);
          // Don't revert - keep optimistic update, but log the error
          // The user should see the updated quantity even if backend update fails
        }
      }
    } catch (error) {
      logger.error("Error updating fish cart quantity:", error);
    }
  }, [user]);

  const removeFromFishCart = useCallback(async (fishProductId: string, sizeCategoryId: string) => {
    try {
      // Optimistic update - update UI immediately
      setFishCart((prev) =>
        prev.filter((item) => {
          const itemFishProductId = typeof item.fishProduct === 'string' 
            ? item.fishProduct 
            : (item.fishProduct._id || item.fishProduct.id);
          return !(itemFishProductId === fishProductId && item.sizeCategoryId === sizeCategoryId);
        }),
      );

      // Sync with backend (non-blocking) if user is logged in
      if (user) {
        removeFromFishCartAPI(fishProductId, sizeCategoryId)
          .then(() => {
            logger.info("Successfully removed fish product from backend fish cart");
          })
          .catch((error) => {
            logger.error("Error removing from fish cart via API:", error);
          });
      }
    } catch (error) {
      logger.error("Error removing from fish cart:", error);
    }
  }, [user]);

  const clearFishCart = useCallback(async () => {
    try {
      // Clear frontend state immediately
      setFishCart([]);
      
      // Clear localStorage
      try {
        localStorage.removeItem("fishCart");
        logger.info("LocalStorage fish cart cleared");
      } catch (localStorageError) {
        logger.error("Error clearing localStorage fish cart:", localStorageError);
      }
      
      // If user is logged in, also clear backend fish cart
      if (user) {
        try {
          await clearFishCartBackend();
          logger.info("Backend fish cart cleared successfully");
        } catch (error) {
          logger.error("Error clearing fish cart via API:", error);
        }
      }
    } catch (error) {
      logger.error("Error clearing fish cart:", error);
      setFishCart([]);
      try {
        localStorage.removeItem("fishCart");
      } catch (localStorageError) {
        logger.error("Error clearing localStorage fish cart in error handler:", localStorageError);
      }
    }
  }, [user]);

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  // Save fishCart to localStorage whenever it changes (for guest users)
  useEffect(() => {
    if (!user && !loading && typeof window !== "undefined") {
      try {
        localStorage.setItem("fishCart", JSON.stringify(fishCart));
        logger.info("Auto-saved fish cart to localStorage for guest user");
      } catch (error) {
        logger.error("Error auto-saving fish cart to localStorage:", error);
      }
    }
  }, [fishCart, user, loading]);

  const contextValue = useMemo(
    () => ({
      fishCart,
      loading,
      syncing,
      addToFishCart,
      updateFishCartQuantity,
      removeFromFishCart,
      clearFishCart,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
    }),
    [fishCart, loading, syncing, isSidebarOpen, addToFishCart, updateFishCartQuantity, removeFromFishCart, clearFishCart, openSidebar, closeSidebar],
  );

  return <FishCartContext.Provider value={contextValue}>{children}</FishCartContext.Provider>;
}

export function useFishCart(): FishCartContextType {
  const context = useContext(FishCartContext);
  if (!context) {
    throw new Error("useFishCart must be used within a FishCartProvider");
  }
  return context;
}

