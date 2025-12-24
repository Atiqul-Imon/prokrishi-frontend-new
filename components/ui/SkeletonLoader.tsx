"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

/**
 * Base skeleton component for loading states
 */
export function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-slate-200";
  
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

/**
 * Skeleton loader for product cards
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-sm h-full flex flex-col">
      {/* Image skeleton */}
      <Skeleton variant="rectangular" height="100%" className="aspect-square" />
      
      {/* Content skeleton */}
      <div className="p-3 md:p-2.5 lg:p-3 flex flex-col flex-grow gap-2">
        {/* Title skeleton */}
        <Skeleton variant="text" height={20} className="w-3/4" />
        <Skeleton variant="text" height={20} className="w-1/2" />
        
        {/* Price skeleton */}
        <div className="mt-auto">
          <Skeleton variant="text" height={24} width={100} className="mb-2" />
          <Skeleton variant="rectangular" height={40} className="w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for product grid
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for table rows
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton variant="text" height={16} className="w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton loader for table
 */
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <Skeleton variant="text" height={16} width={100} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Skeleton loader for form inputs
 */
export function FormInputSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton variant="text" height={16} width={100} />
      <Skeleton variant="rectangular" height={40} className="w-full rounded-lg" />
    </div>
  );
}

/**
 * Skeleton loader for form section
 */
export function FormSectionSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton variant="text" height={24} width={200} />
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <FormInputSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}











