"use client";

import React from "react";

interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export function FormCheckbox({
  label,
  error,
  helperText,
  containerClassName = "",
  className = "",
  ...props
}: FormCheckboxProps) {
  return (
    <div className={containerClassName}>
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          {...props}
          className={`w-5 h-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all ${
            props.checked ? "bg-emerald-50 border-emerald-500" : "bg-white"
          } ${className}`}
        />
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {label}
          </span>
          {helperText && (
            <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>
          )}
        </div>
      </label>
      {error && (
        <p className="text-xs text-red-600 mt-1.5 ml-8">{error}</p>
      )}
    </div>
  );
}






