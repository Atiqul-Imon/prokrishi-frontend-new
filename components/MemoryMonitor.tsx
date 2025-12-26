"use client";

import { useEffect } from "react";
import { monitorMemoryUsage, isMemoryUsageHigh, getMemoryUsagePercentage } from "@/app/utils/memory";
import { analytics } from "@/app/utils/analytics";

/**
 * Memory Monitor Component
 * Monitors memory usage and detects potential issues
 */
export default function MemoryMonitor() {
  useEffect(() => {
    let warningShown = false;

    const cleanup = monitorMemoryUsage((memoryInfo) => {
      if (!memoryInfo) return;

      const usagePercentage = getMemoryUsagePercentage();
      const isHigh = isMemoryUsageHigh(0.8);

      // Log memory usage periodically
      if (usagePercentage !== null) {
        analytics.performance('memory_usage', usagePercentage, '%');
      }

      // Warn if memory usage is high
      if (isHigh && !warningShown && process.env.NODE_ENV === 'development') {
        console.warn(
          `[Memory] High memory usage detected: ${usagePercentage?.toFixed(2)}%`,
          memoryInfo
        );
        warningShown = true;
      }

      // Track memory usage spikes
      if (usagePercentage && usagePercentage > 90) {
        analytics.track('memory_warning', {
          usagePercentage,
          usedJSHeapSize: memoryInfo.usedJSHeapSize,
          totalJSHeapSize: memoryInfo.totalJSHeapSize,
          jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
        });
      }
    }, 10000); // Check every 10 seconds

    // Initial memory check
    const initialMemory = getMemoryUsagePercentage();
    if (initialMemory !== null) {
      analytics.performance('initial_memory_usage', initialMemory, '%');
    }

    return cleanup;
  }, []);

  return null;
}










