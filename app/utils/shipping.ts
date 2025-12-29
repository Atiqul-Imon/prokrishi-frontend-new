/**
 * Shipping calculation utility
 * Matches backend logic in backend-nestjs/src/orders/services/shipping.service.ts
 */

export type ShippingZone = 'inside_dhaka' | 'outside_dhaka';

export interface ShippingCalculationResult {
  zone: ShippingZone;
  totalWeightKg: number;
  shippingFee: number;
  breakdown: {
    type: 'fish' | 'other';
    tier: 'flat' | 'under_threshold' | 'over_threshold';
    fishFee?: number;
    otherFee?: number;
    otherWeightKg?: number;
  };
}

// Shipping rules matching backend
const SHIPPING_RULES = {
  weightThresholdKg: 3,
  fish: {
    inside_dhaka: 100,
    outside_dhaka: 150, // Not used - fish only inside Dhaka
  },
  other: {
    inside_dhaka: {
      upToKgFee: 80,
      perKgFee: 20,
    },
    outside_dhaka: {
      upToKgFee: 150,
      perKgFee: 30,
    },
  },
};

/**
 * Convert measurement to kg
 */
function measurementToKg(measurement?: number, unit?: string): number {
  if (!measurement || measurement <= 0) {
    return 0;
  }

  const normalizedUnit = (unit || '').toLowerCase();
  switch (normalizedUnit) {
    case 'kg':
      return measurement;
    case 'g':
      return measurement / 1000;
    default:
      return 0;
  }
}

/**
 * Calculate item weight in kg
 */
function calculateItemWeightKg(
  product: {
    measurement?: number;
    unit?: string;
    unitWeightKg?: number;
    variantSnapshot?: {
      measurement?: number;
      unit?: string;
      unitWeightKg?: number;
    };
  },
  quantity: number
): number {
  if (quantity <= 0) return 0;

  // Try variant first, then product
  const measurementKg =
    measurementToKg(product.variantSnapshot?.measurement, product.variantSnapshot?.unit) ||
    measurementToKg(product.measurement, product.unit);

  if (measurementKg > 0) {
    return measurementKg * quantity;
  }

  const unitWeight =
    product.variantSnapshot?.unitWeightKg ?? product.unitWeightKg ?? 0;

  if (unitWeight > 0) {
    return unitWeight * quantity;
  }

  // Default weight estimates
  const defaultWeightPerUnit: Record<string, number> = {
    pcs: 0.1, // 100g per piece
    kg: 1,
    g: 0.001,
    l: 1, // 1kg per liter
    ml: 0.001,
  };

  const unit = (product.variantSnapshot?.unit || product.unit || 'pcs').toLowerCase();
  const weightPerUnit = defaultWeightPerUnit[unit] || 0.1;

  return weightPerUnit * quantity;
}

/**
 * Calculate shipping for fish products (flat fee)
 */
function calculateFishShipping(zone: ShippingZone): number {
  return SHIPPING_RULES.fish[zone];
}

/**
 * Calculate shipping for other products (weight-based)
 */
function calculateOtherProductShipping(
  zone: ShippingZone,
  totalWeightKg: number
): number {
  const rules = SHIPPING_RULES.other[zone];
  let shippingFee = 0;

  if (totalWeightKg <= SHIPPING_RULES.weightThresholdKg) {
    shippingFee = rules.upToKgFee;
  } else {
    const excessWeight = totalWeightKg - SHIPPING_RULES.weightThresholdKg;
    shippingFee = rules.upToKgFee + excessWeight * rules.perKgFee;
  }

  return Math.round(shippingFee);
}

// Type for cart items used in shipping calculation
type ShippingCartItem = {
  measurement?: number;
  unit?: string;
  unitWeightKg?: number;
  variantSnapshot?: {
    measurement?: number;
    unit?: string;
    unitWeightKg?: number;
  };
  quantity: number;
  [key: string]: unknown; // Allow additional properties from CartItem
};

/**
 * Calculate total shipping for cart items
 */
export function calculateShipping(
  zone: ShippingZone,
  regularCartItems: ShippingCartItem[],
  hasFishProducts: boolean
): ShippingCalculationResult {
  // Calculate weight for regular products
  let totalWeightKg = 0;
  for (const item of regularCartItems) {
    totalWeightKg += calculateItemWeightKg(item, item.quantity);
  }

  let shippingFee = 0;
  let fishFee = 0;
  let otherFee = 0;

  // Calculate fish shipping (if any)
  if (hasFishProducts) {
    fishFee = calculateFishShipping(zone);
    shippingFee += fishFee;
  }

  // Calculate other products shipping (if any)
  if (regularCartItems.length > 0) {
    otherFee = calculateOtherProductShipping(zone, totalWeightKg);
    shippingFee += otherFee;
  }

  // Determine breakdown tier
  const breakdown: ShippingCalculationResult['breakdown'] = {
    type: hasFishProducts && regularCartItems.length > 0 ? 'other' : hasFishProducts ? 'fish' : 'other',
    tier:
      totalWeightKg <= SHIPPING_RULES.weightThresholdKg
        ? 'under_threshold'
        : 'over_threshold',
  };

  if (hasFishProducts) {
    breakdown.fishFee = fishFee;
  }
  if (regularCartItems.length > 0) {
    breakdown.otherFee = otherFee;
    breakdown.otherWeightKg = totalWeightKg;
  }

  return {
    zone,
    totalWeightKg,
    shippingFee,
    breakdown,
  };
}

/**
 * Get display shipping rates for UI
 */
export function getShippingRates(zone: ShippingZone): {
  fish: number;
  otherBase: number;
  otherPerKg: number;
  weightThreshold: number;
} {
  return {
    fish: SHIPPING_RULES.fish[zone],
    otherBase: SHIPPING_RULES.other[zone].upToKgFee,
    otherPerKg: SHIPPING_RULES.other[zone].perKgFee,
    weightThreshold: SHIPPING_RULES.weightThresholdKg,
  };
}

