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
import type { AxiosError, AxiosRequestConfig } from "axios";
import { logger } from "./logger";
import { retry, retryOnCondition, isNetworkError, isServerError } from "./retry";

const BASE_URL = getApiBaseUrl();

// Type definitions for better type safety
type FormDataValue = string | number | boolean | File | Blob | null | undefined | FormDataValue[] | Record<string, unknown>;
type ProductFormData = FormData | Record<string, FormDataValue>;
export type CategoryFormData = { name: string; description?: string; image?: File };
type OrderData = {
  orderItems: Array<{
    product: string;
    quantity: number;
    variantId?: string;
    name?: string;
    price?: number;
  }>;
  shippingAddress: Address;
  paymentMethod: string;
  idempotencyKey?: string;
  [key: string]: unknown;
};
type PaymentData = {
  orderId: string;
  paymentMethod: string;
  transactionId?: string;
  [key: string]: unknown;
};
type ApiRequestOptions = Omit<AxiosRequestConfig, 'url'>;
type AxiosErrorResponse = AxiosError<{ message?: string }>;

const isFileLike = (value: unknown): value is File | Blob => {
  if (typeof File !== "undefined" && value instanceof File) {
    return true;
  }
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return true;
  }
  return false;
};

const appendFormDataValue = (formData: FormData, key: string, value: FormDataValue) => {
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

  formData.append(key, String(value));
};

// Request deduplication: Track in-flight requests to prevent duplicate calls
const pendingRequests = new Map<string, Promise<unknown>>();

// Response cache: Cache GET requests to reduce API calls
interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

const responseCache = new Map<string, CacheEntry>();

// Cache TTL in milliseconds (default: 2 minutes for most requests, 5 minutes for static data)
const DEFAULT_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
const STATIC_CACHE_TTL = 5 * 60 * 1000; // 5 minutes (categories, etc.)

// Generate cache key from request
function getCacheKey(path: string, options: ApiRequestOptions, token?: string): string {
  const method = (options.method || 'GET').toUpperCase();
  const params = options.params ? JSON.stringify(options.params) : '';
  const data = options.data ? JSON.stringify(options.data) : '';
  // Include token in cache key for user-specific data
  const auth = token ? `:${token.substring(0, 10)}` : '';
  return `${method}:${path}:${params}:${data}${auth}`;
}

// Generate request key for deduplication (same as cache key)
function getRequestKey(path: string, options: ApiRequestOptions, token?: string): string {
  return getCacheKey(path, options, token);
}

// Check if request should be cached (only GET requests)
function shouldCache(method?: string): boolean {
  return !method || method.toUpperCase() === 'GET';
}

// Check if cache entry is still valid
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

