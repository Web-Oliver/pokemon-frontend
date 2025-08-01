/**
 * Search Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Replaces over-engineered search system with focused implementation
 * Consolidates useSearch + useAutocomplete + SearchService into single hook
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { searchCards, searchSets, searchProducts } from '../api/searchApi';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { useDebouncedCallback } from '../utils/common';
import {
  isValidSearchQuery,
  handleSearchError,
  getDisplayName,
} from '../utils/searchHelpers';

// Focused types
export interface SearchResult {
  _id: string;
  displayName: string;
  data: any; // Original data from API
  type: 'set' | 'product' | 'card';
}

export interface SearchState {
  loading: boolean;
  results: SearchResult[];
  error: string | null;
  selectedSet: string | null;
  selectedCategory: string | null;
}

export interface UseSearchReturn extends SearchState {
  // Core search operations
  searchSets: (query: string) => void;
  searchProducts: (query: string, setName?: string, category?: string) => void;
  searchCards: (query: string, setName?: string) => void;

  // Selection management
  selectSet: (setName: string) => void;
  selectCategory: (category: string) => void;
  clearFilters: () => void;

  // Utility
  clearResults: () => void;
  clearError: () => void;
}

/**
 * Search Hook
 * Focused responsibility: search and basic state management
 * Uses unifiedApiClient caching automatically
 */
export const useSearch = (): UseSearchReturn => {
  const [state, setState] = useState<SearchState>({
    loading: false,
    results: [],
    error: null,
    selectedSet: null,
    selectedCategory: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cancel any ongoing requests
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  // Set error state
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Clear results
  const clearResults = useCallback(() => {
    setState((prev) => ({ ...prev, results: [], error: null }));
  }, []);

  // Generic search handler using DRY helper
  const handleSearch = useCallback(
    async (
      query: string,
      searchType: 'sets' | 'products' | 'cards',
      filters?: { setName?: string; category?: string }
    ) => {
      if (!isValidSearchQuery(query)) {
        clearResults();
        return;
      }

      cancelRequest();
      setLoading(true);
      setError(null);

      abortControllerRef.current = new AbortController();

      try {
        log(`Searching ${searchType}: ${query}`);

        let response;
        switch (searchType) {
          case 'sets':
            response = await searchSets({ query: query.trim(), limit: 15 });
            break;
          case 'products':
            response = await searchProducts({
              query: query.trim(),
              setName: filters?.setName,
              category: filters?.category,
              limit: 15,
            });
            break;
          case 'cards':
            response = await searchCards({
              query: query.trim(),
              setName: filters?.setName,
              limit: 15,
            });
            break;
        }

        if (abortControllerRef.current?.signal.aborted) return;

        const results: SearchResult[] = response.data.map((item) => ({
          _id: item._id,
          displayName: getDisplayName({
            _id: item._id,
            displayName: '',
            data: item,
            type: searchType.slice(0, -1) as any,
          }),
          data: item,
          type: searchType.slice(0, -1) as 'set' | 'product' | 'card',
        }));

        console.log(`[DEBUG SEARCH] API Response for "${query}":`, {
          searchType,
          query,
          rawResponse: response,
          responseData: response.data,
          responseCount: response.count,
          processedResults: results,
          resultCount: results.length,
        });

        setState((prev) => ({ ...prev, results, loading: false }));
        log(`Found ${results.length} ${searchType}`);
      } catch (error) {
        handleSearchError(error, `${searchType} search`, setError, setLoading);
      }
    },
    [cancelRequest, setLoading, setError, clearResults]
  );

  // Specific search handlers using the generic handler
  const handleSearchSets = useCallback(
    (query: string) => {
      return handleSearch(query, 'sets');
    },
    [handleSearch]
  );

  const handleSearchProducts = useCallback(
    (query: string, setName?: string, category?: string) => {
      return handleSearch(query, 'products', { setName, category });
    },
    [handleSearch]
  );

  const handleSearchCards = useCallback(
    (query: string, setName?: string) => {
      return handleSearch(query, 'cards', { setName });
    },
    [handleSearch]
  );

  // Create debounced versions
  const { debouncedCallback: debouncedSearchSets } = useDebouncedCallback(
    handleSearchSets,
    300
  );
  const { debouncedCallback: debouncedSearchProducts } = useDebouncedCallback(
    handleSearchProducts,
    300
  );
  const { debouncedCallback: debouncedSearchCards } = useDebouncedCallback(
    handleSearchCards,
    300
  );

  // Selection management
  const selectSet = useCallback((setName: string) => {
    setState((prev) => ({
      ...prev,
      selectedSet: setName,
      results: [], // Clear results when changing filters
    }));
  }, []);

  const selectCategory = useCallback((category: string) => {
    setState((prev) => ({
      ...prev,
      selectedCategory: category,
      results: [], // Clear results when changing filters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedSet: null,
      selectedCategory: null,
      results: [],
    }));
  }, []);

  // Cleanup on unmount
  useState(() => {
    return () => {
      cancelRequest();
    };
  });

  return useMemo(
    () => ({
      // State
      ...state,

      // Search operations (debounced)
      searchSets: debouncedSearchSets,
      searchProducts: debouncedSearchProducts,
      searchCards: debouncedSearchCards,

      // Selection management
      selectSet,
      selectCategory,
      clearFilters,

      // Utility
      clearResults,
      clearError,
    }),
    [
      state,
      debouncedSearchSets,
      debouncedSearchProducts,
      debouncedSearchCards,
      selectSet,
      selectCategory,
      clearFilters,
      clearResults,
      clearError,
    ]
  );
};
