/**
 * Basic Search Hook
 * Handles core search functionality without hierarchical logic
 *
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Only handles basic search operations
 * - Extracted from 822-line useSearch hook for better maintainability
 * - Focused on search term management and result handling
 */

import { useState, useRef, useCallback } from 'react';
import { ICard } from '../../domain/models/card';
import {
  searchApi,
  SetResult,
  CardResult,
  ProductResult,
  CategoryResult,
} from '../../api/searchApi';
import { handleApiError } from '../../utils/errorHandler';
import { log } from '../../utils/logger';

export interface BasicSearchState {
  searchTerm: string;
  searchResults: ICard[];
  loading: boolean;
  error: string | null;
  searchMode: 'cards' | 'products';
}

export interface UseBasicSearchReturn extends BasicSearchState {
  handleSearch: (query: string) => Promise<void>;
  setSearchMode: (mode: 'cards' | 'products') => void;
  clearSearch: () => void;
  clearError: () => void;
  getBestMatch: (query: string) => Promise<ICard | null>;
}

/**
 * Hook for basic search functionality
 * Handles search term management and result processing
 * Separated from complex hierarchical search logic
 */
export const useBasicSearch = (): UseBasicSearchReturn => {
  const [state, setState] = useState<BasicSearchState>({
    searchTerm: '',
    searchResults: [],
    loading: false,
    error: null,
    searchMode: 'cards',
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setState(prev => ({
          ...prev,
          searchTerm: '',
          searchResults: [],
          error: null,
        }));
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState(prev => ({
        ...prev,
        searchTerm: query,
        loading: true,
        error: null,
      }));

      try {
        log(`[BASIC SEARCH] Searching for: ${query}`);

        let results: ICard[] = [];

        if (state.searchMode === 'cards') {
          // Search for cards using the search API
          const searchResults = await searchApi.searchCards({
            query,
            limit: 20,
          });
          results = searchResults;
        } else {
          // For products, we would implement product search here
          // Currently using cards as fallback
          const searchResults = await searchApi.searchCards({
            query,
            limit: 20,
          });
          results = searchResults;
        }

        if (!abortController.signal.aborted) {
          setState(prev => ({
            ...prev,
            searchResults: results,
            loading: false,
          }));
          log(`[BASIC SEARCH] Found ${results.length} results`);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          const errorMessage = 'Search failed. Please try again.';
          handleApiError(error, errorMessage);

          setState(prev => ({
            ...prev,
            error: errorMessage,
            loading: false,
            searchResults: [],
          }));
        }
      }
    },
    [state.searchMode]
  );

  const getBestMatch = useCallback(async (query: string): Promise<ICard | null> => {
    try {
      log(`[BASIC SEARCH] Getting best match for: ${query}`);

      const results = await searchApi.searchCards({
        query,
        limit: 1,
      });

      return results && results.length > 0 ? results[0] : null;
    } catch (error) {
      log(`[BASIC SEARCH] Best match search failed: ${error}`);
      return null;
    }
  }, []);

  const setSearchMode = useCallback((mode: 'cards' | 'products') => {
    setState(prev => ({
      ...prev,
      searchMode: mode,
      searchResults: [], // Clear results when changing modes
    }));
  }, []);

  const clearSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      searchTerm: '',
      searchResults: [],
      loading: false,
      error: null,
      searchMode: state.searchMode, // Preserve search mode
    });
  }, [state.searchMode]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    handleSearch,
    setSearchMode,
    clearSearch,
    clearError,
    getBestMatch,
  };
};

export default useBasicSearch;
