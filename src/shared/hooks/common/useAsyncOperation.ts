import { useCallback, useState } from 'react';
import { useErrorHandler } from '@/shared/hooks/error/useErrorHandler';
import { useLoadingOrchestrator } from '@/shared/hooks/loading/useLoadingOrchestrator';

/**
 * Async Operation Hook
 * 
 * SOLID/DRY Compliance:
 * - Single Responsibility: Handles async operations with loading and error states
 * - DRY: Eliminates duplicate async operation patterns across components
 * - Interface Segregation: Provides specific interfaces for different operation types
 */

export interface AsyncOperationConfig {
  /** Operation identifier for loading tracking */
  operationId: string;
  /** Context for logging and error handling */
  context: string;
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Whether to show error notifications */
  showErrors?: boolean;
  /** Custom error message */
  errorMessage?: string;
  /** Operation timeout in ms */
  timeout?: number;
  /** Whether to retry on failure */
  enableRetry?: boolean;
  /** Max retry attempts */
  maxRetries?: number;
  /** Retry delay in ms */
  retryDelay?: number;
}

export interface UseAsyncOperationReturn<T = any> {
  loading: boolean;
  error: string | null;
  data: T | null;
  execute: (operation: () => Promise<T>) => Promise<T | undefined>;
  executeWithValidation: (
    operation: () => Promise<T>,
    validator?: (data: T) => boolean,
    errorMessage?: string
  ) => Promise<T | undefined>;
  clearError: () => void;
  setData: (data: T | null) => void;
  reset: () => void;
}

/**
 * Enhanced async operation hook with loading, error handling, and retry logic
 */
export const useAsyncOperation = <T = any>(
  initialData: T | null = null
): UseAsyncOperationReturn<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(initialData);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(initialData);
  }, [initialData]);

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await operation();
        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  const executeWithValidation = useCallback(
    async (
      operation: () => Promise<T>,
      validator?: (data: T) => boolean,
      errorMessage: string = 'Data validation failed'
    ): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await operation();

        if (validator && !validator(result)) {
          throw new Error(errorMessage);
        }

        setData(result);
        setLoading(false);
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'An error occurred';
        setError(errorMsg);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  return {
    loading,
    error,
    data,
    execute,
    executeWithValidation,
    clearError,
    setData,
    reset,
  };
};;

/**
 * Convenience hook for API operations
 */
export const useAsyncApiOperation = <T>(
  operation: () => Promise<T>,
  operationId: string,
  apiContext: string
) => {
  return useAsyncOperation(operation, {
    operationId,
    context: `${apiContext.toUpperCase()}_API`,
    showLoading: true,
    showErrors: true,
    timeout: 30000,
    enableRetry: true,
    maxRetries: 2,
    retryDelay: 1000,
  });
};

/**
 * Convenience hook for form operations
 */
export const useAsyncFormOperation = <T>(
  operation: () => Promise<T>,
  operationId: string,
  formContext: string
) => {
  return useAsyncOperation(operation, {
    operationId,
    context: `${formContext.toUpperCase()}_FORM`,
    showLoading: true,
    showErrors: true,
    errorMessage: 'Form submission failed. Please try again.',
    timeout: 15000,
    enableRetry: false, // Forms usually shouldn't auto-retry
  });
};

/**
 * Convenience hook for background operations (no loading UI)
 */
export const useAsyncBackgroundOperation = <T>(
  operation: () => Promise<T>,
  operationId: string,
  context: string
) => {
  return useAsyncOperation(operation, {
    operationId,
    context: context.toUpperCase(),
    showLoading: false,
    showErrors: false, // Background operations usually fail silently
    timeout: 60000, // Longer timeout for background work
    enableRetry: true,
    maxRetries: 5,
    retryDelay: 2000,
  });
};