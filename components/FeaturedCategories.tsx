"use client";

import React, { useEffect, useState, memo } from "react";
import Link from "next/link";
import ImageKitImage from "@/components/ui/ImageKitImage";
import { getFeaturedCategories } from "@/app/utils/api";
import { Category } from "@/types/models";

const CategoryCard = memo(({ category, isFirst }: { category: Category; isFirst?: boolean }) => (
  <Link
    href={`/products/category/${category._id}`}
    className="group block text-center p-3 sm:p-4 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 focus:outline-none focus:ring-0 focus:border-0"
  >
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-2 sm:mb-3 overflow-hidden rounded-xl border border-gray-200 group-hover:border-emerald-500 group-hover:shadow-md transition-all duration-300 bg-white">
      {category.image ? (
        <ImageKitImage
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          loading={isFirst ? "eager" : "lazy"}
          priority={isFirst}
          imageType="category"
          size="medium"
          quality={75}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <span className="text-gray-400 text-xs font-semibold">{category.name.charAt(0)}</span>
        </div>
      )}
    </div>
    <h3 className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300 line-clamp-2 leading-tight">
      {category.name}
    </h3>
  </Link>
));

function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        setError(null);
        const data = await getFeaturedCategories();
        const categoriesList = data.categories || [];
        if (process.env.NODE_ENV === 'development') {
          console.log("Loaded categories:", categoriesList.length, categoriesList);
        }
        setCategories(categoriesList.slice(0, 8));
      } catch (err: any) {
        const errorMessage = err?.message || "Failed to load featured categories.";
        setError(errorMessage);
        if (process.env.NODE_ENV === 'development') {
          console.error("Error loading categories:", err);
        }
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-8 lg:py-12 bg-gradient-to-br from-amber-50 via-white to-green-50">
        <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 mt-4">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Categories error:", error);
    }
    // Don't hide on error, show a message instead for debugging
    return (
      <section className="py-8 lg:py-12 bg-gradient-to-br from-amber-50 via-white to-green-50">
        <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
          <div className="text-center text-red-600">
            <p>Failed to load categories: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("No categories found");
    }
    return null;
  }

  return (
    <section className="py-8 lg:py-12 bg-gradient-to-br from-amber-50 via-white to-green-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-4 md:gap-6 justify-center">
          {categories.map((category, index) => (
            <CategoryCard key={category._id} category={category} isFirst={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(FeaturedCategories);

