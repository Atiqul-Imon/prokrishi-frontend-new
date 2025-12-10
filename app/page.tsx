"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import FeaturedCategories from "@/components/FeaturedCategories";
import ProductCard from "@/components/ProductCard";
import { getFeaturedProducts } from "@/app/utils/api";
import { Product } from "@/types/models";
import { Card } from "@/components/ui/Card";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        setLoading(true);
        const data = await getFeaturedProducts();
        setFeaturedProducts(data.products || []);
      } catch (err: any) {
        console.error("Error loading featured products:", err);
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    }
    loadFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Featured Products Section - Titleless (matches old frontend) */}
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

    </div>
  );
}
