/**
 * Generic Async Operation Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows DRY principle - eliminates duplicated loading/error state patterns
 *
 * Standard for new API format with comprehensive error handling and data validation
 * Following CLAUDE.md SOLID principles and steering document guidelines
 */

import { useCallback, useState } from 'react';
import { log } from '../utils/logger';

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
 * Validate API response data to prevent hook errors
 */
const validateApiResponse = <T>(data: T, context: string): boolean => {
  if (data === null || data === undefined) {
    log(
      `[ASYNC OPERATION] API response validation failed - null/undefined data in ${context}`
    );
    return false;
  }

  // Check for arrays - ensure they are actually arrays
  if (Array.isArray(data)) {
    if (!Array.isArray(data)) {
      log(
        `[ASYNC OPERATION] API response validation failed - expected array but got ${typeof data} in ${context}`
      );
      return false;
    }
    return true;
  }

  // Check for objects - ensure they are valid objects
  if (typeof data === 'object') {
    if (typeof data !== 'object') {
      log(
        `[ASYNC OPERATION] API response validation failed - expected object but got ${typeof data} in ${context}`
      );
      return false;
    }
    return true;
  }

  // Other primitive types are generally valid
  return true;
};

/**
 * Generic hook for managing async operations with loading and error states
 * Standard with comprehensive error handling and data validation for new API format
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
        log('[ASYNC OPERATION] Executing async operation');
        const result = await operation();

        // Basic validation for new API format - skip validation for empty arrays (valid case)
        if (Array.isArray(result) && result.length === 0) {
          log('[ASYNC OPERATION] Empty array result - skipping validation');
        } else if (!validateApiResponse(result, 'execute')) {
          throw new Error('Invalid API response format received');
        }

        setData(result);
        setLoading(false);
        log('[ASYNC OPERATION] Async operation completed successfully');
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        log('[ASYNC OPERATION] Async operation failed', {
          error: errorMessage,
        });
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
        log('[ASYNC OPERATION] Executing async operation with validation');
        const result = await operation();

        // Basic API response validation
        if (!validateApiResponse(result, 'executeWithValidation')) {
          throw new Error('Invalid API response format received');
        }

        // Custom validation if provided
        if (validator && !validator(result)) {
          log('[ASYNC OPERATION] Custom validation failed', { result });
          throw new Error(errorMessage);
        }

        setData(result);
        setLoading(false);
        log(
          '[ASYNC OPERATION] Async operation with validation completed successfully'
        );
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'An error occurred';
        log('[ASYNC OPERATION] Async operation with validation failed', {
          error: errorMsg,
        });
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
};
