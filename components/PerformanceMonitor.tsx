"use client";

import { useEffect } from "react";
import { performanceMonitor } from "@/app/utils/performance";
import { analytics } from "@/app/utils/analytics";

export default function PerformanceMonitor() {
  useEffect(() => {
    // Measure page load performance
    const measurePerformance = () => {
      // Wait for page to fully load
      if (document.readyState === 'complete') {
        const pageMetrics = performanceMonitor.measurePageLoad();
        const webVitals = performanceMonitor.getWebVitals();

        // Log to analytics
        if (webVitals.fcp) {
          analytics.performance('first_contentful_paint', webVitals.fcp);
        }
        if (webVitals.ttfb) {
          analytics.performance('time_to_first_byte', webVitals.ttfb);
        }

        // Log total load time
        const totalLoadTime = pageMetrics.find((m) => m.name === 'Total Load Time');
        if (totalLoadTime) {
          analytics.performance('total_load_time', totalLoadTime.value);
        }

        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.log('[Performance Metrics]', {
            pageMetrics,
            webVitals,
          });
        }
      }
    };

    // Measure on load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Observe long tasks
    const cleanupLongTasks = performanceMonitor.observeLongTasks((task) => {
      analytics.performance('long_task', task.duration, 'ms');
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Performance] Long task detected:', task.duration, 'ms');
      }
    });

    // Observe layout shifts
    const cleanupLayoutShifts = performanceMonitor.observeLayoutShifts((shift: any) => {
      analytics.performance('layout_shift', shift.value);
      if (process.env.NODE_ENV === 'development' && shift.value > 0.1) {
        console.warn('[Performance] Layout shift detected:', shift.value);
      }
    });

    // Observe first input delay
    const cleanupFirstInput = performanceMonitor.observeFirstInput((input: any) => {
      analytics.performance('first_input_delay', input.processingStart - input.startTime);
      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance] First input delay:', input.processingStart - input.startTime, 'ms');
      }
    });

    return () => {
      cleanupLongTasks();
      cleanupLayoutShifts();
      cleanupFirstInput();
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  return null;
}

