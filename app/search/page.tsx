"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { searchProducts } from "@/app/utils/api";
import { ProductsResponse, PaginationParams } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Category, Product } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [results, setResults] = useState<Partial<ProductsResponse>>({
    products: [],
    pagination: {} as any,
    filters: {},
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Get search parameters from URL
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const page = searchParams.get("page") || "1";
  const status = searchParams.get("status") || "active";

  // Local state for filters
  const [filters, setFilters] = useState({
    q: query,
    category: category,
    minPrice: minPrice,
    maxPrice: maxPrice,
    sortBy: sortBy,
    sortOrder: sortOrder,
    status: status,
  });

  useEffect(() => {
    performSearch();
  }, [searchParams]);

  const performSearch = async () => {
    setLoading(true);
    setError("");

    try {
      // Build search params object with proper types
      const searchParams: PaginationParams = {
        search: query || undefined,
        category: category || undefined,
        page: parseInt(page) || 1,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        sort: sortBy && sortBy !== "name" ? sortBy : undefined,
        order: sortOrder as "asc" | "desc" | undefined,
        status: status || undefined,
      };
      
      const data = await searchProducts(searchParams);

      setResults(data);
    } catch (err) {
      setError(handleApiError(err, "searching products"));
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL with new filters
    const params = new URLSearchParams();
    Object.keys(updatedFilters).forEach((key) => {
      if (updatedFilters[key] !== undefined && updatedFilters[key] !== "") {
        params.append(key, updatedFilters[key]);
      }
    });

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
      sortOrder: "asc",
      status: "active",
    });
    router.push("/search");
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ page: newPage.toString() });
  };

  return (
    <div className="min-h-screen bg-white py-8 pb-20">
      <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Search Results
            {query && <span className="text-gray-600"> for "{query}"</span>}
          </h1>
          {results.pagination?.totalProducts !== undefined && (
            <p className="text-gray-600">
              {results.pagination.totalProducts} product
              {results.pagination.totalProducts !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <Card padding="lg" variant="elevated" className="sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
                >
                  {showFilters ? <X size={20} /> : <Filter size={20} />}
                </button>
              </div>

              <div
                className={`${showFilters ? "block" : "hidden"} lg:block space-y-6`}
              >
                {/* Search Query */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Query
                  </label>
                  <input
                    type="text"
                    value={filters.q}
                    onChange={(e) => updateFilters({ q: e.target.value })}
                    placeholder="Search products..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      updateFilters({ category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                  >
                    <option value="">All Categories</option>
                    {results.categories?.map((cat: Category) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) =>
                        updateFilters({ minPrice: e.target.value })
                      }
                      placeholder="Min price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        updateFilters({ maxPrice: e.target.value })
                      }
                      placeholder="Max price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <div className="space-y-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) =>
                        updateFilters({ sortBy: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                    >
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                    </select>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) =>
                        updateFilters({ sortOrder: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)]"
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-16 text-gray-500">
                <div className="inline-block w-8 h-8 border-4 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin mb-4" />
                <p>Searching...</p>
              </div>
            ) : error ? (
              <Card padding="lg">
                <div className="text-center py-8">
                  <p className="text-red-600">{error}</p>
                </div>
              </Card>
            ) : !results.products || results.products.length === 0 ? (
              <Card padding="lg">
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No products found
                  </h3>
                  <p className="mt-2 text-gray-600">
                    Try adjusting your filters or search for different products.
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                  {(results.products || []).map((product: Product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {results.pagination && results.pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(results.pagination.currentPage - 1)}
                      disabled={results.pagination.currentPage <= 1}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Previous
                    </Button>
                    
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {results.pagination.currentPage} of {results.pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(results.pagination.currentPage + 1)}
                      disabled={results.pagination.currentPage >= results.pagination.totalPages}
                    >
                      Next
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[var(--primary-green)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

