/**
 * Error Classification Utility
 * 
 * SOLID/DRY Compliance:
 * - Single Responsibility: Classifies errors for appropriate handling
 * - Open/Closed: Extensible for new error types without modification
 * - DRY: Centralizes error classification logic
 */

export type ErrorType = 
  | 'network'
  | 'api'
  | 'validation' 
  | 'authentication'
  | 'authorization'
  | 'rate_limit'
  | 'server'
  | 'client'
  | 'unknown';

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ClassifiedError {
  type: ErrorType;
  severity: ErrorSeverity;
  isRetryable: boolean;
  userMessage: string;
  shouldShowToast: boolean;
  shouldLog: boolean;
  metadata: Record<string, any>;
}

export interface ErrorPattern {
  pattern: RegExp | string;
  type: ErrorType;
  severity: ErrorSeverity;
  isRetryable: boolean;
  userMessage: string;
}

/**
 * Predefined error patterns for classification
 */
const ERROR_PATTERNS: ErrorPattern[] = [
  // Network Errors
  {
    pattern: /network|fetch|connection|timeout|cors/i,
    type: 'network',
    severity: 'medium',
    isRetryable: true,
    userMessage: 'Network error. Please check your connection and try again.',
  },
  
  // API Status Code Errors
  {
    pattern: /400|bad request/i,
    type: 'validation',
    severity: 'low',
    isRetryable: false,
    userMessage: 'Invalid request. Please check your input.',
  },
  {
    pattern: /401|unauthorized/i,
    type: 'authentication',
    severity: 'high',
    isRetryable: false,
    userMessage: 'Authentication required. Please log in again.',
  },
  {
    pattern: /403|forbidden/i,
    type: 'authorization',
    severity: 'high',
    isRetryable: false,
    userMessage: 'Access denied. You do not have permission for this action.',
  },
  {
    pattern: /404|not found/i,
    type: 'api',
    severity: 'medium',
    isRetryable: false,
    userMessage: 'The requested resource was not found.',
  },
  {
    pattern: /429|too many requests/i,
    type: 'rate_limit',
    severity: 'medium',
    isRetryable: true,
    userMessage: 'Too many requests. Please wait a moment and try again.',
  },
  {
    pattern: /50[0-9]|server error|internal error/i,
    type: 'server',
    severity: 'high',
    isRetryable: true,
    userMessage: 'Server error. Please try again later.',
  },

  // Validation Errors
  {
    pattern: /validation|invalid|required|format/i,
    type: 'validation',
    severity: 'low',
    isRetryable: false,
    userMessage: 'Please check your input and try again.',
  },

  // Client-side Errors
  {
    pattern: /reference|undefined|null|cannot read/i,
    type: 'client',
    severity: 'high',
    isRetryable: false,
    userMessage: 'An application error occurred. Please refresh the page.',
  },
];

/**
 * Error Classifier Class
 */
export class ErrorClassifier {
  private static instance: ErrorClassifier;
  private customPatterns: ErrorPattern[] = [];

  private constructor() {}

  public static getInstance(): ErrorClassifier {
    if (!ErrorClassifier.instance) {
      ErrorClassifier.instance = new ErrorClassifier();
    }
    return ErrorClassifier.instance;
  }

  /**
   * Add custom error patterns
   */
  public addCustomPattern(pattern: ErrorPattern): void {
    this.customPatterns.push(pattern);
  }

  /**
   * Classify an error based on patterns
   */
  public classify(error: Error | unknown, context?: string): ClassifiedError {
    const errorMessage = this.extractErrorMessage(error);
    const errorStatus = this.extractHttpStatus(error);
    
    // Try custom patterns first
    for (const pattern of this.customPatterns) {
      if (this.matchesPattern(errorMessage, pattern.pattern)) {
        return this.createClassifiedError(pattern, error, context);
      }
    }

    // Try predefined patterns
    for (const pattern of ERROR_PATTERNS) {
      if (this.matchesPattern(errorMessage, pattern.pattern)) {
        return this.createClassifiedError(pattern, error, context);
      }
    }

    // Classify by HTTP status if available
    if (errorStatus) {
      const statusPattern = this.getPatternByStatus(errorStatus);
      if (statusPattern) {
        return this.createClassifiedError(statusPattern, error, context);
      }
    }

    // Default classification
    return this.createDefaultClassification(error, context);
  }

