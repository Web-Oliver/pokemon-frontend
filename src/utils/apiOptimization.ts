/**
 * API Optimization Utilities
 * Layer 1: Core/Foundation (CLAUDE.md Architecture)
 *
 * Following Context7 + CLAUDE.md principles:
 * - Request deduplication to prevent duplicate API calls
 * - Simple caching layer with TTL for frequent requests
 * - Batch operations for bulk operations
 * - Performance optimizations without changing functionality
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';

// Cache interface for storing request results
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Request cache with TTL support
const requestCache = new Map<string, CacheEntry>();

// Pending requests map for deduplication
const pendingRequests = new Map<string, Promise<AxiosResponse>>();

/**
 * Generate cache key from request config
 */
function generateCacheKey(config: AxiosRequestConfig): string {
  const { method = 'GET', url = '', params = {}, data = {} } = config;
  const paramsStr = JSON.stringify(params);
  const dataStr = method === 'GET' ? '' : JSON.stringify(data);
  return `${method}:${url}:${paramsStr}:${dataStr}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

/**
 * Get cached data if valid
 */
export function getCachedData<T>(cacheKey: string): T | null {
  const entry = requestCache.get(cacheKey);
  if (entry && isCacheValid(entry)) {
    return entry.data;
  }

  // Clean up expired cache entry
  if (entry) {
    requestCache.delete(cacheKey);
  }

  return null;
}

/**
 * Set cache data with TTL
 */
export function setCacheData<T>(
  cacheKey: string,
  data: T,
  ttl: number = 5 * 60 * 1000
): void {
  requestCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Request deduplication wrapper
 * Prevents multiple identical requests from being made simultaneously
 */
export function deduplicateRequest<T>(
  cacheKey: string,
  requestFn: () => Promise<AxiosResponse<T>>
): Promise<AxiosResponse<T>> {
  // Check if there's already a pending request for this key
  const existingRequest = pendingRequests.get(cacheKey);
  if (existingRequest) {
    return existingRequest as Promise<AxiosResponse<T>>;
  }

  // Create new request and store it
  const newRequest = requestFn().finally(() => {
    // Clean up pending request when completed
    pendingRequests.delete(cacheKey);
  });

  pendingRequests.set(cacheKey, newRequest);
  return newRequest;
}

/**
 * Optimized API request wrapper with caching and deduplication
 */
export function optimizedApiRequest<T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  config: AxiosRequestConfig,
  options: {
    enableCache?: boolean;
    cacheTTL?: number;
    enableDeduplication?: boolean;
  } = {}
): Promise<AxiosResponse<T>> {
  const {
    enableCache = false,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    enableDeduplication = true,
  } = options;

  const cacheKey = generateCacheKey(config);

  // Check cache first if enabled
  if (enableCache) {
    const cachedData = getCachedData<T>(cacheKey);
    if (cachedData) {
      // Return cached data wrapped in axios response format
      return Promise.resolve({
        data: cachedData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      } as AxiosResponse<T>);
    }
  }

  // Create the actual request function
  const executeRequest = async (): Promise<AxiosResponse<T>> => {
    const response = await requestFn();

    // Cache the response data if caching is enabled
    if (enableCache && response.status >= 200 && response.status < 300) {
      setCacheData(cacheKey, response.data, cacheTTL);
    }

    return response;
  };

  // Apply deduplication if enabled
  if (enableDeduplication) {
    return deduplicateRequest(cacheKey, executeRequest);
  }

  return executeRequest();
}

/**
 * Batch operation utility for grouping multiple requests
 */
export class BatchProcessor<T, R> {
  private batchQueue: T[] = [];
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly batchSize: number;
  private readonly batchDelay: number;
  private readonly processFn: (items: T[]) => Promise<R[]>;

  constructor(
    processFn: (items: T[]) => Promise<R[]>,
    options: {
      batchSize?: number;
      batchDelay?: number;
    } = {}
  ) {
    this.processFn = processFn;
    this.batchSize = options.batchSize || 10;
    this.batchDelay = options.batchDelay || 100; // 100ms delay
  }

  /**
   * Add item to batch queue
   */
  add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      // Add item with resolve/reject handlers
      const batchItem = {
        data: item,
        resolve,
        reject,
      };

      this.batchQueue.push(batchItem as any);

      // Process immediately if batch is full
      if (this.batchQueue.length >= this.batchSize) {
        this.processBatch();
        return;
      }

      // Schedule batch processing if not already scheduled
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.processBatch();
        }, this.batchDelay);
      }
    });
  }

  /**
   * Process current batch
   */
  private async processBatch(): void {
    if (this.batchQueue.length === 0) {
      return;
    }

    // Clear timeout and get current batch
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const currentBatch = this.batchQueue.splice(0, this.batchSize);
    const items = currentBatch.map((item: any) => item.data);

    try {
      const results = await this.processFn(items);

      // Resolve individual promises
      currentBatch.forEach((item: any, index: number) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      // Reject all promises in case of error
      currentBatch.forEach((item: any) => {
        item.reject(error);
      });
    }
  }
}

/**
 * Clear all cached data
 */
export function clearApiCache(): void {
  requestCache.clear();
}

/**
 * Clear expired cache entries
 */
export function cleanupExpiredCache(): void {
  for (const [key, entry] of requestCache.entries()) {
    if (!isCacheValid(entry)) {
      requestCache.delete(key);
    }
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
} {
  let validEntries = 0;
  let expiredEntries = 0;

  for (const entry of requestCache.values()) {
    if (isCacheValid(entry)) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }

  return {
    totalEntries: requestCache.size,
    validEntries,
    expiredEntries,
  };
}

// Auto-cleanup expired cache entries every 10 minutes
setInterval(cleanupExpiredCache, 10 * 60 * 1000);
