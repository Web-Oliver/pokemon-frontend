/**
 * Search Service - DRY Implementation
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Following CLAUDE.md SOLID and DRY principles:
 * - Single Responsibility: Only handles search logic
 * - Open/Closed: Extensible for new search types
 * - Dependency Inversion: Depends on abstractions, not concrete implementations
 * - DRY: Consolidates all search-related operations
 */

import { SetResult, CardResult, ProductResult, CategoryResult } from '../api/searchApi';

// ===== INTERFACES =====

export interface SearchServiceConfig {
  searchMode: 'cards' | 'products';
  setContext?: string;
  categoryContext?: string;
  debounceMs?: number;
  cacheEnabled?: boolean;
  maxSuggestions?: number;
  minQueryLength?: number;
  useOptimizedSearch?: boolean;
  enableFuzzyMatching?: boolean;
  enableAdvancedFilters?: boolean;
}

export interface SearchState {
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
  data: any; // SetResult | CardResult | ProductResult | CategoryResult
}

export interface ISearchService {
  getSuggestions(
    query: string,
    fieldType: 'set' | 'category' | 'cardProduct'
  ): Promise<SearchSuggestion[]>;
  updateState(updates: Partial<SearchState>): SearchState;
  clearContext(type: 'set' | 'category' | 'all'): SearchState;
  getState(): SearchState;
  updateConfig(updates: Partial<SearchServiceConfig>): void;
  clearCache(): void;
}

// Legacy aliases for backward compatibility
export type HierarchicalSearchConfig = SearchServiceConfig;
export type HierarchicalSearchState = SearchState;
export type IHierarchicalSearchService = ISearchService;
import {
  searchCardsOptimized,
  searchCardsInSet,
  getCardSuggestionsOptimized,
} from '../api/consolidatedSearch';
import {
  searchProductsOptimized,
  searchProductsInSet,
  getProductSuggestionsOptimized,
} from '../api/consolidatedSearch';
import { searchSetsOptimized, getSetSuggestionsOptimized, searchCardMarketSetNames } from '../api/consolidatedSearch';
import { SEARCH_CONFIG } from '../utils/constants';
import { formatDisplayNameWithNumber } from '../utils/cardUtils';

/**
 * Search Service
 * Handles all search operations including hierarchical search and set suggestions
 */
export class SearchService implements ISearchService {
  private config: SearchServiceConfig;
  private state: SearchState;
  private cache: Map<string, { data: SearchSuggestion[]; timestamp: number; ttl: number }> = new Map();
  private pendingRequests: Map<string, Promise<SearchSuggestion[]>> = new Map();

