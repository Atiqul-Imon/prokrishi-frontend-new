/**
 * Application constants
 */

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/**
 * Status options
 */
export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "out_of_stock", label: "Out of Stock" },
] as const;

/**
 * User roles
 */
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
} as const;

/**
 * Order statuses
 */
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
} as const;

/**
 * Payment statuses
 */
export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

/**
 * Product units
 */
export const PRODUCT_UNITS = [
  { value: "pcs", label: "Pieces" },
  { value: "kg", label: "Kilogram" },
  { value: "g", label: "Gram" },
  { value: "l", label: "Liter" },
  { value: "ml", label: "Milliliter" },
] as const;

/**
 * Price types
 */
export const PRICE_TYPES = {
  PER_UNIT: "PER_UNIT",
  PER_WEIGHT: "PER_WEIGHT",
} as const;

/**
 * Stock types
 */
export const STOCK_TYPES = {
  COUNT: "COUNT",
  WEIGHT: "WEIGHT",
} as const;

/**
 * File upload limits
 */
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DISPLAY: "MMM dd, yyyy",
  DISPLAY_WITH_TIME: "MMM dd, yyyy hh:mm a",
  ISO: "yyyy-MM-dd",
  ISO_WITH_TIME: "yyyy-MM-dd HH:mm:ss",
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },
  PRODUCTS: {
    BASE: "/products",
    ADMIN: "/products/admin",
  },
  ORDERS: {
    BASE: "/orders",
    ADMIN: "/admin/orders",
  },
  USERS: {
    BASE: "/user",
    ADMIN: "/user/admin",
  },
} as const;











