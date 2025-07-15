/**
 * Enhanced Search Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Manages search functionality with hierarchical logic and caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ICard } from '../domain/models/card';
import { searchApi, SetResult, CardResult, ProductResult, CategoryResult } from '../api/searchApi';
import * as cardsApi from '../api/cardsApi';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';

export interface SearchState {
  searchTerm: string;
  searchResults: ICard[];
  suggestions: SetResult[] | CardResult[] | ProductResult[] | CategoryResult[];
  loading: boolean;
  searchMeta?: {
    cached?: boolean;
    hitRate?: number;
    queryTime?: number;
  };
  error: string | null;

  // Hierarchical search state
  selectedSet: string | null;
  selectedCategory: string | null;
  setName: string;
  categoryName: string;
  cardProductName: string;
  activeField: 'set' | 'category' | 'cardProduct' | null;

  // Selected card data for autofill
  selectedCardData: {
    cardName: string;
    pokemonNumber: string;
    baseName: string;
    variety: string;
    setInfo?: { setName: string; year?: number };
    categoryInfo?: { category: string };
  } | null;
}

export interface UseSearchReturn extends SearchState {
  // Search operations
  handleSearch: (_query: string) => Promise<void>;
  handleSuggestionSelect: (
    _suggestion: SetResult | CardResult | ProductResult | CategoryResult,
    _fieldType: 'set' | 'category' | 'cardProduct'
  ) => void;
  getBestMatch: (_query: string) => Promise<ICard | null>;

  // Hierarchical search operations
  updateSetName: (_value: string) => void;
  updateCategoryName: (_value: string) => void;
  updateCardProductName: (_value: string) => void;
  clearSelectedSet: () => void;
  clearSelectedCategory: () => void;
  setActiveField: (_field: 'set' | 'category' | 'cardProduct' | null) => void;

  // General operations
  clearSearch: () => void;
  clearError: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [state, setState] = useState<SearchState>({
    searchTerm: '',
    searchResults: [],
    suggestions: [],
    loading: false,
    error: null,
    selectedSet: null,
    selectedCategory: null,
    setName: '',
    categoryName: '',
    cardProductName: '',
    activeField: null,
    selectedCardData: null,
  });

  const debounceRef = useRef<number>();
  const suggestionsCacheRef = useRef<
    Map<string, SetResult[] | CardResult[] | ProductResult[] | CategoryResult[]>
  >(new Map());

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  /**
   * Clear all search state
   */
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchTerm: '',
      searchResults: [],
      suggestions: [],
      searchMeta: undefined,
      error: null,
      selectedCardData: null,
    }));
  }, []);

  /**
   * Handle main search functionality
   */
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        clearSearch();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        log(`Searching for: ${query}`);

        // Use new unified search API with hierarchical filtering
        const results = await searchApi.searchCards(
          query,
          state.selectedSet || undefined, // setContext
          state.selectedCategory || undefined, // categoryContext
          50 // limit
        );

        // Convert CardResult[] to ICard[] for compatibility
        const cardResults: ICard[] = results.map(result => ({
          _id: result._id,
          id: result._id, // Add missing id field
          cardName: result.cardName,
          baseName: result.baseName,
          variety: result.variety || '',
          pokemonNumber: result.pokemonNumber || '',
          setId: result.setInfo?.setName || '', // This might need adjustment based on actual data structure
          // Add other required ICard properties as needed
        }));

        setState(prev => ({
          ...prev,
          searchTerm: query,
          searchResults: cardResults,
          loading: false,
          searchMeta: {
            cached: false,
            hitRate: 1.0,
            queryTime: Date.now(),
          },
        }));

        log(`Search completed. Found ${results.length} results`);
      } catch (error) {
        handleApiError(error, 'Search failed');
        setError('Search failed. Please try again.');
        setLoading(false);
      }
    },
    [state.selectedSet, state.selectedCategory, clearSearch, setLoading, setError]
  );

  /**
   * Get suggestions with caching and debounce
   */
  const getSuggestions = useCallback(
    async (query: string, fieldType: 'set' | 'category' | 'cardProduct') => {
      console.log(`[SEARCH DEBUG] getSuggestions called:`, {
        query,
        fieldType,
        selectedSet: state.selectedSet,
        selectedCategory: state.selectedCategory,
      });

      if (!query.trim() || query.length < 2) {
        console.log(`[SEARCH DEBUG] Query too short, clearing suggestions`);
        setState(prev => ({ ...prev, suggestions: [] }));
        return;
      }

      // Check cache first
      const cacheKey = `${fieldType}:${query}:${state.selectedSet || 'noSet'}:${state.selectedCategory || 'noCategory'}`;
      if (suggestionsCacheRef.current.has(cacheKey)) {
        const cachedSuggestions = suggestionsCacheRef.current.get(cacheKey)!;
        console.log(`[SEARCH DEBUG] Using cached suggestions:`, cachedSuggestions.length);
        setState(prev => ({ ...prev, suggestions: cachedSuggestions }));
        return;
      }

      try {
        console.log(`[SEARCH DEBUG] Making API call for ${fieldType} suggestions`);
        let suggestions: SetResult[] | CardResult[] | ProductResult[] | CategoryResult[] = [];

        if (fieldType === 'set') {
          console.log(`[SEARCH DEBUG] Calling searchApi.searchSets with query: "${query}"`);
          suggestions = await searchApi.searchSets(query, 10);
          console.log(`[SEARCH DEBUG] searchSets returned:`, suggestions);
        } else if (fieldType === 'category') {
          console.log(`[SEARCH DEBUG] Calling searchApi.searchCategories with query: "${query}"`);
          suggestions = await searchApi.searchCategories(query, 10);
          console.log(`[SEARCH DEBUG] searchCategories returned:`, suggestions);
        } else if (fieldType === 'cardProduct') {
          const searchParams = {
            query,
            setContext: state.selectedSet || undefined,
            categoryContext: state.selectedCategory || undefined,
            limit: 10,
          };
          console.log(`[SEARCH DEBUG] Calling searchApi.searchCards with params:`, searchParams);
          suggestions = await searchApi.searchCards(
            query,
            state.selectedSet || undefined, // Apply set context if available
            state.selectedCategory || undefined, // Apply category context if available
            10
          );
          console.log(`[SEARCH DEBUG] searchCards returned:`, suggestions);
        }

        // Cache suggestions
        suggestionsCacheRef.current.set(cacheKey, suggestions);

        setState(prev => ({ ...prev, suggestions }));

        console.log(
          `[SEARCH DEBUG] Successfully set ${suggestions.length} suggestions for ${fieldType}: ${query}`
        );
        log(`Got ${suggestions.length} suggestions for ${fieldType}: ${query}`);
      } catch (error) {
        console.error(`[SEARCH DEBUG] Failed to get suggestions:`, error);
        log(`Failed to get suggestions: ${error}`);
        setState(prev => ({ ...prev, suggestions: [] }));
      }
    },
    [state.selectedSet, state.selectedCategory]
  );

  /**
   * Handle suggestion selection with hierarchical logic - Context7/ReactiveSearch pattern
   */
  const handleSuggestionSelect = useCallback(
    (
      suggestion: SetResult | CardResult | ProductResult | CategoryResult,
      fieldType: 'set' | 'category' | 'cardProduct'
    ) => {
      console.log(`[SEARCH DEBUG] handleSuggestionSelect called:`, { suggestion, fieldType });

      if (fieldType === 'set') {
        // Context7 pattern: Set selection affects subsequent searches
        const setName = suggestion.setName || suggestion.name || suggestion;
        setState(prev => ({
          ...prev,
          setName,
          selectedSet: setName,
          suggestions: [],
          activeField: null,
          // Clear card/product field when set changes
          cardProductName: '',
          // Clear any selected card data when set changes
          selectedCardData: null,
        }));

        log(`Set selected: ${setName}. Card/product searches will be filtered to this set.`);
      } else if (fieldType === 'category') {
        // Context7 pattern: Category selection affects subsequent product searches
        const categoryName = suggestion.category || suggestion.name || suggestion;
        setState(prev => ({
          ...prev,
          categoryName,
          selectedCategory: categoryName,
          suggestions: [],
          activeField: null,
          // Clear card/product field when category changes
          cardProductName: '',
          // Clear any selected card data when category changes
          selectedCardData: null,
        }));

        log(
          `Category selected: ${categoryName}. Product searches will be filtered to this category.`
        );
      } else if (fieldType === 'cardProduct') {
        // Context7 pattern: Card/product selection autofills hierarchical context
        const cardName = suggestion.cardName || suggestion.name || suggestion;

        // Store complete card data for autofill
        const cardData = {
          cardName,
          pokemonNumber: suggestion.pokemonNumber || '',
          baseName: suggestion.baseName || cardName,
          variety: suggestion.variety || '',
          setInfo: suggestion.setInfo,
          categoryInfo: suggestion.categoryInfo,
        };

        setState(prev => ({
          ...prev,
          cardProductName: cardName,
          suggestions: [],
          activeField: null,
          // Store complete card data for form autofill
          selectedCardData: cardData,
        }));

        // Auto-fill set information if available (ReactiveSearch TreeList pattern)
        if (suggestion.setInfo && suggestion.setInfo.setName) {
          setState(prev => ({
            ...prev,
            setName: suggestion.setInfo.setName,
            selectedSet: suggestion.setInfo.setName,
          }));
          log(`Auto-filled set: ${suggestion.setInfo.setName} from card selection`);
        }

        // Auto-fill category information if available
        if (suggestion.categoryInfo && suggestion.categoryInfo.category) {
          setState(prev => ({
            ...prev,
            categoryName: suggestion.categoryInfo.category,
            selectedCategory: suggestion.categoryInfo.category,
          }));
          log(`Auto-filled category: ${suggestion.categoryInfo.category} from product selection`);
        }

        console.log(`[SEARCH DEBUG] Card data stored for autofill:`, cardData);
        log(`Card/product selected: ${cardName} with complete data for autofill`);
      }
    },
    []
  );

  /**
   * Get best match for auto-fill functionality
   */
  const getBestMatch = useCallback(async (query: string): Promise<ICard | null> => {
    try {
      return await cardsApi.getBestMatchCard(query);
    } catch (error) {
      handleApiError(error, 'Failed to get best match');
      return null;
    }
  }, []);

  /**
   * Update set name field
   */
  const updateSetName = useCallback(
    (value: string) => {
      console.log(`[SEARCH DEBUG] updateSetName called with: "${value}"`);

      setState(prev => ({
        ...prev,
        setName: value,
        selectedSet: value.trim() ? prev.selectedSet : null, // Clear selectedSet if field is empty
        activeField: 'set',
        // Clear card/product suggestions when typing in set field
        suggestions: prev.activeField !== 'set' ? [] : prev.suggestions,
        // Clear card/product field when set changes
        cardProductName: value.trim() ? prev.cardProductName : '',
      }));

      console.log(`[SEARCH DEBUG] selectedSet will be: ${value.trim() ? 'kept' : 'cleared'}`);

      // Debounced suggestions
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = window.setTimeout(() => {
        getSuggestions(value, 'set');
      }, 300);
    },
    [getSuggestions]
  );

  /**
   * Update card/product name field
   */
  const updateCardProductName = useCallback(
    (value: string) => {
      setState(prev => ({
        ...prev,
        cardProductName: value,
        activeField: 'cardProduct',
        // Clear set suggestions when typing in card/product field
        suggestions: prev.activeField !== 'cardProduct' ? [] : prev.suggestions,
      }));

      // Debounced suggestions
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = window.setTimeout(() => {
        getSuggestions(value, 'cardProduct');
      }, 300);
    },
    [getSuggestions]
  );

  /**
   * Update category name field
   */
  const updateCategoryName = useCallback(
    (value: string) => {
      setState(prev => ({
        ...prev,
        categoryName: value,
        activeField: 'category',
        // Clear card/product suggestions when typing in category field
        suggestions: prev.activeField !== 'category' ? [] : prev.suggestions,
      }));

      // Debounced suggestions
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = window.setTimeout(() => {
        getSuggestions(value, 'category');
      }, 300);
    },
    [getSuggestions]
  );

  /**
   * Clear selected set
   */
  const clearSelectedSet = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedSet: null,
      setName: '',
    }));
  }, []);

  /**
   * Clear selected category
   */
  const clearSelectedCategory = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedCategory: null,
      categoryName: '',
    }));
  }, []);

  /**
   * Set active field for suggestion display
   */
  const setActiveField = useCallback((field: 'set' | 'category' | 'cardProduct' | null) => {
    setState(prev => ({
      ...prev,
      activeField: field,
      // Clear suggestions when field changes
      suggestions: field !== prev.activeField ? [] : prev.suggestions,
    }));
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,

    // Search operations
    handleSearch,
    handleSuggestionSelect,
    getBestMatch,

    // Hierarchical search operations
    updateSetName,
    updateCategoryName,
    updateCardProductName,
    clearSelectedSet,
    clearSelectedCategory,
    setActiveField,

    // General operations
    clearSearch,
    clearError,
  };
};
