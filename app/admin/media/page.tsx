"use client";

import { useState } from "react";
import { Image, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminMediaPage() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    // TODO: Implement media upload API call
    setTimeout(() => {
      setUploading(false);
      alert("Media uploaded successfully!");
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500">Manage your media files</p>
        </div>
        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <Button variant="primary" className="flex items-center gap-2" disabled={uploading}>
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload Media"}
          </Button>
        </label>
      </div>

      {/* Upload Area */}
      <div className="bg-white">
        <Image className="mx-auto text-gray-400" size={48} />
        <p className="text-gray-500">
          Media library functionality will be available soon
        </p>
        <p className="text-sm text-gray-400">
          Upload and manage images, videos, and other media files
        </p>
      </div>
    </div>
  );
}

