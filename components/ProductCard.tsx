"use client";

import React, { useMemo, useCallback } from "react";
import Link from "next/link";
import ImageKitImage from "@/components/ui/ImageKitImage";
import { useCart } from "@/app/context/CartContext";
import { Product } from "@/types/models";
import { formatCurrency } from "@/app/utils";
import { Badge } from "@/components/ui/Badge";
import { Package, Fish } from "lucide-react";

interface ProductCardProps {
  product: Product;
  showBadges?: boolean;
  className?: string;
}

function ProductCard({ product, showBadges = true, className = "" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { _id, name, price, stock, image, images, unit, measurement, isFishProduct, priceRange, sizeCategories } = product;

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, id: _id }, 1);
  }, [product, _id, addToCart]);

  // Calculate display price
  const displayPrice = useMemo(() => {
    if (isFishProduct && priceRange) {
      return priceRange.min || 0;
    }
    if (isFishProduct && sizeCategories && sizeCategories.length > 0) {
      const activeCategories = sizeCategories.filter(cat => cat.status === 'active');
      if (activeCategories.length > 0) {
        return Math.min(...activeCategories.map(cat => cat.pricePerKg));
      }
    }
    return price || 0;
  }, [price, isFishProduct, priceRange, sizeCategories]);

  // Check if product has variants with sale prices
  const hasSalePrice = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.some(v => v.salePrice && v.salePrice < v.price);
    }
    return false;
  }, [product.variants]);

  const inStock = useMemo(() => {
    // Fish products: check size categories
    if (isFishProduct && sizeCategories) {
      return sizeCategories.some(cat => (cat.stock || 0) > 0 && cat.status === 'active');
    }
    
    // Use normalized stock value (from productNormalizer utility)
    // This ensures consistency across all pages (homepage, products page, category pages)
    const normalizedStock = Number(stock) || 0;
    if (normalizedStock > 0) {
      return true;
    }
    
    // Fallback: For products with variants, check if any variant has stock
    // This is a safety check in case normalization didn't run
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      return product.variants.some((variant: any) => 
        (Number(variant.stock) || 0) > 0 && (variant.status === 'active' || !variant.status)
      );
    }
    
    // Final fallback: check stock field directly
    return normalizedStock > 0;
  }, [stock, isFishProduct, sizeCategories, product.hasVariants, product.variants]);

  const measurementText = measurement && unit ? `${measurement} ${unit}` : null;
  
  // Get all available images
  const allImages = useMemo(() => {
    if (images && images.length > 0) {
      return images;
    }
    if (image) {
      return [image];
    }
    return [];
  }, [images, image]);
  
  // Get primary and secondary images
  const primaryImage = allImages[0] || null;
  const secondaryImage = allImages.length > 1 ? allImages[1] : null;
  const hasMultipleImages = allImages.length > 1;

  return (
    <article className={`group relative rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 h-full flex flex-col ${className}`} aria-label={`Product: ${name}`}>
      <Link href={`/products/${_id}`} className="block flex-shrink-0 relative focus:outline-none focus:ring-0 focus:border-0" aria-label={`View details for ${name}`}>
        <div className="relative overflow-hidden aspect-square w-full bg-gradient-to-br from-gray-50 to-gray-100">
          {primaryImage ? (
            <>
              {/* Primary Image */}
              <ImageKitImage
                src={primaryImage}
                alt={name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover object-center transition-all duration-500 ease-out ${
                  hasMultipleImages 
                    ? "group-hover:opacity-0 group-hover:scale-110" 
                    : "group-hover:scale-105 group-hover:brightness-110"
                }`}
                loading="lazy"
                imageType="product"
                size="medium"
                quality={80}
              />
              
              {/* Secondary Image (shown on hover when multiple images exist) */}
              {hasMultipleImages && secondaryImage && (
                <ImageKitImage
                  src={secondaryImage}
                  alt={`${name} - view 2`}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out absolute inset-0"
                  loading="lazy"
                  imageType="product"
                  size="medium"
                  quality={80}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
          )}
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          {showBadges && isFishProduct && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="warning" size="sm" className="text-[11px] font-semibold flex items-center gap-1.5 px-2.5 py-1 shadow-md backdrop-blur-sm bg-amber-500/95 text-white border-0">
                <Fish size={12} />
                <span>Fish</span>
              </Badge>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10" role="status" aria-live="polite">
              <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 md:p-3.5 lg:p-4 flex flex-col flex-grow">
        {/* Title */}
        <Link href={`/products/${_id}`}>
          <h3 className="text-base md:text-sm lg:text-base font-bold text-gray-900 mb-1 md:mb-1 lg:mb-1 line-clamp-2 hover:text-emerald-700 transition-colors duration-200 min-h-[2.5rem] md:min-h-[2.25rem] lg:min-h-[2.5rem] leading-snug group-hover:translate-x-0.5 transition-transform">
            {name}
          </h3>
        </Link>

        {/* Price and Measurement */}
        <div className="mt-auto space-y-1.5">
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight">
              {formatCurrency(displayPrice)}
            </p>
            {isFishProduct && priceRange && priceRange.min !== priceRange.max && (
              <span className="text-sm text-gray-500 font-semibold whitespace-nowrap">
                - {formatCurrency(priceRange.max || displayPrice)}
              </span>
            )}
          </div>
          
          {(measurementText || isFishProduct) && (
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              {measurementText && <span>{measurementText}</span>}
              {isFishProduct && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">Per kg</span>}
            </div>
          )}

          {/* Add to Cart / Select Size Button */}
          {isFishProduct ? (
            <Link
              href={`/products/${_id}`}
              className={`group/btn relative w-full font-semibold py-1.5 md:py-2 lg:py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-sm lg:text-base overflow-hidden min-h-[40px] touch-manipulation tracking-tight ${
                inStock
                  ? "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white hover:from-amber-700 hover:via-amber-600 hover:to-amber-700 shadow-md active:scale-[0.95] focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm pointer-events-none"
              }`}
              aria-label={inStock ? `Select size for ${name}` : `${name} is out of stock`}
            >
              {/* Shimmer effect on hover - only for in stock */}
              {inStock && (
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}
              
              {/* Text */}
              <span className="relative z-10 font-medium">{inStock ? "Select Size" : "Out of Stock"}</span>
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              aria-label={inStock ? `Add ${name} to cart` : `${name} is out of stock`}
              aria-disabled={!inStock}
              className={`group/btn relative w-full font-semibold py-1.5 md:py-2 lg:py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center gap-2 text-base md:text-sm lg:text-base overflow-hidden min-h-[40px] touch-manipulation tracking-tight ${
                inStock
                  ? "bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white hover:from-emerald-800 hover:via-emerald-700 hover:to-emerald-800 shadow-md active:scale-[0.95] focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-0"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-sm"
              }`}
            >
              {/* Shimmer effect on hover - only for in stock */}
              {inStock && (
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}
              
              {/* Text - same for both in stock and out of stock */}
              <span className="relative z-10 font-medium">Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default React.memo(ProductCard);

