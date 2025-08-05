/**
 * Fetch Collection Items Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Abstracts data fetching patterns using useAsyncOperation
 * Follows DRY principle - eliminates duplicate data fetching patterns
 *
 * Standard for new API format with comprehensive error handling and array validation
 * Following CLAUDE.md SOLID principles and steering document guidelines
 */

import { useCallback, useRef } from 'react';
import { useAsyncOperation } from './useAsyncOperation';
import { log } from '../utils/logger';

export interface FetchCollectionItemsConfig {
  /** Initial data for the hook */
  initialData?: any[];
  /** Auto-fetch on mount */
  autoFetch?: boolean;
}

export interface UseFetchCollectionItemsReturn<T = any> {
  // Data state
  items: T[] | null;
  loading: boolean;
  error: string | null;

  // Operations
  fetchItems: (fetchFn: () => Promise<T[]>) => Promise<T[] | undefined>;
  fetchItemsWithValidation: (
    fetchFn: () => Promise<T[]>,
    validator?: (items: T[]) => boolean,
    errorMessage?: string
  ) => Promise<T[] | undefined>;
  refreshItems: () => Promise<T[] | undefined>;
  clearError: () => void;
  setItems: (items: T[] | null) => void;
  reset: () => void;

  // Internal state for refresh
  lastFetchFn: (() => Promise<T[]>) | null;

  // Convenience properties
  isEmpty: boolean;
  hasItems: boolean;
  itemCount: number;
}

/**
 * Validate collection items array for new API format
 */
const validateCollectionItems = <T>(items: T[]): boolean => {
  if (!Array.isArray(items)) {
    log(
      '[FETCH COLLECTION ITEMS] Validation failed - received non-array response'
    );
    return false;
  }

  // Check for basic item validity
  const hasInvalidItems = items.some(
    (item) =>
      !item || typeof item !== 'object' || (!('id' in item) && !('_id' in item))
  );

  if (hasInvalidItems) {
    log(
      '[FETCH COLLECTION ITEMS] Validation failed - some items lack required properties',
      {
        totalItems: items.length,
      }
    );
    return false;
  }

  return true;
};

/**
 * Generic hook for fetching collection items
 * Standard with comprehensive error handling and array validation for new API format
 * Used by: Collection, SetSearch, SealedProductSearch, Auctions, etc.
 */
export const useFetchCollectionItems = <T = any>(
  config: FetchCollectionItemsConfig = {}
): UseFetchCollectionItemsReturn<T> => {
  const { initialData = null } = config;

  const {
    data: items,
    loading,
    error,
    executeWithValidation,
    clearError,
    setData: setItems,
    reset,
  } = useAsyncOperation<T[]>(initialData);

  // Store the last fetch function for refresh capability using useRef
  // This persists across renders and prevents refresh functionality from breaking
  const lastFetchFnRef = useRef<(() => Promise<T[]>) | null>(null);

  const fetchItems = useCallback(
    async (fetchFn: () => Promise<T[]>): Promise<T[] | undefined> => {
      lastFetchFnRef.current = fetchFn;

      return await executeWithValidation(
        fetchFn,
        validateCollectionItems,
        'Invalid collection items format received from API'
      );
    },
    [executeWithValidation]
  );

  const fetchItemsWithValidation = useCallback(
    async (
      fetchFn: () => Promise<T[]>,
      validator?: (items: T[]) => boolean,
      errorMessage?: string
    ): Promise<T[] | undefined> => {
      lastFetchFnRef.current = fetchFn;

      const combinedValidator = (items: T[]): boolean => {
        // First run basic validation
        if (!validateCollectionItems(items)) {
          return false;
        }

        // Then run custom validation if provided
        if (validator && !validator(items)) {
          return false;
        }

        return true;
      };

      return await executeWithValidation(
        fetchFn,
        combinedValidator,
        errorMessage || 'Collection items validation failed'
      );
    },
    [executeWithValidation]
  );

  const refreshItems = useCallback(async (): Promise<T[] | undefined> => {
    if (!lastFetchFnRef.current) {
      log('[FETCH COLLECTION ITEMS] No fetch function available for refresh');
      throw new Error(
        'No fetch function available for refresh. Call fetchItems first.'
      );
    }

    log('[FETCH COLLECTION ITEMS] Refreshing items using last fetch function');
    return await executeWithValidation(
      lastFetchFnRef.current,
      validateCollectionItems,
      'Invalid collection items format received during refresh'
    );
  }, [executeWithValidation]);

  // Convenience properties for safer array access
  const safeItems = items || [];
  const isEmpty = safeItems.length === 0;
  const hasItems = safeItems.length > 0;
  const itemCount = safeItems.length;

  return {
    items,
    loading,
    error,
    fetchItems,
    fetchItemsWithValidation,
    refreshItems,
    clearError,
    setItems,
    reset,
    lastFetchFn: lastFetchFnRef.current,
    isEmpty,
    hasItems,
    itemCount,
  };
};
