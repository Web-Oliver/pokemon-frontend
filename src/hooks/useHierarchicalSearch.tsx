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
import { autoFillFromProductSelection } from '../utils/searchHelpers';

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
    setValue: (field: string, value: any) => void,
    clearErrors: (field: string) => void,
    onSelection?: (data: any) => void
  ) => void;
  handleSecondarySelection: (
    result: SearchResult,
    setValue: (field: string, value: any) => void,
    clearErrors: (field: string) => void,
    onSelection: (data: any) => void
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

  // Centralized search effect with proper minLength validation
  useEffect(() => {
    if (!activeField) {
      setSuggestions([]);
      return;
    }

    const currentValue =
      activeField === config.primaryField
        ? debouncedPrimary
        : debouncedSecondary;

    // FIXED: Proper minLength validation to prevent glitchy search behavior
    if (!currentValue || typeof currentValue !== 'string' || currentValue.trim().length < 2) {
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
        
        // FIXED: Better validation for secondary field searches
        if (currentValue.trim().length < 2) {
          setSuggestions([]);
          return;
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
    config.mode,
    config.primaryField,
    config.secondaryField,
    search.searchSets,
    search.searchCards,
    search.searchSetProducts,
    search.searchProducts,
  ]);

  // Handle primary field selection (Set/SetProduct)
  const handlePrimarySelection = useCallback(
    (
      result: SearchResult,
      setValue: (field: string, value: any) => void,
      clearErrors: (field: string) => void,
      onSelection?: (data: any) => void
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
    [config]
  );

  // Handle secondary field selection (Card/Product)
  const handleSecondarySelection = useCallback(
    (
      result: SearchResult,
      setValue: (field: string, value: any) => void,
      clearErrors: (field: string) => void,
      onSelection: (data: any) => void
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

      // FIXED: For cards, autofill set information from card data
      if (config.mode === 'card') {
        // Set the card name
        setValue(config.secondaryField, result.displayName);
        clearErrors(config.secondaryField);
        
        // CRITICAL FIX: Autofill Set Name from card data
        if (result.data?.setName) {
          setValue('setName', result.data.setName);
          clearErrors('setName');
        }
        
        // Autofill other card fields if available
        if (result.data?.cardNumber) {
          setValue('cardNumber', result.data.cardNumber);
          clearErrors('cardNumber');
        }
        if (result.data?.variety) {
          setValue('variety', result.data.variety);
          clearErrors('variety');
        }
        
        const cardData = {
          _id: result.id,
          cardName: result.displayName,
          setName: result.data?.setName,
          cardNumber: result.data?.cardNumber,
          variety: result.data?.variety,
          ...result.data,
        };
        onSelection(cardData);
      } else {
        // For products, use autofill pattern
        const autoFillConfig = { setValue, clearErrors };
        autoFillFromProductSelection(autoFillConfig, result, onSelection);
      }

      // Clear suggestions
      setTimeout(() => {
        setSuggestions([]);
        setActiveField(null);
      }, 10);
    },
    [config]
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
