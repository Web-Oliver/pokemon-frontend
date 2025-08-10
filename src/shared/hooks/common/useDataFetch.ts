/**
 * Generic Data Fetching Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Consolidates repetitive useState patterns for loading, error, and data states
 * Replaces patterns like:
 * - const [loading, setLoading] = useState(false)
 * - const [error, setError] = useState<string | null>(null)
 * - const [data, setData] = useState<T[]>([])
 *
 * Following CLAUDE.md SOLID principles and DRY pattern consolidation
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { log } from '../../utils/performance/logger';
import {
  ApplicationError,
  type ErrorContext,
  handleApiError,
  handleError,
  safeExecute,
} from '../../utils/helpers/errorHandler';

export interface UseDataFetchOptions<T> {
  initialData?: T;
  immediate?: boolean; // Whether to fetch immediately on mount
  validateData?: (data: T) => boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApplicationError) => void;
  errorContext?: ErrorContext; // Enhanced error context
  dependencies?: React.DependencyList; // Dependencies that trigger refetch
  refetchOnDependencyChange?: boolean;
}

export interface UseDataFetchReturn<T> {
  data: T;
  loading: boolean;
  error: ApplicationError | null; // Enhanced error type

  // Actions
  execute: (fetcher: () => Promise<T>) => Promise<T | undefined>;
  refetch: () => Promise<T | undefined>;
  reset: () => void;
  clearError: () => void;
  setData: (data: T) => void;

  // Status
  hasData: boolean;
  isSuccess: boolean;
  isError: boolean;
}

/**
 * Generic data fetching hook that consolidates common loading/error/data patterns
 * Replaces repetitive useState patterns across multiple hooks and components
 */
export const useDataFetch = <T>(
  fetcher?: () => Promise<T>,
  options: UseDataFetchOptions<T> = {}
): UseDataFetchReturn<T> => {
  const {
    initialData,
    immediate = false,
    validateData,
    onSuccess,
    onError,
    errorContext = {},
    dependencies = [],
    refetchOnDependencyChange = true,
  } = options;

  // Consolidated state - replaces multiple useState calls
  const [data, setData] = useState<T>(initialData as T);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApplicationError | null>(null);

  // Store the fetcher for refetch functionality
  const [currentFetcher, setCurrentFetcher] = useState<
    (() => Promise<T>) | null
  >(fetcher || null);

  // Race condition prevention
  const mountedRef = useRef<boolean>(true);
  const currentFetchRef = useRef<Promise<T> | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setData(initialData as T);
    setLoading(false);
    setError(null);
  }, [initialData]);

  const execute = useCallback(
    async (fetcherFn: () => Promise<T>): Promise<T | undefined> => {
      if (loading) return; // Prevent concurrent fetches

      setLoading(true);
      setError(null);

      log('[USE DATA FETCH] Executing data fetch operation');

      const fetchPromise = safeExecute(
        async () => {
          const result = await fetcherFn();

          // Optional data validation
          if (validateData && !validateData(result)) {
            throw new Error('Data validation failed');
          }

          return result;
        },
        { ...errorContext, action: 'execute' }
      );

      currentFetchRef.current = fetchPromise;

      try {
        const result = await fetchPromise;

        // Only update state if component is still mounted and this is the current fetch
        console.log('[USE DATA FETCH] Checking state update:', {
          mountedRefCurrent: mountedRef.current,
          fetchPromisesMatch: currentFetchRef.current === fetchPromise,
          result: !!result
        });
        if (mountedRef.current && currentFetchRef.current === fetchPromise) {
          if (result !== undefined) {
            console.log('[USE DATA FETCH] Setting data and loading=false');
            setData(result);
            onSuccess?.(result);
          }
          setLoading(false);
        } else {
          console.log('[USE DATA FETCH] NOT updating state - component unmounted or different fetch');
        }

        log('[USE DATA FETCH] Data fetch completed successfully');
        return result;
      } catch (err) {
        // Only update error state if component is still mounted
        if (mountedRef.current && currentFetchRef.current === fetchPromise) {
          const processedError = handleError(err, errorContext);
          setError(processedError);
          setLoading(false);

          log('[USE DATA FETCH] Data fetch failed', {
            error: processedError.getDebugInfo(),
          });

          // Enhanced error callback
          if (onError) {
            onError(processedError);
          } else {
            // Use centralized error handler if no custom handler provided
            handleApiError(err, 'Data fetch failed');
          }
        }

        return undefined;
      }
    },
    [loading, validateData, onSuccess, onError, errorContext]
  );

  const refetch = useCallback(async (): Promise<T | undefined> => {
    if (!currentFetcher) {
      log('[USE DATA FETCH] No fetcher available for refetch');
      return undefined;
    }
    return execute(currentFetcher);
  }, [currentFetcher, execute]);

  // Update current fetcher when a new one is provided
  useEffect(() => {
    if (fetcher && fetcher !== currentFetcher) {
      setCurrentFetcher(() => fetcher);
    }
  }, [fetcher, currentFetcher]);

  // Immediate execution on mount if requested
  useEffect(() => {
    if (immediate && fetcher) {
      execute(fetcher);
    }
  }, [immediate, fetcher, execute]);

  // Handle dependency changes
  useEffect(() => {
    if (
      refetchOnDependencyChange &&
      currentFetcher &&
      dependencies.length > 0
    ) {
      execute(currentFetcher);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      currentFetchRef.current = null;
    };
  }, []);

  // Computed values for convenience
  const hasData = data !== null && data !== undefined;
  const isSuccess = !loading && !error && hasData;
  const isError = !loading && error !== null;

  return {
    data,
    loading,
    error,

    // Actions
    execute,
    refetch,
    reset,
    clearError,
    setData,

    // Status
    hasData,
    isSuccess,
    isError,
  };
};

