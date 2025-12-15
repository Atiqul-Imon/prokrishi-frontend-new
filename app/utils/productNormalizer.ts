/**
 * Product Normalization Utility
 * 
 * Ensures consistent stock calculation across all pages (homepage, products page, category pages)
 * This prevents "sold out" issues caused by inconsistent normalization logic.
 */

import { Product } from "@/types/models";
import { logger } from "./logger";

/**
 * Normalize product stock calculation
 * 
 * This function ensures consistent stock calculation across all pages:
 * 1. Uses variantSummary.totalStock if available (from backend calculation)
 * 2. Falls back to calculating from variants directly if variantSummary is missing
 * 3. Uses product.stock for products without variants
 * 
 * @param product - Raw product data from API
 * @returns Normalized product with correct stock and hasVariants
 */
export function normalizeProductStock(product: any): Product {
  let calculatedStock = 0;
  
  // Check if product has variants (check both hasVariants flag and actual variants array)
  const hasVariants = product.hasVariants || 
    (product.variants && Array.isArray(product.variants) && product.variants.length > 0);
  
  if (hasVariants && product.variants && product.variants.length > 0) {
    // Use variantSummary if available (from backend calculation)
    // IMPORTANT: Don't check if totalStock > 0, because 0 is a valid stock value (means out of stock)
    if (product.variantSummary?.totalStock !== undefined) {
      calculatedStock = Number(product.variantSummary.totalStock) || 0;
    } else {
      // Fallback: calculate from variants directly (only count active variants)
      calculatedStock = product.variants
        .filter((v: any) => v && (v.status === 'active' || !v.status))
        .reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
    }
  } else {
    // For products without variants, use stock field directly
    calculatedStock = Number(product.stock) || 0;
  }
  
  return {
    ...product,
    stock: calculatedStock,
    hasVariants: hasVariants, // Ensure hasVariants is set correctly
  };
}

/**
 * Normalize multiple products at once
 * 
 * @param products - Array of raw product data from API
 * @returns Array of normalized products
 */
export function normalizeProducts(products: any[]): Product[] {
  if (!products || !Array.isArray(products)) {
    return [];
  }
  
  return products.map((product) => normalizeProductStock(product));
}


