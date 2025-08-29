/**
 * Toast Notifications Utility
 * Extracted from errorHandler.ts to separate UI concerns from error handling logic
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles toast notifications
 * - Separation of Concerns: UI logic separate from error handling
 * - DRY: Centralized toast notification styling and behavior
 */

import toast from 'react-hot-toast';

/**
 * Show success toast notification
 * @param message - Success message to display
 * @param options - Optional toast configuration
 */
export const showSuccessToast = (
  message: string,
  options?: Record<string, unknown>
): void => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#F0FDF4',
      border: '1px solid #BBF7D0',
      color: '#16A34A',
    },
    icon: '✅',
    ...options,
  });
};

/**
 * Show info toast notification
 * @param message - Info message to display
 * @param options - Optional toast configuration
 */
export const showInfoToast = (
  message: string,
  options?: Record<string, unknown>
): void => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#EFF6FF',
      border: '1px solid #BFDBFE',
      color: '#2563EB',
    },
    icon: 'ℹ️',
    ...options,
  });
};

/**
 * Show warning toast notification
 * @param message - Warning message to display
 * @param options - Optional toast configuration
 */
export const showWarningToast = (
  message: string,
  options?: Record<string, unknown>
): void => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      color: '#D97706',
    },
    icon: '⚠️',
    ...options,
  });
};

/**
 * Show error toast notification
 * @param message - Error message to display
 * @param options - Optional toast configuration
 */
export const showErrorToast = (
  message: string,
  options?: Record<string, unknown>
): void => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      color: '#DC2626',
    },
    icon: '⚠️',
    ...options,
  });
};

/**
 * Show specialized error toast based on status code
 * @param message - Error message to display
 * @param statusCode - HTTP status code for appropriate styling
 * @param options - Optional toast configuration
 */
export const showStatusErrorToast = (
  message: string,
  statusCode?: number,
  options?: Record<string, unknown>
): void => {
  const baseConfig = {
    duration: 5000,
    position: 'top-right' as const,
    style: {
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      color: '#DC2626',
    },
    ...options,
  };

  if (statusCode && statusCode >= 500) {
    // Server errors
    toast.error(message, {
      ...baseConfig,
      icon: '🚫',
    });
  } else if (statusCode === 401 || statusCode === 403) {
    // Authentication/authorization errors
    toast.error(message, {
      ...baseConfig,
      icon: '🔒',
    });
  } else {
    // General client errors
    toast.error(message, {
      ...baseConfig,
      icon: '⚠️',
    });
  }
};

/**
 * Show storage error toast (specific for storage failures)
 * @param message - Storage error message
 * @param options - Optional toast configuration
 */
export const showStorageErrorToast = (
  message: string = 'Failed to save data locally',
  options?: Record<string, unknown>
): void => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      color: '#DC2626',
    },
    icon: '💾',
    ...options,
  });
};

export default {
  showSuccessToast,
  showInfoToast,
  showWarningToast,
  showErrorToast,
  showStatusErrorToast,
  showStorageErrorToast,
};
/**
 * Centralized Error Logger Utility
 * 
 * SOLID/DRY Compliance:
 * - Single Responsibility: Only handles error logging with context
 * - DRY: Eliminates 50+ scattered console.error patterns
 * - Open/Closed: Extensible for different log levels and outputs
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export type LogContext = string;

export interface ErrorLogEntry {
  level: LogLevel;
  context: LogContext;
  message: string;
  error?: Error | unknown;
  metadata?: Record<string, any>;
  timestamp: string;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private logEntries: ErrorLogEntry[] = [];
  private readonly maxEntries = 1000; // Prevent memory leaks

  private constructor() {}

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with context and metadata
   */
  public logError(
    context: LogContext,
    message: string,
    error?: Error | unknown,
    metadata?: Record<string, any>
  ): void {
    this.log('error', context, message, error, metadata);
  }

  /**
   * Log a warning with context
   */
  public logWarning(
    context: LogContext,
    message: string,
    error?: Error | unknown,
    metadata?: Record<string, any>
  ): void {
    this.log('warn', context, message, error, metadata);
  }

  /**
   * Log info message with context
   */
  public logInfo(
    context: LogContext,
    message: string,
    metadata?: Record<string, any>
  ): void {
    this.log('info', context, message, undefined, metadata);
  }

  /**
   * Core logging method with consistent formatting
   */
  private log(
    level: LogLevel,
    context: LogContext,
    message: string,
    error?: Error | unknown,
    metadata?: Record<string, any>
  ): void {
    const entry: ErrorLogEntry = {
      level,
      context,
      message,
      error,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Store entry for analysis
    this.logEntries.push(entry);
    this.pruneOldEntries();

    // Format console output consistently
    const contextPrefix = `[${context.toUpperCase()}]`;
    const fullMessage = `${contextPrefix} ${message}`;

    switch (level) {
      case 'error':
        if (error) {
          console.error(fullMessage, error, metadata);
        } else {
          console.error(fullMessage, metadata);
        }
        break;
      case 'warn':
        if (error) {
          console.warn(fullMessage, error, metadata);
        } else {
          console.warn(fullMessage, metadata);
        }
        break;
      case 'info':
        console.info(fullMessage, metadata);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(fullMessage, metadata);
        }
        break;
    }
  }

  /**
   * Get recent log entries for debugging
   */
  public getRecentLogs(limit: number = 50): ErrorLogEntry[] {
    return this.logEntries.slice(-limit);
  }

  /**
   * Clear all log entries
   */
  public clearLogs(): void {
    this.logEntries = [];
  }

  /**
   * Prevent memory leaks by limiting stored entries
   */
  private pruneOldEntries(): void {
    if (this.logEntries.length > this.maxEntries) {
      this.logEntries = this.logEntries.slice(-this.maxEntries);
    }
  }
}

// Singleton instance
export const errorLogger = ErrorLogger.getInstance();

/**
 * Convenience functions for common logging patterns
 */
export const logError = (
  context: LogContext,
  message: string,
  error?: Error | unknown,
  metadata?: Record<string, any>
) => errorLogger.logError(context, message, error, metadata);

export const logWarning = (
  context: LogContext,
  message: string,
  error?: Error | unknown,
  metadata?: Record<string, any>
) => errorLogger.logWarning(context, message, error, metadata);

export const logInfo = (
  context: LogContext,
  message: string,
  metadata?: Record<string, any>
) => errorLogger.logInfo(context, message, metadata);