// Get cache TTL based on endpoint
function getCacheTTL(path: string): number {
  // Static data gets longer cache
  if (path.includes('/categories') || path.includes('/featured')) {
    return STATIC_CACHE_TTL;
  }
  // Product lists get medium cache
  if (path.includes('/products') && !path.includes('/product/')) {
    return DEFAULT_CACHE_TTL;
  }
  // Individual products get shorter cache (stock changes)
  if (path.includes('/product/')) {
    return 1 * 60 * 1000; // 1 minute
  }
  return DEFAULT_CACHE_TTL;
}

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
  (error: AxiosErrorResponse) => {
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
 * Universal axios wrapper for API requests with request deduplication and response caching.
 * 
 * Features:
 * - Request deduplication: Prevents duplicate simultaneous requests
 * - Response caching: Caches GET requests to reduce API calls
 * - Automatic cache invalidation: Based on TTL
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  // Get auth token for cache key
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("accessToken") || undefined 
    : undefined;

  const requestKey = getRequestKey(path, options, token);
  const method = (options.method || 'GET').toUpperCase();
  const isGetRequest = method === 'GET';

  // Check cache first (only for GET requests)
  if (isGetRequest && shouldCache(method)) {
    const cached = responseCache.get(requestKey);
    if (cached && isCacheValid(cached)) {
      logger.debug(`[API Cache Hit] ${path}`);
      return cached.data as T;
    }
    // Remove expired cache entry
    if (cached) {
      responseCache.delete(requestKey);
    }
  }

  // Check for pending duplicate request
  const pendingRequest = pendingRequests.get(requestKey);
  if (pendingRequest) {
    logger.debug(`[API Deduplication] Reusing pending request for ${path}`);
    try {
      return await pendingRequest as T;
    } catch (error) {
      // If pending request failed, remove it and continue with new request
      pendingRequests.delete(requestKey);
      throw error;
    }
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const res = await api({
        url: path,
        ...options,
      });
      
      const data = res.data as T;

      // Cache successful GET requests
      if (isGetRequest && shouldCache(method) && res.status === 200) {
        const ttl = getCacheTTL(path);
        responseCache.set(requestKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });
        logger.debug(`[API Cache Set] ${path} (TTL: ${ttl}ms)`);
      }

      return data;
    } catch (err) {
      const axiosError = err as AxiosErrorResponse;
      let msg = axiosError.response?.data?.message || axiosError.message || "API Error";
      
      // Handle timeout errors specifically
      if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
        msg = "Request timeout - please try again";
      }
      
      // Handle network errors
      if (axiosError.code === 'ERR_NETWORK' || !axiosError.response) {
        msg = "Network error - please check your connection";
      }
      
      // Handle 404 errors specifically
      if (axiosError.response?.status === 404) {
        msg = "Product not found - it may have been deleted";
      }
      
      const apiError = new Error(msg) as Error & { status?: number };
      if (axiosError.response?.status) {
        apiError.status = axiosError.response.status;
      }
      throw apiError;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(requestKey);
    }
  })();

  // Store pending request for deduplication
  pendingRequests.set(requestKey, requestPromise);

  return requestPromise as Promise<T>;
}

/**
 * Clear response cache (useful after mutations)
 */
export function clearApiCache(pattern?: string): void {
  if (!pattern) {
    responseCache.clear();
    logger.debug('[API Cache] Cleared all cache');
    return;
  }
  
  // Clear cache entries matching pattern
  let cleared = 0;
  for (const key of responseCache.keys()) {
    if (key.includes(pattern)) {
      responseCache.delete(key);
      cleared++;
    }
  }
  logger.debug(`[API Cache] Cleared ${cleared} entries matching pattern: ${pattern}`);
}

/**
 * Invalidate cache for specific path
 */
export function invalidateApiCache(path: string): void {
  clearApiCache(path);
}

/**
 * Register a new user.
 */
export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await apiRequest<RegisterResponse>("/user/register", {
    method: "POST",
    data,
  });
  // NestJS returns { success: true, data: { user, accessToken, refreshToken, message } }
  const responseData = response.data || response;
  if (responseData.accessToken) {
    localStorage.setItem("accessToken", responseData.accessToken);
  }
  if (responseData.refreshToken) {
    localStorage.setItem("refreshToken", responseData.refreshToken);
  }
  return {
    success: response.success || true,
    message: responseData.message,
    user: responseData.user,
    accessToken: responseData.accessToken,
    refreshToken: responseData.refreshToken,
  };
}

