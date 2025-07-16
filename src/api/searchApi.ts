import apiClient from './apiClient';
import { searchCardMarketRefProducts } from './cardMarketRefProductsApi';

// Context7 Search Performance Optimization
const searchCache = new Map<string, {
  data: any;
  timestamp: number;
  ttl: number;
}>();

const pendingRequests = new Map<string, Promise<any>>();

// Context7 Request Optimization Utilities
const createCacheKey = (params: any): string => {
  return JSON.stringify(params, Object.keys(params).sort());
};

const isValidCacheEntry = (entry: any): boolean => {
  return entry && (Date.now() - entry.timestamp) < entry.ttl;
};

const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of searchCache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      searchCache.delete(key);
    }
  }
};

// Context7 Periodic Cache Cleanup
setInterval(cleanupCache, 120000); // Every 2 minutes

export interface SearchResult {
  success: boolean;
  type: 'sets' | 'cards' | 'products' | 'categories' | 'productSets';
  query: string;
  setContext?: string;
  categoryContext?: string;
  results: SetResult[] | CardResult[] | ProductResult[] | CategoryResult[];
  count: number;
}

export interface UnifiedSearchResult {
  success: boolean;
  query: string;
  totalCount: number;
  results: {
    cards?: {
      success: boolean;
      count: number;
      data: CardResult[];
    };
    products?: {
      success: boolean;
      count: number;
      data: ProductResult[];
    };
    sets?: {
      success: boolean;
      count: number;
      data: SetResult[];
    };
  };
}

export interface SuggestionsResult {
  success: boolean;
  query: string;
  suggestions: {
    cards?: {
      success: boolean;
      count: number;
      data: CardResult[];
    };
    products?: {
      success: boolean;
      count: number;
      data: ProductResult[];
    };
    sets?: {
      success: boolean;
      count: number;
      data: SetResult[];
    };
  };
}

export interface SetResult {
  setName: string;
  year?: number;
  score: number;
  source: 'cards' | 'products';
  isExactMatch: boolean;
  searchScore?: number; // Context7 enhanced scoring
}

export interface CardResult {
  _id: string;
  cardName: string;
  baseName: string;
  variety?: string;
  pokemonNumber?: string;
  setInfo?: {
    setName: string;
    year?: number;
  };
  searchScore?: number; // Context7 enhanced scoring
  isExactMatch?: boolean; // Context7 exact match detection
  relevanceScore?: number; // New backend relevance score
  fuseScore?: number; // Fuse.js fuzzy matching score
  searchMetadata?: {
    query: string;
    matchedFields: string[];
    confidence: string;
    searchType: string;
  };
  highlights?: {
    [field: string]: string;
  };
}

export interface ProductResult {
  _id: string;
  name: string;
  setName?: string;
  category: string;
  available: boolean;
  price: number;
  setInfo?: {
    setName: string;
  };
  categoryInfo?: {
    category: string;
  };
  searchScore?: number; // Context7 enhanced scoring
  isExactMatch?: boolean; // Context7 exact match detection
  relevanceScore?: number; // New backend relevance score
  fuseScore?: number; // Fuse.js fuzzy matching score
  searchMetadata?: {
    query: string;
    matchedFields: string[];
    confidence: string;
    searchType: string;
  };
  highlights?: {
    [field: string]: string;
  };
  priceNumeric?: number; // Backend numeric price
  displayName?: string; // Backend display name
  isAvailable?: boolean; // Backend availability flag
}

export interface CategoryResult {
  category: string;
  productCount: number;
  isExactMatch: boolean;
  searchScore?: number; // Context7 enhanced scoring
}

