"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllProducts, getFeaturedCategories } from "../utils/api";
import { fishProductApi } from "../utils/fishApi";
import { logger } from "../utils/logger";
import { handleApiError } from "../utils/errorHandler";
import { normalizeProducts } from "../utils/productNormalizer";
import type { Product, Category, FishProduct } from "@/types/models";
import ProductGrid from "@/components/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/SkeletonLoader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Filter, X, ChevronDown } from "lucide-react";
import PullToRefresh from "@/components/PullToRefresh";
import dynamic from "next/dynamic";

// Lazy load heavy components for code splitting
const FilterDrawer = dynamic(() => import("@/components/FilterDrawer"), {
  ssr: false,
  loading: () => null,
});

const SortBottomSheet = dynamic(() => import("@/components/SortBottomSheet"), {
  ssr: false,
  loading: () => null,
});

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
  const [showSortSheet, setShowSortSheet] = useState(false);

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

  // Load products with filters (both regular and fish products)
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch regular products
      const regularProductsRes = await getAllProducts({
        page: currentPage,
        limit: Math.ceil(limit / 2), // Split limit between regular and fish products
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        sort: sortBy === "newest" ? undefined : sortBy,
        order: sortOrder,
      });
      
      // Normalize regular products using shared utility for consistency
      const normalizedRegularProducts = normalizeProducts(regularProductsRes.products || []);
      
      // Fetch fish products (only if no category filter or category is fish)
      let fishProducts: Product[] = [];
      try {
        const fishRes = await fishProductApi.getAll({
          page: currentPage,
          limit: Math.ceil(limit / 2),
          status: 'active',
          search: searchQuery || undefined,
          sort: sortBy === "newest" ? "createdAt" : sortBy,
          order: sortOrder,
        });
        
        // Transform fish products to match Product type
        const fishProductsList = fishRes.fishProducts || [];
        fishProducts = fishProductsList.map((fp: FishProduct) => ({
          _id: fp._id,
          name: fp.name,
          price: (fp as any).priceRange?.min || 0,
          stock: (fp as any).availableStock || 0,
          image: fp.image,
          unit: 'kg',
          measurement: 1,
          category: fp.category,
          isFishProduct: true,
          priceRange: (fp as any).priceRange,
          sizeCategories: fp.sizeCategories,
          createdAt: (fp as any).createdAt,
        }));
      } catch (fishErr) {
        logger.warn("Failed to load fish products:", fishErr);
        // Continue without fish products if they fail to load
      }
      
      // Combine regular and fish products
      const allProducts = [...normalizedRegularProducts, ...fishProducts];
      
      // Apply sorting if needed
      if (sortBy === "price") {
        allProducts.sort((a, b) => {
          const priceA = a.isFishProduct ? (a.priceRange?.min || 0) : a.price;
          const priceB = b.isFishProduct ? (b.priceRange?.min || 0) : b.price;
          return sortOrder === "asc" ? priceA - priceB : priceB - priceA;
        });
      } else if (sortBy === "name") {
        allProducts.sort((a, b) => {
          const nameA = a.name.toLowerCase();
          const nameB = b.name.toLowerCase();
          return sortOrder === "asc" 
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        });
      } else if (sortBy === "newest") {
        allProducts.sort((a, b) => {
          const dateA = new Date((a as any).createdAt || 0).getTime();
          const dateB = new Date((b as any).createdAt || 0).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
      }
      
      // Limit to requested limit
      const limitedProducts = allProducts.slice(0, limit);
      
      setProducts(limitedProducts);
      setTotalProducts(allProducts.length);
    } catch (err) {
      setError(handleApiError(err, "loading products"));
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedCategory, sortBy, sortOrder, searchQuery, limit]);

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
            {/* Mobile Filter & Sort Buttons */}
            <div className="flex gap-2 sm:hidden w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="flex-1 min-h-[44px]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {selectedCategory && (
                  <span className="ml-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortSheet(true)}
                className="flex-1 min-h-[44px]"
              >
                Sort
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Desktop Filters */}
            <div className="hidden sm:flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="appearance-none bg-gray-50 px-4 py-2 pr-10 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white cursor-pointer min-h-[44px]"
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
                  className="appearance-none bg-gray-50 px-4 py-2 pr-10 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white cursor-pointer min-h-[44px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
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
            <PullToRefresh onRefresh={loadProducts} disabled={loading}>
              <div className="mb-8">
                <ProductGrid
                  products={products}
                  columns={{ mobile: 2, tablet: 3, desktop: 4, wide: 6 }}
                  gap="md"
                  showBadges={true}
                />
              </div>
            </PullToRefresh>

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

        {/* Mobile Filter Drawer */}
        <FilterDrawer
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          title="Filters"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full appearance-none bg-gray-50 px-4 py-3 pr-10 rounded-lg text-base font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white cursor-pointer min-h-[44px]"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="lg"
                onClick={clearFilters}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          </div>
        </FilterDrawer>

        {/* Mobile Sort Bottom Sheet */}
        <SortBottomSheet
          isOpen={showSortSheet}
          onClose={() => setShowSortSheet(false)}
          selectedValue={sortBy}
          onSelect={handleSortChange}
          options={[
            { value: "newest", label: "Newest First" },
            { value: "price", label: "Price" },
            { value: "name", label: "Name" },
          ]}
        />
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

