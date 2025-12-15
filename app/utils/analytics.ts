/**
 * Analytics & Monitoring Utility
 * Provides basic analytics tracking and error monitoring
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private maxEvents = 100; // Keep last 100 events in memory

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);

    // Keep only last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, properties);
    }

    // In production, you can send to analytics service
    // Example: sendToAnalyticsService(event);
  }

  /**
   * Track page view
   */
  pageView(path: string, title?: string): void {
    this.track('page_view', {
      path,
      title: title || path,
    });
  }

  /**
   * Track user action
   */
  action(action: string, details?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...details,
    });
  }

  /**
   * Track error
   */
  error(error: Error | string, context?: Record<string, any>): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    this.track('error', {
      message: errorMessage,
      stack: errorStack,
      ...context,
    });

    // Log to console
    console.error('[Analytics Error]', errorMessage, context);
  }

  /**
   * Track performance metric
   */
  performance(metricName: string, value: number, unit: string = 'ms'): void {
    this.track('performance', {
      metric: metricName,
      value,
      unit,
    });
  }

  /**
   * Get all tracked events (for debugging)
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
  }
}

// Singleton instance
export const analytics = new Analytics();

// Auto-track page views
if (typeof window !== 'undefined') {
  // Track initial page load
  analytics.pageView(window.location.pathname, document.title);

  // Track navigation changes (for SPA)
  let lastPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    const currentPath = window.location.pathname;
    if (currentPath !== lastPath) {
      analytics.pageView(currentPath, document.title);
      lastPath = currentPath;
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}





