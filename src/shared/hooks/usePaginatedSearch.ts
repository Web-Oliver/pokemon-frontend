/**
 * Paginated Search Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for paginated search state management
 * - DRY: Eliminates duplicate search logic across pages
 * - DIP: Depends on SearchPaginationService abstraction
 */

import { useCallback, useState } from 'react';
import { useDataFetch } from './common/useDataFetch';
import { unifiedApiService } from '../services/UnifiedApiService';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  total: number;
}

interface SearchResultData<T> {
  items: T[];
  pagination: PaginationData;
}

export interface UsePaginatedSearchResult<T> {
  items: T[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  searchSets: (params?: any) => Promise<void>;
  searchProducts: (params?: any) => Promise<void>;
  setPage: (page: number) => void;
  clearError: () => void;
}

export function usePaginatedSearch<T = any>(): UsePaginatedSearchResult<T> {
  // Non-loading/error/data state - kept as is
  const [lastSearchParams, setLastSearchParams] = useState<any>(null);
  const [searchType, setSearchType] = useState<'sets' | 'products' | null>(
    null
  );

  // REFACTORED: Use useDataFetch to replace repetitive useState patterns
  // Eliminates: const [items, setItems], const [loading, setLoading], const [error, setError], const [pagination, setPagination]
  const searchDataFetch = useDataFetch<SearchResultData<T>>(undefined, {
    initialData: {
      items: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
        total: 0,
      },
    },
    onError: (error) => console.error('Error in paginated search:', error),
  });

  const clearError = useCallback(() => {
    searchDataFetch.clearError();
  }, []); // CRITICAL FIX: Empty dependency array to prevent infinite loops

  const searchSets = useCallback(
    async (params: any = {}) => {
      setSearchType('sets');
      setLastSearchParams(params);

      // Use the execute method from useDataFetch which handles loading/error states
      await searchDataFetch.execute(async (): Promise<SearchResultData<T>> => {
        // FIXED: Ensure we always have a query parameter, even if empty
        const query = params.query !== undefined ? params.query : (params.search || '');
        console.log('[HOOK] searchSets - query:', query, 'params:', params);
        const result = await unifiedApiService.search.searchSets(query);
        console.log('[HOOK] searchSets - result:', result);
        
        const transformedResult = {
          items: result.data || [],
          pagination: {
            currentPage: params.page || 1,
            totalPages: Math.max(1, Math.ceil((result.count || 0) / (params.limit || 20))),
            hasNextPage: (params.page || 1) < Math.ceil((result.count || 0) / (params.limit || 20)),
            hasPrevPage: (params.page || 1) > 1,
            total: result.count || 0,
          }
        };
        console.log('[HOOK] searchSets - transformed result:', transformedResult);
        return transformedResult;
      });
    },
    [] // CRITICAL FIX: Empty dependency array to prevent infinite loops
  );

  const searchProducts = useCallback(
    async (params: any = {}) => {
      setSearchType('products');
      setLastSearchParams(params);

      // Use the execute method from useDataFetch which handles loading/error states
      await searchDataFetch.execute(async (): Promise<SearchResultData<T>> => {
        // FIXED: Ensure we always have a query parameter, even if empty
        const query = params.query !== undefined ? params.query : (params.search || '');
        const result = await unifiedApiService.search.searchProducts(query);
        
        return {
          items: result.data || [],
          pagination: {
            currentPage: params.page || 1,
            totalPages: Math.max(1, Math.ceil((result.count || 0) / (params.limit || 20))),
            hasNextPage: (params.page || 1) < Math.ceil((result.count || 0) / (params.limit || 20)),
            hasPrevPage: (params.page || 1) > 1,
            total: result.count || 0,
          }
        };
      });
    },
    [] // CRITICAL FIX: Empty dependency array to prevent infinite loops
  );

  const setPage = useCallback(
    (page: number) => {
      if (lastSearchParams && searchType) {
        const newParams = { ...lastSearchParams, page };

        if (searchType === 'sets') {
          searchSets(newParams);
        } else if (searchType === 'products') {
          searchProducts(newParams);
        }
      }
    },
    [lastSearchParams, searchType] // CRITICAL FIX: Remove function dependencies to prevent loops
  );

  return {
    // REFACTORED: Data from consolidated useDataFetch hook
    items: searchDataFetch.data?.items || [],
    pagination: searchDataFetch.data?.pagination || {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      total: 0,
    },
    // REFACTORED: Loading & Error State from useDataFetch hook
    loading: searchDataFetch.loading,
    error: searchDataFetch.error,
    searchSets,
    searchProducts,
    setPage,
    clearError,
  };
}
