"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAdminProducts, deleteProduct, toggleProductFeatured } from "../../utils/api";
import { Plus, Edit, Trash2, Eye, Package, Star } from "lucide-react";
import type { Product } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";
import { formatCurrency } from "@/app/utils";
import {
  AdminListPageLayout,
  AdminTableHeader,
  AdminTableRow,
  ConfirmDialog,
  type TableColumn,
} from "@/components/admin";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { page: number; limit: number; search?: string } = { page: currentPage, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      const result = await getAdminProducts(params);
      setProducts(result.products || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      setError(handleApiError(err, "loading products"));
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
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      setError(handleApiError(err, "deleting product"));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedIds).map((id) => deleteProduct(id));
      await Promise.all(deletePromises);
      setProducts(products.filter((p) => !selectedIds.has(p._id)));
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
    } catch (err) {
      setError(handleApiError(err, "deleting products"));
      setBulkDeleteConfirm(false);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleProductFeatured(id);
      setProducts(products.map((p) => 
        p._id === id ? { ...p, isFeatured: !p.isFeatured } : p
      ));
    } catch (err) {
      setError(handleApiError(err, "toggling featured status"));
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
    if (selectedIds.size === products.length && products.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p._id || "").filter(Boolean)));
    }
  };

  const columns: TableColumn[] = [
    { key: "product", label: "Product", align: "left" },
    { key: "category", label: "Category", align: "left" },
    { key: "price", label: "Price", align: "left" },
    { key: "stock", label: "Stock", align: "left" },
    { key: "status", label: "Status", align: "left" },
    { key: "featured", label: "Featured", align: "center" },
    { key: "actions", label: "Actions", align: "right" },
  ];

  const bulkActions = selectedIds.size > 0 ? (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm font-medium text-emerald-900">
        {selectedIds.size} selected
      </span>
      <button
        onClick={() => setBulkDeleteConfirm(true)}
        className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
      >
        Delete Selected
      </button>
    </div>
  ) : undefined;

  return (
    <>
      <AdminListPageLayout
        title="Products"
        description="Manage your product catalog"
        primaryAction={{
          label: "Add Product",
          href: "/admin/products/add",
          icon: Plus,
        }}
        searchPlaceholder="Search products..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={fetchProducts}
        error={error}
        onErrorDismiss={() => setError(null)}
        loading={loading}
        empty={!loading && products.length === 0}
        emptyIcon={<Package className="mx-auto text-slate-400 mb-3" size={40} strokeWidth={1.5} />}
        emptyTitle="No products found"
        emptyDescription="Get started by adding your first product"
        emptyAction={
          <Link href="/admin/products/add">
            <button className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md text-sm font-semibold">
              Add Your First Product
            </button>
          </Link>
        }
        pagination={
          totalPages > 1
            ? {
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
              }
            : undefined
        }
        bulkActions={bulkActions}
      >
        <table className="w-full">
          <AdminTableHeader
            columns={columns}
            selectable
            selectedCount={selectedIds.size}
            totalCount={products.length}
            onSelectAll={toggleSelectAll}
          />
          <tbody className="divide-y divide-slate-200">
            {products.map((product) => (
              <AdminTableRow
                key={product._id}
                selectable
                selected={selectedIds.has(product._id || "")}
                onSelect={(selected) => {
                  if (product._id) {
                    if (selected) {
                      setSelectedIds((prev) => new Set([...prev, product._id!]));
                    } else {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        next.delete(product._id!);
                        return next;
                      });
                    }
                  }
                }}
              >
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
                        <p className="text-xs text-slate-500">{product.sku}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-900">
                    {typeof product.category === 'object' && product.category?.name ? product.category.name : (typeof product.category === 'string' ? product.category : "Uncategorized")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(product.price)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-sm font-bold ${
                      (product.stock || 0) < 10 ? "text-red-600" : "text-slate-900"
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
                    onClick={() => handleToggleFeatured(product._id || "")}
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
                      className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                      title="View"
                    >
                      <Eye size={18} strokeWidth={2} />
                    </Link>
                    <Link
                      href={`/admin/products/edit/${product._id}`}
                      className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit size={18} strokeWidth={2} />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(product._id || null)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                </td>
              </AdminTableRow>
            ))}
          </tbody>
        </table>
      </AdminListPageLayout>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Product"
        message="This action cannot be undone. Are you sure you want to delete this product?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm) {
            handleDelete(deleteConfirm);
          }
        }}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Selected Products"
        message={`Are you sure you want to delete ${selectedIds.size} product(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </>
  );
}
