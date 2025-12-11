"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fishProductApi } from "../../../../utils/fishApi";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SizeCategory {
  label: string;
  pricePerKg: string;
  stock: string;
  minWeight?: string;
  maxWeight?: string;
  sku?: string;
  measurementIncrement?: string;
  status: "active" | "inactive" | "out_of_stock";
  isDefault: boolean;
}

export default function AddFishProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sizeCategories, setSizeCategories] = useState<SizeCategory[]>([
    { label: "", pricePerKg: "", stock: "", measurementIncrement: "0.25", status: "active", isDefault: true },
  ]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    status: "active",
    isFeatured: false,
    tags: "",
    metaTitle: "",
    metaDescription: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addSizeCategory = () => {
    setSizeCategories([
      ...sizeCategories,
      { label: "", pricePerKg: "", stock: "", status: "active", isDefault: false },
    ]);
  };

  const removeSizeCategory = (index: number) => {
    if (sizeCategories.length > 1) {
      const newCategories = sizeCategories.filter((_, i) => i !== index);
      if (newCategories.length > 0 && !newCategories.some((cat) => cat.isDefault)) {
        newCategories[0].isDefault = true;
      }
      setSizeCategories(newCategories);
    }
  };

  const updateSizeCategory = (index: number, field: keyof SizeCategory, value: any) => {
    const newCategories = [...sizeCategories];
    if (field === "isDefault") {
      newCategories.forEach((cat, i) => {
        cat.isDefault = i === index;
      });
    } else {
      newCategories[index] = { ...newCategories[index], [field]: value };
    }
    setSizeCategories(newCategories);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (sizeCategories.length === 0) {
      setError("Please add at least one size category");
      setLoading(false);
      return;
    }

    for (let i = 0; i < sizeCategories.length; i++) {
      const cat = sizeCategories[i];
      if (!cat.label || !cat.label.trim()) {
        setError(`Size category ${i + 1} must have a label`);
        setLoading(false);
        return;
      }
      if (!cat.pricePerKg || parseFloat(cat.pricePerKg) <= 0) {
        setError(`Size category ${i + 1} must have a valid price per kg`);
        setLoading(false);
        return;
      }
    }

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description || "");
      fd.append("shortDescription", formData.shortDescription || "");
      fd.append("status", formData.status);
      fd.append("isFeatured", formData.isFeatured.toString());
      if (formData.metaTitle) fd.append("metaTitle", formData.metaTitle);
      if (formData.metaDescription) fd.append("metaDescription", formData.metaDescription);
      if (formData.tags) {
        const tagsArray = formData.tags.split(",").map((t) => t.trim()).filter((t) => t);
        if (tagsArray.length > 0) {
          fd.append("tags", JSON.stringify(tagsArray));
        }
      }

      fd.append(
        "sizeCategories",
        JSON.stringify(
          sizeCategories.map((cat) => ({
            label: cat.label.trim(),
            pricePerKg: parseFloat(cat.pricePerKg),
            stock: cat.stock ? parseInt(cat.stock) : 0,
            minWeight: cat.minWeight ? parseFloat(cat.minWeight) : undefined,
            maxWeight: cat.maxWeight ? parseFloat(cat.maxWeight) : undefined,
            sku: cat.sku?.trim() || undefined,
            measurementIncrement:
              cat.measurementIncrement && parseFloat(cat.measurementIncrement) > 0
                ? parseFloat(cat.measurementIncrement)
                : cat.minWeight
                ? parseFloat(cat.minWeight)
                : 0.25,
            status: cat.status,
            isDefault: cat.isDefault || false,
          }))
        )
      );

      if (image) {
        fd.append("image", image);
      }

      await fishProductApi.create(fd);
      router.push("/admin/fish/products");
    } catch (err: any) {
      setError(err.message || "Failed to create fish product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/fish/products">
          <button className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Add Fish Product</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create a new fish product</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Max 100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Product Image</h2>
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer text-center">
                <Plus className="mx-auto mb-2 text-slate-400" size={24} />
                <span className="text-sm text-slate-600 dark:text-slate-400">Click to upload image</span>
              </div>
            </label>
            {imagePreview && (
              <div className="mt-4 relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Size Categories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Size Categories *</h2>
              <button
                type="button"
                onClick={addSizeCategory}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
              >
                <Plus size={16} />
                Add Size
              </button>
            </div>
            <div className="space-y-3">
              {sizeCategories.map((category, index) => (
                <div key={index} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={category.isDefault}
                        onChange={() => updateSizeCategory(index, "isDefault", true)}
                        className="w-4 h-4 text-slate-600"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">Default</span>
                      {category.isDefault && (
                        <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded">
                          Default
                        </span>
                      )}
                    </label>
                    {sizeCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSizeCategory(index)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Label *</label>
                      <input
                        type="text"
                        required
                        value={category.label}
                        onChange={(e) => updateSizeCategory(index, "label", e.target.value)}
                        placeholder="e.g., Small, 2kg size"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Price/Kg (৳) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={category.pricePerKg}
                        onChange={(e) => updateSizeCategory(index, "pricePerKg", e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Stock (kg) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={category.stock}
                        onChange={(e) => updateSizeCategory(index, "stock", e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Min Increment (kg)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={category.measurementIncrement || "0.25"}
                      onChange={(e) => updateSizeCategory(index, "measurementIncrement", e.target.value)}
                      placeholder="e.g., 0.25"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Minimum sellable increment; default 0.25kg.</p>
                  </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Min Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={category.minWeight || ""}
                        onChange={(e) => updateSizeCategory(index, "minWeight", e.target.value || undefined)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Max Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={category.maxWeight || ""}
                        onChange={(e) => updateSizeCategory(index, "maxWeight", e.target.value || undefined)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">SKU</label>
                      <input
                        type="text"
                        value={category.sku || ""}
                        onChange={(e) => updateSizeCategory(index, "sku", e.target.value || undefined)}
                        placeholder="Optional"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                      <select
                        value={category.status}
                        onChange={(e) => updateSizeCategory(index, "status", e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Additional Options</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-slate-600 rounded focus:ring-slate-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Featured Product</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., fresh, premium, local"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  maxLength={160}
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Max 160 characters</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/fish/products">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" disabled={loading} isLoading={loading}>
            <Save size={16} />
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
