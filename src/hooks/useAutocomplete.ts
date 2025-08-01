/**
 * Autocomplete Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Focused autocomplete using the consolidated search hook
 */

import { useCallback, useEffect, useState } from 'react';
import { SearchResult, useSearch } from './useSearch';

// Legacy compatibility interfaces
export interface AutocompleteField {
  id: string;
  value: string;
  placeholder: string;
  type: 'set' | 'category' | 'cardProduct';
  required?: boolean;
  disabled?: boolean;
}

export interface AutocompleteConfig {
  searchMode: 'cards' | 'products';
  debounceMs?: number;
  cacheEnabled?: boolean;
  maxSuggestions?: number;
  minQueryLength?: number;
}

export const createAutocompleteConfig = (
  searchMode: 'cards' | 'products'
): AutocompleteConfig => ({
  searchMode,
  debounceMs: 300,
  cacheEnabled: true,
  maxSuggestions: 15,
  minQueryLength: 1,
});

export interface AutocompleteState {
  value: string;
  isOpen: boolean;
  activeIndex: number;
}

export interface UseAutocompleteReturn extends AutocompleteState {
  // Input handling
  setValue: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;

  // Results
  results: SearchResult[];
  loading: boolean;
  error: string | null;

  // Selection
  selectResult: (result: SearchResult) => void;
  selectByIndex: (index: number) => void;

  // Navigation
  moveUp: () => void;
  moveDown: () => void;
  selectActive: () => void;

  // Utility
  close: () => void;
  clear: () => void;
}

/**
 * Autocomplete Hook
 * Provides focused autocomplete functionality using the search hook
 */
export const useAutocomplete = (
  searchType: 'sets' | 'products' | 'cards',
  onSelect?: (result: SearchResult) => void,
  filters?: { setName?: string; category?: string },
  disabled?: boolean
): UseAutocompleteReturn => {
  const search = useSearch();

  const [state, setState] = useState<AutocompleteState>({
    value: '',
    isOpen: false,
    activeIndex: -1,
  });

  // Update search when value changes
  useEffect(() => {
    if (state.value.trim() && state.isOpen && !disabled) {
      switch (searchType) {
        case 'sets':
          search.searchSets(state.value);
          break;
        case 'products':
          search.searchProducts(
            state.value,
            filters?.setName,
            filters?.category
          );
          break;
        case 'cards':
          search.searchCards(state.value, filters?.setName);
          break;
      }
    } else {
      search.clearResults();
    }
  }, [
    state.value,
    state.isOpen,
    searchType,
    filters?.setName,
    filters?.category,
    disabled,
  ]);

  // Set value and trigger search
  const setValue = useCallback(
    (value: string) => {
      setState((prev) => ({
        ...prev,
        value,
        activeIndex: -1,
        isOpen: !disabled && value.trim().length >= 1,
      }));
    },
    [disabled]
  );

  // Handle focus
  const onFocus = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: !disabled && prev.value.trim().length >= 1,
    }));
  }, [disabled]);

  // Handle blur with delay to allow selection
  const onBlur = useCallback(() => {
    setTimeout(() => {
      setState((prev) => ({ ...prev, isOpen: false, activeIndex: -1 }));
    }, 150);
  }, []);

  // Select a result
  const selectResult = useCallback(
    (result: SearchResult) => {
      setState((prev) => ({
        ...prev,
        value: result.displayName,
        isOpen: false,
        activeIndex: -1,
      }));
      onSelect?.(result);
      search.clearResults();
    },
    [onSelect]
  );

  // Select by index
  const selectByIndex = useCallback(
    (index: number) => {
      const result = search.results[index];
      if (result) {
        selectResult(result);
      }
    },
    [search.results, selectResult]
  );

  // Navigation
  const moveUp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeIndex:
        prev.activeIndex > 0 ? prev.activeIndex - 1 : search.results.length - 1,
    }));
  }, [search.results.length]);

  const moveDown = useCallback(() => {
    setState((prev) => ({
      ...prev,
      activeIndex:
        prev.activeIndex < search.results.length - 1 ? prev.activeIndex + 1 : 0,
    }));
  }, [search.results.length]);

  const selectActive = useCallback(() => {
    if (state.activeIndex >= 0 && search.results[state.activeIndex]) {
      selectResult(search.results[state.activeIndex]);
    }
  }, [state.activeIndex, search.results, selectResult]);

  // Close dropdown
  const close = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false, activeIndex: -1 }));
  }, []);

  // Clear everything
  const clear = useCallback(() => {
    setState({
      value: '',
      isOpen: false,
      activeIndex: -1,
    });
    search.clearResults();
    search.clearError();
  }, []);

  return {
    // State
    ...state,

    // Input handling
    setValue,
    onFocus,
    onBlur,

    // Results from search hook
    results: search.results,
    loading: search.loading,
    error: search.error,

    // Selection
    selectResult,
    selectByIndex,

    // Navigation
    moveUp,
    moveDown,
    selectActive,

    // Utility
    close,
    clear,
  };
};
