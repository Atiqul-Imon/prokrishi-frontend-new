"use client";

import React from "react";
import { Plus, Trash2, BarChart3 } from "lucide-react";
import { FormInput, FormSelect } from "./index";

export interface ProductVariant {
  _id?: string;
  label: string;
  sku?: string;
  price: string;
  salePrice?: string;
  stock: string;
  measurement: string;
  unit: string;
  unitWeightKg?: string;
  measurementIncrement?: string;
  priceType?: "PER_UNIT" | "PER_WEIGHT";
  stockType?: "COUNT" | "WEIGHT";
  status: "active" | "inactive" | "out_of_stock";
  isDefault: boolean;
}

interface VariantManagerProps {
  variants: ProductVariant[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof ProductVariant, value: string | boolean) => void;
  className?: string;
}

export function VariantManager({
  variants,
  onAdd,
  onRemove,
  onUpdate,
  className = "",
}: VariantManagerProps) {
  const unitOptions = [
    { value: "pcs", label: "Pieces" },
    { value: "kg", label: "Kilogram" },
    { value: "g", label: "Gram" },
    { value: "l", label: "Liter" },
    { value: "ml", label: "Milliliter" },
  ];

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
            <BarChart3 className="text-purple-600" size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Product Variants</h2>
            <p className="text-xs text-slate-500">
              {variants.length} variant{variants.length !== 1 ? "s" : ""} added
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md text-sm font-semibold"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Variant
        </button>
      </div>

      <div className="space-y-4">
        {variants.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
            <BarChart3 className="mx-auto mb-3 text-slate-400" size={32} strokeWidth={1.5} />
            <p className="text-sm">No variants added. Click "Add Variant" to create one.</p>
          </div>
        ) : (
          variants.map((variant, index) => (
            <div
              key={index}
              className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 hover:border-purple-300 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                    Variant {index + 1}
                  </span>
                  {variant.isDefault && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={variant.isDefault}
                      onChange={() => onUpdate(index, "isDefault", true)}
                      className="w-4 h-4 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600">Set as Default</span>
                  </label>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemove(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove variant"
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
                  value={variant.label}
                  onChange={(e) => onUpdate(index, "label", e.target.value)}
                  placeholder="e.g., Small, 500g"
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="SKU"
                  type="text"
                  value={variant.sku || ""}
                  onChange={(e) => onUpdate(index, "sku", e.target.value)}
                  placeholder="Optional"
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Price (৳)"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.price}
                  onChange={(e) => onUpdate(index, "price", e.target.value)}
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Sale Price (৳)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={variant.salePrice || ""}
                  onChange={(e) => onUpdate(index, "salePrice", e.target.value || "")}
                  placeholder="Optional"
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Stock"
                  required
                  type="number"
                  min="0"
                  value={variant.stock}
                  onChange={(e) => onUpdate(index, "stock", e.target.value)}
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Measurement"
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={variant.measurement}
                  onChange={(e) => onUpdate(index, "measurement", e.target.value)}
                  containerClassName=""
                  className="text-sm"
                />

                <FormSelect
                  label="Unit"
                  required
                  options={unitOptions}
                  value={variant.unit}
                  onChange={(e) => onUpdate(index, "unit", e.target.value)}
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Unit Weight (kg)"
                  type="number"
                  min="0"
                  step="0.001"
                  value={variant.unitWeightKg || ""}
                  onChange={(e) => onUpdate(index, "unitWeightKg", e.target.value || "")}
                  placeholder="Optional"
                  containerClassName=""
                  className="text-sm"
                />

                <FormInput
                  label="Measurement Increment"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={variant.measurementIncrement || "0.01"}
                  onChange={(e) => onUpdate(index, "measurementIncrement", e.target.value)}
                  containerClassName=""
                  className="text-sm"
                />

                <FormSelect
                  label="Price Type"
                  options={[
                    { value: "PER_UNIT", label: "Per Unit" },
                    { value: "PER_WEIGHT", label: "Per Weight" },
                  ]}
                  value={variant.priceType || (variant.unit === "pcs" ? "PER_UNIT" : "PER_WEIGHT")}
                  onChange={(e) => onUpdate(index, "priceType", e.target.value as "PER_UNIT" | "PER_WEIGHT")}
                  containerClassName=""
                  className="text-sm"
                />

                <FormSelect
                  label="Stock Type"
                  options={[
                    { value: "COUNT", label: "Count" },
                    { value: "WEIGHT", label: "Weight" },
                  ]}
                  value={variant.stockType || (variant.unit === "pcs" ? "COUNT" : "WEIGHT")}
                  onChange={(e) => onUpdate(index, "stockType", e.target.value as "COUNT" | "WEIGHT")}
                  containerClassName=""
                  className="text-sm"
                />

                <FormSelect
                  label="Status"
                  options={statusOptions}
                  value={variant.status}
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

