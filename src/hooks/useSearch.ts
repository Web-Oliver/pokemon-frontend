/**
 * Enhanced Search Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Manages search functionality with hierarchical logic and caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ICard } from '../domain/models/card';
import * as cardsApi from '../api/cardsApi';
import * as setsApi from '../api/setsApi';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';

export interface SearchState {
  searchTerm: string;
  searchResults: ICard[];
  suggestions: string[];
  loading: boolean;
  searchMeta?: {
    cached?: boolean;
    hitRate?: number;
    queryTime?: number;
  };
  error: string | null;
  
  // Hierarchical search state
  selectedSet: string | null;
  setName: string;
  cardProductName: string;
  activeField: 'set' | 'cardProduct' | null;
}

export interface UseSearchReturn extends SearchState {
  // Search operations
  handleSearch: (query: string) => Promise<void>;
  handleSuggestionSelect: (suggestion: string, fieldType: 'set' | 'cardProduct') => void;
  getBestMatch: (query: string) => Promise<ICard | null>;
  
  // Hierarchical search operations
  updateSetName: (value: string) => void;
  updateCardProductName: (value: string) => void;
  clearSelectedSet: () => void;
  setActiveField: (field: 'set' | 'cardProduct' | null) => void;
  
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
    setName: '',
    cardProductName: '',
    activeField: null,
  });

  const debounceRef = useRef<NodeJS.Timeout>();
  const suggestionsCacheRef = useRef<Map<string, string[]>>(new Map());

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
    }));
  }, []);

  /**
   * Handle main search functionality
   */
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      log(`Searching for: ${query}`);
      
      // Apply hierarchical filtering if set is selected
      const searchParams = state.selectedSet 
        ? { setName: state.selectedSet, limit: 50 }
        : { limit: 50 };

      const results = await cardsApi.searchCards(query, searchParams);
      
      setState(prev => ({
        ...prev,
        searchTerm: query,
        searchResults: results,
        loading: false,
        // Note: searchMeta would be populated from backend response
        searchMeta: {
          cached: false, // This would come from backend
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
  }, [state.selectedSet, clearSearch, setLoading, setError]);

  /**
   * Get suggestions with caching and debounce
   */
  const getSuggestions = useCallback(async (query: string, fieldType: 'set' | 'cardProduct') => {
    if (!query.trim() || query.length < 2) {
      setState(prev => ({ ...prev, suggestions: [] }));
      return;
    }

    // Check cache first
    const cacheKey = `${fieldType}:${query}`;
    if (suggestionsCacheRef.current.has(cacheKey)) {
      const cachedSuggestions = suggestionsCacheRef.current.get(cacheKey)!;
      setState(prev => ({ ...prev, suggestions: cachedSuggestions }));
      return;
    }

    try {
      let suggestions: string[] = [];

      if (fieldType === 'set') {
        // Get set suggestions
        const sets = await setsApi.getSets();
        suggestions = sets
          .filter(set => set.setName.toLowerCase().includes(query.toLowerCase()))
          .map(set => set.setName)
          .slice(0, 10);
      } else if (fieldType === 'cardProduct') {
        // Get card suggestions with hierarchical filtering
        const searchParams = state.selectedSet 
          ? { setName: state.selectedSet }
          : undefined;
        
        suggestions = await cardsApi.getCardSuggestions(query, 10);
      }

      // Cache suggestions
      suggestionsCacheRef.current.set(cacheKey, suggestions);
      
      setState(prev => ({ ...prev, suggestions }));
      
      log(`Got ${suggestions.length} suggestions for ${fieldType}: ${query}`);
    } catch (error) {
      log(`Failed to get suggestions: ${error}`);
      setState(prev => ({ ...prev, suggestions: [] }));
    }
  }, [state.selectedSet]);

  /**
   * Handle suggestion selection with hierarchical logic
   */
  const handleSuggestionSelect = useCallback((suggestion: string, fieldType: 'set' | 'cardProduct') => {
    if (fieldType === 'set') {
      // Set selection affects subsequent card/product searches
      setState(prev => ({
        ...prev,
        setName: suggestion,
        selectedSet: suggestion,
        suggestions: [],
        activeField: null,
        // Clear card/product field when set changes
        cardProductName: '',
      }));
      
      log(`Set selected: ${suggestion}. Card/product searches will be filtered to this set.`);
    } else if (fieldType === 'cardProduct') {
      // Card/product selection autofills set information
      setState(prev => ({
        ...prev,
        cardProductName: suggestion,
        suggestions: [],
        activeField: null,
      }));
      
      // Auto-fill set information based on card selection
      getBestMatchAndFillSet(suggestion);
      
      log(`Card/product selected: ${suggestion}`);
    }
  }, []);

  /**
   * Get best match and auto-fill set information
   */
  const getBestMatchAndFillSet = useCallback(async (query: string) => {
    try {
      const bestMatch = await cardsApi.getBestMatchCard(query);
      if (bestMatch && bestMatch.setId) {
        // Fetch set information and auto-fill
        const set = await setsApi.getSetById(bestMatch.setId);
        setState(prev => ({
          ...prev,
          setName: set.setName,
          selectedSet: set.setName,
        }));
        
        log(`Auto-filled set: ${set.setName} based on card selection`);
      }
    } catch (error) {
      log(`Failed to auto-fill set information: ${error}`);
    }
  }, []);

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
  const updateSetName = useCallback((value: string) => {
    setState(prev => ({
      ...prev,
      setName: value,
      activeField: 'set',
      // Clear card/product suggestions when typing in set field
      suggestions: prev.activeField !== 'set' ? [] : prev.suggestions,
    }));

    // Debounced suggestions
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      getSuggestions(value, 'set');
    }, 300);
  }, [getSuggestions]);

  /**
   * Update card/product name field
   */
  const updateCardProductName = useCallback((value: string) => {
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

    debounceRef.current = setTimeout(() => {
      getSuggestions(value, 'cardProduct');
    }, 300);
  }, [getSuggestions]);

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
   * Set active field for suggestion display
   */
  const setActiveField = useCallback((field: 'set' | 'cardProduct' | null) => {
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
    updateCardProductName,
    clearSelectedSet,
    setActiveField,
    
    // General operations
    clearSearch,
    clearError,
  };
};