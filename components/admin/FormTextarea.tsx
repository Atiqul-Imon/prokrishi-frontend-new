"use client";

import React from "react";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  showCharCount?: boolean;
  maxLength?: number;
  value?: string;
}

export function FormTextarea({
  label,
  required = false,
  error,
  helperText,
  containerClassName = "",
  className = "",
  showCharCount = false,
  maxLength,
  value = "",
  ...props
}: FormTextareaProps) {
  const charCount = value.length;
  const remainingChars = maxLength ? maxLength - charCount : undefined;

  return (
    <div className={containerClassName}>
      <label className="block text-sm font-semibold text-slate-900 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        {...props}
        value={value}
        maxLength={maxLength}
        className={`w-full px-4 py-3 bg-slate-50 border ${
          error ? "border-red-300" : "border-slate-200"
        } rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
          error ? "focus:ring-red-500/50 focus:border-red-500/50" : "focus:ring-emerald-500/50 focus:border-emerald-500/50"
        } transition-all resize-y ${className}`}
      />
      <div className="flex items-center justify-between mt-1.5">
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-slate-500">{helperText}</p>
        )}
        {showCharCount && maxLength && (
          <p className={`text-xs ml-auto ${
            remainingChars !== undefined && remainingChars < 20 ? "text-amber-600" : "text-slate-500"
          }`}>
            {charCount}/{maxLength} characters
          </p>
        )}
      </div>
    </div>
  );
}







