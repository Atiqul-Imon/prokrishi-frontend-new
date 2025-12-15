"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCategoryById, getAllProducts, getAllCategories } from "@/app/utils/api";
import { fishProductApi } from "@/app/utils/fishApi";
import { logger } from "@/app/utils/logger";
import { handleApiError } from "@/app/utils/errorHandler";
import ProductGrid from "@/components/ProductGrid";
import { ProductGridSkeleton, Skeleton } from "@/components/ui/SkeletonLoader";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";
import type { Product, Category } from "@/types/models";

export default function ProductsByCategoryPage() {
  const params = useParams();
  const { id: categoryId } = params;
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
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

        const categoryName = categoryRes.category?.name || "";
        const categorySlug = categoryRes.category?.slug || "";
        
        // Get all categories to find fish category ID (more reliable than name matching)
        let fishCategoryId: string | null = null;
        try {
          const allCategoriesRes = await getAllCategories();
          if (allCategoriesRes.success && allCategoriesRes.categories) {
            const fishCategory = allCategoriesRes.categories.find((cat: any) => {
              const name = (cat.name || "").toLowerCase().trim();
              const slug = (cat.slug || "").toLowerCase().trim();
              return (
                name === "মাছ" ||
                name.includes("মাছ") ||
                name === "machh" ||
                name === "fish" ||
                name.includes("fish") ||
                slug === "machh" ||
                slug === "fish" ||
                slug.includes("fish")
              );
            });
            if (fishCategory) {
              fishCategoryId = fishCategory._id;
            }
          }
        } catch (catErr) {
          logger.warn("Failed to fetch all categories for fish detection:", catErr);
        }
        
        // Check if this is the fish category - use ID match (most reliable) or name match
        const normalizedCategoryName = categoryName.toLowerCase().trim();
        const isFishCategory = 
          fishCategoryId === categoryId ||
          categoryName === "মাছ" || 
          normalizedCategoryName === "মাছ" ||
          normalizedCategoryName === "machh" || 
          normalizedCategoryName === "fish" ||
          normalizedCategoryName.includes("মাছ") ||
          normalizedCategoryName.includes("fish") ||
          categorySlug === "machh" ||
          categorySlug === "fish" ||
          categorySlug.includes("fish");
        
        logger.debug("Category page - Category:", {
          id: categoryId,
          name: categoryName,
          slug: categorySlug,
          fishCategoryId,
          isFishCategory,
        });

        // Fetch regular products filtered by category
        const productRes = await getAllProducts({
          category: categoryId as string,
          limit: 100, // Get more products for category page
        });

        let allProducts: Product[] = [];

        // Normalize regular products - ensure stock field is set correctly
        if (productRes.products) {
          const normalizedProducts = productRes.products.map((product: any) => {
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
            
            return {
              ...product,
              stock: calculatedStock,
              hasVariants: hasVariants, // Ensure hasVariants is set correctly
            };
          });
          allProducts = normalizedProducts;
        }

        // If this is the fish category, also fetch fish products
        if (isFishCategory) {
          try {
            // Try with the category ID first, then without filter if no results
            const categoryToUse = fishCategoryId || categoryId;
            logger.debug("Fetching fish products for category:", categoryToUse);
            
            let fishRes = await fishProductApi.getAll({
              category: categoryToUse as string,
              limit: 100,
              status: "active",
            });

            // If no products found with category filter, try without filter to see if there are any fish products
            if (!fishRes.fishProducts || fishRes.fishProducts.length === 0) {
              logger.debug("No fish products found with category filter, trying without filter");
              fishRes = await fishProductApi.getAll({
                limit: 100,
                status: "active",
              });
              logger.debug("Fish products without category filter:", {
                count: fishRes.fishProducts?.length || 0,
              });
            }

            logger.debug("Fish products response:", {
              count: fishRes.fishProducts?.length || 0,
              hasProducts: !!(fishRes.fishProducts && fishRes.fishProducts.length > 0),
            });

            if (fishRes.fishProducts && fishRes.fishProducts.length > 0) {
              // Transform fish products to match Product type
              const transformedFishProducts: Product[] = fishRes.fishProducts.map((fishProduct: any) => {
                // Use priceRange.min as the base price, or first size category price
                const basePrice = fishProduct.priceRange?.min || 
                  (fishProduct.sizeCategories && fishProduct.sizeCategories.length > 0 
                    ? fishProduct.sizeCategories[0].pricePerKg 
                    : 0);

                // Calculate total stock from active size categories
                const totalStock = fishProduct.availableStock || 
                  (fishProduct.sizeCategories || []).reduce((sum: number, sc: any) => {
                    return sum + (sc.status === 'active' ? (sc.stock || 0) : 0);
                  }, 0);

                return {
                  _id: fishProduct._id,
                  name: fishProduct.name,
                  description: fishProduct.description,
                  shortDescription: fishProduct.shortDescription,
                  price: basePrice,
                  stock: totalStock,
                  image: fishProduct.image,
                  category: fishProduct.category || categoryRes.category,
                  isFishProduct: true,
                  sizeCategories: fishProduct.sizeCategories || [],
                  priceRange: fishProduct.priceRange,
                  status: fishProduct.status,
                  isFeatured: fishProduct.isFeatured,
                  slug: fishProduct.slug,
                  sku: fishProduct.sku,
                  tags: fishProduct.tags,
                  // Set hasVariants to false since fish products use sizeCategories
                  hasVariants: false,
                };
              });

              // Combine regular products and fish products
              allProducts = [...allProducts, ...transformedFishProducts];
            }
          } catch (fishErr) {
            // Log error but don't fail the whole page if fish products fail to load
            logger.warn("Error fetching fish products for category page:", fishErr);
          }
        }

        setProducts(allProducts);
      } catch (err) {
        setError(handleApiError(err, "loading products"));
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
          <div className="mb-6">
            <Skeleton variant="text" height={32} width={300} className="mb-2" />
            <Skeleton variant="text" height={20} width={200} />
          </div>
          <ProductGridSkeleton count={12} />
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
          <ProductGrid
            products={products}
            columns={{ mobile: 2, tablet: 3, desktop: 4, wide: 6 }}
            gap="md"
            showBadges={true}
          />
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

