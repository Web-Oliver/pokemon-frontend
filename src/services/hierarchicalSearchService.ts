/**
 * Context7 Hierarchical Search Service
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Following CLAUDE.md DRY and SOLID principles:
 * - Single Responsibility: Only handles hierarchical search logic
 * - Open/Closed: Extensible for new search types
 * - Dependency Inversion: Depends on abstractions, not concrete implementations
 * - DRY: Reusable across different search contexts
 */

import { SetResult, CardResult, ProductResult, CategoryResult } from '../api/searchApi';
import {
  searchCardsOptimized,
  searchCardsInSet,
  getCardSuggestionsOptimized,
} from '../api/cardsApi';
import {
  searchProductsOptimized,
  searchProductsInSet,
  getProductSuggestionsOptimized,
} from '../api/cardMarketRefProductsApi';
import { searchSetsOptimized, getSetSuggestionsOptimized } from '../api/setsApi';
import { SEARCH_CONFIG } from '../utils/constants';

export interface HierarchicalSearchConfig {
  searchMode: 'cards' | 'products';
  setContext?: string;
  categoryContext?: string;
  debounceMs?: number;
  cacheEnabled?: boolean;
  maxSuggestions?: number;
  minQueryLength?: number;
  useOptimizedSearch?: boolean; // New flag for using optimized endpoints
  enableFuzzyMatching?: boolean; // Enable Fuse.js fuzzy matching
  enableAdvancedFilters?: boolean; // Enable advanced filtering options
}

export interface HierarchicalSearchState {
  selectedSet: string | null;
  selectedCategory: string | null;
  activeField: 'set' | 'category' | 'cardProduct' | null;
  isLoading: boolean;
  error: string | null;
}

export interface SearchSuggestion {
  id: string;
  displayName: string;
  metadata: {
    setName?: string;
    category?: string;
    count?: number;
    source?: string;
  };
  data: SetResult | CardResult | ProductResult | CategoryResult;
}

/**
 * Context7 Hierarchical Search Service
 * Reusable service for managing hierarchical search operations
 */
export class HierarchicalSearchService {
  private config: HierarchicalSearchConfig;
  private state: HierarchicalSearchState;
  private cache: Map<string, { data: SearchSuggestion[]; timestamp: number; ttl: number }> =
    new Map();
  private pendingRequests: Map<string, Promise<SearchSuggestion[]>> = new Map();

  constructor(config: HierarchicalSearchConfig) {
    this.config = {
      debounceMs: SEARCH_CONFIG.DEBOUNCE_MS,
      cacheEnabled: true,
      maxSuggestions: SEARCH_CONFIG.MAX_SUGGESTIONS,
      minQueryLength:
        config.searchMode === 'products'
          ? SEARCH_CONFIG.SEALED_PRODUCT_MIN_QUERY_LENGTH
          : SEARCH_CONFIG.CARD_MIN_QUERY_LENGTH,
      useOptimizedSearch: true, // Default to using optimized endpoints
      enableFuzzyMatching: true, // Enable Fuse.js fuzzy matching by default
      enableAdvancedFilters: true, // Enable advanced filtering by default
      ...config,
    };

    this.state = {
      selectedSet: null,
      selectedCategory: null,
      activeField: null,
      isLoading: false,
      error: null,
    };
  }

