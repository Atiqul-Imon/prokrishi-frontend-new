"use client";

import React, { type ReactNode } from "react";
import { AdminPageHeader } from "./AdminPageHeader";
import { ErrorAlert } from "./ErrorAlert";
import { Button } from "@/components/ui/Button";
import { Save, X } from "lucide-react";
import Link from "next/link";

interface AdminFormPageLayoutProps {
  title: string;
  description?: string;
  backHref: string;
  error?: string | null;
  onErrorDismiss?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  loading?: boolean;
  submitLabel?: string;
  submitIcon?: ReactNode;
  cancelLabel?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "7xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export function AdminFormPageLayout({
  title,
  description,
  backHref,
  error,
  onErrorDismiss,
  onSubmit,
  loading = false,
  submitLabel = "Save",
  submitIcon,
  cancelLabel = "Cancel",
  children,
  actions,
  className = "",
  maxWidth = "7xl",
}: AdminFormPageLayoutProps) {
  const content = (
    <>
      <AdminPageHeader
        title={title}
        description={description}
        backHref={backHref}
      />

      <ErrorAlert message={error || ""} onDismiss={onErrorDismiss} />

      <form onSubmit={onSubmit} className="space-y-6">
        {children}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          {actions || (
            <>
              <Link href={backHref}>
                <Button variant="outline" type="button">
                  <X size={16} />
                  {cancelLabel}
                </Button>
              </Link>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                isLoading={loading}
              >
                {submitIcon || <Save size={16} />}
                {submitLabel}
              </Button>
            </>
          )}
        </div>
      </form>
    </>
  );

  return (
    <div className={`space-y-6 ${maxWidthClasses[maxWidth]} mx-auto ${className}`}>
      {content}
    </div>
  );
}

