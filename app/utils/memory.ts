/**
 * Memory Monitoring Utilities
 * Tools for tracking memory usage and detecting memory leaks
 */

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

/**
 * Get current memory usage (if available)
 */
export function getMemoryUsage(): MemoryInfo | null {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  const memory = (performance as any).memory;
  if (!memory) {
    return null;
  }

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    timestamp: Date.now(),
  };
}

/**
 * Monitor memory usage over time
 */
export function monitorMemoryUsage(
  callback: (info: MemoryInfo | null) => void,
  interval: number = 5000
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const intervalId = setInterval(() => {
    const memoryInfo = getMemoryUsage();
    callback(memoryInfo);
  }, interval);

  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Check if memory usage is high
 */
export function isMemoryUsageHigh(threshold: number = 0.8): boolean {
  const memory = getMemoryUsage();
  if (!memory) return false;

  const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
  return usageRatio > threshold;
}

/**
 * Get memory usage percentage
 */
export function getMemoryUsagePercentage(): number | null {
  const memory = getMemoryUsage();
  if (!memory) return null;

  return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
}

/**
 * Detect potential memory leaks by tracking memory growth
 */
export function detectMemoryLeak(
  samples: number = 10,
  interval: number = 5000,
  growthThreshold: number = 0.1
): Promise<boolean> {
  return new Promise((resolve) => {
    const memoryReadings: number[] = [];
    let sampleCount = 0;

    const intervalId = setInterval(() => {
      const memory = getMemoryUsage();
      if (memory) {
        memoryReadings.push(memory.usedJSHeapSize);
        sampleCount++;

        if (sampleCount >= samples) {
          clearInterval(intervalId);

          // Calculate average growth rate
          let totalGrowth = 0;
          for (let i = 1; i < memoryReadings.length; i++) {
            const growth = (memoryReadings[i] - memoryReadings[i - 1]) / memoryReadings[i - 1];
            totalGrowth += growth;
          }
          const averageGrowth = totalGrowth / (memoryReadings.length - 1);

          resolve(averageGrowth > growthThreshold);
        }
      }
    }, interval);

    // Timeout after reasonable time
    setTimeout(() => {
      clearInterval(intervalId);
      resolve(false);
    }, samples * interval * 2);
  });
}










