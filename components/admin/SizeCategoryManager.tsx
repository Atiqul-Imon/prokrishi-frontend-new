"use client";

import React from "react";
import { Plus, Trash2, Fish } from "lucide-react";
import { FormInput, FormSelect } from "./index";

export interface SizeCategoryForm {
  _id?: string;
  label: string;
  pricePerKg: string;
  stock: string;
  minWeight?: string;
  maxWeight?: string;
  sku?: string;
  measurementIncrement?: string;
  status: "active" | "inactive" | "out_of_stock";
  isDefault: boolean;
}

interface SizeCategoryManagerProps {
  sizeCategories: SizeCategoryForm[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof SizeCategoryForm, value: string | boolean) => void;
  minCategories?: number;
  className?: string;
}

export function SizeCategoryManager({
  sizeCategories,
  onAdd,
  onRemove,
  onUpdate,
  minCategories = 1,
  className = "",
}: SizeCategoryManagerProps) {
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "out_of_stock", label: "Out of Stock" },
  ];

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <Fish className="text-purple-600" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Size Categories <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-slate-500">
              {sizeCategories.length} size categor{sizeCategories.length !== 1 ? "ies" : "y"} added
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md text-sm font-semibold"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Size Category
        </button>
      </div>

      <div className="space-y-4">
        {sizeCategories.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
            <Fish className="mx-auto mb-3 text-slate-400" size={32} strokeWidth={1.5} />
            <p className="text-sm">No size categories added. Click "Add Size Category" to create one.</p>
          </div>
        ) : (
          sizeCategories.map((category, index) => (
            <div
              key={index}
              className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-purple-300 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                    {category.label || `Size ${index + 1}`}
                  </span>
                  {category.isDefault && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="defaultSizeCategory"
                      checked={category.isDefault}
                      onChange={() => onUpdate(index, "isDefault", true)}
                      className="w-4 h-4 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600">Set as Default</span>
                  </label>
                  {sizeCategories.length > minCategories && (
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove size category"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                  label="Label"
                  required
                  type="text"
                  value={category.label}
                  onChange={(e) => onUpdate(index, "label", e.target.value)}
                  placeholder="e.g., Small (0.5-1kg), Medium (1-2kg)"
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Price per Kg (৳)"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={category.pricePerKg}
                  onChange={(e) => onUpdate(index, "pricePerKg", e.target.value)}
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Stock (kg)"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={category.stock}
                  onChange={(e) => onUpdate(index, "stock", e.target.value)}
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Min Weight (kg)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={category.minWeight || ""}
                  onChange={(e) => onUpdate(index, "minWeight", e.target.value || undefined)}
                  placeholder="Optional"
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Max Weight (kg)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={category.maxWeight || ""}
                  onChange={(e) => onUpdate(index, "maxWeight", e.target.value || undefined)}
                  placeholder="Optional"
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="SKU"
                  type="text"
                  value={category.sku || ""}
                  onChange={(e) => onUpdate(index, "sku", e.target.value)}
                  placeholder="Optional"
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Measurement Increment (kg)"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={category.measurementIncrement || "0.25"}
                  onChange={(e) => onUpdate(index, "measurementIncrement", e.target.value)}
                  containerClassName=""
                  className="text-sm"
                />

                <FormSelect
                  label="Status"
                  options={statusOptions}
                  value={category.status}
                  onChange={(e) => onUpdate(index, "status", e.target.value as "active" | "inactive" | "out_of_stock")}
                  containerClassName=""
                  className="text-sm"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

