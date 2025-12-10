"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fishProductApi } from "../../../utils/fishApi";
import { Plus, Search, Edit, Trash2, Eye, Fish, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminFishProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: currentPage, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      const result = await fishProductApi.getAll(params);
      const productsList = result.fishProducts || result.products || result.data || [];
      setProducts(Array.isArray(productsList) ? productsList : []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load fish products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    try {
      await fishProductApi.delete(id);
      setProducts(products.filter((p) => p._id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p._id)));
    }
  };

  const getPriceRange = (product: any) => {
    if (!product.sizeCategories || product.sizeCategories.length === 0) {
      return "N/A";
    }
    const prices = product.sizeCategories
      .map((cat: any) => cat.pricePerKg)
      .filter((p: any) => p != null);
    if (prices.length === 0) return "N/A";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      return `৳${min.toLocaleString()}/kg`;
    }
    return `৳${min.toLocaleString()} - ৳${max.toLocaleString()}/kg`;
  };

  const getTotalStock = (product: any) => {
    if (!product.sizeCategories || product.sizeCategories.length === 0) {
      return 0;
    }
    return product.sizeCategories.reduce((sum: number, cat: any) => sum + (cat.stock || 0), 0);
  };

  return (
    <div className="space-y-6">
      {/* Minimal Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Fish Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your fish product catalog</p>
        </div>
        <Link href="/admin/fish/products/add">
          <Button variant="primary" className="flex items-center gap-2 text-sm">
            <Plus size={16} />
            Add Fish Product
          </Button>
        </Link>
      </div>

      {/* Minimal Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search fish products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
            />
          </div>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Products Table - Modern Design */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Loading fish products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Fish className="mx-auto text-slate-400 dark:text-slate-500 mb-3" size={40} />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">No fish products found</p>
            <Link href="/admin/fish/products/add">
              <Button variant="primary" className="text-sm">Add Your First Fish Product</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={() => {
                    selectedIds.forEach((id) => handleDelete(id));
                    setSelectedIds(new Set());
                  }}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Delete Selected
                </button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 dark:border-slate-700 text-slate-600 focus:ring-slate-500"
                      />
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Size Categories
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Price Range
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Stock (kg)
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {products.map((product) => {
                    const totalStock = getTotalStock(product);
                    return (
                      <tr
                        key={product._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(product._id)}
                            onChange={() => toggleSelect(product._id)}
                            className="rounded border-slate-300 dark:border-slate-700 text-slate-600 focus:ring-slate-500"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name || "Fish Product"}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <Fish className="text-slate-400" size={18} />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {product.name || "Unnamed Product"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {product.sizeCategories && product.sizeCategories.length > 0 ? (
                              product.sizeCategories.slice(0, 2).map((cat: any, idx: number) => (
                                <span
                                  key={cat._id || idx}
                                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded"
                                >
                                  {cat.label || "N/A"}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 dark:text-slate-400">No sizes</span>
                            )}
                            {product.sizeCategories && product.sizeCategories.length > 2 && (
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 rounded">
                                +{product.sizeCategories.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {getPriceRange(product)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-sm font-medium ${
                              totalStock < 10
                                ? "text-red-600 dark:text-red-400"
                                : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {totalStock} kg
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              product.status === "active"
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {product.status || "inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/fish/products/${product._id}`}
                              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye size={16} />
                            </Link>
                            <Link
                              href={`/admin/fish/products/edit/${product._id}`}
                              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(product._id)}
                              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Minimal Pagination */}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal - Minimal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">Delete Fish Product</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
