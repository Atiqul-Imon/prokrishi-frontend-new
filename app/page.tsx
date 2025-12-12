"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/app/utils/api";
import { fishProductApi } from "@/app/utils/fishApi";
import { logger } from "@/app/utils/logger";
import { Product, FishProduct } from "@/types/models";
import { Card } from "@/components/ui/Card";

export default function Home() {
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
        // Fetch only regular featured products
        const data = await getFeaturedProducts();
        setFeaturedProducts(data.products || []);
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
        // Fetch all fish products (not just featured)
        const response = await fishProductApi.getAll({
          limit: 100, // Get up to 100 fish products
          status: 'active',
          sort: 'createdAt',
          order: 'desc',
        });

        // fishProductApi.getAll() returns { success, fishProducts, pagination }
        const fishProductsList = response.fishProducts || [];

        // Transform fish products to match Product type for display
        const transformedFishProducts: Product[] = fishProductsList.map((fp: FishProduct) => ({
          _id: fp._id,
          name: fp.name,
          price: fp.priceRange?.min || 0, // Use min price from range
          stock: fp.availableStock || 0,
          image: fp.image,
          unit: 'kg', // Fish products are sold by weight
          measurement: 1,
          category: fp.category,
          isFishProduct: true, // Mark as fish product
          priceRange: fp.priceRange, // Keep price range for fish products
          sizeCategories: fp.sizeCategories, // Keep size categories
          createdAt: fp.createdAt, // Keep creation date for sorting
        }));

        // Sort by creation date (newest first)
        transformedFishProducts.sort((a, b) => {
          const dateA = new Date((a as Product & { createdAt?: string }).createdAt || 0).getTime();
          const dateB = new Date((b as Product & { createdAt?: string }).createdAt || 0).getTime();
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
            <div className="product-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-4 lg:gap-6 items-stretch">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
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
              <div className="product-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-4 lg:gap-6 items-stretch">
                {fishProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
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
