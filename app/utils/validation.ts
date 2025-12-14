/**
 * Validation utilities for form inputs and data
 */

/**
 * Validate email address
 */
export function isValidEmail(email: string | undefined | null): boolean {
  if (!email) {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone number (Bangladeshi format)
 */
export function isValidPhone(phone: string | undefined | null): boolean {
  if (!phone) {
    return false;
  }
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  // Check if it's a valid Bangladeshi mobile number
  // 11 digits starting with 01, or 13 digits starting with 880
  return (digits.length === 11 && digits.startsWith("01")) || 
         (digits.length === 13 && digits.startsWith("880"));
}

/**
 * Validate URL
 */
export function isValidUrl(url: string | undefined | null): boolean {
  if (!url) {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate required field
 */
export function isRequired(value: string | number | undefined | null): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return true;
}

/**
 * Validate minimum length
 */
export function hasMinLength(value: string | undefined | null, minLength: number): boolean {
  if (!value) {
    return false;
  }
  return value.trim().length >= minLength;
}

/**
 * Validate maximum length
 */
export function hasMaxLength(value: string | undefined | null, maxLength: number): boolean {
  if (!value) {
    return true;
  }
  return value.trim().length <= maxLength;
}

/**
 * Validate number range
 */
export function isInRange(value: number | string | undefined | null, min: number, max: number): boolean {
  if (value === null || value === undefined || value === "") {
    return false;
  }
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) {
    return false;
  }
  return num >= min && num <= max;
}

/**
 * Validate positive number
 */
export function isPositive(value: number | string | undefined | null): boolean {
  if (value === null || value === undefined || value === "") {
    return false;
  }
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) {
    return false;
  }
  return num > 0;
}

/**
 * Validate non-negative number
 */
export function isNonNegative(value: number | string | undefined | null): boolean {
  if (value === null || value === undefined || value === "") {
    return false;
  }
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) {
    return false;
  }
  return num >= 0;
}

/**
 * Get validation error message
 */
export function getValidationError(field: string, rule: string): string {
  const messages: Record<string, Record<string, string>> = {
    email: {
      required: "Email is required",
      invalid: "Please enter a valid email address",
    },
    phone: {
      required: "Phone number is required",
      invalid: "Please enter a valid phone number",
    },
    password: {
      required: "Password is required",
      minLength: "Password must be at least 8 characters",
    },
    name: {
      required: "Name is required",
      minLength: "Name must be at least 2 characters",
    },
  };

  return messages[field]?.[rule] || `${field} is invalid`;
}






