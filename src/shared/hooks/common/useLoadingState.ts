/**
 * useLoadingState Hook - Standardized Loading State Management
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Consolidates all loading state patterns into a single, consistent interface
 * Replaces inconsistent usePageLayout vs useState patterns
 * Simplifies conditional rendering with loading states
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles loading state management
 * - DRY: Eliminates repetitive loading state patterns
 * - Open/Closed: Extensible for different loading variants
 */

import { useCallback, useState } from 'react';
import { 
  ApplicationError, 
  handleError, 
  type ErrorContext 
} from '../../utils/helpers/errorHandler';
import { log } from '../../utils/performance/logger';

export interface UseLoadingStateOptions {
  initialLoading?: boolean;
  errorContext?: ErrorContext;
  onLoadingChange?: (loading: boolean) => void;
  onError?: (error: ApplicationError) => void;
}

export interface UseLoadingStateReturn {
  // State
  loading: boolean;
  error: ApplicationError | null;
  
  // Actions
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: string | Error | ApplicationError) => void;
  clearError: () => void;
  reset: () => void;
  
  // Utilities
  withLoading: <T>(
    operation: () => Promise<T>,
    options?: { suppressErrors?: boolean }
  ) => Promise<T | undefined>;
  
  // Computed
  isIdle: boolean;
  hasError: boolean;
}

/**
 * Standardized loading state hook that replaces inconsistent patterns
 * 
 * Replaces patterns like:
 * - const [loading, setLoading] = useState(false)
 * - usePageLayout for just loading/error states  
 * - Inconsistent conditional rendering
 * 
 * @example
 * ```typescript
 * const loadingState = useLoadingState();
 * 
 * // Replace useState patterns
 * // OLD: const [loading, setLoading] = useState(false);
 * // NEW: const { loading, withLoading } = useLoadingState();
 * 
 * const handleSubmit = async () => {
 *   await loadingState.withLoading(async () => {
 *     await someApiCall();
 *   });
 * };
 * 
 * // Simplified conditional rendering
 * if (loadingState.loading) return <LoadingSpinner />;
 * if (loadingState.hasError) return <ErrorMessage error={loadingState.error} />;
 * ```
 */
export const useLoadingState = (
  options: UseLoadingStateOptions = {}
): UseLoadingStateReturn => {
  const {
    initialLoading = false,
    errorContext = {},
    onLoadingChange,
    onError,
  } = options;

  const [loading, setLoadingState] = useState(initialLoading);
  const [error, setErrorState] = useState<ApplicationError | null>(null);

  const startLoading = useCallback(() => {
    setLoadingState(true);
    setErrorState(null);
    onLoadingChange?.(true);
    
    log('[USE LOADING STATE] Loading started', errorContext);
  }, [errorContext, onLoadingChange]);

  const stopLoading = useCallback(() => {
    setLoadingState(false);
    onLoadingChange?.(false);
    
    log('[USE LOADING STATE] Loading stopped', errorContext);
  }, [errorContext, onLoadingChange]);

  const setError = useCallback((errorInput: string | Error | ApplicationError) => {
    const processedError = handleError(errorInput, errorContext);
    setErrorState(processedError);
    setLoadingState(false);
    
    log('[USE LOADING STATE] Error set', { error: processedError.getDebugInfo() });
    
    onError?.(processedError);
  }, [errorContext, onError]);

  const clearError = useCallback(() => {
    setErrorState(null);
    log('[USE LOADING STATE] Error cleared', errorContext);
  }, [errorContext]);

  const reset = useCallback(() => {
    setLoadingState(initialLoading);
    setErrorState(null);
    log('[USE LOADING STATE] State reset', errorContext);
  }, [initialLoading, errorContext]);

  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    operationOptions: { suppressErrors?: boolean } = {}
  ): Promise<T | undefined> => {
    const { suppressErrors = false } = operationOptions;
    
    startLoading();
    
    try {
      const result = await operation();
      stopLoading();
      return result;
    } catch (err) {
      if (!suppressErrors) {
        setError(err as Error);
      } else {
        stopLoading();
      }
      return undefined;
    }
  }, [startLoading, stopLoading, setError]);

  // Computed values for convenience
  const isIdle = !loading && !error;
  const hasError = error !== null;

  return {
    // State
    loading,
    error,
    
    // Actions
    startLoading,
    stopLoading,
    setError,
    clearError,
    reset,
    
    // Utilities
    withLoading,
    
    // Computed
    isIdle,
    hasError,
  };
};

/**
 * Specialized loading state hook for data operations
 * Combines loading state with data management
 */
export const useDataLoadingState = <T>(initialData?: T) => {
  const loadingState = useLoadingState();
  const [data, setData] = useState<T | undefined>(initialData);

  const withLoadingAndData = useCallback(async <R>(
    operation: () => Promise<R>,
    options?: { 
      suppressErrors?: boolean;
      updateData?: (result: R) => T;
    }
  ): Promise<R | undefined> => {
    const result = await loadingState.withLoading(operation, options);
    
    if (result !== undefined && options?.updateData) {
      setData(options.updateData(result));
    }
    
    return result;
  }, [loadingState]);

  const resetData = useCallback(() => {
    setData(initialData);
    loadingState.reset();
  }, [initialData, loadingState]);

  return {
    ...loadingState,
    data,
    setData,
    withLoadingAndData,
    resetData,
    hasData: data !== undefined,
  };
};

/**
 * Loading state hook for form operations
 * Specialized for form submission patterns
 */
export const useFormLoadingState = () => {
  const loadingState = useLoadingState();

  const withFormSubmission = useCallback(async <T>(
    submitOperation: () => Promise<T>,
    options: {
      onSuccess?: (result: T) => void;
      onError?: (error: ApplicationError) => void;
      resetOnSuccess?: boolean;
    } = {}
  ): Promise<T | undefined> => {
    const { onSuccess, onError, resetOnSuccess = false } = options;
    
    const result = await loadingState.withLoading(submitOperation);
    
    if (result !== undefined) {
      onSuccess?.(result);
      if (resetOnSuccess) {
        loadingState.reset();
      }
    } else if (loadingState.error) {
      onError?.(loadingState.error);
    }
    
    return result;
  }, [loadingState]);

  return {
    ...loadingState,
    withFormSubmission,
    isSubmitting: loadingState.loading,
  };
};

export default useLoadingState;