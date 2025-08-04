/**
 * Optimized Search Hook - Context7 Performance Patterns with Hierarchical Support
 *
 * UPDATED: Enhanced for hierarchical search with no simultaneous suggestions
 * - Set → Card: Traditional card search within sets
 * - SetProduct → Product: New sealed product hierarchy
 * - No simultaneous suggestions (user specification)
 * - Integrated with SearchApiService for context management
 *
 * Following Context7 React.dev documentation for optimal search performance:
 * - useMemo for expensive search computations
 * - useCallback for stable function references
 * - Suspense-compatible async operations
 * - React Compiler optimization ready
 * - CLAUDE.md SOLID principles compliance
 */

import { useState, useCallback, useMemo, useRef, useTransition } from 'react';
import { useSearch, SearchResult } from './useSearch';
import { useDebouncedValue } from './useDebounce';
import { searchApiService } from '../services/SearchApiService';

interface OptimizedSearchConfig {
  minLength?: number;
  debounceMs?: number;
  enableTransitions?: boolean;
  hierarchicalMode?: boolean; // NEW: Enable hierarchical search logic
  allowSimultaneousSuggestions?: boolean; // NEW: Control simultaneous suggestions (always false per user spec)
  onAutofill?: (autofillData: any) => void; // NEW: Callback for autofill data
}

interface OptimizedSearchState {
  results: SearchResult[];
  isLoading: boolean;
  isPending: boolean;
  error: string | null;
  query: string;
  activeField?: 'set' | 'setProduct' | 'product' | 'card'; // NEW: Track active field for hierarchical logic
  selectedSetProduct?: SearchResult; // NEW: Track selected SetProduct for filtering
  selectedSet?: SearchResult; // NEW: Track selected Set for filtering
}

/**
 * Context7 Pattern: Optimized search hook with React Concurrent features and Hierarchical Support
 * Implements performance patterns from React.dev documentation with hierarchical search logic
 */
