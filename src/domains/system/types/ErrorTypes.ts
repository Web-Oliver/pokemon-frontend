/**
 * Enhanced Error Handling System - Mirrors Backend Error Architecture
 * Aligns with pokemon-collection-backend error categories and severity levels
 */

// Error Categories matching backend exactly
export const ErrorCategories = {
  DATABASE: 'DATABASE',
  VALIDATION: 'VALIDATION',
  OCR_PROCESSING: 'OCR_PROCESSING',
  EXTERNAL_API: 'EXTERNAL_API',
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  SYSTEM: 'SYSTEM'
} as const;

export type ErrorCategory = keyof typeof ErrorCategories;

// Error Severity levels matching backend
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export type ErrorSeverityLevel = typeof ErrorSeverity[keyof typeof ErrorSeverity];

// API Error interface matching backend RFC 7807 Problem Details format
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverityLevel;
    context?: Record<string, any>;
  };
}

// Error Type definition for centralized error catalog
export interface ErrorType {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverityLevel;
  httpStatus: number;
}

// Centralized Error Catalog matching backend error types
export const ERROR_TYPES: Record<string, ErrorType> = {
  // Validation Errors
  DBA_NO_ITEMS: {
    code: 'DBA_NO_ITEMS',
    message: 'No items provided for DBA export',
    category: ErrorCategories.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    httpStatus: 400
  },
  INVALID_PAGINATION: {
    code: 'INVALID_PAGINATION',
    message: 'Invalid pagination parameters',
    category: ErrorCategories.VALIDATION,
    severity: ErrorSeverity.LOW,
    httpStatus: 400
  },
  
  // OCR Processing Errors
  OCR_PROCESSING_TIMEOUT: {
    code: 'OCR_PROCESSING_TIMEOUT',
    message: 'OCR processing timeout',
    category: ErrorCategories.OCR_PROCESSING,
    severity: ErrorSeverity.MEDIUM,
    httpStatus: 408
  },
  OCR_EXTRACTION_FAILED: {
    code: 'OCR_EXTRACTION_FAILED',
    message: 'Failed to extract text from image',
    category: ErrorCategories.OCR_PROCESSING,
    severity: ErrorSeverity.HIGH,
    httpStatus: 422
  },
  OCR_MATCHING_FAILED: {
    code: 'OCR_MATCHING_FAILED',
    message: 'Failed to match extracted text to cards',
    category: ErrorCategories.OCR_PROCESSING,
    severity: ErrorSeverity.MEDIUM,
    httpStatus: 422
  },
  
  // Database Errors
  DATABASE_CONNECTION_FAILED: {
    code: 'DATABASE_CONNECTION_FAILED',
    message: 'Database connection failed',
    category: ErrorCategories.DATABASE,
    severity: ErrorSeverity.CRITICAL,
    httpStatus: 503
  },
  ENTITY_NOT_FOUND: {
    code: 'ENTITY_NOT_FOUND',
    message: 'Entity not found',
    category: ErrorCategories.DATABASE,
    severity: ErrorSeverity.MEDIUM,
    httpStatus: 404
  },
  
  // Network/API Errors
  NETWORK_TIMEOUT: {
    code: 'NETWORK_TIMEOUT',
    message: 'Network request timeout',
    category: ErrorCategories.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    httpStatus: 408
  },
  EXTERNAL_API_ERROR: {
    code: 'EXTERNAL_API_ERROR',
    message: 'External API error',
    category: ErrorCategories.EXTERNAL_API,
    severity: ErrorSeverity.HIGH,
    httpStatus: 502
  },
  
  // Authentication/Authorization Errors
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
    category: ErrorCategories.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    httpStatus: 401
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: 'Insufficient permissions',
    category: ErrorCategories.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    httpStatus: 403
  },
  
  // System Errors
  SYSTEM_ERROR: {
    code: 'SYSTEM_ERROR',
    message: 'Internal system error',
    category: ErrorCategories.SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    httpStatus: 500
  }
};

// Enhanced Error class for frontend error handling
export class PokemonCollectionError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverityLevel;
  public readonly httpStatus: number;
  public readonly context?: Record<string, any>;
  public readonly timestamp: string;

  constructor(
    errorType: ErrorType,
    context?: Record<string, any>,
    originalError?: Error
  ) {
    super(errorType.message);
    this.name = 'PokemonCollectionError';
    this.code = errorType.code;
    this.category = errorType.category;
    this.severity = errorType.severity;
    this.httpStatus = errorType.httpStatus;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    // Preserve original error stack if available
    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
  }

  // Convert to API error format
  toApiError(): ApiError {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        category: this.category,
        severity: this.severity,
        context: this.context
      }
    };
  }

  // Check if error is critical
  isCritical(): boolean {
    return this.severity === ErrorSeverity.CRITICAL;
  }

  // Check if error should be retried
  isRetryable(): boolean {
    return [
      ErrorCategories.NETWORK,
      ErrorCategories.EXTERNAL_API
    ].includes(this.category) && 
    this.severity !== ErrorSeverity.CRITICAL;
  }
}