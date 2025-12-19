"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fishProductApi } from "../../../../../utils/fishApi";
import { handleApiError } from "../../../../../utils/errorHandler";
import type { SizeCategory as SizeCategoryType } from "@/types/models";
import { Fish, Image as ImageIcon, Settings } from "lucide-react";
import {
  AdminFormPageLayout,
  FormSection,
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  ImageUpload,
  SizeCategoryManager,
  type SizeCategoryForm,
} from "@/components/admin";

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
  const [sizeCategories, setSizeCategories] = useState<SizeCategoryForm[]>([]);
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
            product.sizeCategories.map((cat: SizeCategoryType) => ({
              _id: cat._id,
              label: cat.label || "",
              pricePerKg: cat.pricePerKg?.toString() || "",
              stock: cat.stock?.toString() || "0",
              minWeight: cat.minWeight?.toString() || undefined,
              maxWeight: cat.maxWeight?.toString() || undefined,
              sku: cat.sku || undefined,
              measurementIncrement: cat.measurementIncrement?.toString() || "1",
              status: cat.status || "active",
              isDefault: cat.isDefault || false,
            }))
          );
        } else {
          setSizeCategories([
            { label: "", pricePerKg: "", stock: "", measurementIncrement: "1", status: "active", isDefault: true },
          ]);
        }
      } catch (err) {
        setError(handleApiError(err, "loading fish product"));
      } finally {
        setFetchLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      setExistingImage(null);
    }
  };

  const addSizeCategory = () => {
    setSizeCategories([
      ...sizeCategories,
      { label: "", pricePerKg: "", stock: "", measurementIncrement: "1", status: "active", isDefault: false },
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

  const updateSizeCategory = (index: number, field: keyof SizeCategoryForm, value: string | boolean) => {
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
      } else if (!existingImage) {
        fd.append("removeImage", "true");
      }

      await fishProductApi.update(productId, fd);
      router.push("/admin/fish/products");
    } catch (err) {
      setError(handleApiError(err, "updating fish product"));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4">Loading fish product...</p>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "out_of_stock", label: "Out of Stock" },
  ];

  return (
    <AdminFormPageLayout
      title="Edit Fish Product"
      description="Update fish product information"
      backHref="/admin/fish/products"
      error={error}
      onErrorDismiss={() => setError(null)}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Update Fish Product"
    >
      <FormSection title="Basic Information" description="Essential product details" icon={Fish}>
        <FormInput
          label="Product Name"
          required
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter fish product name"
        />

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

        <FormSelect
          label="Status"
          required
          options={statusOptions}
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        />
      </FormSection>

      <FormSection title="Product Image" description="Upload product image" icon={ImageIcon}>
        <ImageUpload
          label="Product Image"
          value={image}
          preview={imagePreview}
          existingImage={existingImage}
          onChange={handleImageChange}
          helperText="Recommended: 800x800px or larger"
        />
      </FormSection>

      <FormSection title="Size Categories" description="Define size categories with pricing" icon={Fish}>
        <SizeCategoryManager
          sizeCategories={sizeCategories}
          onAdd={addSizeCategory}
          onRemove={removeSizeCategory}
          onUpdate={updateSizeCategory}
          minCategories={1}
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
