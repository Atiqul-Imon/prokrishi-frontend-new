"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getFeaturedCategories } from "@/app/utils/api";
import { Category } from "@/types/models";

const CategoryCard = ({ category }: { category: Category }) => (
  <Link
    href={`/products/category/${category._id}`}
    className="group block text-center p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
  >
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 overflow-hidden rounded-full border-2 border-gray-200 group-hover:border-[var(--primary-green)] transition-colors duration-300">
      {category.image ? (
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
          <span className="text-gray-400 text-xs">{category.name.charAt(0)}</span>
        </div>
      )}
    </div>
    <h3 className="text-sm font-semibold text-gray-800 group-hover:text-[var(--primary-green)] transition-colors duration-300 line-clamp-2">
      {category.name}
    </h3>
  </Link>
);

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const data = await getFeaturedCategories();
        setCategories((data.categories || []).slice(0, 8));
      } catch (err: any) {
        setError("Failed to load featured categories.");
        console.error(err);
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

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section className="py-8 lg:py-12 bg-gradient-to-br from-amber-50 via-white to-green-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6 justify-center">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

