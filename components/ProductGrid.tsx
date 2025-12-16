"use client";

import React from "react";
import { Product } from "@/types/models";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: "sm" | "md" | "lg";
  showBadges?: boolean;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

const defaultColumns = {
  mobile: 2,
  tablet: 3,
  desktop: 4,
  wide: 5,
};

const gapClasses = {
  sm: "gap-3",
  md: "gap-4 md:gap-6",
  lg: "gap-6 md:gap-8",
};

function ProductGrid({
  products,
  columns = defaultColumns,
  gap = "md",
  showBadges = true,
  className = "",
  emptyMessage = "No products found",
  loading = false,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 mt-4">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Map column numbers to Tailwind classes
  const getGridColsClass = (cols: number) => {
    const colMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    };
    return colMap[cols] || "grid-cols-2";
  };

  const gridCols = `${getGridColsClass(columns.mobile || 2)} sm:${getGridColsClass(columns.tablet || 3)} md:${getGridColsClass(columns.desktop || 4)} lg:${getGridColsClass(columns.wide || 5)}`;

  return (
    <div className={`grid ${gridCols} ${gapClasses[gap]} items-stretch ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          showBadges={showBadges}
        />
      ))}
    </div>
  );
}

// OPTIMIZED: Memoize ProductGrid to prevent unnecessary re-renders
// Only re-renders when products array or props actually change
export default React.memo(ProductGrid, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  // Only re-render if products array reference changes or length changes
  // This prevents re-renders when parent re-renders with same products
  return (
    prevProps.products === nextProps.products &&
    prevProps.products.length === nextProps.products.length &&
    prevProps.columns === nextProps.columns &&
    prevProps.gap === nextProps.gap &&
    prevProps.showBadges === nextProps.showBadges &&
    prevProps.className === nextProps.className &&
    prevProps.emptyMessage === nextProps.emptyMessage &&
    prevProps.loading === nextProps.loading
  );
});

