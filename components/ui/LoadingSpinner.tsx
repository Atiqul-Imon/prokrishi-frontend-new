"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

/**
 * Reusable loading spinner component
 * 
 * @example
 * <LoadingSpinner size="md" text="Loading products..." />
 * <LoadingSpinner fullScreen />
 */
export default function LoadingSpinner({
  size = "md",
  className = "",
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        className={`${sizeClasses[size]} text-emerald-600 animate-spin`}
        strokeWidth={2.5}
      />
      {text && (
        <p className="text-sm text-slate-600 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}



