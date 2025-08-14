import { error as logError, log } from '../performance/logger';
import { APIResponse } from './responseTransformer';
import {
  showErrorToast,
  showStatusErrorToast,
  showWarningToast,
} from '../../components/organisms/ui/toastNotifications';

/**
 * Standard API Error class for new API format
 * Stores structured error information for better debugging and error handling
 */
export class APIError extends Error {
  public statusCode?: number;
  public details?: any;
  public apiResponse?: APIResponse<any>;
  public timestamp: string;

  constructor(
    message: string,
    statusCode?: number,
    details?: any,
    apiResponse?: APIResponse<any>
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
    this.apiResponse = apiResponse;
    this.timestamp = new Date().toISOString();

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, APIError.prototype);
  }

  /**
   * Get formatted error message for display
   */
  getDisplayMessage(): string {
    return this.message || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Get detailed error information for debugging
   */
  getDebugInfo(): Record<string, any> {
    return {
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      apiResponse: this.apiResponse,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Check if error is from API response (Axios error with response data)
 */
const isApiResponseError = (error: any): boolean => {
  return (
    error &&
    typeof error === 'object' &&
    error.response &&
    error.response.data &&
    typeof error.response.data === 'object'
  );
};

/**
 * Validate that error response follows new API format
 */
const isValidApiErrorResponse = (responseData: any): boolean => {
  return (
    responseData &&
    typeof responseData === 'object' &&
    'success' in responseData &&
    'status' in responseData &&
    'meta' in responseData
  );
};

/**
 * Standard global error handler for API errors - NEW FORMAT ONLY
 * Simplified to handle only the new standardized API format
 * @param error - The error object (typically from Axios or transformApiResponse)
 * @param userMessage - Optional user-friendly message to display
 */
export const handleApiError = (error: unknown, userMessage?: string): void => {
  let displayMessage =
    userMessage || 'An unexpected error occurred. Please try again.';
  let apiError: APIError | null = null;

  // Handle APIError instances (thrown by transformApiResponse)
  if (error instanceof APIError) {
    apiError = error;
    displayMessage = error.getDisplayMessage();
    logError('API Error:', error.getDebugInfo());
  }
  // Handle API response errors (from axios responses with new format)
  else if (isApiResponseError(error)) {
    const axiosError = error as any;
    const responseData = axiosError.response.data;

    // Validate response format
    if (isValidApiErrorResponse(responseData)) {
      apiError = new APIError(
        responseData.message || displayMessage,
        axiosError.response?.status,
        responseData.details,
        responseData
      );
      displayMessage = responseData.message || displayMessage;
      logError('API Response Error:', {
        message: responseData.message,
        status: responseData.status,
        details: responseData.details,
        meta: responseData.meta,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Invalid response format
      apiError = new APIError(
        'Invalid API response format received',
        axiosError.response?.status || 500,
        { invalidResponse: responseData },
        responseData
      );
      logError('Invalid API Response Format:', {
        statusCode: axiosError.response?.status,
        receivedData: responseData,
        timestamp: new Date().toISOString(),
      });
    }
  }
  // Handle legacy API format errors (backward compatibility)
  else if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    const response = err.response as Record<string, unknown> | undefined;
    const data = response?.data as Record<string, unknown> | undefined;

    // Check for network errors specifically
    if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
      displayMessage = 'Unable to connect to the server. Please check if the backend is running.';
      apiError = new APIError(
        displayMessage,
        0,
        { networkError: true, originalMessage: err.message },
        undefined
      );
      
      // Don't spam console with network errors - log once per session
      if (!sessionStorage.getItem('network-error-logged')) {
        logError('Network Error: Backend not accessible');
        sessionStorage.setItem('network-error-logged', 'true');
      }
      return; // Skip toast notification for network errors
    }

    if (data?.message && typeof data.message === 'string') {
      displayMessage = data.message;
    } else if (err.message && typeof err.message === 'string') {
      displayMessage = err.message;
    }

    // Create APIError for consistent error handling
    apiError = new APIError(
      displayMessage,
      response?.status as number,
      data,
      data as any
    );

    logError('API Error:', apiError.getDebugInfo());
  }
  // Handle other error types
  else {
    logError('General Error:', error);
    apiError = new APIError(displayMessage);
  }

  // Use toast notification for better user experience
  showErrorToast(displayMessage);

  // Store the last error for debugging purposes
  if (typeof window !== 'undefined') {
    (window as any).__lastApiError = apiError;
  }
};

/**
 * Get the last API error for debugging purposes
 * Useful for developers to inspect error details in browser console
 */
export const getLastApiError = (): APIError | null => {
  if (typeof window !== 'undefined') {
    return (window as any).__lastApiError || null;
  }
  return null;
};

/**
 * Standard error handler specifically for new API format errors
 * Can be used when you need more control over error processing
 */
export const handleEnhancedApiError = (
  error: APIError,
  customMessage?: string
): void => {
  const displayMessage = customMessage || error.getDisplayMessage();

  // Log detailed error information
  logError('Standard API Error Details:', error.getDebugInfo());

  // Show appropriate toast based on error status
  showStatusErrorToast(displayMessage, error.statusCode);

  // Store for debugging
  if (typeof window !== 'undefined') {
    (window as any).__lastApiError = error;
  }
};

/**
 * Enhanced Error Types for comprehensive error handling
 * Following CLAUDE.md principles: Single Responsibility, DRY, Reusability
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  API = 'api',
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  USER_INPUT = 'user_input',
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  additionalInfo?: Record<string, unknown>;
}

/**
 * Enhanced Application Error class
 * Replaces direct Error usage throughout the application
 */
export class ApplicationError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;
  public readonly statusCode?: number;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    context: ErrorContext = {},
    recoverable: boolean = true,
    statusCode?: number,
    details?: any
  ) {
    super(message);
    this.name = 'ApplicationError';
    this.severity = severity;
    this.category = category;
    this.context = { ...context, timestamp: new Date().toISOString() };
    this.recoverable = recoverable;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }

  /**
   * Get user-friendly error message based on category and severity
   */
  getUserMessage(): string {
    const baseMessages = {
      [ErrorCategory.API]: 'Unable to connect to the server. Please try again.',
      [ErrorCategory.NETWORK]:
        'Network connection issue. Please check your internet connection.',
      [ErrorCategory.AUTHENTICATION]:
        'Authentication failed. Please log in again.',
      [ErrorCategory.AUTHORIZATION]:
        'You do not have permission to perform this action.',
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.BUSINESS_LOGIC]:
        'Operation cannot be completed due to business rules.',
      [ErrorCategory.USER_INPUT]:
        'Please correct the highlighted fields and try again.',
      [ErrorCategory.SYSTEM]: 'An unexpected error occurred. Please try again.',
    };

    return baseMessages[this.category] || this.message;
  }

  /**
   * Get detailed error information for debugging
   */
  getDebugInfo(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      severity: this.severity,
      category: this.category,
      context: this.context,
      recoverable: this.recoverable,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Check if error should trigger automatic recovery
   */
  shouldAutoRecover(): boolean {
    return this.recoverable && this.severity === ErrorSeverity.LOW;
  }

  /**
   * Check if error requires immediate user notification
   */
  requiresUserNotification(): boolean {
    return this.severity >= ErrorSeverity.MEDIUM;
  }
}

/**
 * Factory functions for creating standardized errors
 * Replaces direct "throw new Error()" usage throughout application
 */
export const createError = {
  api: (
    message: string,
    statusCode?: number,
    context: ErrorContext = {},
    details?: any
  ): ApplicationError =>
    new ApplicationError(
      message,
      ErrorSeverity.MEDIUM,
      ErrorCategory.API,
      context,
      true,
      statusCode,
      details
    ),

  validation: (
    message: string,
    context: ErrorContext = {},
    details?: any
  ): ApplicationError =>
    new ApplicationError(
      message,
      ErrorSeverity.LOW,
      ErrorCategory.VALIDATION,
      context,
      true,
      undefined,
      details
    ),

  network: (
    message: string = 'Network error occurred',
    context: ErrorContext = {}
  ): ApplicationError =>
    new ApplicationError(
      message,
      ErrorSeverity.HIGH,
      ErrorCategory.NETWORK,
      context,
      true
    ),

  auth: (
    message: string = 'Authentication failed',
    context: ErrorContext = {}
  ): ApplicationError =>
    new ApplicationError(
      message,
      ErrorSeverity.HIGH,
      ErrorCategory.AUTHENTICATION,
      context,
      false,
      401
    ),

  authorization: (
    message: string = 'Access denied',
    context: ErrorContext = {}
  ): ApplicationError =>
    new ApplicationError(
      message,
      ErrorSeverity.HIGH,
      ErrorCategory.AUTHORIZATION,
      context,
      false,
      403
    ),

  businessLogic: (
    message: string,
    context: ErrorContext = {},
    details?: any
  ): ApplicationError =>
    new ApplicationError(
      message,
      ErrorSeverity.MEDIUM,
      ErrorCategory.BUSINESS_LOGIC,
      context,
      true,
      undefined,
      details
    ),

  userInput: (
    message: string,
    context: ErrorContext = {},
    details?: any
  ): ApplicationError =>
    new ApplicationError(
      message,
      ErrorSeverity.LOW,
      ErrorCategory.USER_INPUT,
      context,
      true,
      undefined,
      details
    ),

  system: (
    message: string,
    context: ErrorContext = {},
    recoverable: boolean = false
  ): ApplicationError =>
    new ApplicationError(
      message,
      ErrorSeverity.CRITICAL,
      ErrorCategory.SYSTEM,
      context,
      recoverable
    ),
};

/**
 * Enhanced Error Handler - Centralized error processing
 * Replaces direct throw new Error() usage throughout the application
 */
export const handleError = (
  error: unknown,
  context: ErrorContext = {},
  userMessage?: string
): ApplicationError => {
  let processedError: ApplicationError;

  // Handle ApplicationError instances
  if (error instanceof ApplicationError) {
    processedError = error;
    // Merge additional context if provided
    if (Object.keys(context).length > 0) {
      processedError.context = { ...processedError.context, ...context };
    }
  }
  // Handle APIError instances (backward compatibility)
  else if (error instanceof APIError) {
    processedError = createError.api(
      error.message,
      error.statusCode,
      context,
      error.details
    );
  }
  // Handle API response errors
  else if (isApiResponseError(error)) {
    const axiosError = error as any;
    const responseData = axiosError.response.data;

    processedError = createError.api(
      responseData?.message || 'API request failed',
      axiosError.response?.status,
      context,
      responseData
    );
  }
  // Handle standard Error instances
  else if (error instanceof Error) {
    processedError = createError.system(error.message, context, true);
  }
  // Handle unknown error types
  else {
    processedError = createError.system(
      typeof error === 'string' ? error : 'An unknown error occurred',
      context,
      false
    );
  }

  // Log error based on severity
  const debugInfo = processedError.getDebugInfo();
  switch (processedError.severity) {
    case ErrorSeverity.CRITICAL:
      logError('CRITICAL ERROR:', debugInfo);
      break;
    case ErrorSeverity.HIGH:
      logError('HIGH SEVERITY ERROR:', debugInfo);
      break;
    case ErrorSeverity.MEDIUM:
      log('MEDIUM SEVERITY ERROR:', debugInfo);
      break;
    case ErrorSeverity.LOW:
      log('LOW SEVERITY ERROR:', debugInfo);
      break;
  }

  // Show user notification if required
  if (processedError.requiresUserNotification()) {
    const displayMessage = userMessage || processedError.getUserMessage();

    if (
      processedError.severity === ErrorSeverity.CRITICAL ||
      processedError.severity === ErrorSeverity.HIGH
    ) {
      showErrorToast(displayMessage);
    } else if (processedError.severity === ErrorSeverity.MEDIUM) {
      showWarningToast(displayMessage);
    }
  }

  // Store for debugging and ErrorBoundary integration
  if (typeof window !== 'undefined') {
    (window as any).__lastApplicationError = processedError;
  }

  return processedError;
};

/**
 * Convenience function to throw standardized errors
 * Replaces direct "throw new Error()" usage
 */
export const throwError = (
  message: string,
  category: ErrorCategory = ErrorCategory.SYSTEM,
  severity: ErrorSeverity = ErrorSeverity.MEDIUM,
  context: ErrorContext = {},
  recoverable: boolean = true
): never => {
  const error = new ApplicationError(
    message,
    severity,
    category,
    context,
    recoverable
  );
  const processedError = handleError(error, context);
  throw processedError;
};

/**
 * Safe execution wrapper with error handling
 * Replaces try-catch blocks throughout the application
 */
export const safeExecute = async <T>(
  operation: () => Promise<T> | T,
  context: ErrorContext = {},
  fallbackValue?: T
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    const processedError = handleError(error, context);

    if (processedError.shouldAutoRecover() && fallbackValue !== undefined) {
      log('Auto-recovering from error with fallback value:', {
        error: processedError.getDebugInfo(),
        fallbackValue,
      });
      return fallbackValue;
    }

    // Re-throw if not recoverable or no fallback
    throw processedError;
  }
};

/**
 * Get the last application error for debugging
 */
export const getLastApplicationError = (): ApplicationError | null => {
  if (typeof window !== 'undefined') {
    return (window as any).__lastApplicationError || null;
  }
  return null;
};

/**
 * Clear stored error information
 */
export const clearLastError = (): void => {
  if (typeof window !== 'undefined') {
    delete (window as any).__lastApplicationError;
    delete (window as any).__lastApiError;
  }
};

// Toast notification functions moved to ../ui/toastNotifications.ts
// Import them from there: showSuccessToast, showInfoToast, showWarningToast, showErrorToast
