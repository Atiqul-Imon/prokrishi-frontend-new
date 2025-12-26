"use client";

import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export function FormInput({
  label,
  required = false,
  error,
  helperText,
  containerClassName = "",
  className = "",
  ...props
}: FormInputProps) {
  return (
    <div className={containerClassName}>
      <label className="block text-sm font-semibold text-slate-900 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className={`w-full px-4 py-3 bg-slate-50 border ${
          error ? "border-red-300" : "border-slate-200"
        } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-500/50 focus:border-red-500/50" : "focus:ring-emerald-500/50 focus:border-emerald-500/50"
        } transition-all ${className}`}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1.5">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-slate-500 mt-1.5">{helperText}</p>
      )}
    </div>
  );
}













