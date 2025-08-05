/**
 * Autocomplete Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * UPDATED: Enhanced for dual hierarchical search patterns
 * - Set → Card: Traditional card search within sets
 * - SetProduct → Product: New sealed product hierarchy
 * - Product selection autofills SetProduct information
 * - No simultaneous suggestions (user specification)
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for hierarchical autocomplete logic
 * - DIP: Depends on search and SearchApiService abstractions
 * - OCP: Open for extension with new search types
 */

import { useCallback, useEffect, useState } from 'react';
import { SearchResult, useSearch } from './useSearch';
import { searchApiService } from '../services/SearchApiService';

// Enhanced interfaces for hierarchical autocomplete
export interface AutocompleteField {
  id: string;
  value: string;
  placeholder: string;
  type: 'set' | 'setProduct' | 'product' | 'card' | 'category'; // UPDATED: Added setProduct
  required?: boolean;
  disabled?: boolean;
}

export interface AutocompleteConfig {
  searchMode: 'cards' | 'products' | 'setProducts'; // UPDATED: Added setProducts
  debounceMs?: number;
  cacheEnabled?: boolean;
  maxSuggestions?: number;
  minQueryLength?: number;
  hierarchicalMode?: boolean; // NEW: Enable hierarchical filtering
  allowSimultaneousSuggestions?: boolean; // NEW: Control simultaneous suggestions (always false per user spec)
}

export const createAutocompleteConfig = (
  searchMode: 'cards' | 'products' | 'setProducts'
): AutocompleteConfig => ({
  searchMode,
  debounceMs: 300,
  cacheEnabled: true,
  maxSuggestions: 15,
  minQueryLength: 1,
  hierarchicalMode: true, // Enable hierarchical filtering by default
  allowSimultaneousSuggestions: false, // Per user specification - no simultaneous suggestions
});

export interface AutocompleteState {
  value: string;
  isOpen: boolean;
  activeIndex: number;
  selectedSetProduct?: SearchResult; // NEW: Track selected SetProduct for filtering
  selectedSet?: SearchResult; // NEW: Track selected Set for filtering
  fieldType?: 'set' | 'setProduct' | 'product' | 'card'; // NEW: Track active field type
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

  // NEW: Hierarchical methods
  setFieldType: (fieldType: 'set' | 'setProduct' | 'product' | 'card') => void;
  clearHierarchicalState: () => void;
  shouldShowSuggestions: () => boolean;

  // NEW: Selection handlers with autofill
  selectSetProduct: (setProduct: SearchResult) => void;
  selectProduct: (product: SearchResult) => Promise<{ autofillData?: any }>;
  selectSet: (set: SearchResult) => void;
}

/**
 * Enhanced Autocomplete Hook with Hierarchical Support
 * Provides hierarchical autocomplete functionality with SetProduct → Product filtering
 */
export const useAutocomplete = (
  searchType: 'sets' | 'products' | 'cards' | 'setProducts', // UPDATED: Added setProducts
  onSelect?: (result: SearchResult) => void,
  filters?: { setName?: string; category?: string; setProductId?: string }, // UPDATED: Added setProductId filter
  disabled?: boolean,
  hierarchicalConfig?: {
    enableHierarchical?: boolean;
    onAutofill?: (autofillData: any) => void; // NEW: Callback for autofill data
  }
): UseAutocompleteReturn => {
  const search = useSearch();

  const [state, setState] = useState<AutocompleteState>({
    value: '',
    isOpen: false,
    activeIndex: -1,
    selectedSetProduct: undefined,
    selectedSet: undefined,
    fieldType: undefined,
  });

  // Update search when value changes with hierarchical support
  useEffect(() => {
    if (state.value.trim() && state.isOpen && !disabled) {
      // Check if suggestions should be shown (no simultaneous suggestions per user spec)
      if (!searchApiService.shouldShowSuggestions(searchType as any)) {
        search.clearResults();
        return;
      }

      switch (searchType) {
        case 'sets':
          searchApiService.updateSearchContext({ activeField: 'set' });
          search.searchSets(state.value);
          break;
        case 'setProducts':
          searchApiService.updateSearchContext({ activeField: 'setProduct' });
          search.searchSetProducts(state.value);
          break;
        case 'products':
          searchApiService.updateSearchContext({ activeField: 'product' });
          search.searchProducts(
            state.value,
            filters?.setName,
            filters?.category
          );
          break;
        case 'cards':
          searchApiService.updateSearchContext({ activeField: 'card' });
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
    filters?.setProductId,
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
      selectedSetProduct: undefined,
      selectedSet: undefined,
      fieldType: undefined,
    });
    search.clearResults();
    search.clearError();

    // Clear hierarchical context if enabled
    if (hierarchicalConfig?.enableHierarchical) {
      searchApiService.clearSearchContext();
    }
  }, [hierarchicalConfig?.enableHierarchical]);

  // NEW: Hierarchical methods
  const selectSetProduct = useCallback(
    (setProduct: SearchResult) => {
      setState((prev) => ({
        ...prev,
        selectedSetProduct: setProduct,
        fieldType: 'setProduct',
      }));

      if (hierarchicalConfig?.enableHierarchical) {
        searchApiService.handleSetProductSelection(setProduct.data);
      }
    },
    [hierarchicalConfig?.enableHierarchical]
  );

  const selectSet = useCallback(
    (set: SearchResult) => {
      setState((prev) => ({
        ...prev,
        selectedSet: set,
        fieldType: 'set',
      }));

      if (hierarchicalConfig?.enableHierarchical) {
        searchApiService.handleSetSelection(set.data);
      }
    },
    [hierarchicalConfig?.enableHierarchical]
  );

  const selectProduct = useCallback(
    async (product: SearchResult) => {
      setState((prev) => ({
        ...prev,
        fieldType: 'product',
      }));

      if (hierarchicalConfig?.enableHierarchical) {
        try {
          const result = await searchApiService.handleProductSelection(
            product.data
          );
          if (result.autofillData && hierarchicalConfig?.onAutofill) {
            hierarchicalConfig.onAutofill(result.autofillData);
          }
          return result;
        } catch (error) {
          console.error('Product selection failed:', error);
          return {};
        }
      }
      return {};
    },
    [
      hierarchicalConfig?.enableHierarchical,
      hierarchicalConfig?.onAutofill,
      searchApiService,
    ]
  );

  const setFieldType = useCallback(
    (fieldType: 'set' | 'setProduct' | 'product' | 'card') => {
      setState((prev) => ({ ...prev, fieldType }));
    },
    []
  );

  const clearHierarchicalState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedSetProduct: undefined,
      selectedSet: undefined,
      fieldType: undefined,
    }));

    if (hierarchicalConfig?.enableHierarchical) {
      searchApiService.clearSearchContext();
    }
  }, [hierarchicalConfig?.enableHierarchical]);

  const shouldShowSuggestions = useCallback(() => {
    if (!hierarchicalConfig?.enableHierarchical) {
      return true;
    }
    return searchApiService.shouldShowSuggestions(state.fieldType as any);
  }, [hierarchicalConfig?.enableHierarchical, state.fieldType]);

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

    // NEW: Hierarchical methods
    setFieldType,
    clearHierarchicalState,
    shouldShowSuggestions,
    selectSetProduct,
    selectProduct,
    selectSet,
  };
};
