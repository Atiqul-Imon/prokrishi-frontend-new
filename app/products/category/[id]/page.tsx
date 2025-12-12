"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCategoryById, getAllProducts } from "@/app/utils/api";
import { logger } from "@/app/utils/logger";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function ProductsByCategoryPage() {
  const params = useParams();
  const { id: categoryId } = params;
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!categoryId) return;

    async function fetchData() {
      setLoading(true);
      try {
        // Fetch category info first
        const categoryRes = await getCategoryById(categoryId as string);
        if (categoryRes.success && categoryRes.category) {
          setCategory(categoryRes.category);
        }

        // Fetch products filtered by category
        const productRes = await getAllProducts({
          category: categoryId as string,
          limit: 100, // Get more products for category page
        });

        if (productRes.products) {
          setProducts(productRes.products);
        } else {
          setProducts([]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load products");
        logger.error("Error fetching data for category page:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
          <Card padding="lg">
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <Link href="/products">
                <Button variant="primary">Browse All Products</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 pb-20">
      <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to All Products
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {category ? category.name : "Category"} Products
          </h1>
          <p className="text-gray-600">
            {products.length} {products.length === 1 ? "product" : "products"} found
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <Card padding="lg">
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No Products Found
              </h2>
              <p className="text-gray-600 mb-6">
                There are currently no products available in this category.
              </p>
              <Link href="/products">
                <Button variant="primary">Browse All Products</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

