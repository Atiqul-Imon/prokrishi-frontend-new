// app/utils/api.ts
// Centralized API utility for Prokrishi frontend (Next.js) using axios and localStorage-based JWT

import axios from "axios";
import { getApiBaseUrl } from "./env";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ApiResponse,
  UserProfileResponse,
  ProductsResponse,
  ProductResponse,
  CategoryResponse,
  OrderResponse,
  DashboardStatsResponse,
  PaymentInitResponse,
  PaginationParams,
  ShippingQuoteRequest,
  ShippingQuoteResponse,
} from "@/types/api";
import { Address, Product, Category, Order } from "@/types/models";

const BASE_URL = getApiBaseUrl();

const isFileLike = (value: any): value is File | Blob => {
  if (typeof File !== "undefined" && value instanceof File) {
    return true;
  }
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return true;
  }
  return false;
};

const appendFormDataValue = (formData: FormData, key: string, value: any) => {
  if (isFileLike(value)) {
    formData.append(key, value);
    return;
  }

  if (Array.isArray(value)) {
    const containsFile = value.some((item) => isFileLike(item));
    if (containsFile) {
      value.forEach((item) => {
        if (isFileLike(item)) {
          formData.append(key, item);
        } else if (
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean"
        ) {
          formData.append(key, String(item));
        } else {
          formData.append(key, JSON.stringify(item));
        }
      });
    } else {
      formData.append(key, JSON.stringify(value));
    }
    return;
  }

  if (typeof value === "object") {
    formData.append(key, JSON.stringify(value));
    return;
  }

  formData.append(key, value);
};

// Create an axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000, // 20 second timeout for better reliability
});

// Request interceptor: Attach JWT (if any) from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Handle 401/403, auto-logout (optional), extract tokens, etc.
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        // Optionally redirect to login page
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Universal axios wrapper for API requests.
 */
export async function apiRequest<T = any>(
  path: string,
  options: any = {}
): Promise<T> {
  try {
    const res = await api({
      url: path,
      ...options,
    });
    return res.data as T;
  } catch (err: any) {
    let msg = err.response?.data?.message || err.message || "API Error";
    
    // Handle timeout errors specifically
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      msg = "Request timeout - please try again";
    }
    
    // Handle network errors
    if (err.code === 'ERR_NETWORK' || !err.response) {
      msg = "Network error - please check your connection";
    }
    
    // Handle 404 errors specifically
    if (err.response?.status === 404) {
      msg = "Product not found - it may have been deleted";
    }
    
    const apiError = new Error(msg) as Error & { status?: number };
    if (err.response?.status) {
      apiError.status = err.response.status;
    }
    throw apiError;
  }
}

/**
 * Register a new user.
 */
export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiRequest<RegisterResponse>("/user/register", {
    method: "POST",
    data,
  });
  if (response.accessToken) {
    localStorage.setItem("accessToken", response.accessToken);
  }
  if (response.refreshToken) {
    localStorage.setItem("refreshToken", response.refreshToken);
  }
  return response;
}

/**
 * Login user.
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiRequest<LoginResponse>("/user/login", {
    method: "POST",
    data,
  });
  if (response.accessToken) {
    localStorage.setItem("accessToken", response.accessToken);
  }
  if (response.refreshToken) {
    localStorage.setItem("refreshToken", response.refreshToken);
  }
  return response;
}

/**
 * Logout user.
 */
export function logoutUser(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

/**
 * Fetch current user profile (requires valid JWT).
 */
export function fetchProfile(): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>("/user/profile", {
    method: "GET",
  });
}

export async function updateUserAddresses(addresses: Address[]): Promise<UserProfileResponse> {
  console.log("API: updateUserAddresses called with:", addresses);
  try {
    const result = await apiRequest<UserProfileResponse>("/user/profile", {
      method: "PUT",
      data: { addresses },
    });
    console.log("API: updateUserAddresses successful response:", result);
    return result;
  } catch (error) {
    console.error("API: updateUserAddresses error:", error);
    throw error;
  }
}

