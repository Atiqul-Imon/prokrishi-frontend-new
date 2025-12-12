"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fishProductApi } from "../../../../utils/fishApi";
import { ArrowLeft, Edit, Fish, DollarSign, PackageCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { FishProduct, SizeCategory } from "@/types/models";
import { handleApiError } from "@/app/utils/errorHandler";

export default function FishProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<FishProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const result = await fishProductApi.getById(productId);
        setProduct(result.fishProduct || result);
      } catch (err) {
        setError(handleApiError(err, "loading fish product"));
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
        <Link href="/admin/fish/products">
          <Button variant="outline">Back to Fish Products</Button>
        </Link>
      </div>
    );
  }

  const getTotalStock = (): number => {
    if (!product?.sizeCategories || product.sizeCategories.length === 0) return 0;
    return product.sizeCategories.reduce((sum: number, cat: SizeCategory) => sum + (cat.stock || 0), 0);
  };

  const getPriceRange = (): string => {
    if (!product?.sizeCategories || product.sizeCategories.length === 0) return "N/A";
    const prices = product.sizeCategories
      .filter((cat: SizeCategory) => cat.status === "active")
      .map((cat: SizeCategory) => cat.pricePerKg)
      .filter((p: number) => p != null);
    if (prices.length === 0) return "N/A";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      return `৳${min.toLocaleString()}/kg`;
    }
    return `৳${min.toLocaleString()} - ৳${max.toLocaleString()}/kg`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/fish/products">
            <button className="p-2 rounded-lg text-slate-600">
              <ArrowLeft size={18} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
            <p className="text-sm text-slate-500">Fish Product Details</p>
          </div>
        </div>
        <Link href={`/admin/fish/products/edit/${productId}`}>
          <Button variant="primary" className="flex items-center gap-2 text-sm">
            <Edit size={16} />
            Edit Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Image */}
          {product.image && (
            <div className="bg-white">
              <h2 className="text-sm font-semibold text-slate-900">Product Image</h2>
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-md h-auto rounded-lg object-cover"
              />
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

          {/* Size Categories */}
          {product.sizeCategories && product.sizeCategories.length > 0 && (
            <div className="bg-white">
              <h2 className="text-sm font-semibold text-slate-900">Size Categories</h2>
              <div className="space-y-3">
                {product.sizeCategories.map((cat: SizeCategory, index: number) => (
                  <div
                    key={cat._id || index}
                    className="p-4 rounded-lg bg-slate-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{cat.label}</span>
                        {cat.isDefault && (
                          <span className="px-2 py-0.5 bg-slate-200">
                            Default
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            cat.status === "active"
                              ? "bg-emerald-100"
                              : "bg-slate-100"
                          }`}
                        >
                          {cat.status}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Price/Kg</p>
                        <p className="font-medium text-slate-900">
                          ৳{cat.pricePerKg?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Stock</p>
                        <p className="font-medium text-slate-900">{cat.stock || 0} kg</p>
                      </div>
                      {cat.minWeight && (
                        <div>
                          <p className="text-xs text-slate-500">Min Weight</p>
                          <p className="font-medium text-slate-900">{cat.minWeight} kg</p>
                        </div>
                      )}
                      {cat.maxWeight && (
                        <div>
                          <p className="text-xs text-slate-500">Max Weight</p>
                          <p className="font-medium text-slate-900">{cat.maxWeight} kg</p>
                        </div>
                      )}
                      {cat.sku && (
                        <div>
                          <p className="text-xs text-slate-500">SKU</p>
                          <p className="font-medium text-slate-900">
                            {cat.sku}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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
                  <Fish className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="text-sm font-medium text-slate-900">
                    {typeof product.category === 'object' && product.category?.name ? product.category.name : (typeof product.category === 'string' ? product.category : "মাছ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <DollarSign className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Price Range</p>
                  <p className="text-sm font-medium text-slate-900">{getPriceRange()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <PackageCheck className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Stock</p>
                  <p
                    className={`text-sm font-medium ${
                      getTotalStock() < 10
                        ? "text-red-600"
                        : "text-slate-900"
                    }`}
                  >
                    {getTotalStock()} kg
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <PackageCheck className="text-slate-600" size={16} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${
                      product.status === "active"
                        ? "bg-emerald-100"
                        : "bg-slate-100"
                    }`}
                  >
                    {product.status || "inactive"}
                  </span>
                </div>
              </div>

               {(product as any).sku && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <PackageCheck className="text-slate-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">SKU</p>
                    <p className="text-sm font-medium text-slate-900">
                      {(product as any).sku}
                    </p>
                  </div>
                </div>
              )}

              {product.isFeatured && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100">
                    <PackageCheck className="text-slate-600" size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Featured</p>
                    <p className="text-sm font-medium text-slate-900">Yes</p>
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

