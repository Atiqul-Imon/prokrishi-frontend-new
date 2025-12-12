"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCategoryById, updateCategory } from "../../../../utils/api";
import type { CategoryFormData } from "@/app/utils/api";
import { handleApiError } from "@/app/utils/errorHandler";
import { Tag, Image as ImageIcon } from "lucide-react";
import {
  AdminFormPageLayout,
  FormSection,
  FormInput,
  FormTextarea,
  ImageUpload,
} from "@/components/admin";

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setFetchLoading(true);
        const result = await getCategoryById(categoryId);
        const category = result.category || result;
        setFormData({
          name: category.name || "",
          description: category.description || "",
        });
        if (category.image) {
          setExistingImage(category.image);
        }
      } catch (err) {
        setError(handleApiError(err, "loading category"));
      } finally {
        setFetchLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const categoryData: CategoryFormData & { existingImage?: string } = {
        name: formData.name,
        description: formData.description,
        image: image || undefined,
        ...(existingImage && !image ? { existingImage } : {}),
      };

      await updateCategory(categoryId, categoryData);
      router.push("/admin/categories");
    } catch (err) {
      setError(handleApiError(err, "updating category"));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 mt-4">Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminFormPageLayout
      title="Edit Category"
      description="Update category information"
      backHref="/admin/categories"
      error={error}
      onErrorDismiss={() => setError(null)}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel="Save Changes"
    >
      <FormSection title="Basic Information" description="Category details" icon={Tag}>
        <FormInput
          label="Category Name"
          required
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter category name"
        />

        <FormTextarea
          label="Description"
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Category description"
        />
      </FormSection>

      <FormSection title="Category Image" description="Upload category image" icon={ImageIcon}>
        <ImageUpload
          label="Category Image"
          value={image}
          preview={imagePreview}
          existingImage={existingImage}
          onChange={handleImageChange}
          helperText="Recommended: 400x400px or larger"
        />
      </FormSection>
    </AdminFormPageLayout>
  );
}
