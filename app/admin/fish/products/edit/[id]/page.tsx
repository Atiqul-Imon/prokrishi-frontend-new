"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fishProductApi } from "../../../../../utils/fishApi";
import { ArrowLeft, Save, Plus, X, Package, Image as ImageIcon, Settings, DollarSign, BarChart3, Upload, AlertCircle, Fish } from "lucide-react";

interface SizeCategory {
  _id?: string;
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

export default function EditFishProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [sizeCategories, setSizeCategories] = useState<SizeCategory[]>([]);
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setFetchLoading(true);
        const result = await fishProductApi.getById(productId);
        const product = result.fishProduct || result;
        
        setFormData({
          name: product.name || "",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          status: product.status || "active",
          isFeatured: product.isFeatured || false,
          tags: product.tags ? product.tags.join(", ") : "",
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
        });

        if (product.image) {
          setExistingImage(product.image);
        }

        if (product.sizeCategories && product.sizeCategories.length > 0) {
          setSizeCategories(
            product.sizeCategories.map((cat: any) => ({
              _id: cat._id,
              label: cat.label || "",
              pricePerKg: cat.pricePerKg?.toString() || "",
              stock: cat.stock?.toString() || "0",
              minWeight: cat.minWeight?.toString() || undefined,
              maxWeight: cat.maxWeight?.toString() || undefined,
              sku: cat.sku || undefined,
              measurementIncrement: cat.measurementIncrement?.toString() || "0.25",
              status: cat.status || "active",
              isDefault: cat.isDefault || false,
            }))
          );
        } else {
          setSizeCategories([
            { label: "", pricePerKg: "", stock: "", measurementIncrement: "0.25", status: "active", isDefault: true },
          ]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load fish product");
      } finally {
        setFetchLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

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
      { label: "", pricePerKg: "", stock: "", measurementIncrement: "0.25", status: "active", isDefault: false },
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
            _id: cat._id,
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
      } else if (existingImage) {
        fd.append("image", existingImage);
      }

      await fishProductApi.update(productId, fd);
      router.push(`/admin/fish/products/${productId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update fish product");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-sm text-slate-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header - Nexus Style */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/admin/fish/products/${productId}`}>
          <button className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Edit Fish Product</h1>
          <p className="text-sm text-slate-600">Update fish product information</p>
        </div>
      </div>

      {/* Error Message - Nexus Style */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} strokeWidth={2} />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-800 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-teal-100">
              <Fish className="text-teal-600" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
              <p className="text-xs text-slate-500">Essential product details</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter fish product name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Short Description
              </label>
              <input
                type="text"
                maxLength={100}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief description (max 100 characters)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
              <p className="text-xs text-slate-500 mt-1.5">{formData.shortDescription.length}/100 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Description
              </label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed product description"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Image Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-teal-100">
              <ImageIcon className="text-teal-600" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Product Image</h2>
              <p className="text-xs text-slate-500">Upload product image</p>
            </div>
          </div>

          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-xl border-2 border-slate-200 shadow-sm" />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : existingImage ? (
              <div className="relative inline-block">
                <img src={existingImage} alt="Current" className="w-40 h-40 object-cover rounded-xl border-2 border-slate-200 shadow-sm" />
                <button
                  type="button"
                  onClick={() => setExistingImage(null)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <div className="px-6 py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all text-center cursor-pointer">
                <Upload className="mx-auto mb-3 text-slate-400" size={32} strokeWidth={1.5} />
                <p className="text-sm font-medium text-slate-700 mb-1">Click to upload image</p>
                <p className="text-xs text-slate-500">Recommended: 800x800px or larger</p>
              </div>
            )}
          </label>
        </div>

        {/* Size Categories Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <BarChart3 className="text-purple-600" size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Size Categories <span className="text-red-500">*</span></h2>
                <p className="text-xs text-slate-500">{sizeCategories.length} size categor{sizeCategories.length !== 1 ? 'ies' : 'y'} added</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addSizeCategory}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md text-sm font-semibold"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Size
            </button>
          </div>

          <div className="space-y-4">
            {sizeCategories.map((category, index) => (
              <div
                key={category._id || index}
                className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-purple-300 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                      Size {index + 1}
                    </span>
                    {category.isDefault && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={category.isDefault}
                        onChange={() => updateSizeCategory(index, "isDefault", true)}
                        className="w-4 h-4 border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-600">Set as Default</span>
                    </label>
                    {sizeCategories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSizeCategory(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove size category"
                      >
                        <X size={16} strokeWidth={2} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={category.label}
                      onChange={(e) => updateSizeCategory(index, "label", e.target.value)}
                      placeholder="e.g., Small, 2kg size"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Price/Kg (৳) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={category.pricePerKg}
                      onChange={(e) => updateSizeCategory(index, "pricePerKg", e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Stock (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={category.stock}
                      onChange={(e) => updateSizeCategory(index, "stock", e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Min Increment (kg)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={category.measurementIncrement || "0.25"}
                      onChange={(e) => updateSizeCategory(index, "measurementIncrement", e.target.value)}
                      placeholder="e.g., 0.25"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Minimum sellable increment; default 0.25kg.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Min Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={category.minWeight || ""}
                      onChange={(e) => updateSizeCategory(index, "minWeight", e.target.value || undefined)}
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Max Weight (kg)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={category.maxWeight || ""}
                      onChange={(e) => updateSizeCategory(index, "maxWeight", e.target.value || undefined)}
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">SKU</label>
                    <input
                      type="text"
                      value={category.sku || ""}
                      onChange={(e) => updateSizeCategory(index, "sku", e.target.value || undefined)}
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                    <select
                      value={category.status}
                      onChange={(e) => updateSizeCategory(index, "status", e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
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

        {/* Additional Options Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-100">
              <Settings className="text-purple-600" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Additional Options</h2>
              <p className="text-xs text-slate-500">SEO and marketing settings</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-900">Featured Product</span>
            </label>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., fresh, premium, local"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Meta Title</label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="SEO meta title"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Meta Description</label>
              <textarea
                rows={3}
                maxLength={160}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="SEO meta description"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all resize-none"
              />
              <p className="text-xs text-slate-500 mt-1.5">{formData.metaDescription.length}/160 characters</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link href={`/admin/fish/products/${productId}`}>
            <button
              type="button"
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md text-sm font-semibold"
            >
              Cancel
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} strokeWidth={2.5} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
