import unifiedApiClient from './unifiedApiClient';

// Context7 Search Performance Optimization
const searchCache = new Map<
  string,
  {
    data: unknown;
    timestamp: number;
    ttl: number;
  }
>();

const pendingRequests = new Map<string, Promise<unknown>>();

// Context7 Request Optimization Utilities
const createCacheKey = (params: Record<string, unknown>): string => {
  return JSON.stringify(params, Object.keys(params).sort());
};

const isValidCacheEntry = (entry: { data: unknown; timestamp: number; ttl: number }): boolean => {
  return entry && Date.now() - entry.timestamp < entry.ttl;
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
    const {
      query,
      types = ['cards', 'products', 'sets'],
      limit = 20,
      page = 1,
      filters = {},
    } = params;

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
        const response = await unifiedApiClient.get(`/search?${queryParams.toString()}`);
        const data = response;

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
        const response = await unifiedApiClient.get(`/search/suggest?${queryParams.toString()}`);
        const data = response;

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

    const cacheKey = createCacheKey({
      query: processedQuery,
      filters,
      limit,
      page,
      endpoint: 'cards',
    });
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
        const response = await unifiedApiClient.get(`/search/cards?${queryParams.toString()}`);
        const data = response;

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

    const cacheKey = createCacheKey({
      query: processedQuery,
      filters,
      limit,
      page,
      endpoint: 'products',
    });
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
        const response = await unifiedApiClient.get(`/search/products?${queryParams.toString()}`);
        const data = response;

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

    const cacheKey = createCacheKey({
      query: processedQuery,
      filters,
      limit,
      page,
      endpoint: 'sets',
    });
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
        const response = await unifiedApiClient.get(`/search/sets?${queryParams.toString()}`);
        const data = response;

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
   * Context7 Enhanced Search Scoring Algorithm
   */
  calculateSearchScore(
    result: SetResult | CardResult | ProductResult | CategoryResult,
    query: string,
    type: string
  ): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Get primary text field based on type
    const primaryText = (
      ('cardName' in result ? result.cardName : '') ||
      ('name' in result ? result.name : '') ||
      ('setName' in result ? result.setName : '') ||
      ('category' in result ? result.category : '') ||
      ''
    ).toLowerCase();

    // Context7 Scoring Factors
    if (primaryText === queryLower) {
      score += 100;
    }
    if (primaryText.startsWith(queryLower)) {
      score += 50;
    }
    if (primaryText.includes(queryLower)) {
      score += 25;
    }

    // Word boundary matching
    const words = queryLower.split(' ');
    const textWords = primaryText.split(' ');
    const wordMatches = words.filter(word =>
      textWords.some((textWord: string) => textWord.includes(word))
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
  isExactMatch(
    result: SetResult | CardResult | ProductResult | CategoryResult,
    query: string,
    _type: string
  ): boolean {
    const queryLower = query.toLowerCase();
    const primaryText = (
      ('cardName' in result ? result.cardName : '') ||
      ('name' in result ? result.name : '') ||
      ('setName' in result ? result.setName : '') ||
      ('category' in result ? result.category : '') ||
      ''
    ).toLowerCase();

    return (
      primaryText === queryLower ||
      primaryText.replace(/[^a-z0-9]/g, '') === queryLower.replace(/[^a-z0-9]/g, '')
    );
  },
};

/**
 * Get all available product categories from the backend (actual enum values)
 */
export const getProductCategories = async (): Promise<Array<{ value: string; label: string }>> => {
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
};

/**
 * Get all available availability options (availability is a NUMBER in backend)
 */
export const getAvailabilityOptions = async (): Promise<
  Array<{ value: number; label: string }>
> => {
  // Availability is stored as a number in the backend
  return [
    { value: 0, label: 'Out of Stock' },
    { value: 1, label: 'Low Stock (1)' },
    { value: 5, label: 'Medium Stock (5)' },
    { value: 10, label: 'High Stock (10+)' },
  ];
};
