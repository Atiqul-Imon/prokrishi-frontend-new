/**
 * Performance Monitoring Utilities
 * Tools for measuring and tracking performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  /**
   * Measure page load performance
   */
  measurePageLoad(): PerformanceMetric[] {
    if (typeof window === 'undefined' || !window.performance) {
      return [];
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return [];

    const metrics: PerformanceMetric[] = [
      {
        name: 'DNS Lookup',
        value: navigation.domainLookupEnd - navigation.domainLookupStart,
        unit: 'ms',
        timestamp: Date.now(),
      },
      {
        name: 'TCP Connection',
        value: navigation.connectEnd - navigation.connectStart,
        unit: 'ms',
        timestamp: Date.now(),
      },
      {
        name: 'TLS Negotiation',
        value: navigation.secureConnectionStart
          ? navigation.connectEnd - navigation.secureConnectionStart
          : 0,
        unit: 'ms',
        timestamp: Date.now(),
      },
      {
        name: 'Time to First Byte (TTFB)',
        value: navigation.responseStart - navigation.requestStart,
        unit: 'ms',
        timestamp: Date.now(),
      },
      {
        name: 'Content Download',
        value: navigation.responseEnd - navigation.responseStart,
        unit: 'ms',
        timestamp: Date.now(),
      },
      {
        name: 'DOM Processing',
        value: navigation.domInteractive - navigation.responseEnd,
        unit: 'ms',
        timestamp: Date.now(),
      },
      {
        name: 'DOM Content Loaded',
        value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        unit: 'ms',
        timestamp: Date.now(),
      },
      {
        name: 'Page Load',
        value: navigation.loadEventEnd - navigation.loadEventStart,
        unit: 'ms',
        timestamp: Date.now(),
      },
      {
        name: 'Total Load Time',
        value: navigation.loadEventEnd - navigation.fetchStart,
        unit: 'ms',
        timestamp: Date.now(),
      },
    ];

    this.metrics.push(...metrics);
    return metrics;
  }

  /**
   * Measure resource loading performance
   */
  measureResources(): PerformanceMetric[] {
    if (typeof window === 'undefined' || !window.performance) {
      return [];
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const metrics: PerformanceMetric[] = resources.map((resource) => ({
      name: resource.name,
      value: resource.duration,
      unit: 'ms',
      timestamp: Date.now(),
    }));

    this.metrics.push(...metrics);
    return metrics;
  }

  /**
   * Measure Long Tasks (blocking operations)
   */
  observeLongTasks(callback: (task: PerformanceEntry) => void): () => void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return () => {};
    }

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          callback(entry);
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);

      return () => {
        observer.disconnect();
        const index = this.observers.indexOf(observer);
        if (index > -1) {
          this.observers.splice(index, 1);
        }
      };
    } catch (error) {
      console.warn('Long task observation not supported:', error);
      return () => {};
    }
  }

  /**
   * Measure Layout Shifts (CLS - Cumulative Layout Shift)
   */
  observeLayoutShifts(callback: (shift: PerformanceEntry) => void): () => void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return () => {};
    }

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            callback(entry);
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);

      return () => {
        observer.disconnect();
        const index = this.observers.indexOf(observer);
        if (index > -1) {
          this.observers.splice(index, 1);
        }
      };
    } catch (error) {
      console.warn('Layout shift observation not supported:', error);
      return () => {};
    }
  }

  /**
   * Measure First Input Delay (FID)
   */
  observeFirstInput(callback: (input: PerformanceEntry) => void): () => void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return () => {};
    }

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          callback(entry);
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);

      return () => {
        observer.disconnect();
        const index = this.observers.indexOf(observer);
        if (index > -1) {
          this.observers.splice(index, 1);
        }
      };
    } catch (error) {
      console.warn('First input observation not supported:', error);
      return () => {};
    }
  }

  /**
   * Get Web Vitals metrics
   */
  getWebVitals(): {
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  } {
    if (typeof window === 'undefined' || !window.performance) {
      return {};
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint') as PerformancePaintTiming[];

    const fcp = paint.find((entry) => entry.name === 'first-contentful-paint')?.startTime;
    const ttfb = navigation ? navigation.responseStart - navigation.requestStart : undefined;

    return {
      fcp,
      ttfb,
    };
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Measure function execution time
 */
export function measureFunction<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  performanceMonitor.getMetrics().push({
    name,
    value: duration,
    unit: 'ms',
    timestamp: Date.now(),
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }

  return result;
}

/**
 * Measure async function execution time
 */
export async function measureAsyncFunction<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  performanceMonitor.getMetrics().push({
    name,
    value: duration,
    unit: 'ms',
    timestamp: Date.now(),
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }

  return result;
}