export async function placeOrder(orderData: any): Promise<OrderResponse> {
  return apiRequest<OrderResponse>("/order", {
    method: "POST",
    data: orderData,
    headers: orderData?.idempotencyKey
      ? { "Idempotency-Key": orderData.idempotencyKey as string }
      : undefined,
  });
}

// Note: Shipping quote endpoint not yet migrated - using cart validate for now
export function getShippingQuote(data: ShippingQuoteRequest): Promise<ShippingQuoteResponse> {
  // TODO: Implement shipping quote endpoint in NestJS
  return apiRequest<ShippingQuoteResponse>("/order/shipping-quote", {
    method: "POST",
    data,
  });
}

export async function validateCartApi(payload: {
  orderItems: Array<{
    product: string;
    quantity: number;
    variantId?: string;
    name?: string;
    price?: number;
  }>;
}): Promise<any> {
  // NestJS uses /cart/validate instead of /order/validate
  return apiRequest<any>("/cart/validate", {
    method: "POST",
    data: payload,
  });
}

// ========== INVOICE FUNCTIONS ==========

/**
 * Get invoice PDF (returns blob URL)
 * @param orderId - Order ID
 * @param type - 'regular' or 'fish'
 */
export async function getInvoicePDF(orderId: string, type: 'regular' | 'fish' = 'regular'): Promise<string> {
  const response = await api.get(`/invoice/${orderId}?type=${type}`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

/**
 * Download invoice PDF
 * @param orderId - Order ID
 * @param type - 'regular' or 'fish'
 */
export async function downloadInvoice(orderId: string, type: 'regular' | 'fish' = 'regular'): Promise<void> {
  try {
    const response = await api.get(`/invoice/${orderId}/download?type=${type}`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${orderId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to download invoice');
  }
}

/**
 * Get invoice HTML (for preview)
 * @param orderId - Order ID
 * @param type - 'regular' or 'fish'
 */
export async function getInvoiceHTML(orderId: string, type: 'regular' | 'fish' = 'regular'): Promise<string> {
  const response = await apiRequest<string>(`/invoice/${orderId}/html?type=${type}`, {
    method: "GET",
  });
  return response;
}

// Generic GET list
export function getResourceList<T = any>(resource: string, query = ""): Promise<T> {
  const path = `/${resource}${query ? `?${query}` : ""}`;
  return apiRequest<T>(path, { method: "GET" });
}

// Generic POST (for JSON data)
export function createResource<T = any>(resource: string, payload: any): Promise<T> {
  return apiRequest<T>(`/${resource}`, {
    method: "POST",
    data: payload,
  });
}

// Generic PUT (for JSON data)
export function updateResource<T = any>(resource: string, id: string, payload: any): Promise<T> {
  return apiRequest<T>(`/${resource}/${id}`, {
    method: "PUT",
    data: payload,
  });
}

// Generic DELETE
export function deleteResource<T = any>(resource: string, id: string): Promise<T> {
  return apiRequest<T>(`/${resource}/${id}`, {
    method: "DELETE",
  });
}

export function getUserById(id: string): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>(`/user/${id}`);
}

export async function getProductById(id: string): Promise<ProductResponse> {
  // Add cache busting parameter to ensure fresh data
  const timestamp = Date.now();
  const response = await apiRequest<any>(`/product/${id}?t=${timestamp}`);
  // NestJS returns { success: true, message, product: {...} }
  // Return in format expected by frontend: { product: {...} }
  return {
    success: response.success || true,
    product: response.product || response.data?.product || null,
  };
}

/**
 * Get related products for a product
 */
export async function getRelatedProducts(productId: string, limit: number = 6): Promise<{ success: boolean; products: Product[] }> {
  return apiRequest<{ success: boolean; products: Product[] }>(`/product/${productId}/related?limit=${limit}`);
}

export async function getCategoryById(id: string): Promise<CategoryResponse> {
  // NestJS uses GET /category/:id instead of /category/id/:id
  const response = await apiRequest<any>(`/category/${id}`);
  // NestJS returns { success: true, message, category: {...} }
  // Return in format expected by frontend: { category: {...} }
  return {
    success: response.success || true,
    category: response.category || response.data?.category || null,
  };
}

export async function getAllCategories(): Promise<any> {
  const response = await apiRequest<any>("/category");
  // NestJS returns { success: true, data: { message, categories } }
  // Return in format expected by frontend: { categories: [...] }
  return {
    success: response.success || true,
    categories: response.data?.categories || response.categories || [],
  };
}

// ========== PRODUCT-SPECIFIC (for file/image upload) ==========

/**
 * Create product (with file/image upload).
 */
export async function createProduct(productData: any): Promise<ProductResponse> {
  // If productData is already a FormData object, use it directly
  let formData: FormData;
  if (productData instanceof FormData) {
    formData = productData;
  } else {
    // Otherwise, convert the object to FormData
    formData = new FormData();
    for (const key in productData) {
      const value = productData[key];

      if (value === null || value === undefined || value === "") {
        continue;
      }

      appendFormDataValue(formData, key, value);
    }
  }

  try {
    // NestJS uses POST /product instead of /product/create
    const res = await api.post<ProductResponse>("/product", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err: any) {
    const msg =
      err.response?.data?.message || err.message || "Failed to create product";
    throw new Error(msg);
  }
}

/**
 * Update product (with file/image upload).
 */
export async function updateProduct(id: string, productData: any): Promise<ProductResponse> {
  // If productData is already a FormData object, use it directly
  let formData: FormData;
  if (productData instanceof FormData) {
    formData = productData;
  } else {
    // Otherwise, convert the object to FormData
    formData = new FormData();
    // Only append fields that have values (optimize payload)
    for (const key in productData) {
      const value = productData[key];
      
      // Skip image if it's not a File object
      if (key === "image" && !isFileLike(value)) {
        continue;
      }
      
      // Skip null, undefined, and empty strings
      if (value === null || value === undefined || value === '') {
        continue;
      }

      appendFormDataValue(formData, key, value);
    }
  }

  try {
    const res = await api.put<ProductResponse>(`/product/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err: any) {
    const msg =
      err.response?.data?.message || err.message || "Failed to update product";
    throw new Error(msg);
  }
}

/**
 * Get all products with pagination.
 */
// Public endpoint - includes fish products
export async function getAllProducts(params?: { page?: number; limit?: number; search?: string; category?: string; sort?: string; order?: 'asc' | 'desc' }): Promise<ProductsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add cache busting parameter
    queryParams.append('t', Date.now().toString());
    
    // Add pagination and filter parameters
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    
    const res = await api.get<ProductsResponse>(`/product?${queryParams.toString()}`);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to get products",
    );
  }
}

// Admin endpoint - excludes fish products (fish products managed separately)
export async function getAdminProducts(params?: { page?: number; limit?: number; search?: string; category?: string; sort?: string; order?: 'asc' | 'desc' }): Promise<ProductsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Add cache busting parameter
    queryParams.append('t', Date.now().toString());
    
    // Add pagination and filter parameters
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    
    const res = await api.get<ProductsResponse>(`/product/admin?${queryParams.toString()}`);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to get products",
    );
  }
}

/**
 * Search products with filters and pagination.
 */
export async function searchProducts(params: PaginationParams = {}): Promise<ProductsResponse> {
  try {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach((key) => {
      const value = params[key as keyof PaginationParams];
      if (value !== undefined && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const res = await api.get<ProductsResponse>(`/product/search?${queryParams.toString()}`);
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to search products",
    );
  }
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(id: string): Promise<ApiResponse> {
  return deleteResource<ApiResponse>("product", id);
}

/**
 * Toggle featured status of a product.
 */
export async function toggleProductFeatured(productId: string): Promise<ApiResponse> {
  return apiRequest<ApiResponse>(`/product/${productId}/toggle-featured`, {
    method: "PATCH",
  });
}

// ========== CATEGORY-SPECIFIC (for file/image upload) ==========

export async function createCategory(category: any): Promise<CategoryResponse> {
  const formData = new FormData();
  formData.append("name", category.name);
  if (category.description) {
    formData.append("description", category.description);
  }
  if (category.image && category.image instanceof File) {
    formData.append("image", category.image);
  }

  try {
    // NestJS uses POST /category instead of /category/create
    const res = await api.post<CategoryResponse>("/category", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err: any) {
    const msg =
      err.response?.data?.message || err.message || "Failed to create category";
    throw new Error(msg);
  }
}

export async function updateCategory(id: string, category: any): Promise<CategoryResponse> {
  // Check if we're doing a simple update (no file upload)
  const hasFile = category.image && category.image instanceof File;
  const hasOnlySimpleFields = !hasFile && Object.keys(category).every(key => 
    typeof category[key] !== 'object' || category[key] === null
  );

  if (hasOnlySimpleFields) {
    // Use JSON for simple updates (like featured toggle) - use PUT
    try {
      // NestJS uses PUT /category/:id instead of /category/update/:id
      const res = await api.put<CategoryResponse>(`/category/${id}`, category, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Failed to update category";
      throw new Error(msg);
    }
  } else {
    // Use FormData for updates with file uploads
    const formData = new FormData();

    Object.keys(category).forEach((key) => {
      if (key !== "image") {
        formData.append(key, category[key]);
      }
    });

    if (category.image && category.image instanceof File) {
      formData.append("image", category.image);
    }

    try {
      // NestJS uses PUT /category/:id instead of /category/update/:id
      const res = await api.put<CategoryResponse>(`/category/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Failed to update category";
      throw new Error(msg);
    }
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse> {
  // NestJS uses DELETE /category/:id instead of /category/delete/:id
  return deleteResource<ApiResponse>("category", id);
}

export async function getFeaturedCategories(): Promise<any> {
  // NestJS uses GET /category?featured=true instead of /category/featured
  const timestamp = Date.now();
  const response = await apiRequest(`/category?featured=true&t=${timestamp}`);
  // NestJS returns { success: true, data: { message, categories } }
  // Return in format expected by frontend: { categories: [...] }
  return {
    categories: response.data?.categories || response.categories || [],
  };
}

// Address Management
export async function addAddress(addressData: Address): Promise<UserProfileResponse> {
  // NestJS uses POST /user/address instead of /user/profile/addresses
  return apiRequest<UserProfileResponse>("/user/address", {
    method: "POST",
    data: addressData,
  });
}

// ========== ADMIN ORDER MANAGEMENT ==========

export interface AdminOrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminOrderStats {
  totalOrders: number;
  totalRevenue: number;
  periodRevenue: number;
  statusBreakdown: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentOrders: any[];
  dailySales: any[];
}

export interface AdminOrderResponse {
  success: boolean;
  orders: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface AdminOrderStatsResponse {
  success: boolean;
  stats: AdminOrderStats;
}

/**
 * Get all orders with pagination and filtering (Admin)
 */
export async function getAdminOrders(filters: AdminOrderFilters = {}): Promise<AdminOrderResponse> {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = `/admin/orders${queryString ? `?${queryString}` : ''}`;
  
  return apiRequest<AdminOrderResponse>(url);
}

/**
 * Get order statistics (Admin)
 */
export async function getAdminOrderStats(period: number = 30): Promise<AdminOrderStatsResponse> {
  return apiRequest<AdminOrderStatsResponse>(`/admin/orders/stats?period=${period}`);
}

/**
 * Get single order details (Admin)
 */
export async function getAdminOrderById(id: string): Promise<{ success: boolean; order: any }> {
  return apiRequest<{ success: boolean; order: any }>(`/admin/orders/${id}`);
}

/**
 * Update order status (Admin)
 */
export async function updateAdminOrderStatus(id: string, status: string, notes?: string): Promise<ApiResponse> {
  return apiRequest<ApiResponse>(`/admin/orders/${id}/status`, {
    method: "PUT",
    data: { status, notes },
  });
}

/**
 * Update payment status (Admin)
 */
export async function updateAdminPaymentStatus(id: string, paymentStatus: string, transactionId?: string, notes?: string): Promise<ApiResponse> {
  return apiRequest<ApiResponse>(`/admin/orders/${id}/payment`, {
    method: "PUT",
    data: { paymentStatus, transactionId, notes },
  });
}

/**
 * Delete order (Admin)
 */
export async function deleteAdminOrder(id: string): Promise<ApiResponse> {
  return apiRequest<ApiResponse>(`/admin/orders/${id}`, {
    method: "DELETE",
  });
}

export async function updateAddress(addressId: string, addressData: Address): Promise<UserProfileResponse> {
  // NestJS uses PUT /user/address/:addressId instead of /user/profile/addresses/:addressId
  return apiRequest<UserProfileResponse>(`/user/address/${addressId}`, {
    method: "PUT",
    data: addressData,
  });
}

export async function deleteAddress(addressId: string): Promise<UserProfileResponse> {
  // NestJS uses DELETE /user/address/:addressId instead of /user/profile/addresses/:addressId
  return apiRequest<UserProfileResponse>(`/user/address/${addressId}`, {
    method: "DELETE",
  });
}

// ========== PAYMENT FUNCTIONS ==========

export async function createPaymentSession(data: { orderId: string; paymentMethod: string }): Promise<PaymentInitResponse> {
  // NestJS uses POST /payment/session or POST /payment/cod/process for COD
  // For COD, use the cod/process endpoint
  if (data.paymentMethod === 'Cash on Delivery' || data.paymentMethod === 'COD') {
    return apiRequest<PaymentInitResponse>("/payment/cod/process", {
      method: "POST",
      data: { orderId: data.orderId },
    });
  }
  // Fallback to session endpoint for backward compatibility
  return apiRequest<PaymentInitResponse>("/payment/session", {
    method: "POST",
    data,
  });
}

export async function getPaymentStatus(orderId: string): Promise<ApiResponse> {
  return apiRequest<ApiResponse>(`/payment/status/${orderId}`, {
    method: "GET",
  });
}

export async function handlePaymentSuccess(paymentData: any): Promise<ApiResponse> {
  // For COD, use PUT /payment/cod/confirm instead of POST /payment/success
  if (paymentData.paymentMethod === 'Cash on Delivery' || paymentData.paymentMethod === 'COD') {
    return apiRequest<ApiResponse>("/payment/cod/confirm", {
      method: "PUT",
      data: {
        orderId: paymentData.orderId,
        transactionId: paymentData.transactionId,
      },
    });
  }
  // Fallback to success endpoint for backward compatibility
  return apiRequest<ApiResponse>("/payment/success", {
    method: "POST",
    data: paymentData,
  });
}

export async function handlePaymentFail(paymentData: any): Promise<ApiResponse> {
  return apiRequest<ApiResponse>("/payment/fail", {
    method: "POST",
    data: paymentData,
  });
}

export async function handlePaymentCancel(paymentData: any): Promise<ApiResponse> {
  return apiRequest<ApiResponse>("/payment/cancel", {
    method: "POST",
    data: paymentData,
  });
}

// ========== MOCK PAYMENT FUNCTIONS (for testing) ==========

export async function mockPaymentSuccess(data: { tran_id: string; orderId: string }): Promise<ApiResponse> {
  return apiRequest<ApiResponse>("/payment/mock/success", {
    method: "POST",
    data,
  });
}

export async function mockPaymentFail(data: { tran_id: string; orderId: string; error: string }): Promise<ApiResponse> {
  return apiRequest<ApiResponse>("/payment/mock/fail", {
    method: "POST",
    data,
  });
}

export async function getOrderDetails(orderId: string): Promise<OrderResponse> {
  return apiRequest<OrderResponse>(`/order/${orderId}`);
}

// Get user orders
export async function getUserOrders(): Promise<{ success: boolean; orders: any[] }> {
  // NestJS uses GET /order instead of /order/user (user context from JWT)
  return apiRequest<{ success: boolean; orders: any[] }>("/order");
}

// Get fish orders for user
export async function getUserFishOrders(): Promise<{ success: boolean; orders: any[] }> {
  return apiRequest<{ success: boolean; orders: any[] }>("/fish/orders/user");
}

// Get featured products
export async function getFeaturedProducts(): Promise<ProductsResponse> {
  const timestamp = Date.now();
  const response = await apiRequest<any>(`/product/featured?t=${timestamp}`);
  // NestJS returns { success: true, data: { message, products } }
  // Return in format expected by frontend: { products: [...] }
  return {
    success: response.success || true,
    products: response.data?.products || response.products || [],
    pagination: response.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalProducts: response.data?.products?.length || 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: response.data?.products?.length || 0,
    },
  };
}

// ================== PASSWORD RESET ==================

export function requestPasswordReset(identifier: string): Promise<ApiResponse> {
  return apiRequest<ApiResponse>("/user/forgot-password", {
    method: "POST",
    data: { identifier },
  });
}

export function resetPasswordWithToken(token: string, password: string): Promise<ApiResponse> {
  // NestJS uses PUT instead of POST for password reset
  return apiRequest<ApiResponse>(`/user/reset-password-email/${token}`, {
    method: "PUT",
    data: { password },
  });
}

export function resetPasswordWithOTP(phone: string, otp: string, password: string): Promise<ApiResponse> {
  // NestJS uses PUT instead of POST for password reset
  return apiRequest<ApiResponse>("/user/reset-password-phone", {
    method: "PUT",
    data: { phone, otp, password },
  });
}

// ====================================================

/**
 * Get dashboard statistics.
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  try {
    const res = await api.get<DashboardStatsResponse>("/dashboard/stats");
    return res.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || err.message || "Failed to get dashboard statistics",
    );
  }
}

// ========== CART API FUNCTIONS ==========

export interface CartItem {
  product: string;
  quantity: number;
  price?: number;
  variant?: {
    variantId: string;
    label?: string;
    sku?: string;
    price?: number;
    salePrice?: number;
    measurement?: number;
    unit?: string;
    image?: string;
  };
}

export interface CartResponse {
  cart: {
    _id: string;
    user: string;
    items: Array<{
      _id: string;
      product: any;
      quantity: number;
      price: number;
      variant?: any;
    }>;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Get user's cart from backend
 */
export async function getCart(): Promise<CartResponse> {
  return apiRequest<CartResponse>("/cart", {
    method: "GET",
  });
}

/**
 * Add item to cart
 */
export async function addToCart(productId: string, quantity: number = 1, variantId?: string): Promise<CartResponse> {
  // NestJS uses POST /cart instead of /cart/add
  return apiRequest<CartResponse>("/cart", {
    method: "POST",
    data: { productId, quantity, variantId },
  });
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(productId: string, quantity: number, variantId?: string): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/cart/item/${productId}`, {
    method: "PUT",
    data: { quantity, variantId },
  });
}

/**
 * Remove item from cart
 */
export async function removeCartItem(productId: string, variantId?: string): Promise<CartResponse> {
  const url = variantId ? `/cart/item/${productId}?variantId=${variantId}` : `/cart/item/${productId}`;
  return apiRequest<CartResponse>(url, {
    method: "DELETE",
  });
}

/**
 * Clear cart
 */
export async function clearCartBackend(): Promise<ApiResponse> {
  return apiRequest<ApiResponse>("/cart/clear", {
    method: "DELETE",
  });
}

