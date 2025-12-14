"use client";

import React, { type ReactNode } from "react";
import { AdminPageActions } from "./AdminPageActions";
import { AdminSearchBar } from "./AdminSearchBar";
import { ErrorAlert } from "./ErrorAlert";
import { AdminTable } from "./AdminTable";
import type { LucideIcon } from "lucide-react";

interface AdminListPageLayoutProps {
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
  secondaryActions?: ReactNode;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onRefresh?: () => void;
  error?: string | null;
  onErrorDismiss?: () => void;
  loading?: boolean;
  empty?: boolean;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  bulkActions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminListPageLayout({
  title,
  description,
  primaryAction,
  secondaryActions,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  onRefresh,
  error,
  onErrorDismiss,
  loading = false,
  empty = false,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  pagination,
  bulkActions,
  children,
  className = "",
}: AdminListPageLayoutProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <AdminPageActions
        title={title}
        description={description}
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
      />

      <AdminSearchBar
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={onSearchChange}
        onRefresh={onRefresh}
      />

      <ErrorAlert message={error || ""} onDismiss={onErrorDismiss} />

      <AdminTable
        loading={loading}
        empty={empty}
        emptyIcon={emptyIcon}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={emptyAction}
        pagination={pagination}
        bulkActions={bulkActions}
      >
        {children}
      </AdminTable>
    </div>
  );
}






