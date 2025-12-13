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
  formatDateTimeBD,
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

// Mobile utilities
export { triggerHaptic, isHapticAvailable, HapticType } from "./haptics";
export { shareContent, shareProduct, sharePage, isShareAvailable } from "./share";
export {
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
  isGeolocationAvailable,
  type LocationCoordinates,
  type LocationError,
} from "./location";

// Analytics
export { analytics } from "./analytics";

// Accessibility
export {
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  trapFocus,
  announceToScreenReader,
  getFocusableElements,
  isElementVisible,
  getContrastRatio,
  meetsWCAGAA,
} from "./accessibility";

// Performance
export {
  performanceMonitor,
  measureFunction,
  measureAsyncFunction,
  type PerformanceMetric,
} from "./performance";

// Network
export {
  getNetworkInfo,
  isSlowConnection,
  isDataSaverEnabled,
  onNetworkChange,
  simulateNetworkThrottle,
  restoreNetworkFetch,
  type NetworkInfo,
} from "./network";

// Memory
export {
  getMemoryUsage,
  monitorMemoryUsage,
  isMemoryUsageHigh,
  getMemoryUsagePercentage,
  detectMemoryLeak,
  type MemoryInfo,
} from "./memory";

