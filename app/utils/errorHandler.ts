/**
 * Error handling utilities for Prokrishi frontend
 * 
 * Provides standardized error handling, user-friendly error messages,
 * and retry logic for failed API calls.
 */

import { logger } from "./logger";
import type { AxiosError } from "axios";

export interface ApiError extends Error {
  status?: number;
  code?: string;
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

/**
 * Extract user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const apiError = error as ApiError;
    
    // Check for API error with response
    if (apiError.response?.data?.message) {
      return apiError.response.data.message;
    }
    
    if (apiError.response?.data?.error) {
      return apiError.response.data.error;
    }
    
    // Check for specific error codes
    if (apiError.code === 'ECONNABORTED' || apiError.message?.includes('timeout')) {
      return "Request timeout - please try again";
    }
    
    if (apiError.code === 'ERR_NETWORK' || !apiError.response) {
      return "Network error - please check your connection";
    }
    
    // Check for HTTP status codes
    if (apiError.status === 404) {
      return "Resource not found";
    }
    
    if (apiError.status === 403) {
      return "You don't have permission to perform this action";
    }
    
    if (apiError.status === 401) {
      return "Please log in to continue";
    }
    
    if (apiError.status === 500) {
      return "Server error - please try again later";
    }
    
    // Return the error message if available
    if (apiError.message) {
      return apiError.message;
    }
  }
  
  // Fallback for unknown errors
  return "An unexpected error occurred. Please try again.";
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const apiError = error as ApiError;
    
    // Network errors are retryable
    if (apiError.code === 'ERR_NETWORK' || !apiError.response) {
      return true;
    }
    
    // Timeout errors are retryable
    if (apiError.code === 'ECONNABORTED' || apiError.message?.includes('timeout')) {
      return true;
    }
    
    // 5xx errors are retryable (server errors)
    if (apiError.status && apiError.status >= 500 && apiError.status < 600) {
      return true;
    }
    
    // 429 (Too Many Requests) is retryable
    if (apiError.status === 429) {
      return true;
    }
  }
  
  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`, error);
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

/**
 * Handle API error with logging and user-friendly message
 */
export function handleApiError(error: unknown, context?: string): string {
  const message = getErrorMessage(error);
  
  // Log error with context
  if (context) {
    logger.error(`[${context}]`, error);
  } else {
    logger.error("API Error:", error);
  }
  
  return message;
}

/**
 * Create a safe async function wrapper that handles errors
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  errorMessage?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      const message = errorMessage || handleApiError(error);
      throw new Error(message);
    }
  };
}

