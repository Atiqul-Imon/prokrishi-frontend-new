/**
 * Network Utilities
 * Tools for network throttling and connection monitoring
 */

export interface NetworkInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

/**
 * Get current network information
 */
export function getNetworkInfo(): NetworkInfo | null {
  if (typeof window === 'undefined' || !('connection' in navigator)) {
    return null;
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) {
    return null;
  }

  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  };
}

/**
 * Check if user is on slow connection
 */
export function isSlowConnection(): boolean {
  const networkInfo = getNetworkInfo();
  if (!networkInfo) return false;

  // Consider 2G or slow-2g as slow connection
  return networkInfo.effectiveType === '2g' || networkInfo.effectiveType === 'slow-2g';
}

/**
 * Check if user has data saver enabled
 */
export function isDataSaverEnabled(): boolean {
  const networkInfo = getNetworkInfo();
  return networkInfo?.saveData || false;
}

/**
 * Monitor network changes
 */
export function onNetworkChange(callback: (info: NetworkInfo | null) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) {
    return () => {};
  }

  const handleChange = () => {
    callback(getNetworkInfo());
  };

  connection.addEventListener('change', handleChange);

  return () => {
    connection.removeEventListener('change', handleChange);
  };
}

/**
 * Simulate network throttling (for testing)
 */
export function simulateNetworkThrottle(delay: number = 100): typeof window.fetch | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    return originalFetch(...args);
  };

  return originalFetch;
}

/**
 * Restore original fetch (after throttling)
 */
export function restoreNetworkFetch(originalFetch: typeof window.fetch | null): void {
  if (typeof window !== 'undefined' && originalFetch) {
    window.fetch = originalFetch;
  }
}