  /**
   * Get suggestions for a specific field type
   * Following Context7 hierarchical pattern
   */
  async getSuggestions(
    query: string,
    fieldType: 'set' | 'category' | 'cardProduct'
  ): Promise<SearchSuggestion[]> {
    const minLength =
      fieldType === 'set'
        ? SEARCH_CONFIG.SET_MIN_QUERY_LENGTH
        : this.config.minQueryLength || SEARCH_CONFIG.DEFAULT_MIN_QUERY_LENGTH;

    if (!query.trim() || query.length < minLength) {
      return [];
    }

    const cacheKey = this.generateCacheKey(query, fieldType);

    // Check cache first (if enabled)
    if (this.config.cacheEnabled) {
      const cached = this.getCachedSuggestions(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check for pending request
    if (this.pendingRequests.has(cacheKey)) {
      return await this.pendingRequests.get(cacheKey)!;
    }

    // Create new request
    const requestPromise = this.performSearch(query, fieldType);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const suggestions = await requestPromise;

      // Cache results
      if (this.config.cacheEnabled) {
        this.cacheResults(cacheKey, suggestions, fieldType);
      }

      return suggestions;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Perform the actual search based on field type
   * Following Context7 hierarchical filtering pattern
   */
  private async performSearch(
    query: string,
    fieldType: 'set' | 'category' | 'cardProduct'
  ): Promise<SearchSuggestion[]> {
    const processedQuery = query.trim().toLowerCase();

    // Use optimized search if enabled
    if (this.config.useOptimizedSearch) {
      switch (fieldType) {
        case 'set':
          return this.searchSetsOptimized(processedQuery);

        case 'category':
          return this.searchCategories(processedQuery);

        case 'cardProduct':
          return this.searchCardProductsOptimized(processedQuery);

        default:
          return [];
      }
    } else {
      // Fallback to legacy search
      switch (fieldType) {
        case 'set':
          return this.searchSets(processedQuery);

        case 'category':
          return this.searchCategories(processedQuery);

        case 'cardProduct':
          return this.searchCardProducts(processedQuery);

        default:
          return [];
      }
    }
  }

  /**
   * Search for sets based on search mode
   */
  private async searchSets(query: string): Promise<SearchSuggestion[]> {
    console.log('[HIERARCHICAL SEARCH] searchSets called with config:', {
      searchMode: this.config.searchMode,
      query,
      maxSuggestions: this.config.maxSuggestions,
    });

    // Use optimized search endpoints
    const response = await searchSetsOptimized({
      query,
      limit: this.config.maxSuggestions!,
    });
    const results = response.data;

    console.log('[HIERARCHICAL SEARCH] searchSets results:', results);
    return results.map(this.mapSetResultToSuggestion);
  }

  /**
   * Search for categories
   */
  private async searchCategories(query: string): Promise<SearchSuggestion[]> {
    // Use predefined categories since searchCategories was removed
    const allCategories = [
      { category: 'Blisters', productCount: 100, isExactMatch: false, searchScore: 0 },
      { category: 'Booster-Boxes', productCount: 200, isExactMatch: false, searchScore: 0 },
      { category: 'Boosters', productCount: 150, isExactMatch: false, searchScore: 0 },
      { category: 'Box-Sets', productCount: 50, isExactMatch: false, searchScore: 0 },
      { category: 'Elite-Trainer-Boxes', productCount: 75, isExactMatch: false, searchScore: 0 },
      { category: 'Theme-Decks', productCount: 120, isExactMatch: false, searchScore: 0 },
      { category: 'Tins', productCount: 80, isExactMatch: false, searchScore: 0 },
      { category: 'Trainer-Kits', productCount: 30, isExactMatch: false, searchScore: 0 },
    ];

    const filteredCategories = allCategories
      .filter(cat => cat.category.toLowerCase().includes(query.toLowerCase()))
      .slice(0, this.config.maxSuggestions!);

    return filteredCategories.map(this.mapCategoryResultToSuggestion);
  }

  /**
   * Search for cards/products with hierarchical filtering
   */
  private async searchCardProducts(query: string): Promise<SearchSuggestion[]> {
    const results =
      this.config.searchMode === 'products'
        ? await searchProductsOptimized({
            query,
            setName: this.state.selectedSet || undefined,
            category: this.state.selectedCategory || undefined,
            limit: this.config.maxSuggestions!,
          }).then(response => response.data)
        : await searchCardsOptimized({
            query,
            setName: this.state.selectedSet || undefined,
            limit: this.config.maxSuggestions!,
          }).then(response => response.data);

    return results.map(
      this.config.searchMode === 'products'
        ? this.mapProductResultToSuggestion
        : this.mapCardResultToSuggestion
    );
  }

  /**
   * New optimized search for sets
   */
  private async searchSetsOptimized(query: string): Promise<SearchSuggestion[]> {
    console.log('[HIERARCHICAL SEARCH] searchSetsOptimized called with:', {
      searchMode: this.config.searchMode,
      query,
      maxSuggestions: this.config.maxSuggestions,
    });

    try {
      const results = await searchSetsOptimized({
        query,
        limit: this.config.maxSuggestions!,
      });

      console.log('[HIERARCHICAL SEARCH] searchSetsOptimized results:', results);
      return results.data.map(this.mapSetResultToSuggestionOptimized);
    } catch (error) {
      console.error('[HIERARCHICAL SEARCH] searchSetsOptimized error:', error);
      // Fallback to legacy search
      return this.searchSets(query);
    }
  }

  /**
   * New optimized search for cards/products with hierarchical filtering
   */
  private async searchCardProductsOptimized(query: string): Promise<SearchSuggestion[]> {
    console.log('[HIERARCHICAL SEARCH] searchCardProductsOptimized called with:', {
      searchMode: this.config.searchMode,
      query,
      selectedSet: this.state.selectedSet,
      selectedCategory: this.state.selectedCategory,
      maxSuggestions: this.config.maxSuggestions,
    });

    try {
      if (this.config.searchMode === 'products') {
        // Use optimized product search
        const results = this.state.selectedSet
          ? await searchProductsInSet(query, this.state.selectedSet, this.config.maxSuggestions!)
          : await searchProductsOptimized({
              query,
              category: this.state.selectedCategory || undefined,
              limit: this.config.maxSuggestions!,
            });

        return (Array.isArray(results) ? results : results.data).map(
          this.mapProductResultToSuggestion
        );
      } else {
        // Use optimized card search
        console.log('[HIERARCHICAL SEARCH] About to search cards with:', {
          query,
          selectedSet: this.state.selectedSet,
          useSelectedSetSearch: !!this.state.selectedSet,
        });

        const results = this.state.selectedSet
          ? await searchCardsInSet(query, this.state.selectedSet, this.config.maxSuggestions!)
          : await searchCardsOptimized({
              query,
              setName: this.state.selectedSet || undefined,
              limit: this.config.maxSuggestions!,
            });

        console.log('[HIERARCHICAL SEARCH] Card search results:', {
          resultsType: Array.isArray(results) ? 'array' : 'object',
          resultsLength: Array.isArray(results) ? results.length : results.data?.length,
          results: Array.isArray(results) ? results : results.data,
        });

        return (Array.isArray(results) ? results : results.data).map(
          this.mapCardResultToSuggestion
        );
      }
    } catch (error) {
      console.error('[HIERARCHICAL SEARCH] searchCardProductsOptimized error:', error);
      // Fallback to legacy search
      return this.searchCardProducts(query);
    }
  }

  /**
   * Get suggestions using optimized endpoints
   */
  async getSuggestionsOptimized(
    query: string,
    fieldType: 'set' | 'category' | 'cardProduct'
  ): Promise<SearchSuggestion[]> {
    const minLength =
      fieldType === 'set'
        ? SEARCH_CONFIG.SET_MIN_QUERY_LENGTH
        : this.config.minQueryLength || SEARCH_CONFIG.DEFAULT_MIN_QUERY_LENGTH;

    if (!query.trim() || query.length < minLength) {
      return [];
    }

    try {
      switch (fieldType) {
        case 'set': {
          const setSuggestions = await getSetSuggestionsOptimized(
            query,
            this.config.maxSuggestions!
          );
          return setSuggestions.map(this.mapSetResultToSuggestionOptimized);
        }

        case 'category':
          return this.searchCategories(query);

        case 'cardProduct':
          if (this.config.searchMode === 'products') {
            const productSuggestions = await getProductSuggestionsOptimized(
              query,
              this.config.maxSuggestions!
            );
            return productSuggestions.map(this.mapProductResultToSuggestion);
          } else {
            const cardSuggestions = await getCardSuggestionsOptimized(
              query,
              this.config.maxSuggestions!
            );
            return cardSuggestions.map(this.mapCardResultToSuggestion);
          }

        default:
          return [];
      }
    } catch (error) {
      console.error('[HIERARCHICAL SEARCH] getSuggestionsOptimized error:', error);
      // Fallback to regular getSuggestions
      return this.getSuggestions(query, fieldType);
    }
  }

  /**
   * Handle suggestion selection with hierarchical logic
   * Following Context7 pattern for autofill and filtering
   */
  handleSuggestionSelect(
    suggestion: SearchSuggestion,
    fieldType: 'set' | 'category' | 'cardProduct'
  ): HierarchicalSearchState {
    const newState = { ...this.state };

    switch (fieldType) {
      case 'set':
        newState.selectedSet = suggestion.metadata.setName || suggestion.displayName;
        newState.activeField = null;
        break;

      case 'category':
        newState.selectedCategory = suggestion.metadata.category || suggestion.displayName;
        newState.activeField = null;
        break;

      case 'cardProduct':
        newState.activeField = null;
        // Auto-fill hierarchical context from selection
        if (suggestion.metadata.setName) {
          newState.selectedSet = suggestion.metadata.setName;
        }
        if (suggestion.metadata.category) {
          newState.selectedCategory = suggestion.metadata.category;
        }
        break;
    }

    this.state = newState;
    return newState;
  }

  /**
   * Update search state
   */
  updateState(updates: Partial<HierarchicalSearchState>): HierarchicalSearchState {
    this.state = { ...this.state, ...updates };
    return this.state;
  }

  /**
   * Clear hierarchical context
   */
  clearContext(type: 'set' | 'category' | 'all'): HierarchicalSearchState {
    const newState = { ...this.state };

    switch (type) {
      case 'set':
        newState.selectedSet = null;
        break;
      case 'category':
        newState.selectedCategory = null;
        break;
      case 'all':
        newState.selectedSet = null;
        newState.selectedCategory = null;
        newState.activeField = null;
        break;
    }

    this.state = newState;
    return newState;
  }

  /**
   * Get current state
   */
  getState(): HierarchicalSearchState {
    return { ...this.state };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<HierarchicalSearchConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Private helper methods for mapping results to suggestions
  private mapSetResultToSuggestion = (result: SetResult): SearchSuggestion => ({
    id: result.setName,
    displayName: result.setName,
    metadata: {
      setName: result.setName,
      count: result.counts?.cards || result.counts?.products || 0,
      source: result.source,
    },
    data: result,
  });

  private mapSetResultToSuggestionOptimized = (result: any): SearchSuggestion => ({
    id: result.setName || result._id,
    displayName: result.setName + (result.year ? ` (${result.year})` : ''),
    metadata: {
      setName: result.setName,
      count: result.totalCardsInSet || result.totalPsaPopulation || 0,
      source: 'optimized',
    },
    data: result,
  });

  private mapCategoryResultToSuggestion = (result: CategoryResult): SearchSuggestion => ({
    id: result.category,
    displayName: result.category,
    metadata: {
      category: result.category,
      count: result.productCount,
    },
    data: result,
  });

  private mapCardResultToSuggestion = (result: CardResult): SearchSuggestion => ({
    id: result._id,
    displayName: result.cardName,
    metadata: {
      setName: result.setInfo?.setName,
      category: undefined,
    },
    data: result,
  });

  private mapProductResultToSuggestion = (result: ProductResult): SearchSuggestion => ({
    id: result._id,
    displayName: result.name,
    metadata: {
      setName: result.setName,
      category: result.category,
    },
    data: result,
  });

  // Cache management methods
  private generateCacheKey(query: string, fieldType: string): string {
    return `${fieldType}:${query}:${this.state.selectedSet || 'noSet'}:${this.state.selectedCategory || 'noCategory'}`;
  }

  private getCachedSuggestions(cacheKey: string): SearchSuggestion[] | null {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(cacheKey);
    }
    return null;
  }

  private cacheResults(cacheKey: string, suggestions: SearchSuggestion[], fieldType: string): void {
    const ttl = fieldType === 'set' ? SEARCH_CONFIG.CACHE_TTL_SETS : SEARCH_CONFIG.CACHE_TTL_OTHERS;
    this.cache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

/**
 * Factory function to create hierarchical search service instances
 * Following SOLID principles for dependency injection
 */
export function createHierarchicalSearchService(
  config: HierarchicalSearchConfig
): HierarchicalSearchService {
  // Safeguard: detect if state object is passed instead of config
  if (config && typeof config === 'object' && 'fields' in config && 'suggestions' in config) {
    console.error('[HIERARCHICAL SEARCH] ERROR: State object passed as config:', config);
    // Return a default config for products mode
    const defaultConfig: HierarchicalSearchConfig = {
      searchMode: 'products',
      debounceMs: SEARCH_CONFIG.DEBOUNCE_MS,
      cacheEnabled: true,
      maxSuggestions: SEARCH_CONFIG.MAX_SUGGESTIONS,
      minQueryLength: SEARCH_CONFIG.SEALED_PRODUCT_MIN_QUERY_LENGTH,
      useOptimizedSearch: true,
      enableFuzzyMatching: true,
      enableAdvancedFilters: true,
    };
    console.log('[HIERARCHICAL SEARCH] Using default config:', defaultConfig);
    return new HierarchicalSearchService(defaultConfig);
  }

  console.log('[HIERARCHICAL SEARCH] Creating service with config:', config);
  return new HierarchicalSearchService(config);
}
