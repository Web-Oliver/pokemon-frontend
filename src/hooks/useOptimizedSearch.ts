/**
 * Optimized Search Hook - Context7 Performance Patterns
 * 
 * Following Context7 React.dev documentation for optimal search performance:
 * - useMemo for expensive search computations
 * - useCallback for stable function references
 * - Suspense-compatible async operations
 * - React Compiler optimization ready
 */

import { useState, useCallback, useMemo, useRef, useTransition } from 'react';
import { useSearch, SearchResult } from './useSearch';
import { useDebouncedValue } from './useDebounce';

interface OptimizedSearchConfig {
  minLength?: number;
  debounceMs?: number;
  enableTransitions?: boolean;
}

interface OptimizedSearchState {
  results: SearchResult[];
  isLoading: boolean;
  isPending: boolean;
  error: string | null;
  query: string;
}

/**
 * Context7 Pattern: Optimized search hook with React Concurrent features
 * Implements performance patterns from React.dev documentation
 */
export const useOptimizedSearch = (config: OptimizedSearchConfig = {}) => {
  const {
    minLength = 1,
    debounceMs = 300,
    enableTransitions = true,
  } = config;

  const [state, setState] = useState<OptimizedSearchState>({
    results: [],
    isLoading: false,
    isPending: false,
    error: null,
    query: '',
  });

  const [isPending, startTransition] = useTransition();
  const search = useSearch();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Context7 Pattern: Memoized debounced query for performance
  const debouncedQuery = useDebouncedValue(state.query, debounceMs);

  // Context7 Pattern: Memoized search function with stable reference
  const performSearch = useCallback(async (
    query: string,
    searchType: 'sets' | 'products' | 'cards',
    setFilter?: string
  ) => {
    if (!query || query.length < minLength) {
      setState(prev => ({ ...prev, results: [], isLoading: false, error: null }));
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const searchOperation = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        let results: SearchResult[] = [];

        switch (searchType) {
          case 'sets':
            await search.searchSets(query);
            results = search.results || [];
            break;
          case 'products':
            await search.searchProducts(query, setFilter);
            results = search.results || [];
            break;
          case 'cards':
            await search.searchCards(query, setFilter);
            results = search.results || [];
            break;
        }

        if (!abortController.signal.aborted) {
          setState(prev => ({ 
            ...prev, 
            results, 
            isLoading: false,
            isPending: false,
            error: null 
          }));
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          setState(prev => ({ 
            ...prev, 
            results: [], 
            isLoading: false,
            isPending: false,
            error: error instanceof Error ? error.message : 'Search failed' 
          }));
        }
      }
    };

    if (enableTransitions) {
      setState(prev => ({ ...prev, isPending: true }));
      startTransition(() => {
        searchOperation();
      });
    } else {
      await searchOperation();
    }
  }, [search, minLength, enableTransitions, startTransition]);

  // Context7 Pattern: Memoized handlers with stable references
  const searchSets = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
    return performSearch(query, 'sets');
  }, [performSearch]);

  const searchProducts = useCallback((query: string, setFilter?: string) => {
    setState(prev => ({ ...prev, query }));
    return performSearch(query, 'products', setFilter);
  }, [performSearch]);

  const searchCards = useCallback((query: string, setFilter?: string) => {
    setState(prev => ({ ...prev, query }));
    return performSearch(query, 'cards', setFilter);
  }, [performSearch]);

  const clearResults = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      results: [],
      isLoading: false,
      isPending: false,
      error: null,
      query: '',
    });
  }, []);

  // Context7 Pattern: Memoized return object for stable references
  return useMemo(() => ({
    ...state,
    isPending: isPending || state.isPending,
    searchSets,
    searchProducts,
    searchCards,
    clearResults,
    hasResults: state.results.length > 0,
    isSearching: state.isLoading || isPending || state.isPending,
  }), [
    state,
    isPending,
    searchSets,
    searchProducts,
    searchCards,
    clearResults,
  ]);
};

// Context7 Pattern: Memoized search result selector
export const useSearchResultSelector = <T>(
  results: SearchResult[],
  selector: (result: SearchResult) => T,
  dependencies: React.DependencyList = []
) => {
  return useMemo(
    () => results.map(selector),
    [results, selector, ...dependencies]
  );
};

// Context7 Pattern: Performance tracking for search operations
export const useSearchPerformance = () => {
  const metricsRef = useRef({
    searches: 0,
    averageTime: 0,
    cacheHits: 0,
  });

  const trackSearch = useCallback((duration: number, wasCached: boolean = false) => {
    metricsRef.current.searches++;
    if (wasCached) {
      metricsRef.current.cacheHits++;
    } else {
      const total = metricsRef.current.averageTime * (metricsRef.current.searches - 1) + duration;
      metricsRef.current.averageTime = total / metricsRef.current.searches;
    }
  }, []);

  const getMetrics = useCallback(() => ({
    ...metricsRef.current,
    cacheHitRate: metricsRef.current.searches > 0 
      ? (metricsRef.current.cacheHits / metricsRef.current.searches) * 100 
      : 0,
  }), []);

  return useMemo(() => ({
    trackSearch,
    getMetrics,
  }), [trackSearch, getMetrics]);
};