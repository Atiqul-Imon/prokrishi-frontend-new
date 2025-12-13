"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { getProductById } from "../../utils/api";
import { fishProductApi } from "../../utils/fishApi";
import { useCart } from "../../context/CartContext";
import type { Product, FishProduct, SizeCategory } from "@/types/models";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Package, Truck, Plus, Minus, CheckCircle } from "lucide-react";
import { handleApiError } from "@/app/utils/errorHandler";
import { formatCurrency } from "@/app/utils";
import dynamic from "next/dynamic";
import { ProductCardSkeleton } from "@/components/ui/SkeletonLoader";
import ShareButton from "@/components/ShareButton";

// Lazy load heavy components for code splitting
const SwipeableImageGallery = dynamic(() => import("@/components/SwipeableImageGallery"), {
  ssr: true,
  loading: () => (
    <div className="aspect-square w-full bg-gray-100 rounded-lg animate-pulse" />
  ),
});

const CollapsibleSection = dynamic(() => import("@/components/CollapsibleSection"), {
  ssr: true,
  loading: () => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
      </div>
    </div>
  ),
});

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [variantId, setVariantId] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFishProduct = useMemo(() => {
    if (!product) return false;
    const fishProduct = product as FishProduct;
    return fishProduct.isFishProduct === true ||
      (fishProduct.sizeCategories && Array.isArray(fishProduct.sizeCategories) && fishProduct.sizeCategories.length > 0);
  }, [product]);

  const sizeCategories = useMemo(() => {
    if (!product) return [];
    const fishProduct = product as FishProduct;
    return fishProduct.sizeCategories || [];
  }, [product]);

  const selectedSizeCategory = useMemo(() => {
    if (!isFishProduct || !variantId) return null;
    return sizeCategories.find((sc: SizeCategory) => sc._id === variantId) || null;
  }, [isFishProduct, sizeCategories, variantId]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Try regular product first
        try {
          const res = await getProductById(id);
          if (res.product) {
            setProduct(res.product);
            return;
          }
        } catch (regularErr) {
          const err = regularErr as { status?: number; message?: string };
          // If 404, try fish product endpoint
          if (err.status === 404 || err.message?.includes('not found')) {
            try {
              const fishRes = await fishProductApi.getById(id);
              // Transform fish product to match Product type
              const fishProduct = fishRes.data?.fishProduct || fishRes.fishProduct;
              if (fishProduct) {
                const transformedProduct: Product = {
                  _id: fishProduct._id,
                  name: fishProduct.name,
                  price: fishProduct.priceRange?.min || 0,
                  stock: fishProduct.availableStock || 0,
                  image: fishProduct.image,
                  images: fishProduct.images || [fishProduct.image].filter(Boolean),
                  unit: 'kg',
                  measurement: 1,
                  category: fishProduct.category,
                  description: fishProduct.description,
                  isFishProduct: true,
                  priceRange: fishProduct.priceRange,
                  sizeCategories: fishProduct.sizeCategories || [],
                } as Product;
                setProduct(transformedProduct);
                return;
              }
            } catch (fishErr) {
              // Both failed, show error
              setError("Product not found - it may have been deleted");
              return;
            }
          }
          // Re-throw if not a 404
          throw regularErr;
        }
      } catch (err) {
        setError(handleApiError(err, "loading product"));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const price = useMemo(() => {
    if (!product) return 0;
    if (isFishProduct && selectedSizeCategory) {
      return selectedSizeCategory.pricePerKg || product.price;
    }
    if (product.hasVariants && variantId) {
      const variant = product.variants?.find((v) => v._id === variantId);
      return variant?.price ?? product.price;
    }
    return product.price;
  }, [product, variantId, isFishProduct, selectedSizeCategory]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    if (product.hasVariants && variantId) {
      return product.variants?.find((v) => v._id === variantId);
    }
    return null;
  }, [product, variantId]);

  const priceType =
    (isFishProduct && 'PER_WEIGHT') ||
    selectedVariant?.priceType ||
    product?.priceType ||
    ((selectedVariant?.unit || product?.unit) === "pcs" ? "PER_UNIT" : "PER_WEIGHT");

  const currentStock = useMemo(() => {
    if (isFishProduct && selectedSizeCategory) {
      return selectedSizeCategory.stock || 0;
    }
    if (isFishProduct && !selectedSizeCategory) {
      // If no size category selected, use total available stock from all active categories
      const activeCategories = sizeCategories.filter((sc: SizeCategory) => sc.status === 'active');
      return activeCategories.reduce((sum: number, cat: SizeCategory) => sum + (cat.stock || 0), 0);
    }
    if (selectedVariant) return selectedVariant.stock || 0;
    return product?.stock || 0;
  }, [product, selectedVariant, selectedSizeCategory, isFishProduct, sizeCategories]);

  const inStock = currentStock > 0;
  const unit = selectedSizeCategory ? "kg" : selectedVariant?.unit || product?.unit || "pcs";
  const stockType =
    selectedSizeCategory ? "WEIGHT" : selectedVariant?.stockType || product?.stockType || (unit === "pcs" ? "COUNT" : "WEIGHT");
  const step =
    selectedSizeCategory?.measurementIncrement ??
    selectedVariant?.measurementIncrement ??
    product?.measurementIncrement ??
    (unit === "pcs" ? 1 : unit === "kg" || unit === "g" ? 0.01 : 1);

  const productImages = useMemo(() => {
    if (!product) return [];
    return product.images && product.images.length > 0 
      ? product.images 
      : (product.image ? [product.image] : []);
  }, [product]);

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    const requested = newQuantity * step;
    if (!inStock) return;
    if (stockType === "WEIGHT") {
      if (requested <= currentStock) {
        setQuantity(newQuantity);
      }
    } else {
      if (newQuantity <= currentStock) {
        setQuantity(newQuantity);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8 pb-24 md:pb-16">
        <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
          <div className="grid gap-4 lg:grid-cols-2 max-w-6xl mx-auto">
            {/* Image skeleton */}
            <div className="space-y-4">
              <div className="aspect-square w-full bg-gray-200 rounded-lg animate-pulse" />
              <div className="flex gap-2 overflow-x-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                ))}
              </div>
            </div>
            {/* Content skeleton */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-12 bg-gray-200 rounded animate-pulse w-1/3" />
              </div>
              <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-24 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4">
          <Card padding="lg">
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error || "Product not found"}</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 pb-24 md:pb-16">
      <div className="w-full mx-auto px-4 xl:max-w-[90%] 2xl:max-w-[70%]">
        <div className="grid gap-4 lg:grid-cols-2 max-w-6xl mx-auto">
          {/* Product Image Section */}
          <div className="space-y-4">
            <Card padding="none" variant="elevated" className="overflow-hidden">
              <div className="relative">
                {productImages.length > 0 ? (
                  <SwipeableImageGallery
                    images={productImages}
                    alt={product.name}
                  />
                ) : (
                  <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {!inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 pointer-events-none">
                    <Badge variant="error" size="lg">Out of Stock</Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Product Info Section */}
          <div className="space-y-4">
            {/* Product Header */}
            <Card padding="lg" variant="elevated">
              <div className="space-y-3">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight flex-1">
                      {product.name}
                    </h1>
                    <ShareButton
                      productName={product.name}
                      productUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/products/${product._id}`}
                      variant="icon"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isFishProduct && (
                      <Badge variant="warning" size="md">
                        🐟 Fish Product
                      </Badge>
                    )}
                    {inStock ? (
                      <Badge variant="success" size="md">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="error" size="md">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-4xl font-bold text-gray-900">{formatCurrency(price)}</p>
                    {priceType === "PER_WEIGHT" && (
                      <p className="text-sm text-gray-500">/ {unit}</p>
                    )}
                    {priceType === "PER_UNIT" && unit !== "pcs" && (
                      <p className="text-sm text-gray-500">/ {unit}</p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Variants */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <Card padding="lg" variant="elevated">
                <div className="space-y-3">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Select Variant</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {product.variants.map((v) => {
                      const isSelected = variantId === v._id;
                      const variantInStock = (v.stock || 0) > 0;
                      return (
                        <button
                          key={v._id}
                          onClick={() => {
                            setVariantId(v._id);
                            setQuantity(1);
                          }}
                          disabled={!variantInStock}
                          className={`rounded-xl px-4 py-3 md:py-4 text-sm font-semibold transition text-left min-h-[44px] touch-manipulation active:scale-95 ${
                            isSelected
                              ? "bg-green-50 text-green-900 ring-2 ring-green-200"
                              : variantInStock
                              ? "bg-white hover:bg-green-50/50"
                              : "bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <div className="font-bold">{v.label || v.unit}</div>
                          <div className="text-xs mt-1">{formatCurrency(v.price)}</div>
                          {!variantInStock && (
                            <div className="text-xs text-red-600 mt-1">Out of stock</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Fish Product Size Categories */}
            {isFishProduct && sizeCategories.length > 0 && (
              <Card padding="lg" variant="elevated">
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Select Size Category</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {sizeCategories.map((sc: SizeCategory) => {
                      const isSelected = variantId === sc._id;
                      return (
                        <button
                          key={sc._id}
                          onClick={() => {
                            setVariantId(sc._id);
                            setQuantity(1);
                          }}
                          className={`rounded-xl px-4 py-3 md:py-4 text-sm font-semibold transition text-left min-h-[44px] touch-manipulation active:scale-95 ${
                            isSelected
                              ? "bg-green-50 text-green-900 ring-2 ring-green-200"
                              : "bg-white hover:bg-green-50/50"
                          }`}
                        >
                          <div className="font-bold">{sc.label || "Size"}</div>
                          <div className="text-xs mt-1">{formatCurrency(sc.pricePerKg)}/kg</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Quantity Selector & Add to Cart */}
            <Card padding="lg" variant="elevated" className="hidden md:block">
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="w-12 h-12 md:w-10 md:h-10 min-w-[44px] min-h-[44px] rounded-lg bg-gray-100 hover:bg-green-50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="flex-1 px-4 py-3 md:py-2 rounded-lg bg-gray-50 text-center min-h-[44px] flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">{quantity}</span>
                      {unit !== "pcs" && (
                        <span className="text-sm text-gray-500 ml-2">{unit}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={!inStock || quantity >= currentStock}
                      className="w-12 h-12 md:w-10 md:h-10 min-w-[44px] min-h-[44px] rounded-lg bg-gray-100 hover:bg-green-50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {inStock && (
                    <p className="text-xs text-gray-500 mt-2">
                      Total: {formatCurrency(price * quantity)}
                    </p>
                  )}
                </div>

                {/* Add to Cart Button - Desktop Only */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold text-lg py-4"
                  onClick={() => addToCart(product, quantity, variantId)}
                  disabled={!inStock}
                >
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </Button>

                {/* Shipping Info */}
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span>Inside Dhaka: ৳80 · Outside Dhaka: ৳150</span>
                  </div>
                  {isFishProduct && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4 text-amber-600" />
                      <span>Fish orders have separate delivery flow</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

          </div>
        </div>

        {/* Product Description - Collapsible on Mobile */}
        {product.description && (
          <div className="mt-8 md:mt-12 max-w-6xl mx-auto">
            <Card padding="lg" variant="elevated">
              <CollapsibleSection title="Product Description" defaultOpen={false}>
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                    {product.description}
                  </div>
                </div>
              </CollapsibleSection>
            </Card>
          </div>
        )}

        {/* Sticky Add to Cart Button - Mobile Only */}
        <div className="fixed bottom-16 left-0 right-0 z-[60] md:hidden bg-white border-t border-gray-200 shadow-lg p-4">
          <div className="flex items-center gap-4 max-w-6xl mx-auto">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(price * quantity)}
                </span>
                {priceType === "PER_WEIGHT" && (
                  <span className="text-sm text-gray-500">/ {unit}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {inStock ? `${currentStock} ${unit} available` : "Out of stock"}
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="flex-shrink-0 font-bold text-base px-4 py-2.5 min-h-[44px]"
              onClick={() => addToCart(product, quantity, variantId)}
              disabled={!inStock}
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
