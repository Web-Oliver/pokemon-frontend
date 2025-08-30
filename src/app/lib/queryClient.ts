/**
 * React Query Client Configuration
 * Comprehensive caching strategy following SOLID and DRY principles
 *
 * Following CLAUDE.md principles for optimal performance:
 * - Aggressive caching for static data (cards, sets, products)
 * - Smart invalidation patterns
 * - Memory optimization with proper garbage collection
 * - Performance monitoring and cache analytics
 */

import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { log } from '@/shared/utils/performance/logger';

// Cache time constants for different data types
export const CACHE_TIMES = {
  // Static reference data - cache for 1 hour
  STATIC_DATA: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 4, // 4 hours
  },
  // Collection data - cache for 15 minutes
  COLLECTION_DATA: {
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  },
  // Search results - cache for 5 minutes
  SEARCH_DATA: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  },
  // Analytics data - cache for 30 minutes
  ANALYTICS_DATA: {
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  },
  // User preferences - cache for 24 hours
  USER_PREFERENCES: {
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 48, // 48 hours
  },
  // Real-time data - NO CACHING for ICR workflow
  REALTIME_DATA: {
    staleTime: 0, // NO CACHING - Always fresh data
    gcTime: 0, // NO CACHE RETENTION - Immediate cleanup
  },
} as const;

// Create query cache with performance monitoring
const queryCache = new QueryCache({
  onError: (error, query) => {
    log('[QUERY CACHE] Query failed', {
      queryKey: query.queryKey,
      error: error.message,
      queryHash: query.queryHash,
    });
  },
  onSuccess: (data, query) => {
    const isDev = (import.meta as ImportMeta & { env?: { MODE?: string } }).env?.MODE === 'development';
    if (isDev) {
      log('[QUERY CACHE] Query succeeded', {
        queryKey: query.queryKey,
        dataSize: JSON.stringify(data).length,
        cacheTime: query.options.gcTime,
        staleTime: (query.options as { staleTime?: number }).staleTime,
      });
    }
  },
});

