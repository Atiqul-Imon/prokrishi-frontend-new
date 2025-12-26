"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getFeaturedProducts } from "@/app/utils/api";
import { fishProductApi } from "@/app/utils/fishApi";
import { logger } from "@/app/utils/logger";
import { normalizeProducts } from "@/app/utils/productNormalizer";
import { Product, FishProduct } from "@/types/models";
import { Card } from "@/components/ui/Card";
import { useIntersectionObserver } from "@/app/hooks/useIntersectionObserver";

// Code-splitting for heavy home components
const HeroSection = dynamic(() => import("@/components/HeroSection"), {
  ssr: true,
  loading: () => (
    <div className="w-full h-[220px] sm:h-[260px] md:h-[320px] bg-gray-100 animate-pulse rounded-xl" />
  ),
});

const FeaturedCategories = dynamic(() => import("@/components/FeaturedCategories"), {
  ssr: true,
  loading: () => (
    <div className="w-full h-[140px] sm:h-[160px] bg-gray-50 border border-gray-100 rounded-xl animate-pulse" />
  ),
});

const ProductGrid = dynamic(() => import("@/components/ProductGrid"), {
  ssr: true,
  loading: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  ),
});

// Smart lazy loading configuration
const INITIAL_BATCH_SIZE = 12; // Load first 12 products immediately
const LAZY_BATCH_SIZE = 6; // Load 6 more products per batch
const TOTAL_PRODUCTS = 30; // Total products to show

