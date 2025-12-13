"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="p-2 rounded-lg bg-emerald-100">
            <Icon className="text-emerald-600" size={20} strokeWidth={2.5} />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}