// Create mutation cache with error handling
const mutationCache = new MutationCache({
  onError: (error, variables, _context, mutation) => {
    log('[MUTATION CACHE] Mutation failed', {
      mutationKey: mutation.options.mutationKey,
      error: error.message,
      variables,
    });
  },
  onSuccess: (_data, variables, _context, mutation) => {
    log('[MUTATION CACHE] Mutation succeeded', {
      mutationKey: mutation.options.mutationKey,
      variables,
    });
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Default cache configuration - will be overridden by specific queries
      staleTime: CACHE_TIMES.COLLECTION_DATA.staleTime,
      gcTime: CACHE_TIMES.COLLECTION_DATA.gcTime,

      // Network and retry configuration
      retry: (failureCount, error: Error) => {
        // Don't retry on authentication errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Don't retry on client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network/server errors
        return failureCount < 3;
      },

      // Retry with exponential backoff + jitter
      retryDelay: (attemptIndex) => {
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
        const jitter = Math.random() * 1000;
        return baseDelay + jitter;
      },

      // Smart refetch behavior
      refetchOnWindowFocus: (query) => {
        // Don't refetch static data on focus
        const isStaticData =
          query.queryKey.includes('cards-reference') ||
          query.queryKey.includes('sets-reference') ||
          query.queryKey.includes('products-reference');
        return !isStaticData;
      },

      // Refetch on reconnect for critical data only
      refetchOnReconnect: (query) => {
        const isCriticalData =
          query.queryKey.includes('collection') ||
          query.queryKey.includes('auction');
        return isCriticalData;
      },

      // Background refetch for stale data
      refetchOnMount: 'always',
      refetchInterval: false, // Disable automatic polling by default

      // Performance optimizations
      structuralSharing: true, // Enable structural sharing for better performance
      networkMode: 'online', // Only run queries when online
    },
    mutations: {
      // Retry mutations once with delay
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

// Comprehensive query keys factory for consistent cache keys and invalidation
export const queryKeys = {
  // === COLLECTION DATA ===
  collection: ['collection'] as const,
  psaCards: (filters?: Record<string, unknown>) =>
    [...queryKeys.collection, 'psa-cards', filters] as const,
  rawCards: (filters?: any) =>
    [...queryKeys.collection, 'raw-cards', filters] as const,
  sealedProducts: (filters?: any) =>
    [...queryKeys.collection, 'sealed-products', filters] as const,
  soldItems: (filters?: any) =>
    [...queryKeys.collection, 'sold-items', filters] as const,
  collectionStats: () => [...queryKeys.collection, 'stats'] as const,
  collectionValue: () => [...queryKeys.collection, 'value'] as const,

  // Individual items with caching strategy
  collectionItem: (type: string, id: string) =>
    ['collection-item', type, id] as const,
  itemHistory: (type: string, id: string) =>
    ['item-history', type, id] as const,
  itemImages: (type: string, id: string) => ['item-images', type, id] as const,

  // === REFERENCE DATA (Static - Long Cache) ===
  reference: ['reference'] as const,
  cardsReference: (params?: any) =>
    [...queryKeys.reference, 'cards', params] as const,
  setsReference: (params?: any) =>
    [...queryKeys.reference, 'sets', params] as const,
  productsReference: (params?: any) =>
    [...queryKeys.reference, 'products', params] as const,
  gradesReference: () => [...queryKeys.reference, 'grades'] as const,
  conditionsReference: () => [...queryKeys.reference, 'conditions'] as const,

  // === SEARCH DATA ===
  search: {
    base: ['search'] as const,
    cards: (query: string, filters?: any) =>
      ['search', 'cards', { query, filters }] as const,
    sets: (query: string, filters?: any) =>
      ['search', 'sets', { query, filters }] as const,
    products: (query: string, filters?: any) =>
      ['search', 'products', { query, filters }] as const,
    history: () => ['search', 'history'] as const,
    suggestions: (type: string, query: string) =>
      ['search', 'suggestions', type, query] as const,

    // Unified search functions
    unified: (query: string, types?: string[], strategy?: string) =>
      ['search', 'unified', { query, types, strategy }] as const,
    hierarchical: (query: string, parentId?: string, mode?: string) =>
      ['search', 'hierarchical', { query, parentId, mode }] as const,
  },

  // === ANALYTICS DATA ===
  analytics: ['analytics'] as const,
  salesAnalytics: (dateRange?: any) =>
    [...queryKeys.analytics, 'sales', dateRange] as const,
  valueAnalytics: (dateRange?: any) =>
    [...queryKeys.analytics, 'value', dateRange] as const,
  gradeDistribution: () =>
    [...queryKeys.analytics, 'grade-distribution'] as const,
  setDistribution: () => [...queryKeys.analytics, 'set-distribution'] as const,
  profitAnalytics: (dateRange?: any) =>
    [...queryKeys.analytics, 'profit', dateRange] as const,

  // === ACTIVITY & AUDIT ===
  activity: ['activity'] as const,
  activityFeed: (filters?: any) =>
    [...queryKeys.activity, 'feed', filters] as const,
  recentActivity: () => [...queryKeys.activity, 'recent'] as const,
  auditLog: (filters?: any) =>
    [...queryKeys.activity, 'audit', filters] as const,

  // === AUCTIONS ===
  auctions: ['auctions'] as const,
  auctionsList: (filters?: any) =>
    [...queryKeys.auctions, 'list', filters] as const,
  auctionDetail: (id: string) => [...queryKeys.auctions, 'detail', id] as const,
  auctionItems: (id: string) => [...queryKeys.auctions, 'items', id] as const,
  auctionStats: () => [...queryKeys.auctions, 'stats'] as const,

  // === DBA/EXPORT FEATURES ===
  dbaSelection: ['dba-selection'] as const,
  dbaSelections: (params?: any) =>
    [...queryKeys.dbaSelection, 'list', params] as const,
  dbaSelectionStats: () => [...queryKeys.dbaSelection, 'stats'] as const,
  dbaExport: (params?: any) =>
    [...queryKeys.dbaSelection, 'export', params] as const,

  // === USER PREFERENCES & SETTINGS ===
  user: ['user'] as const,
  userPreferences: () => [...queryKeys.user, 'preferences'] as const,
  userSettings: () => [...queryKeys.user, 'settings'] as const,
  userSession: () => [...queryKeys.user, 'session'] as const,

  // === ICR/OCR PROCESSING ===
  icr: ['icr'] as const,
  icrScans: (status?: string, page?: number, limit?: number) =>
    [...queryKeys.icr, 'scans', { status, page, limit }] as const,
  icrStitched: (page?: number, limit?: number) =>
    [...queryKeys.icr, 'stitched', { page, limit }] as const,
  icrStatus: () => [...queryKeys.icr, 'status'] as const,

  // === SYSTEM & META ===
  system: ['system'] as const,
  systemStatus: () => [...queryKeys.system, 'status'] as const,
  appConfig: () => [...queryKeys.system, 'config'] as const,
  cacheStats: () => [...queryKeys.system, 'cache-stats'] as const,
} as const;

// Cache invalidation patterns for different operations
export const cacheInvalidation = {
  // Collection mutations
  onAddItem: (itemType: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.collection });
    queryClient.invalidateQueries({ queryKey: queryKeys.collectionStats() });
    queryClient.invalidateQueries({ queryKey: queryKeys.collectionValue() });

    // Invalidate specific item type
    if (itemType === 'psa-card') {
      queryClient.invalidateQueries({ queryKey: queryKeys.psaCards() });
    } else if (itemType === 'raw-card') {
      queryClient.invalidateQueries({ queryKey: queryKeys.rawCards() });
    } else if (itemType === 'sealed-product') {
      queryClient.invalidateQueries({ queryKey: queryKeys.sealedProducts() });
    }

    // Invalidate analytics
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
  },

  onUpdateItem: (itemType: string, itemId: string) => {
    // Invalidate specific item
    queryClient.invalidateQueries({
      queryKey: queryKeys.collectionItem(itemType, itemId),
    });

    // Invalidate collection lists
    queryClient.invalidateQueries({ queryKey: queryKeys.collection });
    queryClient.invalidateQueries({ queryKey: queryKeys.collectionStats() });
    queryClient.invalidateQueries({ queryKey: queryKeys.collectionValue() });

    // Invalidate analytics if price changed
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
  },

  onDeleteItem: (itemType: string, itemId: string) => {
    // Remove specific item from cache
    queryClient.removeQueries({
      queryKey: queryKeys.collectionItem(itemType, itemId),
    });
    queryClient.removeQueries({
      queryKey: queryKeys.itemHistory(itemType, itemId),
    });
    queryClient.removeQueries({
      queryKey: queryKeys.itemImages(itemType, itemId),
    });

    // Invalidate collection lists
    queryClient.invalidateQueries({ queryKey: queryKeys.collection });
    queryClient.invalidateQueries({ queryKey: queryKeys.collectionStats() });
    queryClient.invalidateQueries({ queryKey: queryKeys.collectionValue() });

    // Invalidate analytics
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
  },

  onSaleItem: (itemType: string, itemId: string) => {
    // Update specific item
    queryClient.invalidateQueries({
      queryKey: queryKeys.collectionItem(itemType, itemId),
    });

    // Invalidate collection and sold items
    queryClient.invalidateQueries({ queryKey: queryKeys.collection });
    queryClient.invalidateQueries({ queryKey: queryKeys.soldItems() });

    // Invalidate analytics and activity
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    queryClient.invalidateQueries({ queryKey: queryKeys.activity });
  },

  // Auction mutations
  onCreateAuction: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auctions });
    queryClient.invalidateQueries({ queryKey: queryKeys.activity });
  },

  onUpdateAuction: (auctionId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.auctionDetail(auctionId),
    });
    queryClient.invalidateQueries({
      queryKey: queryKeys.auctionItems(auctionId),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.auctionsList() });
  },

  // ICR/OCR mutations
  onUploadScans: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.icr });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('uploaded') });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() });
  },

  onExtractLabels: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.icr });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('uploaded') });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('extracted') });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() });
  },

  onStitchImages: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.icr });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('extracted') });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('stitched') });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrStitched() });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() });
  },

  onDeleteStitchedImage: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.icr });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('extracted') });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrScans('stitched') });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrStitched() });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() });
  },

  onDeleteScans: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.icr });
    queryClient.invalidateQueries({ queryKey: queryKeys.icrStatus() });
  }
};