export default function HomeClient() {
  // Featured products state
  const [allFeaturedProducts, setAllFeaturedProducts] = useState<Product[]>([]);
  const [featuredDisplayCount, setFeaturedDisplayCount] = useState(INITIAL_BATCH_SIZE);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredLoadingMore, setFeaturedLoadingMore] = useState(false);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  // Fish products state
  const [allFishProducts, setAllFishProducts] = useState<Product[]>([]);
  const [fishDisplayCount, setFishDisplayCount] = useState(INITIAL_BATCH_SIZE);
  const [fishLoading, setFishLoading] = useState(true);
  const [fishLoadingMore, setFishLoadingMore] = useState(false);
  const [fishError, setFishError] = useState<string | null>(null);

  // Intersection observers for lazy loading
  const [featuredTriggerRef, isFeaturedVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '200px', // Start loading 200px before section is visible
    triggerOnce: false,
  });

  const [fishTriggerRef, isFishVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '200px',
    triggerOnce: false,
  });

  // Load initial products (first batch)
  useEffect(() => {
    async function loadInitialProducts() {
      setFeaturedLoading(true);
      setFishLoading(true);
      
      try {
        const [featuredRes, fishRes] = await Promise.allSettled([
          getFeaturedProducts(),
          fishProductApi.getAll({
            limit: TOTAL_PRODUCTS,
            status: "active",
            sort: "createdAt",
            order: "desc",
          }),
        ]);

        // Handle featured products
        if (featuredRes.status === 'fulfilled') {
          const normalizedProducts = normalizeProducts(featuredRes.value.products || []);
          setAllFeaturedProducts(normalizedProducts.slice(0, TOTAL_PRODUCTS));
        } else {
          logger.error("Error loading featured products:", featuredRes.reason);
          setFeaturedError("Failed to load featured products");
        }

        // Handle fish products
        if (fishRes.status === 'fulfilled') {
          const fishProductsList = fishRes.value.fishProducts || [];
          const transformedFishProducts: Product[] = fishProductsList
            .slice(0, TOTAL_PRODUCTS)
            .map((fp: FishProduct) => ({
              _id: fp._id,
              name: fp.name,
              price: (fp as any).priceRange?.min || 0,
              stock: (fp as any).availableStock || 0,
              image: fp.image,
              unit: "kg",
              measurement: 1,
              category: fp.category,
              isFishProduct: true,
              priceRange: (fp as any).priceRange,
              sizeCategories: fp.sizeCategories,
              createdAt: (fp as any).createdAt,
            }));
          setAllFishProducts(transformedFishProducts);
        } else {
          logger.error("Error loading fish products:", fishRes.reason);
          setFishError("Failed to load fish products");
        }
      } catch (err) {
        logger.error("Error loading products:", err);
        setFeaturedError("Failed to load products");
        setFishError("Failed to load fish products");
      } finally {
        setFeaturedLoading(false);
        setFishLoading(false);
      }
    }

    loadInitialProducts();
  }, []);

  // Smart lazy loading: Load more featured products when section becomes visible
  useEffect(() => {
    if (
      isFeaturedVisible &&
      !featuredLoadingMore &&
      featuredDisplayCount < allFeaturedProducts.length &&
      allFeaturedProducts.length > 0
    ) {
      setFeaturedLoadingMore(true);
      
      // Simulate smooth loading with small delay for better UX
      setTimeout(() => {
        setFeaturedDisplayCount((prev) => 
          Math.min(prev + LAZY_BATCH_SIZE, allFeaturedProducts.length)
        );
        setFeaturedLoadingMore(false);
      }, 300);
    }
  }, [isFeaturedVisible, featuredDisplayCount, allFeaturedProducts.length, featuredLoadingMore]);

  // Smart lazy loading: Load more fish products when section becomes visible
  useEffect(() => {
    if (
      isFishVisible &&
      !fishLoadingMore &&
      fishDisplayCount < allFishProducts.length &&
      allFishProducts.length > 0
    ) {
      setFishLoadingMore(true);
      
      // Simulate smooth loading with small delay for better UX
      setTimeout(() => {
        setFishDisplayCount((prev) => 
          Math.min(prev + LAZY_BATCH_SIZE, allFishProducts.length)
        );
        setFishLoadingMore(false);
      }, 300);
    }
  }, [isFishVisible, fishDisplayCount, allFishProducts.length, fishLoadingMore]);

  // Memoized displayed products (only show what's loaded)
  const displayedFeaturedProducts = useMemo(
    () => allFeaturedProducts.slice(0, featuredDisplayCount),
    [allFeaturedProducts, featuredDisplayCount]
  );

  const displayedFishProducts = useMemo(
    () => allFishProducts.slice(0, fishDisplayCount),
    [allFishProducts, fishDisplayCount]
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Featured Products Section */}
      <section className="py-6 sm:py-8 lg:py-12 bg-white w-full">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 xl:max-w-[90%] 2xl:max-w-[70%]">
          {featuredLoading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">Loading products...</p>
            </div>
          ) : featuredError ? (
            <Card padding="lg">
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{featuredError}</p>
                <Link href="/products">
                  <button className="px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[var(--primary-green)]/90 transition-colors">
                    Browse All Products
                  </button>
                </Link>
              </div>
            </Card>
          ) : displayedFeaturedProducts.length > 0 ? (
            <>
              <ProductGrid
                products={displayedFeaturedProducts}
                columns={{ mobile: 2, tablet: 3, desktop: 4, wide: 6 }}
                gap="md"
                showBadges={true}
                emptyMessage="No featured products available at the moment."
              />
              {/* Lazy loading trigger and loading indicator */}
              {featuredDisplayCount < allFeaturedProducts.length && (
                <div ref={featuredTriggerRef} className="mt-8">
                  {featuredLoadingMore && (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <p className="text-gray-500 mt-2 text-sm">Loading more products...</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-sm sm:text-base">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Fish Products Section */}
      <section className="py-6 sm:py-8 lg:py-12 bg-gray-50 w-full">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 xl:max-w-[90%] 2xl:max-w-[70%]">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">মাছ (Fish Products)</h2>
            <p className="text-gray-600 text-sm sm:text-base">Fresh fish products available for delivery</p>
          </div>

          {fishLoading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">Loading fish products...</p>
            </div>
          ) : fishError ? (
            <Card padding="lg">
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{fishError}</p>
                <Link href="/fish">
                  <button className="px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[var(--primary-green)]/90 transition-colors">
                    Browse All Fish Products
                  </button>
                </Link>
              </div>
            </Card>
          ) : displayedFishProducts.length > 0 ? (
            <>
              <ProductGrid
                products={displayedFishProducts}
                columns={{ mobile: 2, tablet: 3, desktop: 4, wide: 6 }}
                gap="md"
                showBadges={true}
                emptyMessage="No fish products available at the moment."
              />
              {/* Lazy loading trigger and loading indicator */}
              {fishDisplayCount < allFishProducts.length && (
                <div ref={fishTriggerRef} className="mt-8">
                  {fishLoadingMore && (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <p className="text-gray-500 mt-2 text-sm">Loading more products...</p>
                    </div>
                  )}
                </div>
              )}
              {/* Show "View All" button when all products are loaded */}
              {fishDisplayCount >= allFishProducts.length && allFishProducts.length >= 30 && (
                <div className="text-center mt-8">
                  <Link href="/fish">
                    <button className="px-6 py-3 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[var(--primary-green)]/90 transition-colors font-semibold">
                      View All Fish Products
                    </button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <p className="text-gray-500 text-sm sm:text-base">No fish products available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

