/**
 * React Query Client Configuration
 *
 * Optimized configuration for caching and performance
 * Following CLAUDE.md principles for optimal performance
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Keep cache for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 2 times
      retry: 2,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect to avoid unnecessary requests
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Query keys factory for consistent cache keys
export const queryKeys = {
  // Collection data
  collection: ['collection'] as const,
  psaCards: () => [...queryKeys.collection, 'psa-cards'] as const,
  rawCards: () => [...queryKeys.collection, 'raw-cards'] as const,
  sealedProducts: () => [...queryKeys.collection, 'sealed-products'] as const,
  soldItems: () => [...queryKeys.collection, 'sold-items'] as const,

  // Individual items
  collectionItem: (type: string, id: string) =>
    ['collection-item', type, id] as const,

  // Search data
  search: ['search'] as const,
  searchCards: (query: string) =>
    [...queryKeys.search, 'cards', query] as const,
  searchSets: (query: string) => [...queryKeys.search, 'sets', query] as const,
  searchProducts: (query: string) =>
    [...queryKeys.search, 'products', query] as const,

  // Analytics
  analytics: ['analytics'] as const,
  salesAnalytics: () => [...queryKeys.analytics, 'sales'] as const,

  // Activity
  activity: ['activity'] as const,
  activityFeed: () => [...queryKeys.activity, 'feed'] as const,

  // DBA Selection
  dbaSelection: ['dba-selection'] as const,
  dbaSelections: (params?: any) => [...queryKeys.dbaSelection, 'list', params] as const,
  dbaSelectionStats: () => [...queryKeys.dbaSelection, 'stats'] as const,
} as const;
