"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllProducts, getFeaturedCategories } from "../utils/api";
import { logger } from "../utils/logger";
import { handleApiError } from "../utils/errorHandler";
import type { Product, Category } from "@/types/models";
import ProductCard from "@/components/ProductCard";
import ProductGrid from "@/components/ProductGrid";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Filter, X, ChevronDown } from "lucide-react";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort state
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get("category") || ""
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort") || "newest"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "desc"
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("search") || ""
  );

  const limit = 24;

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getFeaturedCategories();
        setCategories(data.categories || []);
      } catch (err) {
        logger.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Load products with filters
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllProducts({
        page: currentPage,
        limit,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        sort: sortBy === "newest" ? undefined : sortBy,
        order: sortOrder,
      });
      setProducts(res.products || []);
      setTotalProducts(res.total || res.products?.length || 0);
    } catch (err) {
      setError(handleApiError(err, "loading products"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, sortBy, sortOrder, searchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (sortOrder !== "desc") params.set("order", sortOrder);
    if (searchQuery) params.set("search", searchQuery);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = params.toString() ? `/products?${params.toString()}` : "/products";
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, sortBy, sortOrder, searchQuery, currentPage, router]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleOrderChange = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSortBy("newest");
    setSortOrder("desc");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalProducts / limit);
  const hasActiveFilters = selectedCategory || sortBy !== "newest" || searchQuery;

  return (
    <div className="bg-white min-h-screen pb-16">
      <div className="w-full mx-auto px-4 py-8 xl:max-w-[90%] 2xl:max-w-[70%]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600 text-base">Browse our complete product catalog</p>
        </div>

        {/* Filters and Sort Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="appearance-none bg-gray-50 px-4 py-2 pr-10 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none bg-gray-50 px-4 py-2 pr-10 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort Order Toggle (only show for price/name) */}
            {sortBy !== "newest" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOrderChange}
                className="px-3"
              >
                {sortOrder === "asc" ? "↑ Low to High" : "↓ High to Low"}
              </Button>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            {!loading && (
              <span>
                Showing <span className="font-semibold text-gray-900">{products.length}</span> of{" "}
                <span className="font-semibold text-gray-900">{totalProducts}</span> products
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 mt-4">Loading products…</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card padding="lg">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="primary" onClick={loadProducts}>
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="mb-8">
              <ProductGrid
                products={products}
                columns={{ mobile: 2, tablet: 3, desktop: 4, wide: 6 }}
                gap="md"
                showBadges={true}
              />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "primary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="min-w-[2.5rem]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <Card padding="lg">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No products found.</p>
              {hasActiveFilters && (
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white min-h-screen pb-16">
          <div className="w-full mx-auto px-4 py-8 xl:max-w-[90%] 2xl:max-w-[70%]">
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 mt-4">Loading products…</p>
            </div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}