/**
 * Specialized hook for array data (common pattern in the codebase)
 * Handles empty arrays as valid data and provides array-specific utilities
 */
export const useArrayDataFetch = <T>(
  fetcher?: () => Promise<T[]>,
  options: UseDataFetchOptions<T[]> = {}
) => {
  const arrayOptions: UseDataFetchOptions<T[]> = {
    initialData: [] as T[],
    ...options,
  };

  const result = useDataFetch(fetcher, arrayOptions);

  return {
    ...result,
    // Array-specific computed values
    isEmpty: result.data.length === 0,
    count: result.data.length,
    hasItems: result.data.length > 0,
  };
};

/**
 * Hook for paginated data fetching (common pattern in the codebase)
 * Handles pagination state and append/replace logic
 */
export const usePaginatedDataFetch = <T>(
  fetcher?: (
    offset: number,
    limit: number
  ) => Promise<{
    data: T[];
    meta: { hasMore: boolean; total: number; page: number };
  }>,
  limit: number = 50
) => {
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const paginatedFetcher = useCallback(async () => {
    if (!fetcher)
      return { data: [] as T[], meta: { hasMore: false, total: 0, page: 1 } };
    return fetcher(offset, limit);
  }, [fetcher, offset, limit]);

  const result = useArrayDataFetch(paginatedFetcher, {
    onSuccess: (response) => {
      setHasMore(response.meta.hasMore);
      setTotal(response.meta.total);
      setPage(response.meta.page);
    },
  });

  const loadMore = useCallback(async () => {
    if (!hasMore || result.loading) return;

    const nextOffset = offset + limit;
    setOffset(nextOffset);

    // Execute with new offset and append results
    const newData = await result.execute(() => fetcher!(nextOffset, limit));
    if (newData) {
      result.setData([...result.data, ...newData.data]);
    }
  }, [hasMore, result.loading, offset, limit, fetcher, result]);

  const resetPagination = useCallback(() => {
    setOffset(0);
    setHasMore(false);
    setTotal(0);
    setPage(1);
    result.reset();
  }, [result]);

  return {
    ...result,

    // Pagination state
    hasMore,
    total,
    page,
    offset,

    // Pagination actions
    loadMore,
    resetPagination,
  };
};
