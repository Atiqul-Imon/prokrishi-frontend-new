"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface GalleryImage {
  file?: File;
  preview: string;
  url?: string; // For existing images from server
}

interface GalleryUploadProps {
  label?: string;
  images: GalleryImage[];
  existingImages?: string[];
  onChange: (images: GalleryImage[]) => void;
  onRemove?: (index: number) => void;
  accept?: string;
  maxImages?: number;
  error?: string;
  helperText?: string;
  className?: string;
}

export function GalleryUpload({
  label = "Gallery Images",
  images,
  existingImages = [],
  onChange,
  onRemove,
  accept = "image/*",
  maxImages = 10,
  error,
  helperText,
  className = "",
}: GalleryUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: GalleryImage[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const updatedImages = [...images, ...newImages].slice(0, maxImages);
    onChange(updatedImages);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const image = images[index];
    // Revoke object URL if it's a preview
    if (image.preview && !image.url) {
      URL.revokeObjectURL(image.preview);
    }

    const updatedImages = images.filter((_, i) => i !== index);
    onChange(updatedImages);

    if (onRemove) {
      onRemove(index);
    }
  };

  const allImages = [
    ...existingImages.map((url) => ({ url, preview: url })),
    ...images,
  ];

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          {label}
        </label>
      )}

      <div className="space-y-4">
        {/* Image Grid */}
        {allImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div key={index} className="relative group aspect-[4/3]">
                <Image
                  src={image.preview}
                  alt={`Gallery ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover rounded-xl border-2 border-slate-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {allImages.length < maxImages && (
          <label className="block cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple
              onChange={handleFilesChange}
              className="hidden"
            />
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all text-center">
              <Upload className="mx-auto mb-2 text-slate-400" size={24} strokeWidth={1.5} />
              <p className="text-sm font-medium text-slate-700 mb-1">Add Images</p>
              <p className="text-xs text-slate-500">
                {allImages.length}/{maxImages} images
              </p>
            </div>
          </label>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1.5">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>
      )}
    </div>
  );
}

