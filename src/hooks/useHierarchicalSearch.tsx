/**
 * useHierarchicalSearch - Centralized Hierarchical Search Logic
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Manages hierarchical search state and logic
 * - DRY: Eliminates duplicate search logic across Card/Product forms
 * - Dependency Inversion: Uses abstract search hook instead of concrete APIs
 * - Open/Closed: Extensible for different search hierarchies
 */

import { useEffect, useState, useCallback } from 'react';
import { SearchResult, useSearch } from './useSearch';
import { useDebouncedValue } from './useDebounce';

export type SearchFieldType = 'setName' | 'productName' | 'cardName';
export type SearchMode = 'card' | 'product';

interface HierarchicalSearchConfig {
  mode: SearchMode;
  primaryField: SearchFieldType;
  secondaryField: SearchFieldType;
  debounceDelay?: number;
}

interface HierarchicalSearchState {
  activeField: SearchFieldType | null;
  suggestions: SearchResult[];
  isLoading: boolean;
}

interface HierarchicalSearchActions {
  setActiveField: (field: SearchFieldType | null) => void;
  handlePrimarySelection: (
    result: SearchResult,
    setValue: Function,
    clearErrors: Function,
    onSelection?: Function
  ) => void;
  handleSecondarySelection: (
    result: SearchResult,
    setValue: Function,
    clearErrors: Function,
    onSelection: Function
  ) => void;
  clearSuggestions: () => void;
}

interface UseHierarchicalSearchProps {
  config: HierarchicalSearchConfig;
  primaryValue: string;
  secondaryValue: string;
}

interface UseHierarchicalSearchReturn
  extends HierarchicalSearchState,
    HierarchicalSearchActions {}

/**
 * Centralized hook for hierarchical search patterns
 * Handles Set -> Card/Product search flows
 */
export const useHierarchicalSearch = ({
  config,
  primaryValue,
  secondaryValue,
}: UseHierarchicalSearchProps): UseHierarchicalSearchReturn => {
  // Local state
  const [activeField, setActiveField] = useState<SearchFieldType | null>(null);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search hook
  const search = useSearch();

  // Debounced values
  const debouncedPrimary = useDebouncedValue(
    primaryValue,
    config.debounceDelay || 300
  );
  const debouncedSecondary = useDebouncedValue(
    secondaryValue,
    config.debounceDelay || 300
  );

  // Sync search results to local state
  useEffect(() => {
    setSuggestions(search.results || []);
    setIsLoading(search.isLoading);
  }, [search.results, search.isLoading]);

  // Centralized search effect
  useEffect(() => {
    if (!activeField) {
      setSuggestions([]);
      return;
    }

    const currentValue =
      activeField === config.primaryField
        ? debouncedPrimary
        : debouncedSecondary;

    if (!currentValue || typeof currentValue !== 'string') {
      setSuggestions([]);
      return;
    }

    // Execute search based on active field and mode
    switch (activeField) {
      case config.primaryField:
        if (config.mode === 'card') {
          search.searchSets(currentValue);
        } else {
          search.searchSetProducts(currentValue);
        }
        break;

      case config.secondaryField: {
        // Hierarchical logic: filter by primary selection
        let searchQuery = currentValue;
        if (!currentValue || currentValue.trim() === '') {
          // Show all from primary selection if exists
          if (primaryValue && primaryValue.trim()) {
            searchQuery = '*';
          } else {
            setSuggestions([]);
            return;
          }
        }

        // Search within primary selection context
        if (config.mode === 'card') {
          search.searchCards(searchQuery, primaryValue?.trim() || undefined);
        } else {
          search.searchProducts(searchQuery, primaryValue?.trim() || undefined);
        }
        break;
      }
    }
  }, [
    activeField,
    debouncedPrimary,
    debouncedSecondary,
    primaryValue,
    config,
    search.searchSets,
    search.searchCards,
    search.searchSetProducts,
    search.searchProducts,
    search,
  ]);

  // Handle primary field selection (Set/SetProduct)
  const handlePrimarySelection = useCallback(
    (
      result: SearchResult,
      setValue: Function,
      clearErrors: Function,
      onSelection?: Function
    ) => {
      console.log('[HIERARCHICAL] Primary selection:', result);

      if (!result.id || !result.displayName) {
        setValue(config.primaryField, '');
        clearErrors(config.primaryField);
        onSelection?.(null);
        setSuggestions([]);
        setActiveField(null);
        return;
      }

      // Set primary field value
      const selectedName =
        config.mode === 'card'
          ? result.data?.setName || result.displayName
          : result.data?.setProductName || result.displayName;

      setValue(config.primaryField, selectedName);
      clearErrors(config.primaryField);

      // Auto-fill additional fields
      if (config.mode === 'card' && result.data?.year) {
        setValue('year', result.data.year);
        clearErrors('year');
      }

      // Clear secondary field for fresh selection
      setValue(config.secondaryField, '');
      clearErrors(config.secondaryField);

      // Notify parent
      onSelection?.({
        [config.primaryField]: selectedName,
        _id: result.id,
        ...result.data,
      });

      // Clear suggestions
      setTimeout(() => {
        setSuggestions([]);
        setActiveField(null);
      }, 10);
    },
    [config, setValue, clearErrors]
  );

  // Handle secondary field selection (Card/Product)
  const handleSecondarySelection = useCallback(
    (
      result: SearchResult,
      setValue: Function,
      clearErrors: Function,
      onSelection: Function
    ) => {
      console.log('[HIERARCHICAL] Secondary selection:', result);

      if (!result.id || !result.displayName) {
        setValue(config.secondaryField, '');
        clearErrors(config.secondaryField);
        onSelection(null);
        setSuggestions([]);
        setActiveField(null);
        return;
      }

      // For cards, use direct selection without autofill
      if (config.mode === 'card') {
        const cardData = {
          _id: result.id,
          ...result.data,
        };
        onSelection(cardData);
      } else {
        // For products, use autofill pattern
        const {
          autoFillFromProductSelection,
        } = require('../utils/searchHelpers');
        const autoFillConfig = { setValue, clearErrors };
        autoFillFromProductSelection(autoFillConfig, result, onSelection);
      }

      // Clear suggestions
      setTimeout(() => {
        setSuggestions([]);
        setActiveField(null);
      }, 10);
    },
    [config, setValue, clearErrors]
  );

  // Clear suggestions utility
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setActiveField(null);
  }, []);

  return {
    // State
    activeField,
    suggestions,
    isLoading,

    // Actions
    setActiveField,
    handlePrimarySelection,
    handleSecondarySelection,
    clearSuggestions,
  };
};

export default useHierarchicalSearch;
