"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct, getAllCategories } from "../../../utils/api";
import { logger } from "../../../utils/logger";
import { handleApiError } from "../../../utils/errorHandler";
import { Package, Tag, Settings, DollarSign, Image as ImageIcon } from "lucide-react";
import type { Category } from "@/types/models";
import {
  AdminFormPageLayout,
  FormSection,
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  ImageUpload,
  GalleryUpload,
  VariantManager,
  type ProductVariant,
} from "@/components/admin";

interface GalleryUpload {
  file: File;
  preview: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const handlePrimaryImageChange = (file: File | null) => {
    setPrimaryImage(file);
    if (file) {
      setPrimaryImagePreview(URL.createObjectURL(file));
    } else {
      if (primaryImagePreview) {
        URL.revokeObjectURL(primaryImagePreview);
      }
      setPrimaryImagePreview(null);
    }
  };

  const handleGalleryChange = (images: Array<{ file?: File; preview: string; url?: string }>) => {
    const newUploads: GalleryUpload[] = images
      .filter((img) => img.file)
      .map((img) => ({
        file: img.file!,
        preview: img.preview,
      }));
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

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "out_of_stock", label: "Out of Stock" },
  ];

  const unitOptions = [
    { value: "pcs", label: "Pieces" },
    { value: "kg", label: "Kilogram" },
    { value: "g", label: "Gram" },
    { value: "l", label: "Liter" },
    { value: "ml", label: "Milliliter" },
  ];

  return (
    <AdminFormPageLayout
      title="Add New Product"
      description="Create a new product for your catalog"
      backHref="/admin/products"
      error={error}
      onErrorDismiss={() => setError(null)}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Create Product"
    >
      <FormSection title="Basic Information" description="Essential product details" icon={Package}>
        <FormInput
          label="Product Name"
          required
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter product name"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormSelect
            label="Category"
            required
            options={categoryOptions}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Select category"
          />

          <FormSelect
            label="Status"
            required
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          />
        </div>

        <FormInput
          label="Short Description"
          type="text"
          maxLength={100}
          value={formData.shortDescription}
          onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
          placeholder="Brief description (max 100 characters)"
          helperText={`${formData.shortDescription.length}/100 characters`}
        />

        <FormTextarea
          label="Description"
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed product description"
        />
      </FormSection>

      <FormSection title="Product Variants" description="Enable variants for different sizes, weights, or prices" icon={Tag}>
        <FormCheckbox
          label="Enable Product Variants (e.g., different sizes, weights, prices)"
          checked={hasVariants}
          onChange={(e) => {
            setHasVariants(e.target.checked);
            if (!e.target.checked) {
              setVariants([]);
            } else if (variants.length === 0) {
              addVariant();
            }
          }}
        />

        {hasVariants && (
          <VariantManager
            variants={variants}
            onAdd={addVariant}
            onRemove={removeVariant}
            onUpdate={updateVariant}
          />
        )}
      </FormSection>

      {!hasVariants && (
        <FormSection title="Pricing & Inventory" description="Set product pricing and stock information" icon={DollarSign}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormInput
              label="Price (৳)"
              required
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />

            <FormInput
              label="Sale Price (৳)"
              type="number"
              min="0"
              step="0.01"
              value={formData.salePrice}
              onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              placeholder="Optional"
            />

            <FormInput
              label="Stock"
              required
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <FormInput
              label="Measurement"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.measurement}
              onChange={(e) => setFormData({ ...formData, measurement: e.target.value })}
            />

            <FormSelect
              label="Unit"
              required
              options={unitOptions}
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />

            <FormInput
              label="Unit Weight (kg)"
              type="number"
              min="0"
              step="0.001"
              value={formData.unitWeightKg}
              onChange={(e) => setFormData({ ...formData, unitWeightKg: e.target.value })}
              placeholder="Optional"
            />

            <FormInput
              label="Low Stock Threshold"
              type="number"
              min="0"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
            />
          </div>

          <FormInput
            label="Measurement Increment"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.measurementIncrement}
            onChange={(e) => setFormData({ ...formData, measurementIncrement: e.target.value })}
          />
        </FormSection>
      )}

      <FormSection title="Product Images" description="Upload product images" icon={ImageIcon}>
        <ImageUpload
          label="Primary Image"
          value={primaryImage}
          preview={primaryImagePreview}
          onChange={handlePrimaryImageChange}
          helperText="Recommended: 800x800px or larger"
        />

        <GalleryUpload
          label="Gallery Images"
          images={galleryUploads.map((u) => ({ file: u.file, preview: u.preview }))}
          onChange={handleGalleryChange}
          maxImages={10}
          helperText="You can select multiple images"
        />
      </FormSection>

      <FormSection title="Additional Options" description="SEO and marketing settings" icon={Settings}>
        <FormCheckbox
          label="Featured Product"
          checked={formData.isFeatured}
          onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
        />

        <FormInput
          label="Tags (comma-separated)"
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="e.g., fresh, premium, organic"
        />

        <FormInput
          label="Meta Title"
          type="text"
          value={formData.metaTitle}
          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
          placeholder="SEO meta title"
        />

        <FormTextarea
          label="Meta Description"
          rows={3}
          maxLength={160}
          value={formData.metaDescription}
          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          placeholder="SEO meta description"
          helperText={`${formData.metaDescription.length}/160 characters`}
        />
      </FormSection>
    </AdminFormPageLayout>
  );
}
