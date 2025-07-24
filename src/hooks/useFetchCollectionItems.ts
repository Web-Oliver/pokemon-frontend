/**
 * Fetch Collection Items Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Abstracts data fetching patterns using useAsyncOperation
 * Follows DRY principle - eliminates duplicate data fetching patterns
 */

import { useCallback } from 'react';
import { useAsyncOperation } from './useAsyncOperation';

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
  refreshItems: () => Promise<T[] | undefined>;
  clearError: () => void;
  setItems: (items: T[] | null) => void;

  // Internal state for refresh
  lastFetchFn: (() => Promise<T[]>) | null;
}

/**
 * Generic hook for fetching collection items
 * Eliminates duplicate data fetching patterns across pages
 * Used by: Collection, SetSearch, SealedProductSearch, Auctions, etc.
 */
export const useFetchCollectionItems = <T = any>(
  config: FetchCollectionItemsConfig = {}
): UseFetchCollectionItemsReturn<T> => {
  const { initialData = null, autoFetch = false } = config;

  const {
    data: items,
    loading,
    error,
    execute,
    clearError,
    setData: setItems,
  } = useAsyncOperation<T[]>(initialData);

  // Store the last fetch function for refresh capability
  let lastFetchFn: (() => Promise<T[]>) | null = null;

  const fetchItems = useCallback(
    async (fetchFn: () => Promise<T[]>): Promise<T[] | undefined> => {
      lastFetchFn = fetchFn;
      return await execute(fetchFn);
    },
    [execute]
  );

  const refreshItems = useCallback(async (): Promise<T[] | undefined> => {
    if (!lastFetchFn) {
      throw new Error('No fetch function available for refresh. Call fetchItems first.');
    }
    return await execute(lastFetchFn);
  }, [execute]);

  return {
    items,
    loading,
    error,
    fetchItems,
    refreshItems,
    clearError,
    setItems,
    lastFetchFn,
  };
};
