/**
 * Search Suggestions Hook
 * Handles suggestion management and selection logic
 *
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Only handles suggestions and autocomplete
 * - Extracted from 822-line useSearch hook for better maintainability
 * - Focused on suggestion state and selection handling
 */

import { useState, useRef, useCallback } from 'react';
import {
  searchApi,
  SetResult,
  CardResult,
  ProductResult,
  CategoryResult,
} from '../../api/searchApi';
import { handleApiError } from '../../utils/errorHandler';
import { log } from '../../utils/logger';
import { useSearchCache } from './useSearchCache';

type SuggestionType = SetResult[] | CardResult[] | ProductResult[] | CategoryResult[];

export interface SuggestionsState {
  suggestions: SuggestionType;
  loading: boolean;
  error: string | null;
  searchMeta?: {
    cached?: boolean;
    hitRate?: number;
    queryTime?: number;
  };
}

export interface UseSearchSuggestionsReturn extends SuggestionsState {
  // Suggestion operations
  searchSuggestions: (
    query: string,
    type: 'set' | 'card' | 'product' | 'category'
  ) => Promise<void>;
  clearSuggestions: () => void;
  clearError: () => void;

  // Selection handlers
  handleSuggestionSelect: (
    suggestion: SetResult | CardResult | ProductResult | CategoryResult,
    fieldType: 'set' | 'category' | 'cardProduct'
  ) => void;

  // Utility
  getSuggestionDisplayText: (
    suggestion: SetResult | CardResult | ProductResult | CategoryResult
  ) => string;
}

/**
 * Hook for search suggestions and autocomplete
 * Handles debounced suggestion searches and selection logic
 * Separated from main search logic for better maintainability
 */
export const useSearchSuggestions = (): UseSearchSuggestionsReturn => {
  const [state, setState] = useState<SuggestionsState>({
    suggestions: [],
    loading: false,
    error: null,
  });

  const debounceRef = useRef<number>();
  const abortControllerRef = useRef<AbortController | null>(null);
  const cache = useSearchCache();

  const searchSuggestions = useCallback(
    async (query: string, type: 'set' | 'card' | 'product' | 'category') => {
      if (!query.trim()) {
        setState(prev => ({
          ...prev,
          suggestions: [],
          error: null,
        }));
        return;
      }

      // Clear previous debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const startTime = Date.now();

      debounceRef.current = window.setTimeout(async () => {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setState(prev => ({
          ...prev,
          loading: true,
          error: null,
        }));

        try {
          const cacheKey = `suggestions_${type}_${query.toLowerCase()}`;

          // Check cache first
          const cachedResults = cache.getCachedResults(cacheKey);
          if (cachedResults) {
            setState(prev => ({
              ...prev,
              suggestions: cachedResults,
              loading: false,
              searchMeta: {
                cached: true,
                hitRate: cache.getCacheStats().hitRate,
                queryTime: cache.getQueryTime(startTime),
              },
            }));
            return;
          }

          log(`[SEARCH SUGGESTIONS] Searching ${type} suggestions for: ${query}`);

          let results: SuggestionType = [];

          switch (type) {
            case 'set':
              results = await searchApi.searchSets({ query, limit: 10 });
              break;
            case 'card':
              results = await searchApi.searchCards({ query, limit: 10 });
              break;
            case 'product':
              results = await searchApi.searchProducts({ query, limit: 10 });
              break;
            case 'category':
              results = await searchApi.searchCategories({ query, limit: 10 });
              break;
          }

          if (!abortController.signal.aborted) {
            // Cache the results
            cache.setCachedResults(cacheKey, results);

            setState(prev => ({
              ...prev,
              suggestions: results,
              loading: false,
              searchMeta: {
                cached: false,
                hitRate: cache.getCacheStats().hitRate,
                queryTime: cache.getQueryTime(startTime),
              },
            }));

            log(`[SEARCH SUGGESTIONS] Found ${results.length} ${type} suggestions`);
          }
        } catch (error) {
          if (!abortController.signal.aborted) {
            const errorMessage = `Failed to load ${type} suggestions. Please try again.`;
            handleApiError(error, errorMessage);

            setState(prev => ({
              ...prev,
              error: errorMessage,
              loading: false,
              suggestions: [],
            }));
          }
        }
      }, 300); // 300ms debounce
    },
    [cache]
  );

  const handleSuggestionSelect = useCallback(
    (
      suggestion: SetResult | CardResult | ProductResult | CategoryResult,
      fieldType: 'set' | 'category' | 'cardProduct'
    ) => {
      log(`[SEARCH SUGGESTIONS] Selected ${fieldType} suggestion:`, suggestion);

      // Clear suggestions after selection
      setState(prev => ({
        ...prev,
        suggestions: [],
      }));

      // This would typically call a callback to update parent component state
      // For now, we'll just log the selection
      // The parent component should handle the actual selection logic
    },
    []
  );

  const getSuggestionDisplayText = useCallback(
    (suggestion: SetResult | CardResult | ProductResult | CategoryResult): string => {
      if ('setName' in suggestion) {
        // SetResult
        return `${suggestion.setName} (${suggestion.year || 'Unknown Year'})`;
      } else if ('cardName' in suggestion && 'baseName' in suggestion) {
        // CardResult
        return `${suggestion.cardName} - ${suggestion.baseName}${suggestion.variety ? ` (${suggestion.variety})` : ''}`;
      } else if ('name' in suggestion && 'category' in suggestion) {
        // ProductResult
        return `${suggestion.name} - ${suggestion.category}`;
      } else if ('category' in suggestion) {
        // CategoryResult
        return suggestion.category;
      }

      return 'Unknown suggestion';
    },
    []
  );

  const clearSuggestions = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      suggestions: [],
      loading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    searchSuggestions,
    clearSuggestions,
    clearError,
    handleSuggestionSelect,
    getSuggestionDisplayText,
  };
};

export default useSearchSuggestions;
