/**
 * Search Cache Hook
 * Handles caching logic for search operations
 *
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Only handles caching and TTL management
 * - Extracted from 822-line useSearch hook for better maintainability
 * - Focused on cache operations, hit rates, and cleanup
 */

import { useRef, useCallback, useMemo } from 'react';
import {
  SetResult,
  CardResult,
  ProductResult,
  CategoryResult,
} from '../../api/searchApi';
import { log } from '../../utils/logger';
import { getCacheTTL } from '../../config/cacheConfig';

type SearchResultType =
  | SetResult[]
  | CardResult[]
  | ProductResult[]
  | CategoryResult[];

interface CacheEntry {
  results: SearchResultType;
  timestamp: number;
  score: number;
  ttl: number;
  hitCount: number;
}

interface CacheStats {
  totalQueries: number;
  cacheHits: number;
  hitRate: number;
}

export interface UseSearchCacheReturn {
  // Cache operations
  getCachedResults: (key: string) => SearchResultType | null;
  setCachedResults: (
    key: string,
    results: SearchResultType,
    ttl?: number
  ) => void;
  clearCache: () => void;

  // Cache statistics
  getCacheStats: () => CacheStats;
  getCacheSize: () => number;

  // Cache management
  cleanupExpiredEntries: () => void;

  // Performance metrics
  getQueryTime: (startTime: number) => number;
}

/**
 * Hook for search result caching
 * Implements TTL-based caching with automatic cleanup
 * Separated from search logic for better testability
 */
export const useSearchCache = (): UseSearchCacheReturn => {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const statsRef = useRef<CacheStats>({
    totalQueries: 0,
    cacheHits: 0,
    hitRate: 0,
  });

  // Use centralized cache configuration for consistency
  const cacheTTL = useMemo(
    () => ({
      sets: getCacheTTL('SETS'),
      cards: getCacheTTL('CARDS'),
      products: getCacheTTL('PRODUCTS'),
      categories: getCacheTTL('CATEGORIES'),
    }),
    []
  );

  const getCachedResults = useCallback(
    (key: string): SearchResultType | null => {
      const cached = cacheRef.current.get(key);
      const now = Date.now();

      statsRef.current.totalQueries++;

      if (cached && now - cached.timestamp < cached.ttl) {
        // Valid cache hit
        cached.hitCount++;
        cached.score = (cached.hitCount / (now - cached.timestamp)) * 1000; // Score based on hits/age

        statsRef.current.cacheHits++;
        statsRef.current.hitRate =
          (statsRef.current.cacheHits / statsRef.current.totalQueries) * 100;

        log(
          `[SEARCH CACHE] Cache hit for key: ${key} (score: ${cached.score.toFixed(2)})`
        );
        return cached.results;
      }

      if (cached) {
        // Expired entry
        cacheRef.current.delete(key);
        log(`[SEARCH CACHE] Cache expired for key: ${key}`);
      }

      return null;
    },
    []
  );

  const setCachedResults = useCallback(
    (key: string, results: SearchResultType, customTtl?: number) => {
      const ttl = customTtl || cacheTTL.cards; // Default to cards TTL
      const now = Date.now();

      const entry: CacheEntry = {
        results,
        timestamp: now,
        score: 1, // Initial score
        ttl,
        hitCount: 0,
      };

      cacheRef.current.set(key, entry);
      log(`[SEARCH CACHE] Cached results for key: ${key} (TTL: ${ttl}ms)`);

      // Cleanup if cache gets too large (LRU-style)
      if (cacheRef.current.size > 100) {
        const oldestKey = Array.from(cacheRef.current.entries()).sort(
          ([, a], [, b]) => a.timestamp - b.timestamp
        )[0][0];

        cacheRef.current.delete(oldestKey);
        log(`[SEARCH CACHE] Evicted oldest entry: ${oldestKey}`);
      }
    },
    [cacheTTL]
  );

  const clearCache = useCallback(() => {
    const size = cacheRef.current.size;
    cacheRef.current.clear();

    // Reset stats
    statsRef.current = {
      totalQueries: 0,
      cacheHits: 0,
      hitRate: 0,
    };

    log(`[SEARCH CACHE] Cleared cache (${size} entries)`);
  }, []);

  const getCacheStats = useCallback((): CacheStats => {
    return { ...statsRef.current };
  }, []);

  const getCacheSize = useCallback((): number => {
    return cacheRef.current.size;
  }, []);

  const cleanupExpiredEntries = useCallback(() => {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of cacheRef.current.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        cacheRef.current.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      log(`[SEARCH CACHE] Cleaned up ${removedCount} expired entries`);
    }

    return removedCount;
  }, []);

  const getQueryTime = useCallback((startTime: number): number => {
    return Date.now() - startTime;
  }, []);

  return {
    getCachedResults,
    setCachedResults,
    clearCache,
    getCacheStats,
    getCacheSize,
    cleanupExpiredEntries,
    getQueryTime,
  };
};

export default useSearchCache;
