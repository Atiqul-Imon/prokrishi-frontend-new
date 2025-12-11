"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductById, updateProduct, getAllCategories } from "../../../../utils/api";
import { ArrowLeft, Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
  status: "active" | "inactive" | "out_of_stock";
  isDefault: boolean;
}

interface GalleryUpload {
  file: File;
  preview: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null);
  const [existingPrimaryImage, setExistingPrimaryImage] = useState<string | null>(null);
  const [galleryUploads, setGalleryUploads] = useState<GalleryUpload[]>([]);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
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
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        const [productResult, categoriesResult] = await Promise.all([
          getProductById(productId),
          getAllCategories(),
        ]);

        const product = productResult.product || productResult;
        
        setFormData({
          name: product.name || "",
          category: product.category?._id || product.category || "",
          price: product.price?.toString() || "",
          salePrice: "",
          stock: product.stock?.toString() || "",
          measurement: product.measurement?.toString() || "1",
          unit: product.unit || "pcs",
          unitWeightKg: product.unitWeightKg?.toString() || "",
          measurementIncrement: product.measurementIncrement?.toString() || "0.01",
          lowStockThreshold: product.lowStockThreshold?.toString() || "5",
          status: product.status || "active",
          description: product.description || "",
          shortDescription: product.shortDescription || "",
          isFeatured: product.isFeatured || false,
          tags: product.tags ? product.tags.join(", ") : "",
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
        });

        // Handle variants
        if (product.hasVariants && product.variants && product.variants.length > 0) {
          setHasVariants(true);
          setVariants(
            product.variants.map((v: any) => ({
              _id: v._id?.toString(),
              label: v.label || "",
              sku: v.sku || undefined,
              price: v.price?.toString() || "",
              salePrice: v.salePrice?.toString() || undefined,
              stock: v.stock?.toString() || "0",
              measurement: v.measurement?.toString() || "1",
              unit: v.unit || "pcs",
              unitWeightKg: v.unitWeightKg?.toString() || undefined,
              measurementIncrement: v.measurementIncrement?.toString() || "0.01",
              status: v.status || "active",
              isDefault: v.isDefault || false,
            }))
          );
        } else {
          setHasVariants(false);
          setVariants([]);
        }

        // Handle images
        if (product.image) {
          setExistingPrimaryImage(product.image);
        }
        
        // Gallery images (exclude primary image)
        if (product.images && Array.isArray(product.images)) {
          const gallery = product.images.filter((img: string) => img && img !== product.image);
          setExistingGallery(gallery);
        }

        setCategories(categoriesResult.categories || []);
      } catch (err: any) {
        setError(err.message || "Failed to load product");
      } finally {
        setFetchLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId]);

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
    if (newUploads[index]?.preview) {
      URL.revokeObjectURL(newUploads[index].preview);
    }
    setGalleryUploads(newUploads);
  };

  const removeExistingGalleryImage = (index: number) => {
    setExistingGallery(existingGallery.filter((_, i) => i !== index));
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

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
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

    try {
      const productData = new FormData();
      productData.append("name", formData.name);
      productData.append("category", formData.category);
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
        // Validate variants
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
              _id: v._id,
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
              status: v.status,
              isDefault: v.isDefault || false,
            }))
          )
        );
      } else {
        // No variants - use basic pricing
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
        if (formData.lowStockThreshold) productData.append("lowStockThreshold", formData.lowStockThreshold);
      }

      // Handle images
      if (primaryImage) {
        productData.append("image", primaryImage);
      } else if (existingPrimaryImage) {
        productData.append("image", existingPrimaryImage);
      }

      // Existing gallery images
      if (existingGallery.length > 0) {
        productData.append("existingGallery", JSON.stringify(existingGallery));
      }

      // New gallery uploads
      if (galleryUploads.length > 0) {
        galleryUploads.forEach((upload) => {
          productData.append("galleryImages", upload.file);
        });
      }

      await updateProduct(productId, productData);
      router.push(`/admin/products/${productId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/products/${productId}`}>
          <button className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft size={18} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Edit Product</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update product information</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          {/* Basic Information - Same as Add Page */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
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
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
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

          {/* Variants Toggle - Same as Add Page */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Product Variants</h2>
            <label className="flex items-center gap-3">
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
                className="w-4 h-4 text-slate-600 rounded focus:ring-slate-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Enable Product Variants (e.g., different sizes, weights, prices)
              </span>
            </label>
          </div>

          {/* Variants Management - Same as Add Page */}
          {hasVariants && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Variants</h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1"
                >
                  <Plus size={16} />
                  Add Variant
                </button>
              </div>
              <div className="space-y-3">
                {variants.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                    <p>No variants added. Click "Add Variant" to create one.</p>
                  </div>
                ) : (
                  variants.map((variant, index) => (
                    <div
                      key={variant._id || index}
                      className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Variant {index + 1}
                          </span>
                          {variant.isDefault && (
                            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={variant.isDefault}
                              onChange={() => updateVariant(index, "isDefault", true)}
                              className="w-4 h-4 text-slate-600"
                            />
                            <span className="text-xs text-slate-500 dark:text-slate-400">Default</span>
                          </label>
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Label *</label>
                          <input
                            type="text"
                            required
                            value={variant.label}
                            onChange={(e) => updateVariant(index, "label", e.target.value)}
                            placeholder="e.g., Small, 500g"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">SKU</label>
                          <input
                            type="text"
                            value={variant.sku || ""}
                            onChange={(e) => updateVariant(index, "sku", e.target.value)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Price (৳) *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, "price", e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Sale Price (৳)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.salePrice || ""}
                            onChange={(e) => updateVariant(index, "salePrice", e.target.value || undefined)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Stock *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, "stock", e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Measurement *</label>
                          <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={variant.measurement}
                            onChange={(e) => updateVariant(index, "measurement", e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Unit *</label>
                          <select
                            required
                            value={variant.unit}
                            onChange={(e) => updateVariant(index, "unit", e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          >
                            <option value="pcs">Pieces</option>
                            <option value="kg">Kilogram</option>
                            <option value="g">Gram</option>
                            <option value="l">Liter</option>
                            <option value="ml">Milliliter</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Unit Weight (kg)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={variant.unitWeightKg || ""}
                            onChange={(e) => updateVariant(index, "unitWeightKg", e.target.value || undefined)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Measurement Increment</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={variant.measurementIncrement || "0.01"}
                            onChange={(e) => updateVariant(index, "measurementIncrement", e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                          <select
                            value={variant.status}
                            onChange={(e) => updateVariant(index, "status", e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
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

          {/* Pricing & Inventory - Only show if no variants - Same as Add Page */}
          {!hasVariants && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Pricing & Inventory</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Sale Price (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Measurement
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.measurement}
                    onChange={(e) => setFormData({ ...formData, measurement: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Unit *
                  </label>
                  <select
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilogram</option>
                    <option value="g">Gram</option>
                    <option value="l">Liter</option>
                    <option value="ml">Milliliter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Unit Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={formData.unitWeightKg}
                    onChange={(e) => setFormData({ ...formData, unitWeightKg: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.lowStockThreshold}
                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Measurement Increment
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.measurementIncrement}
                  onChange={(e) => setFormData({ ...formData, measurementIncrement: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
                />
              </div>
            </div>
          )}

          {/* Images */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Product Images</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Primary Image
                </label>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePrimaryImageChange}
                    className="hidden"
                  />
                  <div className="px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer text-center">
                    <Plus className="mx-auto mb-2 text-slate-400" size={24} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Click to upload primary image</span>
                  </div>
                </label>
                {primaryImagePreview ? (
                  <div className="mt-4 relative inline-block">
                    <img src={primaryImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => {
                        setPrimaryImage(null);
                        setPrimaryImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : existingPrimaryImage ? (
                  <div className="mt-4 relative inline-block">
                    <img src={existingPrimaryImage} alt="Current" className="w-32 h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setExistingPrimaryImage(null)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Gallery Images
                </label>
                {existingGallery.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Current Gallery</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingGallery.map((img, index) => (
                        <div key={index} className="relative group">
                          <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeExistingGalleryImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <label className="block">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryFilesChange}
                    className="hidden"
                  />
                  <div className="px-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 transition-colors cursor-pointer text-center">
                    <Plus className="mx-auto mb-2 text-slate-400" size={24} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Click to upload gallery images</span>
                  </div>
                </label>
                {galleryUploads.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {galleryUploads.map((upload, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={upload.preview}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryUpload(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Options - Same as Add Page */}
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Additional Options</h2>
            <div className="space-y-4">
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
                  placeholder="e.g., fresh, premium, organic"
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
          <Link href={`/admin/products/${productId}`}>
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" disabled={loading} isLoading={loading}>
            <Save size={16} />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}


