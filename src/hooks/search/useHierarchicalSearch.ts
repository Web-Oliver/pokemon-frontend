/**
 * Hierarchical Search Hook
 * Handles set-based filtering and hierarchical search logic
 *
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Only handles hierarchical search relationships
 * - Extracted from 822-line useSearch hook for better maintainability
 * - Focused on set/category/product relationships and filtering
 */

import { useState, useCallback } from 'react';
import {
  SetResult,
  CardResult,
  ProductResult,
  CategoryResult,
} from '../../api/searchApi';
import { log } from '../../utils/logger';

export interface HierarchicalSearchState {
  selectedSet: string | null;
  selectedCategory: string | null;
  setName: string;
  categoryName: string;
  cardProductName: string;
  activeField: 'set' | 'category' | 'cardProduct' | null;

  // Selected data for autofill
  selectedCardData: {
    cardName: string;
    pokemonNumber: string;
    baseName: string;
    variety: string;
    setInfo?: { setName: string; year?: number };
    categoryInfo?: { category: string };
  } | null;
}

export interface UseHierarchicalSearchReturn extends HierarchicalSearchState {
  // Field updates
  updateSetName: (value: string) => void;
  updateCategoryName: (value: string) => void;
  updateCardProductName: (value: string) => void;

  // Selection management
  clearSelectedSet: () => void;
  clearSelectedCategory: () => void;
  setActiveField: (field: 'set' | 'category' | 'cardProduct' | null) => void;

  // Hierarchical selection logic
  handleHierarchicalSelection: (
    suggestion: SetResult | CardResult | ProductResult | CategoryResult,
    fieldType: 'set' | 'category' | 'cardProduct'
  ) => void;

  // Filtering logic
  shouldShowSuggestions: (
    fieldType: 'set' | 'category' | 'cardProduct'
  ) => boolean;
  getFilteredSearchContext: () => {
    setFilter?: string;
    categoryFilter?: string;
  };
}

/**
 * Hook for hierarchical search functionality
 * Manages set-based filtering and card/product relationships
 * Implements the complex hierarchical logic from the original useSearch
 */
export const useHierarchicalSearch = (): UseHierarchicalSearchReturn => {
  const [state, setState] = useState<HierarchicalSearchState>({
    selectedSet: null,
    selectedCategory: null,
    setName: '',
    categoryName: '',
    cardProductName: '',
    activeField: null,
    selectedCardData: null,
  });

  const updateSetName = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      setName: value,
      activeField: 'set',
      // Clear card/product selection when set changes
      cardProductName: '',
      selectedCardData: null,
    }));
  }, []);

  const updateCategoryName = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      categoryName: value,
      activeField: 'category',
      // Clear card/product selection when category changes
      cardProductName: '',
      selectedCardData: null,
    }));
  }, []);

  const updateCardProductName = useCallback((value: string) => {
    setState((prev) => ({
      ...prev,
      cardProductName: value,
      activeField: 'cardProduct',
    }));
  }, []);

  const clearSelectedSet = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedSet: null,
      setName: '',
      // Also clear dependent fields
      cardProductName: '',
      selectedCardData: null,
    }));
    log('[HIERARCHICAL SEARCH] Cleared selected set');
  }, []);

  const clearSelectedCategory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedCategory: null,
      categoryName: '',
      // Also clear dependent fields
      cardProductName: '',
      selectedCardData: null,
    }));
    log('[HIERARCHICAL SEARCH] Cleared selected category');
  }, []);

  const setActiveField = useCallback(
    (field: 'set' | 'category' | 'cardProduct' | null) => {
      setState((prev) => ({
        ...prev,
        activeField: field,
      }));
    },
    []
  );

  const handleHierarchicalSelection = useCallback(
    (
      suggestion: SetResult | CardResult | ProductResult | CategoryResult,
      fieldType: 'set' | 'category' | 'cardProduct'
    ) => {
      log(`[HIERARCHICAL SEARCH] Handling ${fieldType} selection:`, suggestion);

      switch (fieldType) {
        case 'set':
          if ('setName' in suggestion) {
            setState((prev) => ({
              ...prev,
              selectedSet: suggestion.id || suggestion.setName,
              setName: suggestion.setName,
              activeField: null, // Clear active field after selection
              // Clear dependent fields
              cardProductName: '',
              selectedCardData: null,
            }));
            log(`[HIERARCHICAL SEARCH] Set selected: ${suggestion.setName}`);
          }
          break;

        case 'category':
          if ('category' in suggestion) {
            setState((prev) => ({
              ...prev,
              selectedCategory: suggestion.category,
              categoryName: suggestion.category,
              activeField: null,
              // Clear dependent fields
              cardProductName: '',
              selectedCardData: null,
            }));
            log(
              `[HIERARCHICAL SEARCH] Category selected: ${suggestion.category}`
            );
          }
          break;

        case 'cardProduct':
          // Handle both card and product selections
          if ('cardName' in suggestion && 'baseName' in suggestion) {
            // Card selection - autofill form data
            setState((prev) => ({
              ...prev,
              cardProductName: suggestion.cardName,
              activeField: null,
              selectedCardData: {
                cardName: suggestion.cardName,
                pokemonNumber: suggestion.pokemonNumber || '',
                baseName: suggestion.baseName,
                variety: suggestion.variety || '',
                setInfo:
                  'setName' in suggestion
                    ? {
                        setName: suggestion.setName,
                        year: suggestion.year,
                      }
                    : undefined,
              },
              // Auto-fill set if not already selected
              ...(!prev.selectedSet && 'setName' in suggestion
                ? {
                    selectedSet: suggestion.setName,
                    setName: suggestion.setName,
                  }
                : {}),
            }));
            log(`[HIERARCHICAL SEARCH] Card selected: ${suggestion.cardName}`);
          } else if ('name' in suggestion && 'category' in suggestion) {
            // Product selection
            setState((prev) => ({
              ...prev,
              cardProductName: suggestion.name,
              activeField: null,
              selectedCardData: {
                cardName: suggestion.name,
                pokemonNumber: '',
                baseName: suggestion.name,
                variety: '',
                categoryInfo: { category: suggestion.category },
              },
              // Auto-fill category if not already selected
              ...(!prev.selectedCategory
                ? {
                    selectedCategory: suggestion.category,
                    categoryName: suggestion.category,
                  }
                : {}),
            }));
            log(`[HIERARCHICAL SEARCH] Product selected: ${suggestion.name}`);
          }
          break;
      }
    },
    []
  );

  const shouldShowSuggestions = useCallback(
    (fieldType: 'set' | 'category' | 'cardProduct'): boolean => {
      // Only show suggestions for the currently active field
      return state.activeField === fieldType;
    },
    [state.activeField]
  );

  const getFilteredSearchContext = useCallback(() => {
    const context: { setFilter?: string; categoryFilter?: string } = {};

    if (state.selectedSet) {
      context.setFilter = state.selectedSet;
    }

    if (state.selectedCategory) {
      context.categoryFilter = state.selectedCategory;
    }

    return context;
  }, [state.selectedSet, state.selectedCategory]);

  return {
    ...state,
    updateSetName,
    updateCategoryName,
    updateCardProductName,
    clearSelectedSet,
    clearSelectedCategory,
    setActiveField,
    handleHierarchicalSelection,
    shouldShowSuggestions,
    getFilteredSearchContext,
  };
};

export default useHierarchicalSearch;
