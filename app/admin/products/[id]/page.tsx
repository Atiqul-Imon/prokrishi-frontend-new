"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductById } from "../../../utils/api";
import { ArrowLeft, Edit, Package, Tag, DollarSign, PackageCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const result = await getProductById(productId);
        setProduct(result.product || result);
      } catch (err) {
        setError(handleApiError(err, "loading product"));
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-slate-200"></div>
          <p className="text-sm text-slate-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error || "Product not found"}</p>
            </div>
          </div>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <button className="p-2 rounded-lg text-slate-600">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-500">Product Details</p>
          </div>
        </div>
        <Link href={`/admin/products/edit/${productId}`}>
          <Button variant="primary" className="flex items-center gap-2 text-sm">
            <Edit size={16} />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Images */}
          {product.images && product.images.length > 0 && (
            <div className="bg-white">
              <h2 className="text-sm font-semibold text-slate-900">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="bg-white">
              <h2 className="text-sm font-semibold text-slate-900">Description</h2>
              {product.description && (
                <p className="text-sm text-slate-600">{product.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Product Info */}
          <div className="bg-white">
            <h2 className="text-sm font-semibold text-slate-900">Product Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Tag className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="text-sm font-medium text-slate-900">
                    {typeof product.category === 'object' && product.category?.name ? product.category.name : (typeof product.category === 'string' ? product.category : "Uncategorized")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <DollarSign className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Price</p>
                  <p className="text-sm font-medium text-slate-900">
                    ৳{product.price?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <PackageCheck className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Stock</p>
                  <p className={`text-sm font-medium ${
                    (product.stock || 0) < 10
                      ? "text-red-600"
                      : "text-slate-900"
                  }`}>
                    {product.stock || 0} {product.unit || "units"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Package className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                      (product as any).status === "active"
                        ? "bg-emerald-100"
                        : "bg-slate-100"
                    }`}
                  >
                    {(product as any).status || "inactive"}
                  </span>
                </div>
              </div>

              {product.measurement && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Package className="text-slate-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Measurement</p>
                    <p className="text-sm font-medium text-slate-900">
                      {product.measurement} {product.unit || "pcs"}
                    </p>
                  </div>
                </div>
              )}

              {(product as any).sku && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <Package className="text-slate-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">SKU</p>
                    <p className="text-sm font-medium text-slate-900">
                      {(product as any).sku}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

