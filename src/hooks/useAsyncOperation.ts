/**
 * Generic Async Operation Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows DRY principle - eliminates duplicated loading/error state patterns
 */

import { useState, useCallback } from 'react';

export interface UseAsyncOperationReturn<T = any> {
  loading: boolean;
  error: string | null;
  data: T | null;
  execute: (operation: () => Promise<T>) => Promise<T | undefined>;
  clearError: () => void;
  setData: (data: T | null) => void;
}

/**
 * Generic hook for managing async operations with loading and error states
 * Eliminates the repeated pattern found in 10+ files
 */
export const useAsyncOperation = <T = any>(initialData: T | null = null): UseAsyncOperationReturn<T> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(initialData);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | undefined> => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    clearError,
    setData,
  };
};