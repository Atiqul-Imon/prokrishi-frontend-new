"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProduct, getAllCategories } from "../../../utils/api";
import { logger } from "../../../utils/logger";
import { handleApiError } from "../../../utils/errorHandler";
import { ArrowLeft, Save, X, Plus, Trash2, Package, Image as ImageIcon, Tag, Settings, DollarSign, BarChart3, Upload, AlertCircle } from "lucide-react";

interface ProductVariant {
  _id?: string;
  label: string;
  sku?: string;
  price: string;
  salePrice?: string;
  stock: string;
  measurement: string;
  unit: string;
  unitWeightKg?: string;
  measurementIncrement?: string;
  priceType?: "PER_UNIT" | "PER_WEIGHT";
  stockType?: "COUNT" | "WEIGHT";
  status: "active" | "inactive" | "out_of_stock";
  isDefault: boolean;
}

interface GalleryUpload {
  file: File;
  preview: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null);
  const [galleryUploads, setGalleryUploads] = useState<GalleryUpload[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    salePrice: "",
    stock: "",
    measurement: "1",
    unit: "pcs",
    unitWeightKg: "",
    measurementIncrement: "0.01",
    priceType: "PER_UNIT",
    stockType: "COUNT",
    lowStockThreshold: "5",
    status: "active",
    description: "",
    shortDescription: "",
    isFeatured: false,
    tags: "",
    metaTitle: "",
    metaDescription: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getAllCategories();
        setCategories(result.categories || []);
      } catch (err) {
        logger.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handlePrimaryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrimaryImage(file);
      setPrimaryImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newUploads = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setGalleryUploads([...galleryUploads, ...newUploads]);
    e.target.value = "";
  };

  const removeGalleryUpload = (index: number) => {
    const newUploads = galleryUploads.filter((_, i) => i !== index);
    newUploads[index]?.preview && URL.revokeObjectURL(newUploads[index].preview);
    setGalleryUploads(newUploads);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        label: "",
        price: "",
        stock: "",
        measurement: "1",
        unit: "pcs",
        measurementIncrement: "0.01",
        status: "active",
        isDefault: variants.length === 0,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    if (newVariants.length > 0 && !newVariants.some((v) => v.isDefault)) {
      newVariants[0].isDefault = true;
    }
    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | boolean) => {
    const newVariants = [...variants];
    if (field === "isDefault") {
      newVariants.forEach((v, i) => {
        v.isDefault = i === index;
      });
    } else {
      newVariants[index] = { ...newVariants[index], [field]: value };
    }
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.name.trim()) {
      setError("Product name is required");
      setLoading(false);
      return;
    }

    if (!formData.category || !formData.category.trim()) {
      setError("Category is required. Please select a category from the dropdown.");
      setLoading(false);
      return;
    }

    try {
        const productData = new FormData();
        productData.append("name", formData.name.trim());
        productData.append("category", formData.category.trim());
        productData.append("status", formData.status);
      if (formData.description) productData.append("description", formData.description);
      if (formData.shortDescription) productData.append("shortDescription", formData.shortDescription);
      if (formData.metaTitle) productData.append("metaTitle", formData.metaTitle);
      if (formData.metaDescription) productData.append("metaDescription", formData.metaDescription);
      if (formData.tags) {
        const tagsArray = formData.tags.split(",").map((t) => t.trim()).filter((t) => t);
        if (tagsArray.length > 0) {
          productData.append("tags", JSON.stringify(tagsArray));
        }
      }
      productData.append("isFeatured", formData.isFeatured.toString());

        if (hasVariants && variants.length > 0) {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          if (!v.label || !v.label.trim()) {
            setError(`Variant ${i + 1} must have a label`);
            setLoading(false);
            return;
          }
          if (!v.price || parseFloat(v.price) <= 0) {
            setError(`Variant ${i + 1} must have a valid price`);
            setLoading(false);
            return;
          }
          const increment = v.measurementIncrement ? parseFloat(v.measurementIncrement) : v.unit === "pcs" ? 1 : 0.01;
          if (!increment || increment <= 0) {
            setError(`Variant ${i + 1} must have a measurement increment greater than 0`);
            setLoading(false);
            return;
          }
        }

        productData.append(
          "variants",
          JSON.stringify(
            variants.map((v) => ({
              label: v.label.trim(),
              sku: v.sku?.trim() || undefined,
              price: parseFloat(v.price),
              salePrice: v.salePrice ? parseFloat(v.salePrice) : undefined,
              stock: parseInt(v.stock) || 0,
              measurement: parseFloat(v.measurement) || 1,
              unit: v.unit,
              unitWeightKg: v.unitWeightKg ? parseFloat(v.unitWeightKg) : undefined,
              measurementIncrement:
                v.measurementIncrement && parseFloat(v.measurementIncrement) > 0
                  ? parseFloat(v.measurementIncrement)
                  : v.unit === "pcs"
                  ? 1
                  : 0.01,
              priceType: v.priceType || (v.unit === "pcs" ? "PER_UNIT" : "PER_WEIGHT"),
              stockType: v.stockType || (v.unit === "pcs" ? "COUNT" : "WEIGHT"),
              status: v.status,
              isDefault: v.isDefault || false,
            }))
          )
        );
        } else {
        if (!formData.price || parseFloat(formData.price) <= 0) {
          setError("Price is required");
          setLoading(false);
          return;
        }
        const baseIncrement =
          formData.measurementIncrement && parseFloat(formData.measurementIncrement) > 0
            ? formData.measurementIncrement
            : formData.unit === "pcs"
            ? "1"
            : "0.01";
          productData.append("price", formData.price);
          if (formData.salePrice) productData.append("salePrice", formData.salePrice);
          productData.append("stock", formData.stock || "0");
          productData.append("measurement", formData.measurement);
          productData.append("unit", formData.unit);
          if (formData.unitWeightKg) productData.append("unitWeightKg", formData.unitWeightKg);
          productData.append("measurementIncrement", baseIncrement);
          productData.append("priceType", formData.priceType || (formData.unit === "pcs" ? "PER_UNIT" : "PER_WEIGHT"));
          productData.append("stockType", formData.stockType || (formData.unit === "pcs" ? "COUNT" : "WEIGHT"));
          if (formData.lowStockThreshold) productData.append("lowStockThreshold", formData.lowStockThreshold);
      }

      if (primaryImage) {
        productData.append("image", primaryImage);
      }

      if (galleryUploads.length > 0) {
        galleryUploads.forEach((upload) => {
          productData.append("galleryImages", upload.file);
        });
      }

      await createProduct(productData);
      router.push("/admin/products");
    } catch (err) {
      logger.error("Product creation error:", err);
      const errorMessage = handleApiError(err, "creating product");
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header - Nexus Style */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products">
          <button className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Add New Product</h1>
          <p className="text-sm text-slate-600">Create a new product for your catalog</p>
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
            <div className="p-2 rounded-lg bg-emerald-100">
              <Package className="text-emerald-600" size={20} strokeWidth={2.5} />
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
                placeholder="Enter product name"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>
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

        {/* Variants Toggle Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100">
              <BarChart3 className="text-purple-600" size={20} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">Product Variants</h2>
              <p className="text-xs text-slate-500">Enable variants for different sizes, weights, or prices</p>
            </div>
          </div>
          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={hasVariants}
              onChange={(e) => {
                setHasVariants(e.target.checked);
                if (!e.target.checked) {
                  setVariants([]);
                } else if (variants.length === 0) {
                  addVariant();
                }
              }}
              className="w-5 h-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-900">
              Enable Product Variants (e.g., different sizes, weights, prices)
            </span>
          </label>
        </div>

        {/* Variants Management */}
        {hasVariants && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <BarChart3 className="text-purple-600" size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Variants</h2>
                  <p className="text-xs text-slate-500">{variants.length} variant{variants.length !== 1 ? 's' : ''} added</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm hover:shadow-md text-sm font-semibold"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Variant
              </button>
            </div>
            <div className="space-y-4">
              {variants.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                  <BarChart3 className="mx-auto mb-3 text-slate-400" size={32} strokeWidth={1.5} />
                  <p className="text-sm">No variants added. Click "Add Variant" to create one.</p>
                </div>
              ) : (
                variants.map((variant, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                          Variant {index + 1}
                        </span>
                        {variant.isDefault && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={variant.isDefault}
                            onChange={() => updateVariant(index, "isDefault", true)}
                            className="w-4 h-4 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs font-medium text-slate-600">Set as Default</span>
                        </label>
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove variant"
                          >
                            <Trash2 size={16} strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Label <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={variant.label}
                          onChange={(e) => updateVariant(index, "label", e.target.value)}
                          placeholder="e.g., Small, 500g"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">SKU</label>
                        <input
                          type="text"
                          value={variant.sku || ""}
                          onChange={(e) => updateVariant(index, "sku", e.target.value)}
                          placeholder="Optional"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Price (৳) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, "price", e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sale Price (৳)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={variant.salePrice || ""}
                          onChange={(e) => updateVariant(index, "salePrice", e.target.value || undefined)}
                          placeholder="Optional"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Stock <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, "stock", e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Measurement <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="0.01"
                          step="0.01"
                          value={variant.measurement}
                          onChange={(e) => updateVariant(index, "measurement", e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Unit <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={variant.unit}
                          onChange={(e) => updateVariant(index, "unit", e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        >
                          <option value="pcs">Pieces</option>
                          <option value="kg">Kilogram</option>
                          <option value="g">Gram</option>
                          <option value="l">Liter</option>
                          <option value="ml">Milliliter</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Unit Weight (kg)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={variant.unitWeightKg || ""}
                          onChange={(e) => updateVariant(index, "unitWeightKg", e.target.value || undefined)}
                          placeholder="Optional"
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Measurement Increment</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={variant.measurementIncrement || "0.01"}
                          onChange={(e) => updateVariant(index, "measurementIncrement", e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Price Type</label>
                        <select
                          value={variant.priceType || (variant.unit === "pcs" ? "PER_UNIT" : "PER_WEIGHT")}
                          onChange={(e) => updateVariant(index, "priceType", e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        >
                          <option value="PER_UNIT">Per Unit</option>
                          <option value="PER_WEIGHT">Per Weight</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Stock Type</label>
                        <select
                          value={variant.stockType || (variant.unit === "pcs" ? "COUNT" : "WEIGHT")}
                          onChange={(e) => updateVariant(index, "stockType", e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        >
                          <option value="COUNT">Count</option>
                          <option value="WEIGHT">Weight</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                        <select
                          value={variant.status}
                          onChange={(e) => updateVariant(index, "status", e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pricing & Inventory - Only show if no variants */}
        {!hasVariants && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-100">
                <DollarSign className="text-amber-600" size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Pricing & Inventory</h2>
                <p className="text-xs text-slate-500">Set product pricing and stock information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Price (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Sale Price (৳)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Measurement</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.measurement}
                  onChange={(e) => setFormData({ ...formData, measurement: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                >
                  <option value="pcs">Pieces</option>
                  <option value="kg">Kilogram</option>
                  <option value="g">Gram</option>
                  <option value="l">Liter</option>
                  <option value="ml">Milliliter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Unit Weight (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={formData.unitWeightKg}
                  onChange={(e) => setFormData({ ...formData, unitWeightKg: e.target.value })}
                  placeholder="Optional"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Low Stock Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-sm font-semibold text-slate-900 mb-2">Measurement Increment</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.measurementIncrement}
                onChange={(e) => setFormData({ ...formData, measurementIncrement: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>
        )}

        {/* Images Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-teal-100">
              <ImageIcon className="text-teal-600" size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Product Images</h2>
              <p className="text-xs text-slate-500">Upload product images</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Primary Image
              </label>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePrimaryImageChange}
                  className="hidden"
                />
                {primaryImagePreview ? (
                  <div className="relative inline-block">
                    <img src={primaryImagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-xl border-2 border-slate-200 shadow-sm" />
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryImage(null);
                        setPrimaryImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <div className="px-6 py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all text-center cursor-pointer">
                    <Upload className="mx-auto mb-3 text-slate-400" size={32} strokeWidth={1.5} />
                    <p className="text-sm font-medium text-slate-700 mb-1">Click to upload primary image</p>
                    <p className="text-xs text-slate-500">Recommended: 800x800px or larger</p>
                  </div>
                )}
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Gallery Images
              </label>
              <label className="block cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryFilesChange}
                  className="hidden"
                />
                <div className="px-6 py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all text-center cursor-pointer">
                  <Upload className="mx-auto mb-3 text-slate-400" size={32} strokeWidth={1.5} />
                  <p className="text-sm font-medium text-slate-700 mb-1">Click to upload gallery images</p>
                  <p className="text-xs text-slate-500">You can select multiple images</p>
                </div>
              </label>
              {galleryUploads.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {galleryUploads.map((upload, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={upload.preview}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-slate-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryUpload(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                placeholder="e.g., fresh, premium, organic"
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
          <Link href="/admin/products">
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
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save size={16} strokeWidth={2.5} />
                <span>Create Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
