export interface VariantSnapshot {
  _id: string;
  label?: string;
  price: number;
  stock?: number;
  measurement?: number;
  unit?: string;
  measurementIncrement?: number;
  unitWeightKg?: number;
  status?: string;
  isDefault?: boolean;
}

export interface ProductVariant {
  _id: string;
  label: string;
  price: number;
  stock: number;
  measurement: number;
  unit: string;
  measurementIncrement?: number;
  unitWeightKg?: number;
  status?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
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
  hasVariants?: boolean;
  variants?: ProductVariant[];
  variantId?: string;
  variantSnapshot?: VariantSnapshot;
  stock?: number;
  image?: string;
  images?: string[];
  category?: Category | string;
  isFishProduct?: boolean;
  sizeCategories?: any[];
}

export interface CartItem extends Product {
  quantity: number;
  totalMeasurement?: number;
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
  createdAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  addresses?: Address[];
}

