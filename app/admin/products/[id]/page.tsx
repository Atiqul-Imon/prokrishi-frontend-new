"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductById } from "../../../utils/api";
import { ArrowLeft, Edit, Package, Tag, DollarSign, PackageCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const result = await getProductById(productId);
        setProduct(result.product || result);
      } catch (err: any) {
        setError(err.message || "Failed to load product");
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
          <div className="inline-block w-6 h-6 border-2 border-slate-200 dark:border-slate-800 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">Error</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-0.5">{error || "Product not found"}</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products">
            <button className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{product.name}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Product Details</p>
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
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {product.images && product.images.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Images</h2>
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
          {(product.description || product.shortDescription) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Description</h2>
              {product.shortDescription && (
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{product.shortDescription}</p>
              )}
              {product.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{product.description}</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Product Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Tag className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Category</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {product.category?.name || "Uncategorized"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <DollarSign className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Price</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    ৳{product.price?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <PackageCheck className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Stock</p>
                  <p className={`text-sm font-medium ${
                    (product.stock || 0) < 10
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-900 dark:text-slate-100"
                  }`}>
                    {product.stock || 0} {product.unit || "units"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Package className="text-slate-600 dark:text-slate-400" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                      product.status === "active"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {product.status || "inactive"}
                  </span>
                </div>
              </div>

              {product.measurement && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Package className="text-slate-600 dark:text-slate-400" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Measurement</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {product.measurement} {product.unit || "pcs"}
                    </p>
                  </div>
                </div>
              )}

              {product.sku && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Package className="text-slate-600 dark:text-slate-400" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">SKU</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 font-mono">
                      {product.sku}
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

