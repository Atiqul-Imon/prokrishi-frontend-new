"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getFeaturedProducts } from "@/app/utils/api";
import { fishProductApi } from "@/app/utils/fishApi";
import { logger } from "@/app/utils/logger";
import { Product, FishProduct } from "@/types/models";
import { Card } from "@/components/ui/Card";

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

export default function HomeClient() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [fishProducts, setFishProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fishLoading, setFishLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fishError, setFishError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        setLoading(true);
        const data = await getFeaturedProducts();
        
        // Debug: Log raw response
        logger.debug("Featured products raw response:", {
          productCount: data.products?.length || 0,
          firstProduct: data.products?.[0] ? {
            name: data.products[0].name,
            stock: data.products[0].stock,
            hasVariants: data.products[0].hasVariants,
            variantSummary: data.products[0].variantSummary,
            variants: data.products[0].variants?.length || 0,
          } : null,
        });
        
        // Normalize products - ensure stock field is set correctly
        const normalizedProducts = (data.products || []).map((product: any) => {
          let calculatedStock = 0;
          
          // Check if product has variants (check both hasVariants flag and actual variants array)
          const hasVariants = product.hasVariants || (product.variants && Array.isArray(product.variants) && product.variants.length > 0);
          
          if (hasVariants && product.variants && product.variants.length > 0) {
            // Use variantSummary if available (from backend calculation)
            if (product.variantSummary?.totalStock !== undefined && product.variantSummary.totalStock > 0) {
              calculatedStock = product.variantSummary.totalStock;
            } else {
              // Fallback: calculate from variants directly (only count active variants)
              calculatedStock = product.variants
                .filter((v: any) => v && (v.status === 'active' || !v.status))
                .reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
            }
          } else {
            // For products without variants, use stock field directly
            calculatedStock = Number(product.stock) || 0;
          }
          
          logger.debug("Product stock normalization:", {
            name: product.name,
            hasVariants: product.hasVariants,
            hasVariantsCalculated: hasVariants,
            variantCount: product.variants?.length || 0,
            variantSummary: product.variantSummary?.totalStock,
            originalStock: product.stock,
            calculatedStock,
          });
          
          return {
            ...product,
            stock: calculatedStock,
            hasVariants: hasVariants, // Ensure hasVariants is set correctly
          };
        });
        setFeaturedProducts(normalizedProducts);
      } catch (err) {
        logger.error("Error loading featured products:", err);
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    }

    async function loadFishProducts() {
      try {
        setFishLoading(true);
        const response = await fishProductApi.getAll({
          limit: 100,
          status: "active",
          sort: "createdAt",
          order: "desc",
        });

        const fishProductsList = response.fishProducts || [];
        const transformedFishProducts: Product[] = fishProductsList.map((fp: FishProduct) => ({
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

        transformedFishProducts.sort((a, b) => {
          const dateA = new Date((a as any).createdAt || 0).getTime();
          const dateB = new Date((b as any).createdAt || 0).getTime();
          return dateB - dateA;
        });

        setFishProducts(transformedFishProducts);
      } catch (err) {
        logger.error("Error loading fish products:", err);
        setFishError("Failed to load fish products");
      } finally {
        setFishLoading(false);
      }
    }

    loadFeaturedProducts();
    loadFishProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Featured Products Section */}
      <section className="py-6 sm:py-8 lg:py-12 bg-white w-full">
        <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 xl:max-w-[90%] 2xl:max-w-[70%]">
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
              <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">Loading products...</p>
            </div>
          ) : error ? (
            <Card padding="lg">
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Link href="/products">
                  <button className="px-4 py-2 bg-[var(--primary-green)] text-white rounded-lg hover:bg-[var(--primary-green)]/90 transition-colors">
                    Browse All Products
                  </button>
                </Link>
              </div>
            </Card>
          ) : featuredProducts.length > 0 ? (
            <ProductGrid
              products={featuredProducts}
              columns={{ mobile: 2, tablet: 3, desktop: 4, wide: 6 }}
              gap="md"
              showBadges={true}
              emptyMessage="No featured products available at the moment."
            />
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
          ) : fishProducts.length > 0 ? (
            <>
              <ProductGrid
                products={fishProducts}
                columns={{ mobile: 2, tablet: 3, desktop: 4, wide: 6 }}
                gap="md"
                showBadges={true}
                emptyMessage="No fish products available at the moment."
              />
              {fishProducts.length >= 100 && (
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