export const searchApi = {
  /**
   * New Unified Search API - searches across multiple types
   */
  async unifiedSearch(params: {
    query: string;
    types?: ('cards' | 'products' | 'sets')[];
    limit?: number;
    page?: number;
    filters?: Record<string, any>;
  }): Promise<UnifiedSearchResult> {
    const { query, types = ['cards', 'products', 'sets'], limit = 20, page = 1, filters = {} } = params;

    const processedQuery = query.trim();
    if (!processedQuery) {
      return {
        success: true,
        query,
        totalCount: 0,
        results: {},
      };
    }

    const cacheKey = createCacheKey({ query: processedQuery, types, limit, page, filters });
    const cachedEntry = searchCache.get(cacheKey);
    if (cachedEntry && isValidCacheEntry(cachedEntry)) {
      return cachedEntry.data;
    }

    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      const queryParams = new URLSearchParams({
        query: processedQuery,
        types: types.join(','),
        limit: limit.toString(),
        page: page.toString(),
      });

      if (Object.keys(filters).length > 0) {
        queryParams.append('filters', JSON.stringify(filters));
      }

      try {
        const response = await apiClient.get(`/search?${queryParams.toString()}`);
        const data = response.data;

        // Cache the result
        const ttl = 300000; // 5 minutes
        searchCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });

        return data;
      } catch (error) {
        console.error('Unified search API error:', error);
        throw error;
      }
    })();

    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  },

  /**
   * New Suggestions API - provides search suggestions
   */
  async suggest(params: {
    query: string;
    types?: ('cards' | 'products' | 'sets')[];
    limit?: number;
  }): Promise<SuggestionsResult> {
    const { query, types = ['cards', 'products', 'sets'], limit = 5 } = params;

    const processedQuery = query.trim();
    if (!processedQuery) {
      return {
        success: true,
        query,
        suggestions: {},
      };
    }

    const cacheKey = createCacheKey({ query: processedQuery, types, limit, endpoint: 'suggest' });
    const cachedEntry = searchCache.get(cacheKey);
    if (cachedEntry && isValidCacheEntry(cachedEntry)) {
      return cachedEntry.data;
    }

    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      const queryParams = new URLSearchParams({
        query: processedQuery,
        types: types.join(','),
        limit: limit.toString(),
      });

      try {
        const response = await apiClient.get(`/search/suggest?${queryParams.toString()}`);
        const data = response.data;

        // Cache the result
        const ttl = 180000; // 3 minutes for suggestions
        searchCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });

        return data;
      } catch (error) {
        console.error('Suggestions API error:', error);
        throw error;
      }
    })();

    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  },

  /**
   * New Optimized Card Search API
   */
  async searchCardsOptimized(params: {
    query: string;
    setId?: string;
    setName?: string;
    year?: number;
    pokemonNumber?: string;
    variety?: string;
    minPsaPopulation?: number;
    limit?: number;
    page?: number;
  }): Promise<{ success: boolean; query: string; count: number; data: CardResult[] }> {
    const { query, limit = 20, page = 1, ...filters } = params;

    const processedQuery = query.trim();
    if (!processedQuery) {
      return {
        success: true,
        query,
        count: 0,
        data: [],
      };
    }

    const cacheKey = createCacheKey({ query: processedQuery, filters, limit, page, endpoint: 'cards' });
    const cachedEntry = searchCache.get(cacheKey);
    if (cachedEntry && isValidCacheEntry(cachedEntry)) {
      return cachedEntry.data;
    }

    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      const queryParams = new URLSearchParams({
        query: processedQuery,
        limit: limit.toString(),
        page: page.toString(),
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      try {
        const response = await apiClient.get(`/search/cards?${queryParams.toString()}`);
        const data = response.data;

        // Cache the result
        const ttl = 300000; // 5 minutes
        searchCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });

        return data;
      } catch (error) {
        console.error('Card search API error:', error);
        throw error;
      }
    })();

    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  },

  /**
   * New Optimized Product Search API
   */
  async searchProductsOptimized(params: {
    query: string;
    category?: string;
    setName?: string;
    minPrice?: number;
    maxPrice?: number;
    availableOnly?: boolean;
    limit?: number;
    page?: number;
  }): Promise<{ success: boolean; query: string; count: number; data: ProductResult[] }> {
    const { query, limit = 20, page = 1, ...filters } = params;

    const processedQuery = query.trim();
    if (!processedQuery) {
      return {
        success: true,
        query,
        count: 0,
        data: [],
      };
    }

    const cacheKey = createCacheKey({ query: processedQuery, filters, limit, page, endpoint: 'products' });
    const cachedEntry = searchCache.get(cacheKey);
    if (cachedEntry && isValidCacheEntry(cachedEntry)) {
      return cachedEntry.data;
    }

    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      const queryParams = new URLSearchParams({
        query: processedQuery,
        limit: limit.toString(),
        page: page.toString(),
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      try {
        const response = await apiClient.get(`/search/products?${queryParams.toString()}`);
        const data = response.data;

        // Cache the result
        const ttl = 300000; // 5 minutes
        searchCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });

        return data;
      } catch (error) {
        console.error('Product search API error:', error);
        throw error;
      }
    })();

    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  },

  /**
   * New Optimized Set Search API
   */
  async searchSetsOptimized(params: {
    query: string;
    year?: number;
    minYear?: number;
    maxYear?: number;
    minPsaPopulation?: number;
    minCardCount?: number;
    limit?: number;
    page?: number;
  }): Promise<{ success: boolean; query: string; count: number; data: SetResult[] }> {
    const { query, limit = 20, page = 1, ...filters } = params;

    const processedQuery = query.trim();
    if (!processedQuery) {
      return {
        success: true,
        query,
        count: 0,
        data: [],
      };
    }

    const cacheKey = createCacheKey({ query: processedQuery, filters, limit, page, endpoint: 'sets' });
    const cachedEntry = searchCache.get(cacheKey);
    if (cachedEntry && isValidCacheEntry(cachedEntry)) {
      return cachedEntry.data;
    }

    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      const queryParams = new URLSearchParams({
        query: processedQuery,
        limit: limit.toString(),
        page: page.toString(),
      });

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      try {
        const response = await apiClient.get(`/search/sets?${queryParams.toString()}`);
        const data = response.data;

        // Cache the result
        const ttl = 600000; // 10 minutes for sets
        searchCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl,
        });

        return data;
      } catch (error) {
        console.error('Set search API error:', error);
        throw error;
      }
    })();

    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  },

  /**
   * Context7 Enhanced Unified Hierarchical Search Endpoint (Legacy)
   */
  async search(params: {
    type: 'sets' | 'cards' | 'products' | 'categories' | 'productSets';
    q: string;
    setContext?: string;
    categoryContext?: string;
    limit?: number;
  }): Promise<SearchResult> {
    const { type, q, setContext, categoryContext, limit = 10 } = params;

    // Context7 Input Preprocessing
    const processedQuery = q.trim().toLowerCase();
    if (!processedQuery) {
      return {
        success: true,
        type,
        query: q,
        setContext,
        categoryContext,
        results: [],
        count: 0,
      };
    }

    console.log(`[SEARCH API DEBUG] search() called with params:`, params);

    // Context7 Cache Key Generation
    const cacheKey = createCacheKey({
      type,
      q: processedQuery,
      setContext,
      categoryContext,
      limit,
    });

    // Context7 Cache Check
    const cachedEntry = searchCache.get(cacheKey);
    if (cachedEntry && isValidCacheEntry(cachedEntry)) {
      console.log(`[SEARCH API DEBUG] Using cached result for:`, cacheKey);
      return cachedEntry.data;
    }

    // Context7 Request Deduplication
    if (pendingRequests.has(cacheKey)) {
      console.log(`[SEARCH API DEBUG] Request already pending for:`, cacheKey);
      return await pendingRequests.get(cacheKey)!;
    }

    const requestPromise = (async () => {
      const queryParams = new URLSearchParams({
        type,
        q: processedQuery,
        limit: limit.toString(),
      });

      if (setContext) {
        queryParams.append('setContext', setContext);
        console.log(`[SEARCH API DEBUG] Added setContext: ${setContext}`);
      }

      if (categoryContext) {
        queryParams.append('categoryContext', categoryContext);
        console.log(`[SEARCH API DEBUG] Added categoryContext: ${categoryContext}`);
      }

      const url = `/search?${queryParams.toString()}`;
      console.log(`[SEARCH API DEBUG] Making request to: ${url}`);

      try {
        const response = await apiClient.get(url);
        const data = response.data;
        
        // Context7 Result Enhancement
        const enhancedData = {
          ...data,
          results: data.results.map((result: any) => ({
            ...result,
            searchScore: this.calculateSearchScore(result, processedQuery, type),
            isExactMatch: this.isExactMatch(result, processedQuery, type),
          })),
        };

        // Context7 Advanced Caching
        const ttl = type === 'sets' ? 600000 : 300000; // 10min for sets, 5min for others
        searchCache.set(cacheKey, {
          data: enhancedData,
          timestamp: Date.now(),
          ttl,
        });

        console.log(`[SEARCH API DEBUG] API response:`, enhancedData);
        return enhancedData;
      } catch (error) {
        console.error(`[SEARCH API DEBUG] API error:`, error);
        throw error;
      }
    })();

    // Store request for deduplication
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up pending request
      pendingRequests.delete(cacheKey);
    }
  },

  /**
   * Context7 Enhanced Search Scoring Algorithm
   */
  calculateSearchScore(result: any, query: string, type: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Get primary text field based on type
    const primaryText = (
      result.cardName || 
      result.name || 
      result.setName || 
      result.category || 
      ''
    ).toLowerCase();
    
    // Context7 Scoring Factors
    if (primaryText === queryLower) score += 100;
    if (primaryText.startsWith(queryLower)) score += 50;
    if (primaryText.includes(queryLower)) score += 25;
    
    // Word boundary matching
    const words = queryLower.split(' ');
    const textWords = primaryText.split(' ');
    const wordMatches = words.filter(word => 
      textWords.some(textWord => textWord.includes(word))
    ).length;
    score += (wordMatches / words.length) * 30;
    
    // Length similarity bonus
    const lengthDiff = Math.abs(primaryText.length - queryLower.length);
    score += Math.max(0, 20 - lengthDiff);
    
    // Type-specific bonuses
    if (type === 'sets' && result.year) {
      score += 5; // Recent sets are more relevant
    }
    
    if (type === 'products' && result.available) {
      score += 10; // Available products are more relevant
    }
    
    return score;
  },

  /**
   * Context7 Exact Match Detection
   */
  isExactMatch(result: any, query: string, type: string): boolean {
    const queryLower = query.toLowerCase();
    const primaryText = (
      result.cardName || 
      result.name || 
      result.setName || 
      result.category || 
      ''
    ).toLowerCase();
    
    return primaryText === queryLower || 
           primaryText.replace(/[^a-z0-9]/g, '') === queryLower.replace(/[^a-z0-9]/g, '');
  },

  /**
   * Context7 Enhanced Set Search (first step in hierarchical search)
   */
  async searchSets(query: string, limit: number = 15): Promise<SetResult[]> {
    console.log(`[SEARCH API DEBUG] searchSets() called:`, { query, limit });
    const result = await this.search({
      type: 'sets',
      q: query,
      limit,
    });
    
    // Context7 Set-Specific Result Enhancement
    const enhancedResults = (result.results as SetResult[])
      .sort((a, b) => {
        // Prioritize exact matches
        if (a.isExactMatch && !b.isExactMatch) return -1;
        if (!a.isExactMatch && b.isExactMatch) return 1;
        
        // Then sort by search score
        return (b.searchScore || 0) - (a.searchScore || 0);
      })
      .slice(0, 15); // Context7 optimal limit
      
    console.log(`[SEARCH API DEBUG] searchSets() returning:`, enhancedResults);
    return enhancedResults;
  },

  /**
   * Context7 Enhanced Product Set Search (for sealed products)
   * Uses dedicated CardMarket Reference Products API for sealed products
   */
  async searchProductSets(query: string, limit: number = 15): Promise<SetResult[]> {
    console.log(`[SEARCH API DEBUG] searchProductSets() called:`, { query, limit });
    
    // Use the dedicated CardMarket Reference Products API
    const products = await searchCardMarketRefProducts(query, { limit });
    
    // Group by setName to get unique sets and count products in each
    const setMap = new Map<string, SetResult & { counts: { products: number } }>();
    
    products.forEach(product => {
      if (product.setName) {
        if (setMap.has(product.setName)) {
          // Increment count for existing set
          const existingSet = setMap.get(product.setName)!;
          existingSet.counts.products++;
        } else {
          // Create new set entry
          setMap.set(product.setName, {
            setName: product.setName,
            score: this.calculateSearchScore(product, query, 'sets'),
            source: 'products',
            isExactMatch: this.isExactMatch(product, query, 'sets'),
            searchScore: this.calculateSearchScore(product, query, 'sets'),
            counts: { products: 1 }
          });
        }
      }
    });
    
    // Context7 Product Set-Specific Result Enhancement
    const enhancedResults = Array.from(setMap.values())
      .sort((a, b) => {
        // Prioritize exact matches
        if (a.isExactMatch && !b.isExactMatch) return -1;
        if (!a.isExactMatch && b.isExactMatch) return 1;
        
        // Then sort by search score
        return (b.searchScore || 0) - (a.searchScore || 0);
      })
      .slice(0, limit); // Context7 optimal limit
      
    console.log(`[SEARCH API DEBUG] searchProductSets() returning:`, enhancedResults);
    return enhancedResults;
  },

  /**
   * Context7 Enhanced Card Search (optionally filtered by set)
   */
  async searchCards(
    query: string,
    setContext?: string,
    categoryContext?: string,
    limit: number = 15
  ): Promise<CardResult[]> {
    console.log(`[SEARCH API DEBUG] searchCards() called:`, {
      query,
      setContext,
      categoryContext,
      limit,
    });
    const result = await this.search({
      type: 'cards',
      q: query,
      setContext,
      categoryContext,
      limit,
    });
    
    // Context7 Card-Specific Result Enhancement
    const enhancedResults = (result.results as CardResult[])
      .sort((a, b) => {
        // Prioritize exact matches
        if (a.isExactMatch && !b.isExactMatch) return -1;
        if (!a.isExactMatch && b.isExactMatch) return 1;
        
        // Context relevance boost
        if (setContext) {
          const aSetMatch = a.setInfo?.setName?.toLowerCase() === setContext.toLowerCase();
          const bSetMatch = b.setInfo?.setName?.toLowerCase() === setContext.toLowerCase();
          if (aSetMatch && !bSetMatch) return -1;
          if (!aSetMatch && bSetMatch) return 1;
        }
        
        // Then sort by search score
        return (b.searchScore || 0) - (a.searchScore || 0);
      })
      .slice(0, 15); // Context7 optimal limit
      
    console.log(`[SEARCH API DEBUG] searchCards() returning:`, enhancedResults);
    return enhancedResults;
  },

  /**
   * Context7 Enhanced Product Search (optionally filtered by set and/or category)
   * Uses dedicated CardMarket Reference Products API for sealed products
   */
  async searchProducts(
    query: string,
    setContext?: string,
    categoryContext?: string,
    limit: number = 15
  ): Promise<ProductResult[]> {
    console.log(`[SEARCH API DEBUG] searchProducts() called:`, {
      query,
      setContext,
      categoryContext,
      limit,
    });
    
    // Use the dedicated CardMarket Reference Products API for sealed products
    const params: any = { limit };
    if (categoryContext) {
      params.category = categoryContext;
    }
    if (setContext) {
      params.setName = setContext;
    }
    
    const products = await searchCardMarketRefProducts(query, params);
    
    // Transform CardMarket products to ProductResult format
    const productResults: ProductResult[] = products.map(product => ({
      _id: product._id,
      name: product.name,
      setName: product.setName,
      category: product.category,
      available: product.available > 0,
      price: parseFloat(product.price?.replace(/[^0-9.,]/g, '').replace(',', '.') || '0'),
      searchScore: this.calculateSearchScore(product, query, 'products'),
      isExactMatch: this.isExactMatch(product, query, 'products')
    }));
    
    // Context7 Product-Specific Result Enhancement
    const enhancedResults = productResults
      .sort((a, b) => {
        // Prioritize exact matches
        if (a.isExactMatch && !b.isExactMatch) return -1;
        if (!a.isExactMatch && b.isExactMatch) return 1;
        
        // Prioritize available products
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        
        // Context relevance boost
        if (setContext) {
          const aSetMatch = a.setName?.toLowerCase() === setContext.toLowerCase();
          const bSetMatch = b.setName?.toLowerCase() === setContext.toLowerCase();
          if (aSetMatch && !bSetMatch) return -1;
          if (!aSetMatch && bSetMatch) return 1;
        }
        
        if (categoryContext) {
          const aCategoryMatch = a.category?.toLowerCase() === categoryContext.toLowerCase();
          const bCategoryMatch = b.category?.toLowerCase() === categoryContext.toLowerCase();
          if (aCategoryMatch && !bCategoryMatch) return -1;
          if (!aCategoryMatch && bCategoryMatch) return 1;
        }
        
        // Then sort by search score
        return (b.searchScore || 0) - (a.searchScore || 0);
      })
      .slice(0, limit); // Context7 optimal limit
      
    console.log(`[SEARCH API DEBUG] searchProducts() returning:`, enhancedResults);
    return enhancedResults;
  },

  /**
   * Context7 Enhanced Category Search
   */
  async searchCategories(query: string, limit: number = 15): Promise<CategoryResult[]> {
    console.log(`[SEARCH API DEBUG] searchCategories() called:`, { query, limit });
    const result = await this.search({
      type: 'categories',
      q: query,
      limit,
    });
    
    // Context7 Category-Specific Result Enhancement
    const enhancedResults = (result.results as CategoryResult[])
      .sort((a, b) => {
        // Prioritize exact matches
        if (a.isExactMatch && !b.isExactMatch) return -1;
        if (!a.isExactMatch && b.isExactMatch) return 1;
        
        // Prioritize categories with more products
        if (a.productCount !== b.productCount) {
          return b.productCount - a.productCount;
        }
        
        // Then sort by search score
        return (b.searchScore || 0) - (a.searchScore || 0);
      })
      .slice(0, 15); // Context7 optimal limit for categories
      
    console.log(`[SEARCH API DEBUG] searchCategories() returning:`, enhancedResults);
    return enhancedResults;
  },
};