/**
 * Login user.
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  try {
    console.log("loginUser: Sending request to /user/login", { email: data.email, passwordLength: data.password?.length });
    const response = await apiRequest<any>("/user/login", {
      method: "POST",
      data,
    });
    
    // Log response for debugging
    console.log("loginUser: API Response received:", response);
    
    // NestJS TransformInterceptor wraps response structure:
    // { success: true, data: { user, accessToken, refreshToken }, message: "...", timestamp: "..." }
    // apiRequest already extracts res.data, so response is the wrapped structure
    // Try response.data first (nested), fallback to response (direct) for compatibility
    const responseData = (response as any).data || response;
    
    console.log("loginUser: Extracted responseData:", responseData);
    
    // Extract tokens and user data - try nested first, then direct
    const accessToken = responseData.accessToken || (response as any).accessToken;
    const refreshToken = responseData.refreshToken || (response as any).refreshToken;
    const user = responseData.user || (response as any).user;
    const message = (response as any).message || responseData.message || "Login successful";
    
    console.log("loginUser: Extracted values:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      userRole: user?.role,
      userName: user?.name
    });
    
    if (!accessToken || !user) {
      console.error("loginUser: Missing required fields:", {
        hasAccessToken: !!accessToken,
        hasUser: !!user,
        responseStructure: response
      });
      throw new Error("Login response missing access token or user data");
    }
    
    // Store tokens in localStorage
    if (accessToken && typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      console.log("loginUser: Access token stored in localStorage");
    } else {
      console.error("loginUser: No access token in response:", response);
    }
    
    if (refreshToken && typeof window !== "undefined") {
      localStorage.setItem("refreshToken", refreshToken);
      console.log("loginUser: Refresh token stored in localStorage");
    }
    
    if (!user) {
      console.error("loginUser: No user data in response:", response);
      throw new Error("Login response missing user data");
    }
    
    console.log("loginUser: Returning success response");
    return {
      success: (response as any).success !== false,
      message,
      user,
      accessToken: accessToken || "",
      refreshToken: refreshToken || "",
    };
  } catch (error: any) {
    console.error("Login error:", error);
    throw error;
  }
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
export async function fetchProfile(): Promise<UserProfileResponse> {
  const response = await apiRequest<UserProfileResponse>("/user/profile", {
    method: "GET",
  });
  // NestJS returns { success: true, data: { message, user } }
  const responseData = response.data || response;
  return {
    success: response.success || true,
    message: responseData.message,
    user: responseData.user || responseData,
  };
}

export async function updateUserAddresses(addresses: Address[]): Promise<UserProfileResponse> {
  logger.debug("API: updateUserAddresses called with:", addresses);
  try {
    const result = await apiRequest<UserProfileResponse>("/user/profile", {
      method: "PUT",
      data: { addresses },
    });
    logger.debug("API: updateUserAddresses successful response:", result);
    return result;
  } catch (error) {
    logger.error("API: updateUserAddresses error:", error);
    throw error;
  }
}

export async function placeOrder(orderData: OrderData): Promise<OrderResponse> {
  // Retry critical order placement with exponential backoff
  return retryOnCondition(
    async () => {
      const response = await apiRequest<OrderResponse>("/order", {
        method: "POST",
        data: orderData,
        headers: orderData?.idempotencyKey
          ? { "Idempotency-Key": orderData.idempotencyKey as string }
          : undefined,
      });
      // NestJS returns { success: true, data: { message, order: {...} } }
      const responseData = response.data || response;
      return {
        success: response.success || true,
        message: responseData.message,
        order: responseData.order || responseData,
        // Also include _id at top level for backward compatibility
        _id: responseData.order?._id || responseData._id,
      };
    },
    (error) => isNetworkError(error) || isServerError(error),
    {
      maxAttempts: 3,
      delay: 1000,
      backoff: "exponential",
      onRetry: (attempt, error) => {
        logger.warn(`Order placement retry attempt ${attempt}:`, error);
      },
    }
  );
}

// Note: Shipping quote endpoint not yet migrated - using cart validate for now
export async function getShippingQuote(data: ShippingQuoteRequest): Promise<ShippingQuoteResponse> {
  // Retry shipping quote calculation with exponential backoff
  return retryOnCondition(
    async () => {
      const response = await apiRequest<ShippingQuoteResponse>("/order/shipping-quote", {
        method: "POST",
        data,
      });
      // NestJS returns { success: true, data: { shippingFee, totalWeightKg, zone, breakdown } }
      const responseData = (response as unknown as { data?: ShippingQuoteResponse; [key: string]: unknown }).data || response;
      return {
        shippingFee: responseData.shippingFee || 0,
        totalWeightKg: responseData.totalWeightKg || 0,
        zone: responseData.zone || data.shippingZone,
        breakdown: responseData.breakdown,
      };
    },
    (error) => isNetworkError(error) || isServerError(error),
    {
      maxAttempts: 3,
      delay: 500,
      backoff: "exponential",
      onRetry: (attempt, error) => {
        logger.warn(`Shipping quote retry attempt ${attempt}:`, error);
      },
    }
  );
}

export async function validateCartApi(payload: {
  orderItems: Array<{
    product: string;
    quantity: number;
    variantId?: string;
    name?: string;
    price?: number;
  }>;
}): Promise<{ hasChanges: boolean; items: unknown[]; totalPrice: number; [key: string]: unknown }> {
  // Retry cart validation with exponential backoff
  return retryOnCondition(
    async () => {
      // Use public endpoint /cart/validate-items that accepts payload
      const response = await apiRequest<{ hasChanges: boolean; items: unknown[]; totalPrice: number; [key: string]: unknown }>("/cart/validate-items", {
        method: "POST",
        data: payload,
      });
      // NestJS returns { success: true, data: { hasChanges, items, totalPrice, ... } }
      const responseData = (response as { data?: { hasChanges: boolean; items: unknown[]; totalPrice: number; [key: string]: unknown }; [key: string]: unknown }).data || response;
      const typedData = responseData as { hasChanges?: boolean; items?: unknown[]; totalPrice?: number; [key: string]: unknown };
      return {
        ...typedData,
        hasChanges: typedData.hasChanges ?? false,
        items: typedData.items || [],
        totalPrice: typedData.totalPrice ?? 0,
      };
    },
    (error) => isNetworkError(error) || isServerError(error),
    {
      maxAttempts: 3,
      delay: 500,
      backoff: "exponential",
      onRetry: (attempt, error) => {
        logger.warn(`Cart validation retry attempt ${attempt}:`, error);
      },
    }
  );
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
  } catch (error) {
    const axiosError = error as AxiosErrorResponse;
    throw new Error(axiosError.response?.data?.message || 'Failed to download invoice');
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
export function createResource<T = unknown>(resource: string, payload: unknown): Promise<T> {
  return apiRequest<T>(`/${resource}`, {
    method: "POST",
    data: payload,
  });
}

// Generic PUT (for JSON data)
export function updateResource<T = unknown>(resource: string, id: string, payload: unknown): Promise<T> {
  return apiRequest<T>(`/${resource}/${id}`, {
    method: "PUT",
    data: payload,
  });
}

// Generic DELETE
export function deleteResource<T = unknown>(resource: string, id: string): Promise<T> {
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
  const response = await apiRequest<ProductResponse>(`/product/${id}?t=${timestamp}`);
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
  const response = await apiRequest<CategoryResponse>(`/category/${id}`);
  // NestJS returns { success: true, message, category: {...} }
  // Return in format expected by frontend: { category: {...} }
  return {
    success: response.success || true,
    category: response.category || response.data?.category || null,
  };
}

export async function getAllCategories(): Promise<{ success: boolean; categories: Category[] }> {
  const response = await apiRequest<{ success?: boolean; data?: Category[] | { categories?: Category[] }; categories?: Category[]; message?: string }>("/category");
  // NestJS TransformInterceptor returns { success: true, data: [categories array], message: '...' }
  // OR if the controller returns { message: '...', categories: [...] }, it becomes { success: true, data: [...], message: '...' }
  // Return in format expected by frontend: { categories: [...] }
  const typedResponse = response as { success?: boolean; data?: Category[] | { categories?: Category[] }; categories?: Category[]; message?: string };
  
  let categories: Category[] = [];
  
  // Check if data is directly the categories array
  if (Array.isArray(typedResponse.data)) {
    categories = typedResponse.data;
  }
  // Check if data is an object with categories property
  else if (typedResponse.data && typeof typedResponse.data === 'object' && 'categories' in typedResponse.data) {
    categories = (typedResponse.data as { categories?: Category[] }).categories || [];
  }
  // Check if categories is directly on the response
  else if (Array.isArray(typedResponse.categories)) {
    categories = typedResponse.categories;
  }
  
  return {
    success: typedResponse.success ?? true,
    categories,
  };
}

// ========== PRODUCT-SPECIFIC (for file/image upload) ==========

/**
 * Create product (with file/image upload).
 */
