"use client";

import React from "react";
import { X, Check } from "lucide-react";

interface SortOption {
  value: string;
  label: string;
}

interface SortBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  options: SortOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  title?: string;
}

export default function SortBottomSheet({
  isOpen,
  onClose,
  options,
  selectedValue,
  onSelect,
  title = "Sort By",
}: SortBottomSheetProps) {
  if (!isOpen) return null;

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl md:hidden animate-in slide-in-from-bottom duration-300 max-h-[70vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation active:scale-95"
            aria-label="Close sort options"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="flex-1 overflow-y-auto">
          {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full flex items-center justify-between px-4 py-4 min-h-[44px] text-left transition-colors touch-manipulation active:bg-gray-50 ${
                  isSelected
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className="font-medium">{option.label}</span>
                {isSelected && (
                  <Check className="w-5 h-5 text-emerald-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

