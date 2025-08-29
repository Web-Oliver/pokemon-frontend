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

export interface UseAsyncOperationReturn<T> {
  /** Execute the async operation */
  execute: () => Promise<T | undefined>;
  /** Current loading state */
  isLoading: boolean;
  /** Last error if any */
  error: Error | null;
  /** Last successful result */
  result: T | null;
  /** Retry the last operation */
  retry: () => Promise<T | undefined>;
  /** Clear error state */
  clearError: () => void;
  /** Clear result state */
  clearResult: () => void;
  /** Reset all states */
  reset: () => void;
}

/**
 * Enhanced async operation hook with loading, error handling, and retry logic
 */
export const useAsyncOperation = <T>(
  operation: () => Promise<T>,
  config: AsyncOperationConfig
): UseAsyncOperationReturn<T> => {
  const {
    operationId,
    context,
    showLoading = true,
    showErrors = true,
    errorMessage,
    timeout = 30000,
    enableRetry = false,
    maxRetries = 3,
    retryDelay = 1000,
  } = config;

  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const errorHandler = useErrorHandler({
    defaultContext: context,
    showToastsDefault: showErrors,
  });

  const loadingOrchestrator = useLoadingOrchestrator({
    defaultContext: context,
    globalTimeout: timeout,
  });

  const isLoading = showLoading ? loadingOrchestrator.isLoading(operationId) : false;

  /**
   * Execute the async operation with full error handling and loading state
   */
  const executeOperation = useCallback(
    async (isRetry = false): Promise<T | undefined> => {
      // Clear previous error if not a retry
      if (!isRetry) {
        setError(null);
        setRetryCount(0);
      }

      // Start loading state
      if (showLoading) {
        loadingOrchestrator.startLoading(operationId, context, {
          isRetry,
          retryCount: isRetry ? retryCount + 1 : 0,
        });
      }

      try {
        // Execute the operation with timeout
        const executeWithTimeout = async (): Promise<T> => {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), timeout)
          );
          
          return Promise.race([operation(), timeoutPromise]);
        };

        const operationResult = await executeWithTimeout();
        
        // Success - update states
        setResult(operationResult);
        setError(null);
        
        if (showLoading) {
          loadingOrchestrator.endLoading(operationId);
        }

        return operationResult;

      } catch (operationError) {
        const error = operationError instanceof Error ? operationError : new Error(String(operationError));
        
        // Handle retry logic
        if (enableRetry && retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Attempt retry
          return executeOperation(true);
        }

        // No more retries - handle error
        setError(error);
        setResult(null);

        if (showLoading) {
          loadingOrchestrator.endLoadingWithError(operationId, error);
        }

        // Use centralized error handling
        errorHandler.handleError(error, {
          context,
          toastMessage: errorMessage,
          metadata: {
            operationId,
            retryCount,
            timeout,
          },
        });

        return undefined;
      }
    },
    [
      operation,
      operationId,
      context,
      showLoading,
      showErrors,
      errorMessage,
      timeout,
      enableRetry,
      maxRetries,
      retryDelay,
      retryCount,
      errorHandler,
      loadingOrchestrator,
    ]
  );

  /**
   * Execute the operation (main interface)
   */
  const execute = useCallback(() => executeOperation(false), [executeOperation]);

  /**
   * Retry the last operation
   */
  const retry = useCallback(() => executeOperation(true), [executeOperation]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear result state
   */
  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setError(null);
    setResult(null);
    setRetryCount(0);
    loadingOrchestrator.clearOperation(operationId);
  }, [operationId, loadingOrchestrator]);

  return {
    execute,
    isLoading,
    error,
    result,
    retry,
    clearError,
    clearResult,
    reset,
  };
};

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