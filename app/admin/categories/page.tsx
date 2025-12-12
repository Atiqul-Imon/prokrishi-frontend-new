"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getAllCategories, deleteCategory } from "../../utils/api";
import { Plus, Search, Edit, Trash2, Tag, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Category } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Manage product categories</p>
        </div>
        <Link href="/admin/categories/add">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={18} />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50"
            />
          </div>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-gray-100"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200"></div>
            <p className="text-gray-500">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full p-12 text-center">
            <Tag className="mx-auto text-gray-400" size={48} />
            <p className="text-gray-500">No categories found</p>
            <Link href="/admin/categories/add">
              <Button variant="primary">Add Your First Category</Button>
            </Link>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category._id}
              className="bg-white"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category?.image ? (
                    <img
                      src={category.image}
                      alt={category?.name || "Category"}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Tag className="text-white" size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{category?.name || "Unnamed Category"}</h3>
                    {category?.description && (
                      <p className="text-sm text-gray-500">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  {category?.productCount || 0} products
                </span>
                <div className="flex gap-2">
                  {category?._id && (
                    <>
                      <Link
                        href={`/admin/categories/edit/${category._id}`}
                        className="p-2 text-gray-600"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(category._id)}
                        className="p-2 text-gray-600"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white">
            <h3 className="text-lg font-semibold text-gray-900">Delete Category</h3>
            <p className="text-gray-600">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

