/**
 * Pure TanStack Query Search Hook - Context7 Optimal Caching Strategy
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * CONTEXT7 PURE TANSTACK QUERY IMPLEMENTATION:
 * - Eliminates redundant triple-layer caching (UnifiedApiClient + API optimization + TanStack Query)
 * - Implements pure useQuery pattern following Context7 best practices
 * - Optimal staleTime (2min), gcTime (5min), hierarchical query keys
 * - Structural sharing, prefetchQuery, invalidation strategies
 * - Memory-efficient single source of truth
 */

import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  searchCards,
  searchProducts,
  searchSets,
  searchSetProducts,
} from '../api/searchApi';
import { log } from '../utils/performance/logger';
import { useDebouncedValue } from './useDebounce';
import { getDisplayName } from '../utils/searchHelpers';
// Removed isValidSearchQuery - implementing lower tolerance search
import { queryKeys } from '../../app/lib/queryClient';

// Focused types
// SearchResult type moved to ../types/searchTypes.ts
import { SearchResult } from '../types/searchTypes';

export interface SearchState {
  loading: boolean;
  results: SearchResult[];
  error: string | null;
  selectedSet: string | null;
  selectedCategory: string | null;
}

export interface UseSearchReturn {
  // Context7 TanStack Query optimized state
  results: SearchResult[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  selectedSet: string | null;
  selectedCategory: string | null;

  // Core search operations with pure TanStack Query
  searchSets: (query: string) => void;
  searchSetProducts: (query: string) => void;
  searchProducts: (query: string, setName?: string, category?: string) => void;
  searchCards: (query: string, setName?: string) => void;

  // Selection management
  selectSet: (setName: string) => void;
  selectCategory: (category: string) => void;
  clearFilters: () => void;

  // Utility
  clearResults: () => void;
  clearError: () => void;

  // Context7 TanStack Query caching methods
  prefetchQuery: (
    type: 'sets' | 'setProducts' | 'products' | 'cards',
    query: string,
    filters?: any
  ) => Promise<void>;
  invalidateSearchCache: (
    type?: 'sets' | 'setProducts' | 'products' | 'cards'
  ) => Promise<void>;
  getSearchCache: (
    type: 'sets' | 'setProducts' | 'products' | 'cards',
    query: string
  ) => SearchResult[] | undefined;

  // Pure TanStack Query status methods
  isStale: boolean;
  dataUpdatedAt: number;
  refetch: () => void;
}

/**
 * Context7 Pure TanStack Query Search Hook
 * CRITICAL: Single source of truth - eliminates redundant caching layers
 * Uses pure useQuery pattern with optimal Context7 configurations
 */
export const useSearch = (): UseSearchReturn => {
  // State for search management (non-query state)
  const [searchConfig, setSearchConfig] = useState({
    currentQuery: '',
    currentType: '' as 'sets' | 'products' | 'cards' | 'setProducts' | '',
    currentFilters: {} as { setName?: string; category?: string },
    selectedSet: null as string | null,
    selectedCategory: null as string | null,
  });

  const queryClient = useQueryClient();

  // Context7 Pattern: Faster debounced query for real-time search
  const debouncedQuery = useDebouncedValue(searchConfig.currentQuery, 150); // Reduced from 300ms to 150ms for responsiveness

  // Context7 Pure TanStack Query Implementation
  const {
    data: queryResults,
    isLoading,
    isFetching,
    error: queryError,
    isStale,
    dataUpdatedAt,
    refetch,
  } = useQuery({
    // Context7 Pattern: Stable hierarchical query keys - CRITICAL FIX for cache stability
    queryKey: (() => {
      if (!searchConfig.currentType) {
        return ['search', 'idle'];
      }

      const baseQuery = debouncedQuery.trim() || '*';
      const { setName, category } = searchConfig.currentFilters;

      switch (searchConfig.currentType) {
        case 'sets':
          return queryKeys.searchSets(baseQuery);
        case 'setProducts':
          return ['search', 'setProducts', baseQuery];
        case 'products':
          return queryKeys.searchProducts(
            `${baseQuery}${setName ? `-${setName}` : ''}${category ? `-${category}` : ''}`
          );
        case 'cards':
          return queryKeys.searchCards(
            `${baseQuery}${setName ? `-${setName}` : ''}`
          );
        default:
          return ['search', 'idle'];
      }
    })(),

    // Query function with proper error handling - CRITICAL FIX: Lower tolerance
    queryFn: async () => {
      if (!searchConfig.currentType) {
        return { data: [], count: 0 };
      }

      // CRITICAL FIX: Allow empty queries with filters OR queries with any length (no minimum)
      const hasValidQuery = debouncedQuery.trim().length > 0;
      const hasFilters = Object.keys(searchConfig.currentFilters).some(
        (key) => searchConfig.currentFilters[key]
      );

      if (!hasValidQuery && !hasFilters) {
        return { data: [], count: 0 };
      }

      console.log(
        `[TANSTACK QUERY DEBUG] Executing ${searchConfig.currentType} search: "${debouncedQuery}" with filters:`,
        searchConfig.currentFilters
      );

      switch (searchConfig.currentType) {
        case 'sets':
          return searchSets({
            query: debouncedQuery.trim() || '*', // Use wildcard for empty queries
            limit: 15,
          });
        case 'setProducts':
          return searchSetProducts({
            query: debouncedQuery.trim() || '*',
            limit: 15,
          });
        case 'products':
          return searchProducts({
            query: debouncedQuery.trim() || '*', // Use wildcard for empty queries
            setName: searchConfig.currentFilters.setName,
            category: searchConfig.currentFilters.category,
            limit: 15,
          });
        case 'cards':
          return searchCards({
            query: debouncedQuery.trim() || '*', // Use wildcard for empty queries
            setName: searchConfig.currentFilters.setName,
            limit: 15,
          });
        default:
          return { data: [], count: 0 };
      }
    },

    // Context7 Optimal Configuration - CRITICAL FIX: Always enabled when currentType exists
    enabled: !!searchConfig.currentType, // Removed restrictive validation - let TanStack Query handle empty queries
    staleTime: 2 * 60 * 1000, // 2 minutes - Context7 recommended
    gcTime: 5 * 60 * 1000, // 5 minutes - Context7 recommended
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Use cached data on mount
    retry: 1, // Single retry for search operations
    retryDelay: 1000, // 1 second delay

    // Context7 Pattern: Structural sharing for performance
    structuralSharing: true,

    // Context7 Pattern: Optimized network mode
    networkMode: 'online',
  });

  // Transform query results to SearchResult format
  const results: SearchResult[] = useMemo(() => {
    if (!queryResults?.data) {
      return [];
    }

    // Map search types to result types
    const getResultType = (
      searchType: string
    ): 'set' | 'product' | 'card' | 'setProduct' => {
      if (searchType === 'setProducts') {
        return 'setProduct';
      }
      if (searchType === 'products') {
        return 'product';
      }
      if (searchType === 'cards') {
        return 'card';
      }
      return 'set';
    };

    const resultType = getResultType(searchConfig.currentType || 'sets');

    return queryResults.data.map((item: any) => ({
      id: item.id || item._id,
      displayName: getDisplayName({
        _id: item.id || item._id,
        displayName: '',
        data: item,
        type: resultType,
      }),
      data: item,
      type: resultType,
    }));
  }, [queryResults?.data, searchConfig.currentType]);

  // Error handling
  const error = queryError ? String(queryError) : null;

  // Clear error
  const clearError = useCallback(() => {
    // TanStack Query handles errors automatically, but we can reset queries if needed
    if (queryError) {
      queryClient.resetQueries({
        queryKey: searchConfig.currentType
          ? searchConfig.currentType === 'sets'
            ? queryKeys.searchSets(debouncedQuery)
            : searchConfig.currentType === 'products'
              ? queryKeys.searchProducts(
                  `${debouncedQuery}${searchConfig.currentFilters.setName ? `-${searchConfig.currentFilters.setName}` : ''}`
                )
              : queryKeys.searchCards(
                  `${debouncedQuery}${searchConfig.currentFilters.setName ? `-${searchConfig.currentFilters.setName}` : ''}`
                )
          : ['search', 'idle'],
      });
    }
  }, [queryClient, queryError, searchConfig, debouncedQuery]);

  // Clear results
  const clearResults = useCallback(() => {
    setSearchConfig((prev) => ({
      ...prev,
      currentQuery: '',
      currentType: '',
      currentFilters: {},
    }));
  }, []);

  // Context7 Pattern: Optimized search handlers using TanStack Query state management
  const handleSearchSets = useCallback((query: string) => {
    log(`[TANSTACK QUERY] Initiating sets search: ${query}`);
    setSearchConfig((prev) => ({
      ...prev,
      currentQuery: query,
      currentType: 'sets',
      currentFilters: {},
    }));
  }, []);

  const handleSearchSetProducts = useCallback((query: string) => {
    console.log(
      `[TANSTACK QUERY DEBUG] Initiating SetProducts search: "${query}"`
    );
    setSearchConfig((prev) => {
      const newConfig = {
        ...prev,
        currentQuery: query,
        currentType: 'setProducts' as const,
        currentFilters: {},
      };
      console.log(
        '[TANSTACK QUERY DEBUG] SetProducts search config updated:',
        newConfig
      );
      return newConfig;
    });
  }, []);

  const handleSearchProducts = useCallback(
    (query: string, setName?: string, category?: string) => {
      log(`[TANSTACK QUERY] Initiating products search: ${query}`, {
        setName,
        category,
      });
      setSearchConfig((prev) => ({
        ...prev,
        currentQuery: query,
        currentType: 'products',
        currentFilters: { setName, category },
      }));
    },
    []
  );

  const handleSearchCards = useCallback((query: string, setName?: string) => {
    log(`[TANSTACK QUERY] Initiating cards search: ${query}`, { setName });
    setSearchConfig((prev) => ({
      ...prev,
      currentQuery: query,
      currentType: 'cards',
      currentFilters: { setName },
    }));
  }, []);

  // Selection management with TanStack Query integration
  const selectSet = useCallback((setName: string) => {
    setSearchConfig((prev) => ({
      ...prev,
      selectedSet: setName,
      currentQuery: '', // Reset search when changing filters
      currentType: '',
    }));
  }, []);

  const selectCategory = useCallback((category: string) => {
    setSearchConfig((prev) => ({
      ...prev,
      selectedCategory: category,
      currentQuery: '', // Reset search when changing filters
      currentType: '',
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchConfig((prev) => ({
      ...prev,
      selectedSet: null,
      selectedCategory: null,
      currentQuery: '',
      currentType: '',
      currentFilters: {},
    }));
  }, []);

  // Context7 TanStack Query Enhanced Caching Methods with optimal configuration
  const prefetchQuery = useCallback(
    async (
      type: 'sets' | 'products' | 'cards',
      query: string,
      filters?: any
    ) => {
      try {
        const queryKey =
          type === 'sets'
            ? queryKeys.searchSets(query)
            : type === 'products'
              ? queryKeys.searchProducts(
                  `${query}${filters?.setName ? `-${filters.setName}` : ''}${filters?.category ? `-${filters.category}` : ''}`
                )
              : queryKeys.searchCards(
                  `${query}${filters?.setName ? `-${filters.setName}` : ''}`
                );

        // Context7 Pattern: Prefetch with optimal timing and configuration
        await queryClient.prefetchQuery({
          queryKey,
          queryFn: async () => {
            switch (type) {
              case 'sets':
                return searchSets({ query: query.trim(), limit: 15 });
              case 'products':
                return searchProducts({
                  query: query.trim(),
                  setName: filters?.setName,
                  category: filters?.category,
                  limit: 15,
                });
              case 'cards':
                return searchCards({
                  query: query.trim(),
                  setName: filters?.setName,
                  limit: 15,
                });
            }
          },
          // Context7 Optimal Configuration - matches main query configuration
          staleTime: 2 * 60 * 1000, // 2 minutes
          gcTime: 5 * 60 * 1000, // 5 minutes
          retry: 1,
          retryDelay: 1000,
          networkMode: 'online',
        });

        log(`[TANSTACK QUERY] Prefetched ${type} search for: "${query}"`);
      } catch (error) {
        console.warn(`[TANSTACK QUERY] Prefetch failed for ${type}:`, error);
      }
    },
    [queryClient]
  );

  // Context7 Pattern: Optimized cache invalidation with hierarchical query keys
  const invalidateSearchCache = useCallback(
    async (type?: 'sets' | 'products' | 'cards') => {
      if (type) {
        // Invalidate specific search type using proper hierarchical keys
        await queryClient.invalidateQueries({
          queryKey: ['search', type],
          exact: false, // Invalidate all queries starting with this key
        });

        log(`[TANSTACK QUERY] Invalidated ${type} search cache`);
      } else {
        // Invalidate all search caches
        await queryClient.invalidateQueries({
          queryKey: ['search'],
          exact: false,
        });

        log('[TANSTACK QUERY] Invalidated all search caches');
      }
    },
    [queryClient]
  );

  // Context7 Pattern: Optimized cache retrieval with proper transformation
  const getSearchCache = useCallback(
    (
      type: 'sets' | 'products' | 'cards',
      query: string
    ): SearchResult[] | undefined => {
      const queryKey =
        type === 'sets'
          ? queryKeys.searchSets(query)
          : type === 'products'
            ? queryKeys.searchProducts(query)
            : queryKeys.searchCards(query);

      const cachedData = queryClient.getQueryData(queryKey);

      if (cachedData) {
        // Transform cached API response to SearchResult format
        const response = cachedData as any;
        return (
          response.data?.map((item: any) => ({
            _id: item._id,
            displayName: getDisplayName({
              _id: item._id,
              displayName: '',
              data: item,
              type: type.slice(0, -1) as any,
            }),
            data: item,
            type: type.slice(0, -1) as 'set' | 'product' | 'card',
          })) || []
        );
      }

      return undefined;
    },
    [queryClient]
  );

  // Context7 Pattern: Memoized return object with stable references
  return useMemo(
    () => ({
      // Context7 TanStack Query state
      results,
      isLoading,
      isFetching,
      error,
      selectedSet: searchConfig.selectedSet,
      selectedCategory: searchConfig.selectedCategory,

      // Search operations with TanStack Query integration
      searchSets: handleSearchSets,
      searchSetProducts: handleSearchSetProducts,
      searchProducts: handleSearchProducts,
      searchCards: handleSearchCards,

      // Selection management
      selectSet,
      selectCategory,
      clearFilters,

      // Utility
      clearResults,
      clearError,

      // Context7 TanStack Query caching methods
      prefetchQuery,
      invalidateSearchCache,
      getSearchCache,

      // Pure TanStack Query status methods
      isStale,
      dataUpdatedAt,
      refetch,
    }),
    [
      results,
      isLoading,
      isFetching,
      error,
      searchConfig.selectedSet,
      searchConfig.selectedCategory,
      handleSearchSets,
      handleSearchSetProducts,
      handleSearchProducts,
      handleSearchCards,
      selectSet,
      selectCategory,
      clearFilters,
      clearResults,
      clearError,
      prefetchQuery,
      invalidateSearchCache,
      getSearchCache,
      isStale,
      dataUpdatedAt,
      refetch,
    ]
  );
};
