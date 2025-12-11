"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAdminProducts, deleteProduct, toggleProductFeatured } from "../../utils/api";
import { Plus, Search, Edit, Trash2, Eye, Package, RefreshCw, X, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminProductsPage() {
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
      const result = await getAdminProducts(params);
      setProducts(result.products || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err: any) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleProductFeatured(id);
      // Update the product in the list
      setProducts(products.map((p) => 
        p._id === id ? { ...p, isFeatured: !p.isFeatured } : p
      ));
    } catch (err: any) {
      setError(err.message || "Failed to toggle featured status");
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

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Products</h1>
          <p className="text-base text-slate-600">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/add">
          <Button variant="primary" className="flex items-center gap-2 text-sm shadow-lg hover:shadow-xl transition-shadow">
            <Plus size={16} />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Enhanced Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={fetchProducts}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-green-600 rounded-full animate-spin"></div>
            <p className="text-sm text-slate-500 mt-3">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto text-slate-400 mb-3" size={40} />
            <p className="text-sm text-slate-500 mb-4">No products found</p>
            <Link href="/admin/products/add">
              <Button variant="primary" className="text-sm">Add Your First Product</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-sm text-slate-700">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={() => {
                    selectedIds.forEach((id) => handleDelete(id));
                    setSelectedIds(new Set());
                  }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete Selected
                </button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-2 border-slate-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product._id)}
                          onChange={() => toggleSelect(product._id)}
                          className="w-4 h-4 rounded border-2 border-slate-300 text-green-600 focus:ring-2 focus:ring-green-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                              <Package className="text-slate-400" size={18} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-900">{product.name}</p>
                            {product.sku && (
                              <p className="text-xs text-slate-500">
                                {product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">
                          ৳{product.price?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-bold ${
                            (product.stock || 0) < 10
                              ? "text-red-600"
                              : "text-slate-900"
                          }`}
                        >
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                            product.status === "active"
                              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                              : "bg-slate-400 text-white"
                          }`}
                        >
                          {product.status || "inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleFeatured(product._id)}
                          className={`mx-auto p-2 rounded-lg transition-all ${
                            product.isFeatured
                              ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                              : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50"
                          }`}
                          title={product.isFeatured ? "Remove from featured" : "Mark as featured"}
                        >
                          <Star 
                            size={20} 
                            className={product.isFeatured ? "fill-current" : ""}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product._id}`}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            href={`/admin/products/edit/${product._id}`}
                            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(product._id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">
                  Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full border border-slate-200 shadow-xl">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Delete Product</h3>
              <p className="text-sm text-slate-600 text-center">
                This action cannot be undone. Are you sure you want to delete this product?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm font-bold"
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
