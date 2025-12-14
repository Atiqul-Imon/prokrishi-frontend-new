"use client";

import React from "react";
import { Plus, LucideIcon } from "lucide-react";
import Link from "next/link";

interface AdminPageActionsProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  secondaryActions?: React.ReactNode;
  className?: string;
}

export function AdminPageActions({
  title,
  description,
  primaryAction,
  secondaryActions,
  className = "",
}: AdminPageActionsProps) {
  const PrimaryButton = primaryAction?.icon || Plus;
  const buttonContent = (
    <button
      onClick={primaryAction?.onClick}
      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md text-sm font-semibold"
    >
      <PrimaryButton size={16} strokeWidth={2.5} />
      {primaryAction?.label}
    </button>
  );

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{title}</h1>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        {secondaryActions}
        {primaryAction && (
          primaryAction.href ? (
            <Link href={primaryAction.href}>{buttonContent}</Link>
          ) : (
            buttonContent
          )
        )}
      </div>
    </div>
  );
}






