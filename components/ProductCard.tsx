"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { Product } from "@/types/models";
import { Button } from "@/components/ui/Button";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { _id, name, price, stock, image, unit, measurement } = product;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, id: _id }, 1);
  };

  const inStock = (stock || 0) > 0;
  const displayPrice = price || 0;
  const measurementText = measurement && unit ? `${measurement} ${unit}` : null;

  return (
    <div className="group relative rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <Link href={`/products/${_id}`} className="block flex-shrink-0">
        <div className="relative overflow-hidden aspect-square w-full bg-gray-100">
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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
          <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-[var(--primary-green)] transition-colors min-h-[2.5rem]">
            {name}
          </h3>
        </Link>

        {/* Price and Measurement */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-bold text-gray-900">৳{displayPrice.toFixed(2)}</p>
              {measurementText && (
                <p className="text-xs text-gray-500">{measurementText}</p>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-base shadow-md ${
              inStock
                ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg active:scale-95"
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

