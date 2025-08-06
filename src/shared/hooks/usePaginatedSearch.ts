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
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<any>(null);
  const [searchType, setSearchType] = useState<'sets' | 'products' | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const searchSets = useCallback(async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      setSearchType('sets');
      setLastSearchParams(params);

      const result = await SearchPaginationService.searchSets(params);
      setItems(result.data);
      setPagination(result.pagination);

      log('usePaginatedSearch: Sets search completed successfully');
    } catch (err) {
      const errorMessage = 'Failed to fetch sets';
      handleApiError(err, errorMessage);
      setError(errorMessage);
      log('usePaginatedSearch: Sets search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      setSearchType('products');
      setLastSearchParams(params);

      const result = await SearchPaginationService.searchProducts(params);
      setItems(result.data);
      setPagination(result.pagination);

      log('usePaginatedSearch: Products search completed successfully');
    } catch (err) {
      const errorMessage = 'Failed to fetch products';
      handleApiError(err, errorMessage);
      setError(errorMessage);
      log('usePaginatedSearch: Products search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
    items,
    pagination,
    loading,
    error,
    searchSets,
    searchProducts,
    setPage,
    clearError,
  };
}