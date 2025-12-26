"use client";

import React from "react";
import { Search, RefreshCw } from "lucide-react";

interface AdminSearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onRefresh?: () => void;
  className?: string;
}

export function AdminSearchBar({
  placeholder = "Search...",
  value,
  onChange,
  onRefresh,
  className = "",
}: AdminSearchBarProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm font-medium"
          >
            <RefreshCw size={16} strokeWidth={2} />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}












