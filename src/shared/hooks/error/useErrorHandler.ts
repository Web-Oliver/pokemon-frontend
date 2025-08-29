import { useCallback, useMemo } from 'react';
import { logError, logWarning, type LogContext } from '@/shared/components/organisms/ui/toastNotifications';
import { 
  showErrorToast, 
  showWarningToast, 
  showStatusErrorToast 
} from '@/shared/components/organisms/ui/toastNotifications';

/**
 * Enhanced Error Handler Hook
 * 
 * SOLID/DRY Compliance:
 * - Single Responsibility: Handles error processing, logging, and user feedback
 * - DRY: Eliminates duplicate error handling patterns across components
 * - Interface Segregation: Provides specific error handling methods for different contexts
 */

export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ErrorCategory = 'user' | 'system' | 'network' | 'validation';

export interface ErrorContext {
  /** Component or operation context */
  context: LogContext;
  /** Error severity level */
  severity?: ErrorSeverity;
  /** Error category for classification */
  category?: ErrorCategory;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Whether to show user notification */
  showToast?: boolean;
  /** Custom toast message (overrides default) */
  toastMessage?: string;
  /** Whether to log to console */
  logToConsole?: boolean;
}

export interface UseErrorHandlerConfig {
  /** Default context for all errors */
  defaultContext: LogContext;
  /** Default error severity */
  defaultSeverity?: ErrorSeverity;
  /** Whether to show toasts by default */
  showToastsDefault?: boolean;
  /** Whether to log to console by default */
  logToConsoleDefault?: boolean;
}

export interface UseErrorHandlerReturn {
  /** Handle any error with full context */
  handleError: (error: Error | unknown, context?: Partial<ErrorContext>) => void;
  /** Handle user-facing errors (validation, input, etc.) */
  handleUserError: (message: string, error?: Error | unknown, context?: Partial<ErrorContext>) => void;
  /** Handle system errors (API, internal logic, etc.) */
  handleSystemError: (error: Error | unknown, context?: Partial<ErrorContext>) => void;
  /** Handle network/API errors */
  handleNetworkError: (error: Error | unknown, context?: Partial<ErrorContext>) => void;
  /** Handle validation errors */
  handleValidationError: (message: string, field?: string, context?: Partial<ErrorContext>) => void;
  /** Create error handler for async operations */
  createAsyncErrorHandler: <T>(
    operation: () => Promise<T>,
    context?: Partial<ErrorContext>
  ) => () => Promise<T | undefined>;
}

/**
 * Centralized error handler hook
 * Replaces scattered try-catch blocks throughout the application
 */
