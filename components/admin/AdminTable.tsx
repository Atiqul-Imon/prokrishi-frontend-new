"use client";

import React, { type ReactNode } from "react";
import { AdminPagination } from "./AdminPagination";

interface AdminTableProps {
  children: ReactNode;
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
  className?: string;
}

export function AdminTable({
  children,
  loading = false,
  empty = false,
  emptyIcon,
  emptyTitle = "No items found",
  emptyDescription,
  emptyAction,
  pagination,
  bulkActions,
  className = "",
}: AdminTableProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ${className}`}>
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 mt-3">Loading...</p>
        </div>
      ) : empty ? (
        <div className="p-12 text-center">
          {emptyIcon}
          <p className="text-sm text-slate-500 mb-4 mt-4">{emptyTitle}</p>
          {emptyDescription && (
            <p className="text-xs text-slate-400 mb-4">{emptyDescription}</p>
          )}
          {emptyAction}
        </div>
      ) : (
        <>
          {bulkActions && (
            <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
              {bulkActions}
            </div>
          )}
          <div className="overflow-x-auto">
            {children}
          </div>
          {pagination && (
            <AdminPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={pagination.onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
}

