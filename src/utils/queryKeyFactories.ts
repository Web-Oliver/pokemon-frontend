/**
 * Query Key Factories for TanStack Query
 * Standardizes and optimizes cache keys across the application
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Only handles query key generation
 * - Open/Closed: Extensible by adding new key factories
 * - DRY: Single source of truth for all query keys
 */

/**
 * Base query key factory interface
 */
interface QueryKeyFactory {
  all: readonly unknown[];
  lists: () => readonly unknown[];
  list: (filters?: Record<string, unknown>) => readonly unknown[];
  details: () => readonly unknown[];
  detail: (id: string | number) => readonly unknown[];
}

/**
 * Create a standardized query key factory for a resource
 */
const createQueryKeyFactory = (resource: string): QueryKeyFactory => ({
  all: [resource] as const,
  lists: () => [resource, 'list'] as const,
  list: (filters) => [resource, 'list', filters] as const,
  details: () => [resource, 'detail'] as const,
  detail: (id) => [resource, 'detail', id] as const,
});

/**
 * Sales Analytics Query Keys
 * Optimized for structural sharing and cache invalidation
 */
export const salesQueryKeys = {
  ...createQueryKeyFactory('sales'),
  
  // Sales data with filters
  data: (params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }) => ['sales', 'data', params] as const,
  
  // Sales summary analytics
  summary: (params?: {
    startDate?: string;
    endDate?: string;
  }) => ['sales', 'summary', params] as const,
  
  // Sales graph data
  graphData: (params?: {
    startDate?: string;
    endDate?: string;
  }) => ['sales', 'graph-data', params] as const,
  
  // KPI calculations
  kpis: (params?: {
    startDate?: string;
    endDate?: string;
  }) => ['sales', 'kpis', params] as const,
  
  // Category breakdown
  categoryBreakdown: (params?: {
    startDate?: string;
    endDate?: string;
  }) => ['sales', 'category-breakdown', params] as const,
};

/**
 * Collection Query Keys
 * For PSA cards, raw cards, and sealed products
 */
export const collectionQueryKeys = {
  ...createQueryKeyFactory('collection'),
  
  // PSA Graded Cards
  psaCards: (filters?: {
    setName?: string;
    grade?: number;
    page?: number;
    limit?: number;
  }) => ['collection', 'psa-cards', filters] as const,
  
  // Raw Cards
  rawCards: (filters?: {
    setName?: string;
    condition?: string;
    page?: number;
    limit?: number;
  }) => ['collection', 'raw-cards', filters] as const,
  
  // Sealed Products
  sealedProducts: (filters?: {
    setName?: string;
    category?: string;
    available?: boolean;
    page?: number;
    limit?: number;
  }) => ['collection', 'sealed-products', filters] as const,
  
  // Collection statistics
  stats: () => ['collection', 'statistics'] as const,
  
  // Total value calculations
  totalValue: () => ['collection', 'total-value'] as const,
};

/**
 * Search Query Keys
 * For search operations and autocomplete
 */
export const searchQueryKeys = {
  ...createQueryKeyFactory('search'),
  
  // Card search
  cards: (params: {
    query: string;
    setName?: string;
    limit?: number;
  }) => ['search', 'cards', params] as const,
  
  // Product search
  products: (params: {
    query: string;
    setName?: string;
    limit?: number;
  }) => ['search', 'products', params] as const,
  
  // Set search
  sets: (query?: string) => ['search', 'sets', query] as const,
  
  // Category search
  categories: (query?: string) => ['search', 'categories', query] as const,
  
  // Autocomplete suggestions
  suggestions: (params: {
    query: string;
    type: 'cards' | 'products' | 'sets' | 'categories';
    setName?: string;
  }) => ['search', 'suggestions', params] as const,
};

/**
 * Reference Data Query Keys
 * For sets, card market data, etc.
 */
