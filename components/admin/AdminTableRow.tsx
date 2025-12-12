"use client";

import React, { type ReactNode } from "react";

interface AdminTableRowProps {
  children: ReactNode;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick?: () => void;
  className?: string;
  hoverClassName?: string;
}

export function AdminTableRow({
  children,
  selectable = false,
  selected = false,
  onSelect,
  onClick,
  className = "",
  hoverClassName = "hover:bg-emerald-50/50",
}: AdminTableRowProps) {
  return (
    <tr
      className={`${selected ? "bg-emerald-50" : ""} ${hoverClassName} transition-all duration-200 ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {selectable && (
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect?.(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          />
        </td>
      )}
      {children}
    </tr>
  );
}

