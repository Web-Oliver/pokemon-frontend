/**
 * Optimized Search Hook with Structural Sharing
 * Performance-optimized version with memoization and structural sharing
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Only handles search operations
 * - Performance optimized with structural sharing and memoization
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { useSearchCache } from './search/useSearchCache';
import { searchApi, SetResult, CardResult, ProductResult, CategoryResult } from '../api/searchApi';
import { ICard } from '../domain/models/card';
import { log } from '../utils/logger';

type SearchResultType = SetResult[] | CardResult[] | ProductResult[] | CategoryResult[];

interface OptimizedSearchState {
  searchTerm: string;
  searchResults: ICard[];
  suggestions: SearchResultType;
  loading: boolean;
  error: string | null;
  selectedSet: string | null;
  setName: string;
  cardProductName: string;
  activeField: 'set' | 'cardProduct' | null;
}

interface UseSearchOptimizedReturn extends OptimizedSearchState {
  handleSearch: (query: string) => Promise<void>;
  handleSuggestionSelect: (
    suggestion: SetResult | CardResult | ProductResult | CategoryResult,
    fieldType: 'set' | 'cardProduct'
  ) => void;
  updateSetName: (value: string) => void;
  updateCardProductName: (value: string) => void;
  clearSearch: () => void;
  setActiveField: (field: 'set' | 'cardProduct' | null) => void;
}

/**
 * Optimized search hook with structural sharing and performance optimizations
 */
export const useSearchOptimized = (): UseSearchOptimizedReturn => {
  const searchCache = useSearchCache();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Use structural sharing for state management
  const [state, setState] = useState<OptimizedSearchState>(() => ({
    searchTerm: '',
    searchResults: [],
    suggestions: [],
    loading: false,
    error: null,
    selectedSet: null,
    setName: '',
    cardProductName: '',
    activeField: null,
  }));

  // Memoized state selectors to prevent unnecessary re-renders
  const searchTerm = useMemo(() => state.searchTerm, [state.searchTerm]);
  const searchResults = useMemo(() => state.searchResults, [state.searchResults]);
  const suggestions = useMemo(() => state.suggestions, [state.suggestions]);
  const loading = useMemo(() => state.loading, [state.loading]);
  const error = useMemo(() => state.error, [state.error]);
  const selectedSet = useMemo(() => state.selectedSet, [state.selectedSet]);
  const setName = useMemo(() => state.setName, [state.setName]);
  const cardProductName = useMemo(() => state.cardProductName, [state.cardProductName]);
  const activeField = useMemo(() => state.activeField, [state.activeField]);

  // Optimized state updates with structural sharing
  const updateState = useCallback((updates: Partial<OptimizedSearchState>) => {
    setState(prev => {
      // Only update if values actually changed (structural sharing)
      const hasChanges = Object.keys(updates).some(key => 
        prev[key as keyof OptimizedSearchState] !== updates[key as keyof OptimizedSearchState]
      );
      
      if (!hasChanges) return prev;
      
      return { ...prev, ...updates };
    });
  }, []);

  // Memoized search function with caching
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      updateState({
        searchTerm: '',
        searchResults: [],
        suggestions: [],
        error: null,
      });
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const cacheKey = `search:${query}:${selectedSet || 'all'}`;
    const startTime = Date.now();

    // Check cache first
    const cachedResults = searchCache.getCachedResults(cacheKey);
    if (cachedResults) {
      const cardResults = cachedResults as CardResult[];
      const convertedResults: ICard[] = cardResults.map(result => ({
        _id: result._id,
        id: result._id,
        cardName: result.cardName,
        baseName: result.baseName,
        variety: result.variety || '',
        pokemonNumber: result.pokemonNumber || '',
        setId: result.setInfo?.setName || '',
      }));

      updateState({
        searchTerm: query,
        searchResults: convertedResults,
        loading: false,
        error: null,
      });
      return;
    }

    updateState({ loading: true, error: null });

    try {
      abortControllerRef.current = new AbortController();
      
      const searchResponse = await searchApi.searchCardsOptimized({
        query,
        setName: selectedSet || undefined,
        limit: 50,
      });

      const results: CardResult[] = searchResponse.data.map(card => ({
        _id: card._id,
        cardName: card.cardName,
        baseName: card.baseName,
        variety: card.variety || '',
        pokemonNumber: card.pokemonNumber || '',
        setInfo: {
          setName: card.setInfo?.setName || '',
          year: card.setInfo?.year,
        },
        searchScore: card.relevanceScore || card.searchScore,
        isExactMatch: card.searchMetadata?.confidence === 'very-high',
        relevanceScore: card.relevanceScore,
        fuseScore: card.fuseScore,
        searchMetadata: card.searchMetadata,
        highlights: card.highlights,
      }));

      // Cache the results
      searchCache.setCachedResults(cacheKey, results);

      // Convert to ICard format
      const cardResults: ICard[] = results.map(result => ({
        _id: result._id,
        id: result._id,
        cardName: result.cardName,
        baseName: result.baseName,
        variety: result.variety || '',
        pokemonNumber: result.pokemonNumber || '',
        setId: result.setInfo?.setName || '',
      }));

      const queryTime = searchCache.getQueryTime(startTime);
      log(`Search completed in ${queryTime}ms for query: ${query}`);

      updateState({
        searchTerm: query,
        searchResults: cardResults,
        loading: false,
        error: null,
      });

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        log(`Search error: ${error.message}`);
        updateState({
          loading: false,
          error: error.message || 'Search failed',
        });
      }
    }
  }, [selectedSet, searchCache, updateState]);

  // Memoized suggestion selection handler
  const handleSuggestionSelect = useCallback((
    suggestion: SetResult | CardResult | ProductResult | CategoryResult,
    fieldType: 'set' | 'cardProduct'
  ) => {
    if (fieldType === 'set' && 'setName' in suggestion) {
      updateState({
        selectedSet: suggestion.setName,
        setName: suggestion.setName,
        suggestions: [],
        activeField: null,
      });
    } else if (fieldType === 'cardProduct' && 'cardName' in suggestion) {
      const cardSuggestion = suggestion as CardResult;
      updateState({
        cardProductName: cardSuggestion.cardName,
        setName: cardSuggestion.setInfo?.setName || '',
        selectedSet: cardSuggestion.setInfo?.setName || null,
        suggestions: [],
        activeField: null,
      });
    }
  }, [updateState]);

  // Memoized field update handlers
  const updateSetName = useCallback((value: string) => {
    updateState({
      setName: value,
      activeField: value ? 'set' : null,
    });
  }, [updateState]);

  const updateCardProductName = useCallback((value: string) => {
    updateState({
      cardProductName: value,
      activeField: value ? 'cardProduct' : null,
    });
  }, [updateState]);

  const setActiveField = useCallback((field: 'set' | 'cardProduct' | null) => {
    updateState({ activeField: field });
  }, [updateState]);

  const clearSearch = useCallback(() => {
    updateState({
      searchTerm: '',
      searchResults: [],
      suggestions: [],
      error: null,
      selectedSet: null,
      setName: '',
      cardProductName: '',
      activeField: null,
    });
  }, [updateState]);

  return {
    searchTerm,
    searchResults,
    suggestions,
    loading,
    error,
    selectedSet,
    setName,
    cardProductName,
    activeField,
    handleSearch,
    handleSuggestionSelect,
    updateSetName,
    updateCardProductName,
    clearSearch,
    setActiveField,
  };
};

export default useSearchOptimized;