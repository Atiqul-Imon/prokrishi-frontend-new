/**
 * Formatting utilities for consistent display of data
 */

/**
 * Format currency (Bangladeshi Taka)
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === null || amount === undefined || amount === "") {
    return "৳0";
  }
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return "৳0";
  }
  return `৳${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format currency without decimals
 */
export function formatCurrencyWhole(amount: number | string | undefined | null): string {
  if (amount === null || amount === undefined || amount === "") {
    return "৳0";
  }
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return "৳0";
  }
  return `৳${Math.round(num).toLocaleString("en-US")}`;
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) {
    return "N/A";
  }
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date | undefined | null): string {
  if (!date) {
    return "N/A";
  }
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid Date";
  }
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(date: string | Date | undefined | null): string {
  if (!date) {
    return "N/A";
  }
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return "Just now";
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return formatDate(d);
    }
  } catch {
    return "Invalid Date";
  }
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number | string | undefined | null): string {
  if (num === null || num === undefined || num === "") {
    return "0";
  }
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) {
    return "0";
  }
  return n.toLocaleString("en-US");
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | string | undefined | null, decimals: number = 1): string {
  if (value === null || value === undefined || value === "") {
    return "0%";
  }
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) {
    return "0%";
  }
  return `${num.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string | undefined | null, maxLength: number = 50): string {
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Format phone number
 */
export function formatPhone(phone: string | undefined | null): string {
  if (!phone) {
    return "N/A";
  }
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  // Format as +880 XXXX-XXXXXX
  if (digits.length === 13 && digits.startsWith("880")) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 11 && digits.startsWith("01")) {
    return `+880 ${digits.slice(1, 5)}-${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number | undefined | null): string {
  if (!bytes || bytes === 0) {
    return "0 Bytes";
  }
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