export const referenceQueryKeys = {
  ...createQueryKeyFactory('reference'),
  
  // All sets
  sets: () => ['reference', 'sets'] as const,
  
  // Set details
  setDetail: (setName: string) => ['reference', 'sets', setName] as const,
  
  // Card market reference products
  cardMarketProducts: (filters?: {
    setName?: string;
    category?: string;
    available?: boolean;
  }) => ['reference', 'card-market-products', filters] as const,
  
  // Price history
  priceHistory: (params: {
    itemType: 'card' | 'product';
    itemId: string;
    timeframe?: '1m' | '3m' | '6m' | '1y';
  }) => ['reference', 'price-history', params] as const,
};

/**
 * Export Query Keys
 * For export operations
 */
export const exportQueryKeys = {
  ...createQueryKeyFactory('export'),
  
  // Collection export
  collection: (params: {
    format: 'csv' | 'excel' | 'pdf';
    itemTypes?: string[];
    filters?: Record<string, unknown>;
  }) => ['export', 'collection', params] as const,
  
  // Sales export
  sales: (params: {
    format: 'csv' | 'excel' | 'pdf';
    startDate?: string;
    endDate?: string;
    category?: string;
  }) => ['export', 'sales', params] as const,
};

/**
 * Utility functions for query key management
 */
export const queryKeyUtils = {
  /**
   * Create a cache key for manual cache operations
   */
  createCacheKey: (keyArray: readonly unknown[]): string => {
    return keyArray
      .map(key => 
        typeof key === 'object' && key !== null 
          ? JSON.stringify(key) 
          : String(key)
      )
      .join(':');
  },

  /**
   * Check if two query keys are related (for cache invalidation)
   */
  areKeysRelated: (key1: readonly unknown[], key2: readonly unknown[]): boolean => {
    if (key1.length === 0 || key2.length === 0) return false;
    return key1[0] === key2[0]; // Same resource type
  },

  /**
   * Get parent keys for invalidation
   */
  getParentKeys: (key: readonly unknown[]): readonly unknown[][] => {
    const parents: unknown[][] = [];
    
    // Add progressively shorter keys as parents
    for (let i = key.length - 1; i > 0; i--) {
      parents.push(key.slice(0, i));
    }
    
    return parents;
  },

  /**
   * Normalize query parameters for consistent caching
   */
  normalizeParams: (params?: Record<string, unknown>): Record<string, unknown> | undefined => {
    if (!params) return undefined;
    
    // Remove undefined values and sort keys for consistency
    const normalized: Record<string, unknown> = {};
    const sortedKeys = Object.keys(params).sort();
    
    for (const key of sortedKeys) {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        normalized[key] = value;
      }
    }
    
    return Object.keys(normalized).length > 0 ? normalized : undefined;
  },
};

/**
 * Pre-configured query key sets for common operations
 */
export const commonQueryKeySets = {
  /**
   * Keys related to sales analytics dashboard
   */
  salesDashboard: (dateRange?: { startDate?: string; endDate?: string }) => [
    salesQueryKeys.data(dateRange),
    salesQueryKeys.summary(dateRange),
    salesQueryKeys.graphData(dateRange),
    salesQueryKeys.kpis(dateRange),
    salesQueryKeys.categoryBreakdown(dateRange),
  ],

  /**
   * Keys related to collection overview
   */
  collectionOverview: () => [
    collectionQueryKeys.stats(),
    collectionQueryKeys.totalValue(),
    collectionQueryKeys.psaCards({ page: 1, limit: 10 }),
    collectionQueryKeys.rawCards({ page: 1, limit: 10 }),
    collectionQueryKeys.sealedProducts({ page: 1, limit: 10 }),
  ],

  /**
   * Keys related to search functionality
   */
  searchSession: (activeQuery: string) => [
    searchQueryKeys.cards({ query: activeQuery }),
    searchQueryKeys.sets(),
    referenceQueryKeys.sets(),
  ],
};

export default {
  salesQueryKeys,
  collectionQueryKeys,
  searchQueryKeys,
  referenceQueryKeys,
  exportQueryKeys,
  queryKeyUtils,
  commonQueryKeySets,
};