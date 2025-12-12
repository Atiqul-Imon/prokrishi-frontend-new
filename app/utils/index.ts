/**
 * Utilities Barrel Export
 */

// API utilities
export { apiRequest } from "./api";
export { fishProductApi, fishOrderApi } from "./fishApi";

// Error handling
export { handleApiError, getErrorMessage, isRetryableError, retryWithBackoff } from "./errorHandler";

// Logging
export { logger } from "./logger";

// Formatting
export {
  formatCurrency,
  formatCurrencyWhole,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatPercentage,
  truncateText,
  formatPhone,
  formatFileSize,
} from "./format";

// Validation
export {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isRequired,
  hasMinLength,
  hasMaxLength,
  isInRange,
  isPositive,
  isNonNegative,
  getValidationError,
} from "./validation";

// Constants
export {
  PAGINATION,
  STATUS_OPTIONS,
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PRODUCT_UNITS,
  PRICE_TYPES,
  STOCK_TYPES,
  FILE_LIMITS,
  DATE_FORMATS,
  API_ENDPOINTS,
} from "./constants";

// UI utilities
export { cn } from "./cn";
export { getApiBaseUrl } from "./env";

// Retry utilities
export { retry, retryOnCondition, isNetworkError, isServerError } from "./retry";