  constructor(config: SearchServiceConfig) {
    this.config = {
      debounceMs: SEARCH_CONFIG.DEBOUNCE_MS,
      cacheEnabled: true,
      maxSuggestions: SEARCH_CONFIG.MAX_SUGGESTIONS,
      minQueryLength:
        config.searchMode === 'products'
          ? SEARCH_CONFIG.SEALED_PRODUCT_MIN_QUERY_LENGTH
          : SEARCH_CONFIG.CARD_MIN_QUERY_LENGTH,
      useOptimizedSearch: true,
      enableFuzzyMatching: true,
      enableAdvancedFilters: true,
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
   */
  private async performSearch(
    query: string,
    fieldType: 'set' | 'category' | 'cardProduct'
  ): Promise<SearchSuggestion[]> {
    const processedQuery = query.trim().toLowerCase();

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

  /**
   * Search for sets using the correct backend API based on search mode
   */
  private async searchSets(query: string): Promise<SearchSuggestion[]> {
    console.log('[SEARCH SERVICE] searchSets called with:', {
      searchMode: this.config.searchMode,
      query,
      maxSuggestions: this.config.maxSuggestions,
    });

    try {
      const baseUrl = 'http://localhost:3000';
      
      if (this.config.searchMode === 'products') {
        // For SEALED PRODUCTS: Get unique setName values from CardMarketReferenceProduct model
        console.log('[SEARCH SERVICE] Getting product set names from CardMarketReferenceProduct.setName field');
        const response = await fetch(`${baseUrl}/api/cardmarket-ref-products/set-names?search=${encodeURIComponent(query)}&limit=${this.config.maxSuggestions}`);
        const data = await response.json();
        
        console.log('[SEARCH SERVICE] Product sets API response:', data);
        
        if (!data.success) {
          throw new Error(data.message || 'Product set search failed');
        }
        
        return data.data.map(this.mapProductSetToSuggestion);
      } else {
        // For CARDS: Use regular Set model (this was working)
        console.log('[SEARCH SERVICE] Using regular Set model for cards');
        const response = await fetch(`${baseUrl}/api/search/sets?query=${encodeURIComponent(query)}&limit=${this.config.maxSuggestions}`);
        const data = await response.json();
        
        console.log('[SEARCH SERVICE] Regular sets API response:', data);
        
        if (!data.success) {
          throw new Error(data.message || 'Set search failed');
        }
        
        return data.data.map(this.mapUnifiedSetToSuggestion);
      }
    } catch (error) {
      console.error('[SEARCH SERVICE] searchSets error:', error);
      return [];
    }
  }

  /**
   * Search for categories
   */
  private async searchCategories(query: string): Promise<SearchSuggestion[]> {
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
   * Search for cards/products with hierarchical filtering using unified search API
   */
  private async searchCardProducts(query: string): Promise<SearchSuggestion[]> {
    try {
      let endpoint: string;
      let params = new URLSearchParams({
        query,
        limit: this.config.maxSuggestions!.toString()
      });

      if (this.config.searchMode === 'products') {
        endpoint = '/api/search/products';
        // Add set filter if a set is selected
        if (this.state.selectedSet) {
          params.append('setName', this.state.selectedSet);
        }
        // Add category filter if a category is selected
        if (this.state.selectedCategory) {
          params.append('category', this.state.selectedCategory);
        }
      } else {
        endpoint = '/api/search/cards';
        // Add set filter if a set is selected
        if (this.state.selectedSet) {
          params.append('setName', this.state.selectedSet);
        }
      }

      console.log('[SEARCH SERVICE] searchCardProducts calling:', `${endpoint}?${params.toString()}`);
      
      const baseUrl = 'http://localhost:3000';
      const response = await fetch(`${baseUrl}${endpoint}?${params.toString()}`);
      const data = await response.json();
      
      console.log('[SEARCH SERVICE] Card/Product API response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Card/Product search failed');
      }

      return data.data.map(this.config.searchMode === 'products' 
        ? this.mapUnifiedProductToSuggestion 
        : this.mapUnifiedCardToSuggestion
      );
    } catch (error) {
      console.error('[SEARCH SERVICE] searchCardProducts error:', error);
      return [];
    }
  }

  /**
   * Handle suggestion selection with hierarchical logic
   */
  handleSuggestionSelect(
    suggestion: SearchSuggestion,
    fieldType: 'set' | 'category' | 'cardProduct'
  ): SearchState {
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
  updateState(updates: Partial<SearchState>): SearchState {
    this.state = { ...this.state, ...updates };
    return this.state;
  }

  /**
   * Clear context
   */
  clearContext(type: 'set' | 'category' | 'all'): SearchState {
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
  getState(): SearchState {
    return { ...this.state };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SearchServiceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // ===== MAPPING FUNCTIONS =====

  // For UNIFIED API: Maps unified search API set results (this was working for cards)
  private mapUnifiedSetToSuggestion = (result: any): SearchSuggestion => {
    console.log('[SEARCH SERVICE] mapUnifiedSetToSuggestion - input:', result);
    
    const setName = result.setName || 'Unknown Set';
    const cardCount = result.counts?.cards || result.totalCardsInSet || 0;
    const productCount = result.counts?.products || 0;
    
    const displayText = this.config.searchMode === 'products' 
      ? `${setName} (${productCount} products)`
      : `${setName} (${cardCount} cards)`;
    
    return {
      id: setName,
      displayName: displayText,
      metadata: {
        setName,
        count: this.config.searchMode === 'products' ? productCount : cardCount,
        source: 'unified-sets',
      },
      data: result,
    };
  };

  // For PRODUCTS: Maps CardMarketReferenceProduct setName field values
  private mapProductSetToSuggestion = (result: any): SearchSuggestion => {
    console.log('[SEARCH SERVICE] mapProductSetToSuggestion - input:', result);
    
    const setName = result.setName || 'Unknown Set';
    const productCount = result.productCount || result.count || 0;
    
    return {
      id: setName,
      displayName: `${setName} (${productCount} products)`,
      metadata: {
        setName,
        count: productCount,
        source: 'product-sets',
      },
      data: result,
    };
  };

  // For CARDS: Maps Set model results (setName, year, totalCardsInSet, etc.)
  private mapSetResultToSuggestion = (result: SetResult): SearchSuggestion => ({
    id: result.setName,
    displayName: `${result.setName} (${result.totalCardsInSet || 0} cards)`,
    metadata: {
      setName: result.setName,
      count: result.totalCardsInSet || 0,
      source: 'sets',
    },
    data: result,
  });

  // For SEALED PRODUCTS: Maps CardMarketReferenceProduct set names
  private mapCardMarketSetToSuggestion = (result: any): SearchSuggestion => {
    console.log('[SEARCH SERVICE] mapCardMarketSetToSuggestion - input:', result);
    
    // CardMarket API returns: { setName, productCount, totalAvailable, averagePrice, etc. }
    const setName = result.setName || 'Unknown Set';
    const productCount = result.productCount || result.count || 0;
    
    console.log('[SEARCH SERVICE] mapCardMarketSetToSuggestion - extracted:', { setName, productCount });
    
    return {
      id: setName,
      displayName: `${setName} (${productCount} products)`,
      metadata: {
        setName,
        count: productCount,
        source: 'cardmarket-sets',
      },
      data: result,
    };
  };

  private mapCategoryResultToSuggestion = (result: CategoryResult): SearchSuggestion => ({
    id: result.category,
    displayName: result.category,
    metadata: {
      category: result.category,
      count: result.productCount,
    },
    data: result,
  });

  // For UNIFIED API: Maps unified search API card results
  private mapUnifiedCardToSuggestion = (result: any): SearchSuggestion => {
    console.log('[SEARCH SERVICE] mapUnifiedCardToSuggestion - input:', result);
    
    const cardName = result.cardName || result.baseName || 'Unknown Card';
    const pokemonNumber = result.pokemonNumber ? `#${result.pokemonNumber}` : '';
    const setName = result.setInfo?.setName || 'Unknown Set';
    const variety = result.variety ? ` (${result.variety})` : '';
    
    const displayName = `${pokemonNumber} ${cardName}${variety} - ${setName}`.trim();
    
    return {
      id: result._id || result.id,
      displayName,
      metadata: {
        setName,
        source: 'unified-cards',
      },
      data: result,
    };
  };

  // For UNIFIED API: Maps unified search API product results  
  private mapUnifiedProductToSuggestion = (result: any): SearchSuggestion => {
    console.log('[SEARCH SERVICE] mapUnifiedProductToSuggestion - input:', result);
    
    const productName = result.name || 'Unknown Product';
    const setName = result.setName || 'Unknown Set';
    const category = result.category ? ` (${result.category})` : '';
    
    const displayName = `${productName}${category} - ${setName}`;
    
    return {
      id: result._id || result.id || productName,
      displayName,
      metadata: {
        setName,
        category: result.category,
        source: 'unified-products',
      },
      data: result,
    };
  };

  private mapCardResultToSuggestion = (result: CardResult): SearchSuggestion => ({
    id: result._id,
    displayName: formatDisplayNameWithNumber(result.cardName, result.pokemonNumber),
    metadata: {
      setName: result.setInfo?.setName,
      category: undefined,
      originalCardName: result.pokemonNumber ? `${result.cardName} (#${result.pokemonNumber})` : result.cardName,
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

  // ===== CACHE MANAGEMENT =====

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
}

/**
 * Factory function to create search service instances
 */
export function createSearchService(config: SearchServiceConfig): SearchService {
  console.log('[SEARCH SERVICE] Creating service with config:', config);
  return new SearchService(config);
}

// ===== LEGACY EXPORTS FOR BACKWARD COMPATIBILITY =====

/**
 * Legacy factory function name for backward compatibility
 */
export function createHierarchicalSearchService(config: HierarchicalSearchConfig): SearchService {
  console.log('[SEARCH SERVICE] Creating service with legacy factory (using SearchService):', config);
  return new SearchService(config);
}

// Legacy class export for backward compatibility
export const HierarchicalSearchService = SearchService;

