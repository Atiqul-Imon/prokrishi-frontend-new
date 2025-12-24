/**
 * Retry utility for failed API calls
 */

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: "fixed" | "exponential";
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Promise that resolves with the function result
 * 
 * @example
 * const result = await retry(() => fetchData(), {
 *   maxAttempts: 3,
 *   delay: 1000,
 *   backoff: 'exponential',
 *   onRetry: (attempt, error) => console.log(`Retry ${attempt}:`, error)
 * });
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = "exponential",
    onRetry,
  } = options;

  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt < maxAttempts) {
        // Calculate delay with backoff
        const currentDelay =
          backoff === "exponential"
            ? delay * Math.pow(2, attempt - 1)
            : delay;

        // Call onRetry callback if provided
        if (onRetry) {
          onRetry(attempt, error);
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }

  // All attempts failed, throw the last error
  throw lastError;
}

/**
 * Retry with specific error types
 * Only retries if error matches certain conditions
 */
export async function retryOnCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: unknown) => boolean,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = "exponential",
    onRetry,
  } = options;

  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt < maxAttempts) {
        const currentDelay =
          backoff === "exponential"
            ? delay * Math.pow(2, attempt - 1)
            : delay;

        if (onRetry) {
          onRetry(attempt, error);
        }

        await new Promise((resolve) => setTimeout(resolve, currentDelay));
      }
    }
  }

  throw lastError;
}

/**
 * Check if error is a network error (should retry)
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("network") ||
      error.message.includes("fetch") ||
      error.message.includes("timeout") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ENOTFOUND")
    );
  }
  return false;
}

/**
 * Check if error is a server error (5xx, should retry)
 */
export function isServerError(error: unknown): boolean {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "status" in error.response
  ) {
    const status = error.response.status as number;
    return status >= 500 && status < 600;
  }
  return false;
}











