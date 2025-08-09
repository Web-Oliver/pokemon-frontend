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

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { SearchResult, useUnifiedSearch } from './useUnifiedSearch';
import { useDebouncedValue } from './useDebounce';
import { autoFillFromProductSelection } from '../utils/helpers/searchHelpers';

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


  // CRITICAL FIX: Memoize the scope types to prevent infinite query key changes
  const scopeTypes = useMemo(() => {
    if (!activeField) {
      return ['sets']; // Default to sets when no field is active
    }
    
    if (activeField === config.primaryField) {
      // Searching in primary field (Set Name) - search for sets
      return config.mode === 'card' ? ['sets'] : ['setproducts'];
    } else {
      // Searching in secondary field (Card/Product Name) - search for cards/products
      return config.mode === 'card' ? ['cards'] : ['products'];
    }
  }, [activeField, config.primaryField, config.mode]);

  const searchConfig = useMemo(() => ({
    strategy: 'basic' as const,
    scope: {
      types: scopeTypes,
    },
    minLength: 2,
    debounceMs: 300,
  }), [scopeTypes]);
  
  const search = useUnifiedSearch(searchConfig);
  
  
  // Debounced values
  const debouncedPrimary = useDebouncedValue(
    primaryValue,
    config.debounceDelay || 300
  );
  const debouncedSecondary = useDebouncedValue(
    secondaryValue,
    config.debounceDelay || 300
  );

  // Ref to prevent infinite loops
  const lastSearchRef = useRef({
    results: null as SearchResult[] | null,
    isLoading: false,
  });

  // Sync search results to local state with stable references
  useEffect(() => {
    const newResults = search?.results || [];
    const newLoading = search?.isLoading || false;


    console.log('[HIERARCHICAL SYNC] Search results sync:', {
      hasSearchObject: !!search,
      newResultsLength: newResults.length,
      newLoading,
      searchQuery: search?.query,
      searchDebouncedQuery: search?.debouncedQuery,
      firstFewResults: newResults.slice(0, 3)
    });

    // Only update if there's an actual change
    if (
      JSON.stringify(lastSearchRef.current.results) !== JSON.stringify(newResults) ||
      lastSearchRef.current.isLoading !== newLoading
    ) {
      console.log('[HIERARCHICAL SYNC] Results changed, updating suggestions');
      
      lastSearchRef.current = {
        results: newResults,
        isLoading: newLoading,
      };
      
      setSuggestions(newResults);
      setIsLoading(newLoading);
    } else {
      console.log('[HIERARCHICAL SYNC] No change detected, skipping update');
    }
  }, [search?.results, search?.isLoading]);

  // Search execution with debounce prevention
  const lastSearchParamsRef = useRef({
    activeField: null as SearchFieldType | null,
    debouncedPrimary: '',
    debouncedSecondary: '',
    primaryValue: '',
  });

  // Centralized search effect with proper minLength validation
  useEffect(() => {
    // Create current search params
    const currentParams = {
      activeField,
      debouncedPrimary,
      debouncedSecondary,
      primaryValue,
    };

    // Check if search params actually changed
    const paramsChanged = JSON.stringify(lastSearchParamsRef.current) !== JSON.stringify(currentParams);
    
    
    if (!paramsChanged) {
      return;
    }

    // Update last search params
    lastSearchParamsRef.current = currentParams;
    
    if (!activeField) {
      setSuggestions([]);
      return;
    }

    const currentValue =
      activeField === config.primaryField
        ? debouncedPrimary
        : debouncedSecondary;

    // FIXED: Proper minLength validation to prevent glitchy search behavior
    
    if (
      !currentValue ||
      typeof currentValue !== 'string' ||
      currentValue.trim().length < 2
    ) {
      setSuggestions([]);
      return;
    }

    // Execute search based on active field and mode
    
    // Execute search using the unified search interface
    
    if (search?.setQuery && typeof search.setQuery === 'function') {
      search.setQuery(currentValue);
    }
  }, [
    activeField,
    debouncedPrimary,
    debouncedSecondary,
    primaryValue,
    config.mode,
    config.primaryField,
    config.secondaryField,
  ]);

  // Handle primary field selection (Set/SetProduct)
  const handlePrimarySelection = useCallback(
    (
      result: SearchResult,
      setValue: (field: string, value: any) => void,
      clearErrors: (field: string) => void,
      onSelection?: (data: any) => void
    ) => {

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

        // CRITICAL FIX: Autofill Set Name from card data with multiple fallbacks
        const setNameValue = result.data?.setName || result.data?.setDisplayName || result.data?.Set?.setName;
        
        if (setNameValue) {
          setValue('setName', setNameValue);
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
          setName: setNameValue,
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
