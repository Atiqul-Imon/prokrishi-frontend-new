/**
 * Logger utility for Prokrishi frontend
 * 
 * Provides consistent logging with different levels:
 * - debug: Development-only detailed logs
 * - info: General information
 * - warn: Warnings that don't break functionality
 * - error: Errors that need attention
 * 
 * In production, only error and warn are logged.
 * In development, all levels are logged.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';

class LoggerImpl implements Logger {
  private shouldLog(level: LogLevel): boolean {
    if (isDevelopment) {
      return true; // Log everything in development
    }
    // In production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args);
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args);
    }
  }

  error(...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error('[ERROR]', ...args);
    }
  }
}

// Export singleton instance
export const logger = new LoggerImpl();

// Export type for use in other files
export type { Logger };



