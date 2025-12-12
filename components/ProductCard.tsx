"use client";

import React, { useMemo } from "react";
import Link from "next/link";
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

export default function ProductCard({ product, showBadges = true, className = "" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { _id, name, price, stock, image, images, unit, measurement, isFishProduct, priceRange, sizeCategories } = product;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, id: _id }, 1);
  };

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
    if (isFishProduct && sizeCategories) {
      return sizeCategories.some(cat => (cat.stock || 0) > 0 && cat.status === 'active');
    }
    return (stock || 0) > 0;
  }, [stock, isFishProduct, sizeCategories]);

  const measurementText = measurement && unit ? `${measurement} ${unit}` : null;
  
  // Get primary image (use first from images array if available, otherwise use image)
  const primaryImage = images && images.length > 0 ? images[0] : image;

  return (
    <div className={`group relative rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col ${className}`}>
      <Link href={`/products/${_id}`} className="block flex-shrink-0">
        <div className="relative overflow-hidden aspect-square w-full bg-gray-100">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Package className="w-6 h-6 md:w-5 md:h-5 text-gray-400" />
            </div>
          )}
          
          {/* Badges */}
          {showBadges && isFishProduct && (
            <div className="absolute top-1.5 left-1.5 z-10">
              <Badge variant="warning" size="sm" className="text-[10px] md:text-[9px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5">
                <Fish size={10} className="md:w-3 md:h-3" />
                <span className="hidden md:inline">Fish</span>
              </Badge>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] md:text-[9px] font-semibold">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 md:p-2.5 lg:p-3 flex flex-col flex-grow">
        {/* Title */}
        <Link href={`/products/${_id}`}>
          <h3 className="text-base md:text-sm lg:text-base font-bold text-gray-900 mb-2 md:mb-1.5 lg:mb-2 line-clamp-2 hover:text-emerald-600 transition-colors min-h-[2.5rem] md:min-h-[2.25rem] lg:min-h-[2.5rem] leading-snug">
            {name}
          </h3>
        </Link>

        {/* Price and Measurement */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-2.5 md:mb-2 lg:mb-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl md:text-lg lg:text-xl font-extrabold text-gray-900 truncate">{formatCurrency(displayPrice)}</p>
                {isFishProduct && priceRange && priceRange.min !== priceRange.max && (
                  <span className="text-sm md:text-xs lg:text-sm text-gray-600 font-semibold whitespace-nowrap">
                    - {formatCurrency(priceRange.max || displayPrice)}
                  </span>
                )}
              </div>
              {measurementText && (
                <p className="text-xs md:text-[11px] lg:text-xs text-gray-600 mt-1 font-medium">{measurementText}</p>
              )}
              {isFishProduct && (
                <p className="text-xs md:text-[11px] lg:text-xs text-gray-600 mt-1 font-medium">Per kg</p>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full font-bold py-2.5 md:py-2 lg:py-2.5 px-3 md:px-2.5 lg:px-3 rounded-lg transition-all duration-200 flex items-center justify-center text-sm md:text-xs lg:text-sm shadow-md ${
              inStock
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg active:scale-95"
                : "bg-gray-400 text-white cursor-not-allowed opacity-50"
            }`}
          >
            <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