export const useErrorHandler = (config: UseErrorHandlerConfig): UseErrorHandlerReturn => {
  const {
    defaultContext,
    defaultSeverity = 'medium',
    showToastsDefault = true,
    logToConsoleDefault = true,
  } = config;

  /**
   * Core error processing function
   */
  const processError = useCallback(
    (error: Error | unknown, context: Partial<ErrorContext> = {}) => {
      const errorContext: Required<ErrorContext> = {
        context: context.context || defaultContext,
        severity: context.severity || defaultSeverity,
        category: context.category || 'system',
        metadata: context.metadata || {},
        showToast: context.showToast ?? showToastsDefault,
        toastMessage: context.toastMessage || '',
        logToConsole: context.logToConsole ?? logToConsoleDefault,
      };

      // Extract error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'Unknown error occurred';

      // Log error if requested
      if (errorContext.logToConsole) {
        if (errorContext.severity === 'critical' || errorContext.severity === 'high') {
          logError(
            errorContext.context,
            errorMessage,
            error,
            {
              severity: errorContext.severity,
              category: errorContext.category,
              ...errorContext.metadata,
            }
          );
        } else {
          logWarning(
            errorContext.context,
            errorMessage,
            error,
            {
              severity: errorContext.severity,
              category: errorContext.category,
              ...errorContext.metadata,
            }
          );
        }
      }

      // Show user notification if requested
      if (errorContext.showToast) {
        const toastMessage = errorContext.toastMessage || getDefaultToastMessage(errorContext);
        
        if (errorContext.severity === 'critical' || errorContext.severity === 'high') {
          showErrorToast(toastMessage);
        } else {
          showWarningToast(toastMessage);
        }
      }

      return {
        error,
        context: errorContext,
        message: errorMessage,
      };
    },
    [defaultContext, defaultSeverity, showToastsDefault, logToConsoleDefault]
  );

  /**
   * General error handler
   */
  const handleError = useCallback(
    (error: Error | unknown, context: Partial<ErrorContext> = {}) => {
      processError(error, context);
    },
    [processError]
  );

  /**
   * Handle user-facing errors (validation, input, etc.)
   */
  const handleUserError = useCallback(
    (message: string, error?: Error | unknown, context: Partial<ErrorContext> = {}) => {
      processError(error || new Error(message), {
        ...context,
        category: 'user',
        severity: context.severity || 'low',
        toastMessage: context.toastMessage || message,
      });
    },
    [processError]
  );

  /**
   * Handle system errors (API, internal logic, etc.)
   */
  const handleSystemError = useCallback(
    (error: Error | unknown, context: Partial<ErrorContext> = {}) => {
      processError(error, {
        ...context,
        category: 'system',
        severity: context.severity || 'high',
      });
    },
    [processError]
  );

  /**
   * Handle network/API errors
   */
  const handleNetworkError = useCallback(
    (error: Error | unknown, context: Partial<ErrorContext> = {}) => {
      processError(error, {
        ...context,
        category: 'network',
        severity: context.severity || 'medium',
        toastMessage: context.toastMessage || 'Network error occurred. Please try again.',
      });
    },
    [processError]
  );

  /**
   * Handle validation errors
   */
  const handleValidationError = useCallback(
    (message: string, field?: string, context: Partial<ErrorContext> = {}) => {
      processError(new Error(message), {
        ...context,
        category: 'validation',
        severity: context.severity || 'low',
        metadata: { ...context.metadata, field },
        toastMessage: context.toastMessage || message,
      });
    },
    [processError]
  );

  /**
   * Create wrapped async operation with error handling
   */
  const createAsyncErrorHandler = useCallback(
    <T>(
      operation: () => Promise<T>,
      context: Partial<ErrorContext> = {}
    ) => {
      return async (): Promise<T | undefined> => {
        try {
          return await operation();
        } catch (error) {
          handleError(error, context);
          return undefined;
        }
      };
    },
    [handleError]
  );

  return useMemo(
    () => ({
      handleError,
      handleUserError,
      handleSystemError,
      handleNetworkError,
      handleValidationError,
      createAsyncErrorHandler,
    }),
    [
      handleError,
      handleUserError,
      handleSystemError,
      handleNetworkError,
      handleValidationError,
      createAsyncErrorHandler,
    ]
  );
};

/**
 * Get default toast message based on error context
 */
function getDefaultToastMessage(context: Required<ErrorContext>): string {
  switch (context.category) {
    case 'user':
      return 'Please check your input and try again.';
    case 'network':
      return 'Network error occurred. Please check your connection.';
    case 'validation':
      return 'Please fix the validation errors and try again.';
    case 'system':
    default:
      return context.severity === 'critical' || context.severity === 'high'
        ? 'A system error occurred. Please try again or contact support.'
        : 'Something went wrong. Please try again.';
  }
}

/**
 * Convenience hook for form error handling
 */
export const useFormErrorHandler = (formContext: string) => {
  return useErrorHandler({
    defaultContext: `${formContext}_FORM`,
    defaultSeverity: 'medium',
    showToastsDefault: true,
    logToConsoleDefault: true,
  });
};

/**
 * Convenience hook for API error handling
 */
export const useApiErrorHandler = (apiContext: string) => {
  return useErrorHandler({
    defaultContext: `${apiContext}_API`,
    defaultSeverity: 'high',
    showToastsDefault: true,
    logToConsoleDefault: true,
  });
};