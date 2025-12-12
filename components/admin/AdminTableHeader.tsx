"use client";

import React, { useRef, useEffect } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  className?: string;
}

interface AdminTableHeaderProps {
  columns: TableColumn[];
  selectable?: boolean;
  selectedCount?: number;
  totalCount?: number;
  onSelectAll?: () => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
}

export function AdminTableHeader({
  columns,
  selectable = false,
  selectedCount = 0,
  totalCount = 0,
  onSelectAll,
  sortBy,
  sortOrder,
  onSort,
}: AdminTableHeaderProps) {
  const allSelected = selectable && selectedCount > 0 && selectedCount === totalCount;
  const someSelected = selectable && selectedCount > 0 && selectedCount < totalCount;

  const handleSort = (column: TableColumn) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  const getSortIcon = (column: TableColumn) => {
    if (!column.sortable || sortBy !== column.key) {
      return <ArrowUpDown size={14} className="text-slate-400" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-emerald-600" />
    ) : (
      <ArrowDown size={14} className="text-emerald-600" />
    );
  };

  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <thead className="bg-slate-50 border-b border-slate-200">
      <tr>
        {selectable && (
          <th className="px-6 py-4 text-left">
            <input
              ref={checkboxRef}
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
              className="w-4 h-4 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
          </th>
        )}
        {columns.map((column) => (
          <th
            key={column.key}
            className={`px-6 py-4 text-${column.align || "left"} text-xs font-bold text-slate-700 uppercase tracking-wider ${column.className || ""}`}
          >
            {column.sortable ? (
              <button
                onClick={() => handleSort(column)}
                className="flex items-center gap-2 hover:text-emerald-600 transition-colors group"
              >
                <span>{column.label}</span>
                {getSortIcon(column)}
              </button>
            ) : (
              column.label
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}

