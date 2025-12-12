"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAllCategories, deleteCategory } from "../../utils/api";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import type { Category } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";
import { truncateText } from "@/app/utils";
import {
  AdminListPageLayout,
  AdminPageActions,
  AdminSearchBar,
  ErrorAlert,
  ConfirmDialog,
} from "@/components/admin";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllCategories();
      let filtered = result.categories || [];
      if (searchQuery) {
        filtered = filtered.filter((cat: Category) =>
          cat?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setCategories(filtered);
    } catch (err) {
      setError(handleApiError(err, "loading categories"));
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(handleApiError(err, "deleting category"));
    }
  };

  return (
    <>
      <div className="space-y-4">
        <AdminPageActions
          title="Categories"
          description="Manage product categories"
          primaryAction={{
            label: "Add Category",
            href: "/admin/categories/add",
            icon: Plus,
          }}
        />

        <AdminSearchBar
          placeholder="Search categories..."
          value={searchQuery}
          onChange={setSearchQuery}
          onRefresh={fetchCategories}
        />

        <ErrorAlert message={error || ""} onDismiss={() => setError(null)} />

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-slate-500 mt-4">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="col-span-full p-12 text-center">
              <Tag className="mx-auto text-slate-400 mb-4" size={48} strokeWidth={1.5} />
              <p className="text-slate-500 mb-4">No categories found</p>
              <Link href="/admin/categories/add">
                <button className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md text-sm font-semibold">
                  Add Your First Category
                </button>
              </Link>
            </div>
          ) : (
            categories.map((category) => (
              <div
                key={category._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {category?.image ? (
                      <img
                        src={category.image}
                        alt={category?.name || "Category"}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                        <Tag className="text-white" size={24} strokeWidth={2} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-900">{category?.name || "Unnamed Category"}</h3>
                      {category?.description && (
                        <p className="text-sm text-slate-500 mt-1">
                          {truncateText(category.description, 50)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <span className="text-sm text-slate-500">
                    {(category as any)?.productCount || 0} products
                  </span>
                  <div className="flex gap-2">
                    {category?._id && (
                      <>
                        <Link
                          href={`/admin/categories/edit/${category._id}`}
                          className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit size={18} strokeWidth={2} />
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(category._id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} strokeWidth={2} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
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
    </>
  );
}
