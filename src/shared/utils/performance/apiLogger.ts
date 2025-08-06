/**
 * API Logger Utility
 * Conditional logging for API operations based on environment
 *
 * Following CLAUDE.md DRY + SOLID principles:
 * - Single Responsibility: Only handles API logging logic
 * - Open/Closed: Extensible through configuration
 * - DRY: Centralized logging logic to replace scattered console.log statements
 * - Environment-aware: Only logs in development mode
 */

/**
 * Determines if API debug logging is enabled
 * Only enables debug logging in development environment
 */
const isApiLoggingEnabled = (): boolean => {
  return (
    import.meta.env.MODE === 'development' &&
    import.meta.env.VITE_DEBUG_API !== 'false'
  );
};

/**
 * API Logger class for consistent, conditional logging
 * Replaces direct console.log usage in API files
 */
export class ApiLogger {
  private prefix: string;

  constructor(apiName: string) {
    this.prefix = `[${apiName}]`;
  }

  /**
   * Log API call initiation with parameters
   * Only logs in development environment
   */
  logApiCall(methodName: string, params?: any): void {
    if (isApiLoggingEnabled()) {
      console.log(
        `${this.prefix} ${methodName} called${params ? ' with params:' : ''}`,
        params || ''
      );
    }
  }

  /**
   * Log raw API responses
   * Only logs in development environment
   */
  logResponse(methodName: string, response: any): void {
    if (isApiLoggingEnabled()) {
      console.log(`${this.prefix} ${methodName} raw response:`, response);
    }
  }

  /**
   * Log extracted/processed data
   * Only logs in development environment
   */
  logProcessedData(
    methodName: string,
    data: any,
    label: string = 'processed data'
  ): void {
    if (isApiLoggingEnabled()) {
      console.log(`${this.prefix} ${methodName} ${label}:`, data);
    }
  }

  /**
   * Log API errors
   * Always logs errors regardless of environment
   */
  logError(methodName: string, error: any): void {
    console.error(`${this.prefix} ${methodName} error:`, error);
  }

  /**
   * Log warnings
   * Always logs warnings regardless of environment
   */
  logWarning(methodName: string, message: string, data?: any): void {
    console.warn(
      `${this.prefix} ${methodName} warning: ${message}`,
      data || ''
    );
  }

  /**
   * Log performance metrics
   * Only logs in development environment with performance debugging enabled
   */
  logPerformance(
    methodName: string,
    startTime: number,
    endTime?: number
  ): void {
    if (
      isApiLoggingEnabled() &&
      import.meta.env.VITE_DEBUG_PERFORMANCE === 'true'
    ) {
      const duration = (endTime || Date.now()) - startTime;
      console.log(`${this.prefix} ${methodName} completed in ${duration}ms`);
    }
  }
}

/**
 * Factory function to create API loggers
 * Provides consistent logger instances across API files
 */
export const createApiLogger = (apiName: string): ApiLogger => {
  return new ApiLogger(apiName);
};

/**
 * Quick utility functions for direct usage
 * For cases where creating a logger instance is overkill
 */
export const apiLog = {
  debug: (message: string, data?: any) => {
    if (isApiLoggingEnabled()) {
      console.log(`[API DEBUG] ${message}`, data || '');
    }
  },

  error: (message: string, error?: any) => {
    console.error(`[API ERROR] ${message}`, error || '');
  },

  warn: (message: string, data?: any) => {
    console.warn(`[API WARNING] ${message}`, data || '');
  },
};

export default ApiLogger;
