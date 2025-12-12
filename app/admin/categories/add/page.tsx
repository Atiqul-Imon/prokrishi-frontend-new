"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCategory } from "../../../utils/api";
import { Save, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  AdminPageHeader,
  FormSection,
  FormInput,
  FormTextarea,
  ImageUpload,
  ErrorAlert,
} from "@/components/admin";
import type { CategoryFormData } from "@/app/utils/api";
import { handleApiError } from "@/app/utils/errorHandler";

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleImageChange = (file: File | null) => {
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const categoryData: CategoryFormData = {
        name: formData.name,
        description: formData.description,
        image: image || undefined,
      };

      await createCategory(categoryData);
      router.push("/admin/categories");
    } catch (err) {
      setError(handleApiError(err, "creating category"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <AdminPageHeader
        title="Add Category"
        description="Create a new product category"
        backHref="/admin/categories"
      />

      <ErrorAlert message={error || ""} onDismiss={() => setError(null)} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection
          title="Category Information"
          description="Basic category details"
          icon={Tag}
        >
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
            placeholder="Enter category description"
          />

          <ImageUpload
            label="Category Image"
            value={image}
            preview={imagePreview}
            onChange={handleImageChange}
            helperText="Upload an image to represent this category"
          />
        </FormSection>

        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/categories">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button variant="primary" type="submit" disabled={loading} isLoading={loading}>
            <Save size={16} />
            Create Category
          </Button>
        </div>
      </form>
    </div>
  );
}