export const useOptimizedSearch = (config: OptimizedSearchConfig = {}) => {
  const { 
    minLength = 1, 
    debounceMs = 300, 
    enableTransitions = true,
    hierarchicalMode = true, // Enable hierarchical mode by default
    allowSimultaneousSuggestions = false, // Per user specification - no simultaneous suggestions
    onAutofill
  } = config;

  const [state, setState] = useState<OptimizedSearchState>({
    results: [],
    isLoading: false,
    isPending: false,
    error: null,
    query: '',
    activeField: undefined,
    selectedSetProduct: undefined,
    selectedSet: undefined,
  });

  const [isPending, startTransition] = useTransition();
  const search = useSearch();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Context7 Pattern: Memoized debounced query for performance
  const debouncedQuery = useDebouncedValue(state.query, debounceMs);

  // Context7 Pattern: Memoized search function with stable reference and hierarchical support
  const performSearch = useCallback(
    async (
      query: string,
      searchType: 'sets' | 'products' | 'cards' | 'setProducts', // UPDATED: Added setProducts
      setFilter?: string,
      setProductFilter?: string // NEW: SetProduct filtering
    ) => {
      if (!query || query.length < minLength) {
        setState((prev) => ({
          ...prev,
          results: [],
          isLoading: false,
          error: null,
        }));
        return;
      }

      // Hierarchical logic: Check if suggestions should be shown (no simultaneous suggestions)
      if (hierarchicalMode && !allowSimultaneousSuggestions) {
        if (!searchApiService.shouldShowSuggestions(searchType as any)) {
          setState((prev) => ({
            ...prev,
            results: [],
            isLoading: false,
            error: null,
          }));
          return;
        }
        
        // Update search context for hierarchical tracking
        searchApiService.updateSearchContext({ activeField: searchType as any });
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const searchOperation = async () => {
        try {
          setState((prev) => ({ ...prev, isLoading: true, error: null }));

          let results: SearchResult[] = [];

          switch (searchType) {
            case 'sets':
              await search.searchSets(query);
              results = search.results || [];
              break;
            case 'setProducts':
              // Use SearchApiService for SetProduct search until useSearch supports it
              try {
                const setProductResults = await searchApiService.getSetProductSuggestions(query, 15);
                results = setProductResults.map(sp => ({
                  id: sp.id,
                  displayName: sp.setProductName,
                  type: 'setProduct' as const,
                  data: sp
                }));
              } catch (error) {
                console.error('SetProduct search failed:', error);
                results = [];
              }
              break;
            case 'products':
              // Apply hierarchical filtering if SetProduct is selected
              if (hierarchicalMode && state.selectedSetProduct) {
                try {
                  const filteredResults = await searchApiService.getHierarchicalProductSuggestions(
                    query,
                    { setProductSelected: state.selectedSetProduct.data },
                    15
                  );
                  results = filteredResults.map(p => ({
                    id: p.id,
                    displayName: p.productName,
                    type: 'product' as const,
                    data: p
                  }));
                } catch (error) {
                  console.error('Hierarchical product search failed:', error);
                  results = [];
                }
              } else {
                await search.searchProducts(query, setFilter);
                results = search.results || [];
              }
              break;
            case 'cards':
              // Apply Set filtering if Set is selected
              if (hierarchicalMode && state.selectedSet) {
                await search.searchCards(query, state.selectedSet.displayName);
              } else {
                await search.searchCards(query, setFilter);
              }
              results = search.results || [];
              break;
          }

          if (!abortController.signal.aborted) {
            setState((prev) => ({
              ...prev,
              results,
              isLoading: false,
              isPending: false,
              error: null,
            }));
          }
        } catch (error) {
          if (!abortController.signal.aborted) {
            setState((prev) => ({
              ...prev,
              results: [],
              isLoading: false,
              isPending: false,
              error: error instanceof Error ? error.message : 'Search failed',
            }));
          }
        }
      };

      if (enableTransitions) {
        setState((prev) => ({ ...prev, isPending: true }));
        startTransition(() => {
          searchOperation();
        });
      } else {
        await searchOperation();
      }
    },
    [search, minLength, enableTransitions, startTransition]
  );

  // Context7 Pattern: Memoized handlers with stable references
  const searchSets = useCallback(
    (query: string) => {
      setState((prev) => ({ ...prev, query }));
      return performSearch(query, 'sets');
    },
    [performSearch]
  );

  const searchProducts = useCallback(
    (query: string, setFilter?: string) => {
      setState((prev) => ({ ...prev, query }));
      return performSearch(query, 'products', setFilter);
    },
    [performSearch]
  );

  const searchCards = useCallback(
    (query: string, setFilter?: string) => {
      setState((prev) => ({ ...prev, query }));
      return performSearch(query, 'cards', setFilter);
    },
    [performSearch]
  );

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
      activeField: undefined,
      selectedSetProduct: undefined,
      selectedSet: undefined,
    });
    
    // Clear hierarchical context if enabled
    if (hierarchicalMode) {
      searchApiService.clearSearchContext();
    }
  }, [hierarchicalMode]);

  // NEW: Hierarchical selection methods
  const selectSetProduct = useCallback((setProduct: SearchResult) => {
    setState(prev => ({
      ...prev,
      selectedSetProduct: setProduct,
      activeField: 'setProduct'
    }));
    
    if (hierarchicalMode) {
      searchApiService.handleSetProductSelection(setProduct.data);
    }
  }, [hierarchicalMode]);

  const selectSet = useCallback((set: SearchResult) => {
    setState(prev => ({
      ...prev,
      selectedSet: set,
      activeField: 'set'
    }));
    
    if (hierarchicalMode) {
      searchApiService.handleSetSelection(set.data);
    }
  }, [hierarchicalMode]);

  const selectProduct = useCallback(async (product: SearchResult) => {
    setState(prev => ({
      ...prev,
      activeField: 'product'
    }));
    
    if (hierarchicalMode) {
      try {
        const result = await searchApiService.handleProductSelection(product.data);
        if (result.autofillData && onAutofill) {
          onAutofill(result.autofillData);
        }
      } catch (error) {
        console.error('Product selection failed:', error);
      }
    }
  }, [hierarchicalMode, onAutofill]);

  const searchSetProducts = useCallback(
    (query: string) => {
      setState((prev) => ({ ...prev, query, activeField: 'setProduct' }));
      return performSearch(query, 'setProducts');
    },
    [performSearch]
  );

  // Context7 Pattern: Memoized return object for stable references with hierarchical methods
  return useMemo(
    () => ({
      ...state,
      isPending: isPending || state.isPending,
      
      // Original search methods
      searchSets,
      searchProducts,
      searchCards,
      clearResults,
      
      // NEW: Hierarchical search methods
      searchSetProducts,
      selectSetProduct,
      selectSet,
      selectProduct,
      
      // Utility properties
      hasResults: state.results.length > 0,
      isSearching: state.isLoading || isPending || state.isPending,
      
      // NEW: Hierarchical state accessors
      isHierarchicalMode: hierarchicalMode,
      canShowSuggestions: hierarchicalMode ? 
        searchApiService.shouldShowSuggestions(state.activeField as any) : true,
      searchContext: hierarchicalMode ? searchApiService.getSearchContext() : null,
    }),
    [
      state, 
      isPending, 
      searchSets, 
      searchProducts, 
      searchCards, 
      searchSetProducts,
      selectSetProduct,
      selectSet,
      selectProduct,
      clearResults,
      hierarchicalMode
    ]
  );
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

  const trackSearch = useCallback(
    (duration: number, wasCached: boolean = false) => {
      metricsRef.current.searches++;
      if (wasCached) {
        metricsRef.current.cacheHits++;
      } else {
        const total =
          metricsRef.current.averageTime * (metricsRef.current.searches - 1) +
          duration;
        metricsRef.current.averageTime = total / metricsRef.current.searches;
      }
    },
    []
  );

  const getMetrics = useCallback(
    () => ({
      ...metricsRef.current,
      cacheHitRate:
        metricsRef.current.searches > 0
          ? (metricsRef.current.cacheHits / metricsRef.current.searches) * 100
          : 0,
    }),
    []
  );

  return useMemo(
    () => ({
      trackSearch,
      getMetrics,
    }),
    [trackSearch, getMetrics]
  );
};
