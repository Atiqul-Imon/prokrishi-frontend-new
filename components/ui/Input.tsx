"use client";

import React from "react";
import { cn } from "@/app/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={cn(
            "w-full px-4 py-3 rounded-xl transition-all duration-200 bg-white border border-gray-200 min-h-[44px]", // Mobile: 44px minimum height for touch
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-white focus-visible:ring-2 focus:border-emerald-500",
            "hover:border-gray-300 hover:shadow-sm",
            "text-base", // Prevent zoom on iOS (16px minimum)
            error
              ? "focus:ring-red-500 focus-visible:ring-red-500 border-red-300"
              : "focus:ring-emerald-500 focus-visible:ring-emerald-500",
            "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200",
            "touch-manipulation", // Better touch performance
            className
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

