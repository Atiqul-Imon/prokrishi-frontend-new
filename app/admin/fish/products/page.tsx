"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fishProductApi } from "../../../utils/fishApi";
import { Plus, Edit, Trash2, Eye, Fish } from "lucide-react";
import type { FishProduct, SizeCategory } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";
import { formatCurrency } from "@/app/utils";
import {
  AdminListPageLayout,
  AdminTableHeader,
  AdminTableRow,
  ConfirmDialog,
  type TableColumn,
} from "@/components/admin";

export default function AdminFishProductsPage() {
  const [products, setProducts] = useState<FishProduct[]>([]);
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
      const result = await fishProductApi.getAll(params);
      setProducts(result.fishProducts || []);
      setTotalPages(result.pagination?.totalPages || 1);
    } catch (err) {
      setError(handleApiError(err, "fetching fish products"));
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
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err) {
      setError(handleApiError(err, "deleting fish product"));
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = Array.from(selectedIds).map((id) => fishProductApi.delete(id));
      await Promise.all(deletePromises);
      setProducts(products.filter((p) => !selectedIds.has(p._id || "")));
      setSelectedIds(new Set());
      setBulkDeleteConfirm(false);
    } catch (err) {
      setError(handleApiError(err, "deleting fish products"));
      setBulkDeleteConfirm(false);
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

  const getPriceRange = (product: FishProduct): string => {
    if (!product.sizeCategories || product.sizeCategories.length === 0) {
      return "N/A";
    }
    const prices = product.sizeCategories
      .map((cat: SizeCategory) => cat.pricePerKg)
      .filter((p: number) => p != null);
    if (prices.length === 0) return "N/A";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      return `${formatCurrency(min)}/kg`;
    }
    return `${formatCurrency(min)} - ${formatCurrency(max)}/kg`;
  };

  const getTotalStock = (product: FishProduct): number => {
    if (!product.sizeCategories || product.sizeCategories.length === 0) {
      return 0;
    }
    return product.sizeCategories.reduce((sum: number, cat: SizeCategory) => sum + (cat.stock || 0), 0);
  };

  const columns: TableColumn[] = [
    { key: "product", label: "Product", align: "left" },
    { key: "sizes", label: "Size Categories", align: "left" },
    { key: "price", label: "Price Range", align: "left" },
    { key: "stock", label: "Stock (kg)", align: "left" },
    { key: "status", label: "Status", align: "left" },
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
        title="Fish Products"
        description="Manage your fish product catalog"
        primaryAction={{
          label: "Add Fish Product",
          href: "/admin/fish/products/add",
          icon: Plus,
        }}
        searchPlaceholder="Search fish products..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={fetchProducts}
        error={error}
        onErrorDismiss={() => setError(null)}
        loading={loading}
        empty={!loading && products.length === 0}
        emptyIcon={<Fish className="mx-auto text-slate-400 mb-3" size={40} strokeWidth={1.5} />}
        emptyTitle="No fish products found"
        emptyAction={
          <Link href="/admin/fish/products/add">
            <button className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md text-sm font-semibold">
              Add Your First Fish Product
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
            {products.map((product) => {
              const totalStock = getTotalStock(product);
              return (
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
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name || "Fish Product"}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                          <Fish className="text-slate-400" size={18} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {product.name || "Unnamed Product"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {product.sizeCategories && product.sizeCategories.length > 0 ? (
                        product.sizeCategories.slice(0, 2).map((cat: SizeCategory, idx: number) => (
                          <span
                            key={cat._id || idx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                          >
                            {cat.label || "N/A"}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No sizes</span>
                      )}
                      {product.sizeCategories && product.sizeCategories.length > 2 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                          +{product.sizeCategories.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-900">
                      {getPriceRange(product)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium ${
                        totalStock < 10 ? "text-red-600" : "text-slate-900"
                      }`}
                    >
                      {totalStock} kg
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
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/fish/products/${product._id}`}
                        className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                        title="View"
                      >
                        <Eye size={18} strokeWidth={2} />
                      </Link>
                      <Link
                        href={`/admin/fish/products/edit/${product._id}`}
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
              );
            })}
          </tbody>
        </table>
      </AdminListPageLayout>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Fish Product"
        message="This action cannot be undone. Are you sure you want to delete this fish product?"
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

      <ConfirmDialog
        isOpen={bulkDeleteConfirm}
        title="Delete Selected Fish Products"
        message={`Are you sure you want to delete ${selectedIds.size} fish product(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </>
  );
}
