/**
 * Paginated Search Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for paginated search state management
 * - DRY: Eliminates duplicate search logic across pages
 * - DIP: Depends on SearchPaginationService abstraction
 */

import { useState, useCallback } from 'react';
import { SearchPaginationService, PaginationData } from '../services/SearchPaginationService';
import { handleApiError } from '../utils/helpers/errorHandler';
import { log } from '../utils/performance/logger';
import { useDataFetch } from './common/useDataFetch';

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
  const [searchType, setSearchType] = useState<'sets' | 'products' | null>(null);

  // REFACTORED: Use useDataFetch to replace repetitive useState patterns
  // Eliminates: const [items, setItems], const [loading, setLoading], const [error, setError], const [pagination, setPagination]
  const searchDataFetch = useDataFetch<SearchResultData<T>>(
    undefined,
    {
      initialData: {
        items: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
          total: 0,
        }
      },
      onError: (error) => log('Error in paginated search:', error)
    }
  );

  const clearError = useCallback(() => {
    searchDataFetch.clearError();
  }, [searchDataFetch]);

  const searchSets = useCallback(async (params: any = {}) => {
    setSearchType('sets');
    setLastSearchParams(params);

    await searchDataFetch.execute(async (): Promise<SearchResultData<T>> => {
      log('usePaginatedSearch: Starting sets search', params);

      const result = await SearchPaginationService.searchSets(params);
      
      const searchResult: SearchResultData<T> = {
        items: result.data,
        pagination: result.pagination
      };

      log('usePaginatedSearch: Sets search completed successfully');
      return searchResult;
    });
  }, [searchDataFetch]);

  const searchProducts = useCallback(async (params: any = {}) => {
    setSearchType('products');
    setLastSearchParams(params);

    await searchDataFetch.execute(async (): Promise<SearchResultData<T>> => {
      log('usePaginatedSearch: Starting products search', params);

      const result = await SearchPaginationService.searchProducts(params);
      
      const searchResult: SearchResultData<T> = {
        items: result.data,
        pagination: result.pagination
      };

      log('usePaginatedSearch: Products search completed successfully');
      return searchResult;
    });
  }, [searchDataFetch]);

  const setPage = useCallback((page: number) => {
    if (lastSearchParams && searchType) {
      const newParams = { ...lastSearchParams, page };
      
      if (searchType === 'sets') {
        searchSets(newParams);
      } else if (searchType === 'products') {
        searchProducts(newParams);
      }
    }
  }, [lastSearchParams, searchType, searchSets, searchProducts]);

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