export interface ApiResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginResponse extends ApiResponse {
  accessToken?: string;
  refreshToken?: string;
  user: any;
}

export interface RegisterRequest {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterResponse extends ApiResponse {
  accessToken?: string;
  refreshToken?: string;
  user: any;
}

export interface UserProfileResponse extends ApiResponse {
  user: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  q?: string; // Query/search term (alternative to search)
  category?: string;
  sort?: string;
  sortBy?: string; // Alternative to sort
  order?: "asc" | "desc";
  sortOrder?: "asc" | "desc"; // Alternative to order
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

export interface ProductsResponse extends ApiResponse {
  products: any[];
  total?: number;
  currentPage?: number;
  totalPages?: number;
}

export interface ProductResponse extends ApiResponse {
  product: any;
}

export interface CategoryResponse extends ApiResponse {
  category: any;
}

export interface OrderResponse extends ApiResponse {
  order: any;
}

export interface DashboardStatsResponse extends ApiResponse {
  stats: any;
}

export interface PaymentInitResponse extends ApiResponse {
  paymentUrl?: string;
}

export interface ShippingQuoteRequest {
  orderItems: Array<{
    product: string;
    quantity: number;
    variantId?: string;
  }>;
  shippingAddress: {
    name?: string;
    phone?: string;
    address: string;
    division?: string;
    district?: string;
    upazila?: string;
  };
  shippingZone: "inside_dhaka" | "outside_dhaka";
}

export interface ShippingQuoteResponse {
  shippingFee: number;
  totalWeightKg: number;
  zone: string;
  breakdown?: any;
}