  /**
   * Extract error message from various error types
   */
  private extractErrorMessage(error: Error | unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object') {
      // Try common error properties
      const errorObj = error as any;
      return errorObj.message || 
             errorObj.error || 
             errorObj.msg || 
             errorObj.detail ||
             JSON.stringify(error);
    }
    
    return 'Unknown error';
  }

  /**
   * Extract HTTP status code from error
   */
  private extractHttpStatus(error: Error | unknown): number | null {
    if (error && typeof error === 'object') {
      const errorObj = error as any;
      return errorObj.status || 
             errorObj.statusCode || 
             errorObj.code || 
             null;
    }
    return null;
  }

  /**
   * Check if error message matches pattern
   */
  private matchesPattern(message: string, pattern: RegExp | string): boolean {
    if (pattern instanceof RegExp) {
      return pattern.test(message);
    }
    return message.toLowerCase().includes(pattern.toLowerCase());
  }

  /**
   * Get error pattern by HTTP status code
   */
  private getPatternByStatus(status: number): ErrorPattern | null {
    if (status >= 400 && status < 500) {
      return ERROR_PATTERNS.find(p => p.pattern.toString().includes(status.toString())) || 
             ERROR_PATTERNS.find(p => p.type === 'client');
    }
    
    if (status >= 500) {
      return ERROR_PATTERNS.find(p => p.type === 'server');
    }
    
    return null;
  }

  /**
   * Create classified error object
   */
  private createClassifiedError(
    pattern: ErrorPattern, 
    originalError: Error | unknown, 
    context?: string
  ): ClassifiedError {
    return {
      type: pattern.type,
      severity: pattern.severity,
      isRetryable: pattern.isRetryable,
      userMessage: pattern.userMessage,
      shouldShowToast: this.shouldShowToast(pattern),
      shouldLog: this.shouldLog(pattern),
      metadata: {
        originalError,
        context,
        pattern: pattern.pattern.toString(),
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Create default classification for unmatched errors
   */
  private createDefaultClassification(
    error: Error | unknown, 
    context?: string
  ): ClassifiedError {
    return {
      type: 'unknown',
      severity: 'medium',
      isRetryable: false,
      userMessage: 'An unexpected error occurred. Please try again.',
      shouldShowToast: true,
      shouldLog: true,
      metadata: {
        originalError: error,
        context,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Determine if error should show toast notification
   */
  private shouldShowToast(pattern: ErrorPattern): boolean {
    // Don't show toast for validation errors (usually handled by forms)
    if (pattern.type === 'validation') {
      return false;
    }
    
    // Don't show toast for low severity client errors
    if (pattern.type === 'client' && pattern.severity === 'low') {
      return false;
    }
    
    return true;
  }

  /**
   * Determine if error should be logged
   */
  private shouldLog(pattern: ErrorPattern): boolean {
    // Always log medium severity and above
    if (pattern.severity === 'medium' || pattern.severity === 'high' || pattern.severity === 'critical') {
      return true;
    }
    
    // Log client and server errors even if low severity
    if (pattern.type === 'client' || pattern.type === 'server') {
      return true;
    }
    
    return false;
  }
}

// Singleton instance
export const errorClassifier = ErrorClassifier.getInstance();

/**
 * Convenience function to classify errors
 */
export const classifyError = (error: Error | unknown, context?: string): ClassifiedError => {
  return errorClassifier.classify(error, context);
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error: Error | unknown): boolean => {
  const classified = classifyError(error);
  return classified.isRetryable;
};

/**
 * Get user-friendly message for error
 */
export const getUserErrorMessage = (error: Error | unknown, context?: string): string => {
  const classified = classifyError(error, context);
  return classified.userMessage;
};

/**
 * Predefined error types for common scenarios
 */
export const CommonErrors = {
  NETWORK_ERROR: new Error('Network connection failed'),
  API_ERROR: new Error('API request failed'),
  VALIDATION_ERROR: new Error('Validation failed'),
  UNAUTHORIZED: new Error('401 Unauthorized'),
  FORBIDDEN: new Error('403 Forbidden'),
  NOT_FOUND: new Error('404 Not Found'),
  SERVER_ERROR: new Error('500 Internal Server Error'),
  RATE_LIMITED: new Error('429 Too Many Requests'),
} as const;