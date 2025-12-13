"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  backHref,
  actions,
  className = "",
}: AdminPageHeaderProps) {
  return (
    <div className={`flex items-center gap-4 mb-6 ${className}`}>
      {backHref && (
        <Link href={backHref}>
          <button className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
        </Link>
      )}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{title}</h1>
        {description && (
          <p className="text-sm text-slate-600">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}



