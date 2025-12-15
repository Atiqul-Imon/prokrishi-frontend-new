export interface VariantSnapshot {
  _id: string;
  label?: string;
  price: number;
  stock?: number;
  measurement?: number;
  unit?: string;
  measurementIncrement?: number;
  unitWeightKg?: number;
  priceType?: "PER_UNIT" | "PER_WEIGHT";
  stockType?: "COUNT" | "WEIGHT";
  status?: string;
  isDefault?: boolean;
}

export interface ProductVariant {
  _id: string;
  label: string;
  price: number;
  salePrice?: number;
  stock: number;
  measurement: number;
  unit: string;
  measurementIncrement?: number;
  unitWeightKg?: number;
  priceType?: "PER_UNIT" | "PER_WEIGHT";
  stockType?: "COUNT" | "WEIGHT";
  status?: string;
  sku?: string;
  isDefault?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface SizeCategory {
  _id: string;
  label: string;
  pricePerKg: number;
  stock?: number;
  status?: string;
  isDefault?: boolean;
  measurementIncrement?: number;
  minWeight?: number;
  maxWeight?: number;
  sku?: string;
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  price: number;
  unit?: string;
  measurement?: number;
  measurementIncrement?: number;
  unitWeightKg?: number;
  priceType?: "PER_UNIT" | "PER_WEIGHT";
  stockType?: "COUNT" | "WEIGHT";
  hasVariants?: boolean;
  variants?: ProductVariant[];
  variantId?: string;
  variantSnapshot?: VariantSnapshot;
  stock?: number;
  image?: string;
  images?: string[];
  category?: Category | string;
  isFishProduct?: boolean;
  sizeCategories?: SizeCategory[];
  status?: string;
  sku?: string;
  isFeatured?: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface FishProduct extends Omit<Product, 'price' | 'stock' | 'variants' | 'hasVariants'> {
  sizeCategories: SizeCategory[];
  status?: 'active' | 'inactive';
  isFeatured?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  totalMeasurement?: number;
  // Note: CartItem should NOT include fish products - they use FishCartItem instead
}

export interface FishCartItem {
  _id?: string;
  fishProduct: FishProduct | string;
  sizeCategoryId: string;
  sizeCategoryLabel: string;
  quantity?: number;
  pricePerKg: number;
}

export interface FishCart {
  _id?: string;
  user: string;
  items: FishCartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  _id?: string;
  name?: string;
  phone?: string;
  division?: string;
  district?: string;
  upazila?: string;
  postalCode?: string;
  address: string;
  addressType?: string;
}

export interface Order {
  _id: string;
  invoiceNumber?: string;
  orderItems: Array<{
    product: string;
    name: string;
    quantity: number;
    price: number;
    variantId?: string;
  }>;
  totalPrice: number;
  totalAmount?: number;
  shippingFee?: number;
  shippingZone?: string;
  paymentMethod?: string;
  status?: string;
  paymentStatus?: string;
  transactionId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
    division?: string;
    district?: string;
    upazila?: string;
  };
  guestInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  addresses?: Address[];
  createdAt?: string;
  updatedAt?: string;
}