/**
 * Get all available product categories from the backend (actual enum values)
 */
export const getProductCategories = async (): Promise<Array<{value: string, label: string}>> => {
  try {
    // Use the actual backend enum categories from SealedProduct model
    return [
      { value: 'Blisters', label: 'Blisters' },
      { value: 'Booster-Boxes', label: 'Booster Boxes' },
      { value: 'Boosters', label: 'Booster Packs' },
      { value: 'Box-Sets', label: 'Box Sets' },
      { value: 'Elite-Trainer-Boxes', label: 'Elite Trainer Boxes' },
      { value: 'Theme-Decks', label: 'Theme Decks' },
      { value: 'Tins', label: 'Tins' },
      { value: 'Trainer-Kits', label: 'Trainer Kits' },
    ];
  } catch (error) {
    console.error('Failed to fetch product categories:', error);
    // Fallback to the same categories if API fails
    return [
      { value: 'Blisters', label: 'Blisters' },
      { value: 'Booster-Boxes', label: 'Booster Boxes' },
      { value: 'Boosters', label: 'Booster Packs' },
      { value: 'Box-Sets', label: 'Box Sets' },
      { value: 'Elite-Trainer-Boxes', label: 'Elite Trainer Boxes' },
      { value: 'Theme-Decks', label: 'Theme Decks' },
      { value: 'Tins', label: 'Tins' },
      { value: 'Trainer-Kits', label: 'Trainer Kits' },
    ];
  }
};

/**
 * Get all available availability options (availability is a NUMBER in backend)
 */
export const getAvailabilityOptions = async (): Promise<Array<{value: number, label: string}>> => {
  try {
    // Availability is stored as a number in the backend
    return [
      { value: 0, label: 'Out of Stock' },
      { value: 1, label: 'Low Stock (1)' },
      { value: 5, label: 'Medium Stock (5)' },
      { value: 10, label: 'High Stock (10+)' },
    ];
  } catch (error) {
    console.error('Failed to fetch availability options:', error);
    return [
      { value: 0, label: 'Out of Stock' },
      { value: 1, label: 'Low Stock (1)' },
      { value: 5, label: 'Medium Stock (5)' },
      { value: 10, label: 'High Stock (10+)' },
    ];
  }
};
