/**
 * Enhanced Search Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Manages search functionality with hierarchical logic and caching
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ICard } from '../domain/models/card';
import { searchApi, SetResult, CardResult, ProductResult, CategoryResult } from '../api/searchApi';
import * as cardsApi from '../api/cardsApi';
import * as cardMarketRefProductsApi from '../api/cardMarketRefProductsApi';
import * as setsApi from '../api/setsApi';
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

  // Configuration
  setSearchMode: (_mode: 'cards' | 'products') => void;
}

export const useSearch = (): UseSearchReturn => {
  const [searchMode, setSearchMode] = useState<'cards' | 'products'>('cards');
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
  const abortControllerRef = useRef<AbortController | null>(null);

  // Context7 Enhanced Caching System
  const suggestionsCacheRef = useRef<
    Map<
      string,
      {
        results: SetResult[] | CardResult[] | ProductResult[] | CategoryResult[];
        timestamp: number;
        score: number;
        ttl: number;
      }
    >
  >(new Map());

  // Context7 Request Deduplication
  const pendingRequestsRef = useRef<Map<string, Promise<any>>>(new Map());

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

        // Always use NEW unified search API for cards
        const searchResponse = await searchApi.searchCardsOptimized({
          query,
          setName: state.selectedSet || undefined,
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
   * Context7 Enhanced Search Optimization with Advanced Caching
   */
  const getSuggestions = useCallback(
    async (query: string, fieldType: 'set' | 'category' | 'cardProduct') => {
      console.log(`[SEARCH DEBUG] getSuggestions called:`, {
        query,
        fieldType,
        selectedSet: state.selectedSet,
        selectedCategory: state.selectedCategory,
      });

      // Context7 Input Validation & Preprocessing
      const processedQuery = query.trim().toLowerCase();
      if (!processedQuery || processedQuery.length < 2) {
        console.log(`[SEARCH DEBUG] Query too short, clearing suggestions`);
        setState(prev => ({ ...prev, suggestions: [] }));
        return;
      }

      // Context7 Advanced Cache Key Generation
      const cacheKey = `${fieldType}:${processedQuery}:${state.selectedSet || 'noSet'}:${state.selectedCategory || 'noCategory'}`;

      // Context7 TTL-based Cache Check
      const cachedEntry = suggestionsCacheRef.current.get(cacheKey);
      if (cachedEntry) {
        const { results, timestamp, ttl } = cachedEntry;
        const isExpired = Date.now() - timestamp > ttl;

        if (!isExpired) {
          console.log(`[SEARCH DEBUG] Using cached suggestions:`, results.length);
          setState(prev => ({ ...prev, suggestions: results }));
          return;
        } else {
          // Clean expired cache entry
          suggestionsCacheRef.current.delete(cacheKey);
        }
      }

      // Context7 Request Deduplication
      if (pendingRequestsRef.current.has(cacheKey)) {
        console.log(`[SEARCH DEBUG] Request already pending for: ${cacheKey}`);
        try {
          const results = await pendingRequestsRef.current.get(cacheKey)!;
          setState(prev => ({ ...prev, suggestions: results }));
          return;
        } catch (error) {
          console.error(`[SEARCH DEBUG] Pending request failed:`, error);
          pendingRequestsRef.current.delete(cacheKey);
        }
      }

      // Context7 Request Cancellation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        console.log(`[SEARCH DEBUG] Making API call for ${fieldType} suggestions`);

        // Create request promise for deduplication
        const requestPromise = (async () => {
          let suggestions: SetResult[] | CardResult[] | ProductResult[] | CategoryResult[] = [];

          // Always use NEW unified search endpoints
          if (fieldType === 'set') {
            console.log(
              `[SEARCH DEBUG] Calling NEW unified set search with query: "${processedQuery}"`
            );
            const setResponse = await searchApi.searchSetsOptimized({
              query: processedQuery,
              limit: 15,
            });
            suggestions = setResponse.data.map(set => ({
              setName: set.setName,
              year: set.year,
              score: set.relevanceScore || set.searchScore || 0,
              source: 'unified-search',
              isExactMatch: set.searchMetadata?.confidence === 'very-high',
              searchScore: set.relevanceScore,
              relevanceScore: set.relevanceScore,
              fuseScore: set.fuseScore,
              searchMetadata: set.searchMetadata,
              highlights: set.highlights,
            }));
            console.log(`[SEARCH DEBUG] NEW unified set search returned:`, suggestions);
          } else if (fieldType === 'category') {
            console.log(
              `[SEARCH DEBUG] Getting predefined categories for query: "${processedQuery}"`
            );
            // Use predefined categories since searchCategories was removed
            const allCategories = [
              { category: 'Blisters', productCount: 100, isExactMatch: false, searchScore: 0 },
              { category: 'Booster-Boxes', productCount: 200, isExactMatch: false, searchScore: 0 },
              { category: 'Boosters', productCount: 150, isExactMatch: false, searchScore: 0 },
              { category: 'Box-Sets', productCount: 50, isExactMatch: false, searchScore: 0 },
              {
                category: 'Elite-Trainer-Boxes',
                productCount: 75,
                isExactMatch: false,
                searchScore: 0,
              },
              { category: 'Theme-Decks', productCount: 120, isExactMatch: false, searchScore: 0 },
              { category: 'Tins', productCount: 80, isExactMatch: false, searchScore: 0 },
              { category: 'Trainer-Kits', productCount: 30, isExactMatch: false, searchScore: 0 },
            ];

            suggestions = allCategories
              .filter(cat => cat.category.toLowerCase().includes(processedQuery.toLowerCase()))
              .slice(0, 15);
            console.log(`[SEARCH DEBUG] Filtered categories returned:`, suggestions);
          } else if (fieldType === 'cardProduct') {
            if (searchMode === 'products') {
              console.log(
                `[SEARCH DEBUG] Calling NEW unified product search with query: "${processedQuery}"`
              );
              const productResponse = await searchApi.searchProductsOptimized({
                query: processedQuery,
                setName: state.selectedSet || undefined,
                category: state.selectedCategory || undefined,
                limit: 15,
              });
              suggestions = productResponse.data.map(product => ({
                _id: product._id,
                name: product.name,
                setName: product.setName,
                category: product.category,
                available: product.available,
                price: product.price,
                searchScore: product.relevanceScore || product.searchScore,
                isExactMatch: product.searchMetadata?.confidence === 'very-high',
                relevanceScore: product.relevanceScore,
                fuseScore: product.fuseScore,
                searchMetadata: product.searchMetadata,
                highlights: product.highlights,
              }));
              console.log(`[SEARCH DEBUG] NEW unified product search returned:`, suggestions);
            } else {
              console.log(
                `[SEARCH DEBUG] Calling NEW unified card search with query: "${processedQuery}"`
              );
              const cardResponse = await searchApi.searchCardsOptimized({
                query: processedQuery,
                setName: state.selectedSet || undefined,
                limit: 15,
              });
              suggestions = cardResponse.data.map(card => ({
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
              console.log(`[SEARCH DEBUG] NEW unified card search returned:`, suggestions);
            }
          }

          // Context7 Result Optimization & Scoring
          const optimizedSuggestions = suggestions
            .map(suggestion => ({
              ...suggestion,
              relevanceScore: calculateRelevanceScore(suggestion, processedQuery, fieldType),
            }))
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, 15); // Context7 optimal result limit

          // Context7 Advanced Caching with TTL
          const cacheEntry = {
            results: optimizedSuggestions,
            timestamp: Date.now(),
            score: optimizedSuggestions.length > 0 ? optimizedSuggestions[0].relevanceScore : 0,
            ttl: fieldType === 'set' ? 300000 : 180000, // 5min for sets, 3min for others
          };
          suggestionsCacheRef.current.set(cacheKey, cacheEntry);

          return optimizedSuggestions;
        })();

        // Store request for deduplication
        pendingRequestsRef.current.set(cacheKey, requestPromise);

        const suggestions = await requestPromise;

        // Check if request was aborted
        if (signal.aborted) {
          console.log(`[SEARCH DEBUG] Request aborted for: ${cacheKey}`);
          return;
        }

        setState(prev => ({ ...prev, suggestions }));

        console.log(
          `[SEARCH DEBUG] Successfully set ${suggestions.length} suggestions for ${fieldType}: ${processedQuery}`
        );
        log(`Got ${suggestions.length} optimized suggestions for ${fieldType}: ${processedQuery}`);
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log(`[SEARCH DEBUG] Request aborted for: ${cacheKey}`);
          return;
        }
        console.error(`[SEARCH DEBUG] Failed to get suggestions:`, error);
        log(`Failed to get suggestions: ${error}`);
        setState(prev => ({ ...prev, suggestions: [] }));
      } finally {
        // Clean up request tracking
        pendingRequestsRef.current.delete(cacheKey);
        if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
          abortControllerRef.current = null;
        }
      }
    },
    [state.selectedSet, state.selectedCategory, searchMode]
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
        const itemName = suggestion.cardName || suggestion.name || suggestion;

        // Store complete data for autofill (supports both cards and products)
        const itemData = {
          _id: suggestion._id, // CRITICAL: Include _id for productId reference
          cardName: itemName,
          name: itemName,
          pokemonNumber: suggestion.pokemonNumber || '',
          baseName: suggestion.baseName || itemName,
          variety: suggestion.variety || '',
          setInfo: suggestion.setInfo,
          categoryInfo: suggestion.categoryInfo,
          // Product-specific fields for sealed products
          category: suggestion.category,
          available: suggestion.available,
          price: suggestion.price,
          setName: suggestion.setName,
        };

        setState(prev => ({
          ...prev,
          cardProductName: itemName,
          suggestions: [],
          activeField: null,
          // Store complete item data for form autofill
          selectedCardData: itemData,
        }));

        // Auto-fill set information from product data (for sealed products)
        if (suggestion.setName) {
          setState(prev => ({
            ...prev,
            setName: suggestion.setName,
            selectedSet: suggestion.setName,
          }));
          log(`Auto-filled set: ${suggestion.setName} from product selection`);
        } else if (suggestion.setInfo && suggestion.setInfo.setName) {
          setState(prev => ({
            ...prev,
            setName: suggestion.setInfo.setName,
            selectedSet: suggestion.setInfo.setName,
          }));
          log(`Auto-filled set: ${suggestion.setInfo.setName} from card selection`);
        }

        // Auto-fill category information if available
        if (suggestion.category) {
          setState(prev => ({
            ...prev,
            categoryName: suggestion.category,
            selectedCategory: suggestion.category,
          }));
          log(`Auto-filled category: ${suggestion.category} from product selection`);
        } else if (suggestion.categoryInfo && suggestion.categoryInfo.category) {
          setState(prev => ({
            ...prev,
            categoryName: suggestion.categoryInfo.category,
            selectedCategory: suggestion.categoryInfo.category,
          }));
          log(`Auto-filled category: ${suggestion.categoryInfo.category} from product selection`);
        }

        console.log(`[SEARCH DEBUG] Item data stored for autofill:`, itemData);
        log(`Card/product selected: ${itemName} with complete data for autofill`);
      }
    },
    []
  );

  /**
   * Get best match for auto-fill functionality using NEW unified search API
   */
  const getBestMatch = useCallback(
    async (query: string): Promise<ICard | null> => {
      try {
        // Use NEW unified search API for best match
        const searchResponse = await searchApi.searchCardsOptimized({
          query,
          setName: state.selectedSet || undefined,
          limit: 1,
        });

        return searchResponse.data.length > 0 ? searchResponse.data[0] : null;
      } catch (error) {
        handleApiError(error, 'Failed to get best match');
        return null;
      }
    },
    [state.selectedSet]
  );

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
      }, 200); // Context7 optimized debounce timing
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
      }, 200); // Context7 optimized debounce timing
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
      }, 200); // Context7 optimized debounce timing
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

  /**
   * Context7 Relevance Scoring Algorithm
   */
  const calculateRelevanceScore = useCallback(
    (suggestion: any, query: string, fieldType: string): number => {
      let score = 0;
      const queryLower = query.toLowerCase();

      // Get the primary text field for comparison
      const primaryText = (
        suggestion.cardName ||
        suggestion.name ||
        suggestion.setName ||
        suggestion.category ||
        ''
      ).toLowerCase();

      // Context7 Scoring Factors
      // 1. Exact match boost
      if (primaryText === queryLower) {
        score += 100;
      }

      // 2. Starts with query boost
      if (primaryText.startsWith(queryLower)) {
        score += 50;
      }

      // 3. Contains query boost
      if (primaryText.includes(queryLower)) {
        score += 25;
      }

      // 4. Length similarity (shorter is better for relevance)
      const lengthDiff = Math.abs(primaryText.length - queryLower.length);
      score += Math.max(0, 20 - lengthDiff);

      // 5. Field-specific scoring
      if (fieldType === 'set' && suggestion.isExactMatch) {
        score += 30;
      }

      if (fieldType === 'category' && suggestion.isExactMatch) {
        score += 30;
      }

      // 6. Context relevance boost
      if (suggestion.setInfo && state.selectedSet) {
        const setMatch =
          suggestion.setInfo.setName?.toLowerCase() === state.selectedSet.toLowerCase();
        if (setMatch) {
          score += 15;
        }
      }

      // 7. Popularity/frequency boost (if available)
      if (suggestion.score && typeof suggestion.score === 'number') {
        score += suggestion.score * 0.1;
      }

      return score;
    },
    [state.selectedSet]
  );

  // Context7 Cache Management
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of suggestionsCacheRef.current.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        suggestionsCacheRef.current.delete(key);
      }
    }
  }, []);

  // Context7 Enhanced Cleanup
  useEffect(() => {
    // Periodic cache cleanup
    const cleanupInterval = setInterval(cleanupCache, 60000); // Every minute

    return () => {
      // Cleanup debounce timer
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Cleanup abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Cleanup interval
      clearInterval(cleanupInterval);

      // Clear pending requests
      pendingRequestsRef.current.clear();
    };
  }, [cleanupCache]);

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

    // Configuration
    setSearchMode,
  };
};
