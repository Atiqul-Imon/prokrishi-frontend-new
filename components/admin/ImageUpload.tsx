"use client";

import React, { useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  label?: string;
  required?: boolean;
  value: File | null;
  preview: string | null;
  existingImage?: string | null;
  onChange: (file: File | null) => void;
  onRemove?: () => void;
  accept?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export function ImageUpload({
  label = "Image",
  required = false,
  value,
  preview,
  existingImage,
  onChange,
  onRemove,
  accept = "image/*",
  error,
  helperText,
  className = "",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (onRemove) {
      onRemove();
    }
  };

  const displayImage = preview || existingImage;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {displayImage ? (
        <div className="relative inline-block">
          <img
            src={displayImage}
            alt="Preview"
            className="w-40 h-40 object-cover rounded-xl border-2 border-slate-200 shadow-sm"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            aria-label="Remove image"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 hover:bg-slate-100 hover:border-emerald-400 transition-all text-center">
            <Upload className="mx-auto mb-3 text-slate-400" size={32} strokeWidth={1.5} />
            <p className="text-sm font-medium text-slate-700 mb-1">Click to upload image</p>
            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </label>
      )}

      {error && (
        <p className="text-xs text-red-600 mt-1.5">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>
      )}
    </div>
  );
}