export async function createProduct(productData: ProductFormData): Promise<ProductResponse> {
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
  } catch (err) {
    const axiosError = err as AxiosErrorResponse;
    const msg =
      axiosError.response?.data?.message || axiosError.message || "Failed to create product";
    throw new Error(msg);
  }
}

/**
 * Update product (with file/image upload).
 */
export async function updateProduct(id: string, productData: ProductFormData): Promise<ProductResponse> {
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
  } catch (err) {
    const axiosError = err as AxiosErrorResponse;
    const msg =
      axiosError.response?.data?.message || axiosError.message || "Failed to update product";
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
    // NestJS returns { success: true, data: { products: [...], total, ... } }
    // apiRequest extracts data, but for this endpoint we need to handle the nested structure
    const responseData = res.data;
    return {
      success: responseData.success || true,
      products: responseData.data?.products || responseData.products || [],
      total: responseData.data?.total || responseData.total || 0,
      currentPage: responseData.data?.currentPage || responseData.currentPage || 1,
      totalPages: responseData.data?.totalPages || responseData.totalPages || 1,
    };
  } catch (err) {
    const axiosError = err as AxiosErrorResponse;
    throw new Error(
      axiosError.response?.data?.message || axiosError.message || "Failed to get products",
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
    // NestJS returns { message, success, products, pagination, total }
    const data = res.data?.data || res.data;
    return {
      success: data.success ?? true,
      products: data.products || [],
      pagination: data.pagination || {},
      total: data.total || data.products?.length || 0,
    };
  } catch (err) {
    const axiosError = err as AxiosErrorResponse;
    throw new Error(
      axiosError.response?.data?.message || axiosError.message || "Failed to get products",
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

    // Use the main /product endpoint with search query parameter
    const res = await api.get<ProductsResponse>(`/product?${queryParams.toString()}`);
    return res.data;
  } catch (err) {
    const axiosError = err as AxiosErrorResponse;
    throw new Error(
      axiosError.response?.data?.message || axiosError.message || "Failed to search products",
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

export async function createCategory(category: CategoryFormData): Promise<CategoryResponse> {
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
  } catch (err) {
    const axiosError = err as AxiosErrorResponse;
    const msg =
      axiosError.response?.data?.message || axiosError.message || "Failed to create category";
    throw new Error(msg);
  }
}

export async function updateCategory(id: string, category: CategoryFormData | Partial<Category>): Promise<CategoryResponse> {
  // Check if we're doing a simple update (no file upload)
  const hasFile = 'image' in category && category.image && category.image instanceof File;
  const categoryRecord = category as Record<string, unknown>;
  const hasOnlySimpleFields = !hasFile && Object.keys(categoryRecord).every(key => 
    typeof categoryRecord[key] !== 'object' || categoryRecord[key] === null
  );

  if (hasOnlySimpleFields) {
    // Use JSON for simple updates (like featured toggle) - use PUT
    try {
      // NestJS uses PUT /category/:id instead of /category/update/:id
      const res = await api.put<CategoryResponse>(`/category/${id}`, category, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    } catch (err) {
      const axiosError = err as AxiosErrorResponse;
      const msg =
        axiosError.response?.data?.message || axiosError.message || "Failed to update category";
      throw new Error(msg);
    }
  } else {
    // Use FormData for updates with file uploads
    const formData = new FormData();

    Object.keys(category).forEach((key) => {
      if (key !== "image") {
        const value = (category as Record<string, unknown>)[key];
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
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
    } catch (err) {
      const axiosError = err as AxiosErrorResponse;
      const msg =
        axiosError.response?.data?.message || axiosError.message || "Failed to update category";
      throw new Error(msg);
    }
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse> {
  // NestJS uses DELETE /category/:id instead of /category/delete/:id
  return deleteResource<ApiResponse>("category", id);
}

export async function getFeaturedCategories(): Promise<{ categories: Category[] }> {
  // NestJS uses GET /category?featured=true or /category/featured
  const timestamp = Date.now();
  try {
    // Use axios directly to get full response structure
    const res = await api.get<{ 
      success?: boolean; 
      data?: Category[] | { message?: string; categories?: Category[] }; 
      categories?: Category[];
      message?: string;
    }>(`/category/featured?t=${timestamp}`);
    
    const responseData = res.data;
    
    // NestJS TransformInterceptor returns { success: true, data: [categories array] }
    // The categories are directly in data as an array
    let categories: Category[] = [];
    if (Array.isArray(responseData.data)) {
      categories = responseData.data;
    } else if (responseData.data && typeof responseData.data === 'object' && 'categories' in responseData.data) {
      categories = (responseData.data as { categories?: Category[] }).categories || [];
    } else if (Array.isArray(responseData.categories)) {
      categories = responseData.categories;
    }
    
    return { categories };
  } catch (err) {
    // Fallback to query parameter approach
    try {
      const res = await api.get<{ 
        success?: boolean; 
        data?: Category[] | { message?: string; categories?: Category[] }; 
        categories?: Category[];
        message?: string;
      }>(`/category?featured=true&t=${timestamp}`);
      
      const responseData = res.data;
      
      let categories: Category[] = [];
      if (Array.isArray(responseData.data)) {
        categories = responseData.data;
      } else if (responseData.data && typeof responseData.data === 'object' && 'categories' in responseData.data) {
        categories = (responseData.data as { categories?: Category[] }).categories || [];
      } else if (Array.isArray(responseData.categories)) {
        categories = responseData.categories;
      }
      
      return { categories };
    } catch (fallbackErr) {
      logger.error("Failed to load featured categories:", fallbackErr);
      return { categories: [] };
    }
  }
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
  recentOrders: Order[];
  dailySales: Array<{ date: string; revenue: number; orders: number }>;
}

export interface AdminOrderResponse {
  success: boolean;
  orders: Order[];
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
  
  const response = await apiRequest<{ success?: boolean; data?: AdminOrderResponse; orders?: Order[]; pagination?: unknown }>(url);
  // NestJS TransformInterceptor wraps response in { success: true, data: { message, success, orders, pagination } }
  const responseData = response.data || response;
  const typedResponse = responseData as { success?: boolean; orders?: Order[]; pagination?: AdminOrderResponse['pagination'] };
  return {
    success: typedResponse.success ?? true,
    orders: typedResponse.orders || [],
    pagination: typedResponse.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalOrders: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 10,
    },
  };
}

/**
 * Get order statistics (Admin)
 */
export async function getAdminOrderStats(period: number = 30): Promise<AdminOrderStatsResponse> {
  const response = await apiRequest<{ success?: boolean; data?: AdminOrderStatsResponse; stats?: AdminOrderStats }>(`/admin/orders/stats?period=${period}`);
  // NestJS TransformInterceptor wraps response in { success: true, data: { message, success, stats } }
  const responseData = response.data || response;
  const typedResponse = responseData as { success?: boolean; stats?: AdminOrderStats };
  return {
    success: typedResponse.success ?? true,
    stats: typedResponse.stats || {
      totalOrders: 0,
      totalRevenue: 0,
      periodRevenue: 0,
      statusBreakdown: {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      },
      recentOrders: [],
      dailySales: [],
    },
  };
}

/**
 * Get single order details (Admin)
 */
export async function getAdminOrderById(id: string): Promise<{ success: boolean; order: Order }> {
  const response = await apiRequest<{ success?: boolean; data?: { success: boolean; order: Order }; order?: Order }>(`/admin/orders/${id}`);
  // NestJS TransformInterceptor wraps response in { success: true, data: { message, success, order } }
  const responseData = response.data || response;
  const typedResponse = responseData as { success?: boolean; order?: Order };
  const order = typedResponse.order || (responseData as Order);
  return {
    success: typedResponse.success ?? true,
    order: order as Order,
  };
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
  // Retry payment session creation with exponential backoff
  return retryOnCondition(
    async () => {
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
    },
    (error) => isNetworkError(error) || isServerError(error),
    {
      maxAttempts: 3,
      delay: 1000,
      backoff: "exponential",
      onRetry: (attempt, error) => {
        logger.warn(`Payment session creation retry attempt ${attempt}:`, error);
      },
    }
  );
}

export async function getPaymentStatus(orderId: string): Promise<ApiResponse> {
  return apiRequest<ApiResponse>(`/payment/status/${orderId}`, {
    method: "GET",
  });
}

export async function handlePaymentSuccess(paymentData: PaymentData): Promise<ApiResponse> {
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

export async function handlePaymentFail(paymentData: PaymentData): Promise<ApiResponse> {
  return apiRequest<ApiResponse>("/payment/fail", {
    method: "POST",
    data: paymentData,
  });
}

export async function handlePaymentCancel(paymentData: PaymentData): Promise<ApiResponse> {
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
export async function getUserOrders(): Promise<{ success: boolean; orders: Order[] }> {
  // NestJS uses GET /order instead of /order/user (user context from JWT)
  return apiRequest<{ success: boolean; orders: Order[] }>("/order");
}

// Get fish orders for user
export async function getUserFishOrders(): Promise<{ success: boolean; orders: Order[] }> {
  return apiRequest<{ success: boolean; orders: Order[] }>("/fish/orders/user");
}

// Get featured products
export async function getFeaturedProducts(): Promise<ProductsResponse> {
  const timestamp = Date.now();
  const response = await apiRequest<any>(`/product/featured?t=${timestamp}`);
  
  // NestJS TransformInterceptor wraps response:
  // Controller returns: { message, products: [...], success: true }
  // Interceptor transforms to: { success: true, data: { products: [...], success: true }, message, timestamp }
  // OR if single field: { success: true, data: [...], message, timestamp }
  
  let products: any[] = [];
  
  // Try different response structures
  if (Array.isArray(response.data)) {
    // If data is directly an array
    products = response.data;
  } else if (response.data?.products && Array.isArray(response.data.products)) {
    // If data contains products array
    products = response.data.products;
  } else if (Array.isArray(response.products)) {
    // If products is at top level
    products = response.products;
  } else if (response.data && typeof response.data === 'object' && 'products' in response.data) {
    // Nested structure
    products = (response.data as any).products || [];
  }
  
  return {
    success: response.success || true,
    products: products,
    pagination: response.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalProducts: products.length || 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: products.length || 0,
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
    // NestJS returns { message, success, data: { stats, recentOrders, lowStockProducts } }
    const responseData = res.data?.data || res.data;
    return {
      success: res.data?.success ?? true,
      message: res.data?.message || 'Dashboard statistics fetched successfully',
      stats: responseData?.stats || responseData,
      recentOrders: responseData?.recentOrders,
      lowStockProducts: responseData?.lowStockProducts,
    };
  } catch (err) {
    const axiosError = err as AxiosErrorResponse;
    throw new Error(
      axiosError.response?.data?.message || axiosError.message || "Failed to get dashboard statistics",
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
      product: Product | string;
      quantity: number;
      price: number;
      variant?: { _id: string; label?: string; [key: string]: unknown };
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

// ==================== Fish Cart API ====================

export interface FishCartItem {
  _id?: string;
  fishProduct: Product | string;
  sizeCategoryId: string;
  sizeCategoryLabel: string;
  pricePerKg: number;
}

export interface FishCartResponse {
  success: boolean;
  message?: string;
  cart?: {
    _id?: string;
    user: string;
    items: FishCartItem[];
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Get user's fish cart from backend
 */
export async function getFishCart(): Promise<FishCartResponse> {
  return apiRequest<FishCartResponse>("/fish-cart", {
    method: "GET",
  });
}

/**
 * Add fish product to fish cart
 */
export async function addToFishCart(fishProductId: string, sizeCategoryId: string, quantity: number = 1): Promise<FishCartResponse> {
  return apiRequest<FishCartResponse>("/fish-cart", {
    method: "POST",
    data: { fishProductId, sizeCategoryId, quantity },
  });
}

/**
 * Update fish cart item quantity
 */
export async function updateFishCartQuantity(fishProductId: string, sizeCategoryId: string, quantity: number): Promise<FishCartResponse> {
  return apiRequest<FishCartResponse>("/fish-cart/quantity", {
    method: "PATCH",
    data: { fishProductId, sizeCategoryId, quantity },
  });
}

/**
 * Remove fish product from fish cart
 */
export async function removeFromFishCart(fishProductId: string, sizeCategoryId: string): Promise<FishCartResponse> {
  return apiRequest<FishCartResponse>(`/fish-cart/${fishProductId}/${sizeCategoryId}`, {
    method: "DELETE",
  });
}

/**
 * Clear fish cart
 */
export async function clearFishCartBackend(): Promise<ApiResponse> {
  return apiRequest<ApiResponse>("/fish-cart", {
    method: "DELETE",
  });
}

/**
 * Validate fish cart
 */
export async function validateFishCart(): Promise<{ success: boolean; isValid: boolean; items: any[] }> {
  return apiRequest("/fish-cart/validate", {
    method: "POST",
  });
}

