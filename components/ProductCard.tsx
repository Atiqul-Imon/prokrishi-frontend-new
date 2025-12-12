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
  const { _id, name, price, stock, image, images, unit, measurement, isFishProduct, isFeatured, priceRange, sizeCategories } = product;

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
    <div className={`group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col ${className}`}>
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
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Badges */}
          {showBadges && (
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
              {isFeatured && (
                <Badge variant="warning" size="sm" className="text-xs font-semibold">
                  ⭐ Featured
                </Badge>
              )}
              {isFishProduct && (
                <Badge variant="warning" size="sm" className="text-xs font-semibold flex items-center gap-1">
                  <Fish size={12} />
                  Fish
                </Badge>
              )}
            </div>
          )}

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <Link href={`/products/${_id}`}>
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-emerald-600 transition-colors min-h-[2.5rem]">
            {name}
          </h3>
        </Link>

        {/* Price and Measurement */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-gray-900">{formatCurrency(displayPrice)}</p>
                {isFishProduct && priceRange && priceRange.min !== priceRange.max && (
                  <span className="text-xs text-gray-500">
                    - {formatCurrency(priceRange.max || displayPrice)}
                  </span>
                )}
              </div>
              {measurementText && (
                <p className="text-xs text-gray-500 mt-0.5">{measurementText}</p>
              )}
              {isFishProduct && (
                <p className="text-xs text-gray-500 mt-0.5">Per kg</p>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-base shadow-md ${
              inStock
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg active:scale-95"
                : "bg-gray-400 text-white cursor-not-allowed opacity-50"
            }`}
          >
            <span className="font-bold">{inStock ? "Add to Cart" : "Out of Stock"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

