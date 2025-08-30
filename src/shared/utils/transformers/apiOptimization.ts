/**
 * API Optimization Utilities
 * Layer 1: Core/Foundation utilities
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: API request optimization only
 * - No external dependencies to prevent circular imports
 * - Performance-focused utilities
 */

/**
 * Optimized API request wrapper
 * Provides request optimization and caching capabilities
 */
export const optimizedApiRequest = async <T>(
  requestFn: () => Promise<T>,
  options?: {
    cache?: boolean;
    timeout?: number;
    retries?: number;
  }
): Promise<T> => {
  const { timeout = 30000, retries = 0 } = options || {};

  let lastError: Error | null = null;
  let attempts = 0;
  const maxAttempts = retries + 1;

  while (attempts < maxAttempts) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      // Race the request against the timeout
      const result = await Promise.race([requestFn(), timeoutPromise]);
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      attempts++;
      
      if (attempts >= maxAttempts) {
        break;
      }
      
      // Exponential backoff for retries
      const delay = Math.min(1000 * Math.pow(2, attempts - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Request failed after retries');
};

/**
 * Request deduplication utility
 * Prevents duplicate requests to the same endpoint
 */
const pendingRequests = new Map<string, Promise<any>>();

export const deduplicateRequest = async <T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }

  const request = requestFn().finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, request);
  return request;
};

/**
 * Simple request cache
 * Caches successful responses for a specified duration
 */
const responseCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const cacheRequest = async <T>(
  key: string,
  requestFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> => {
  const now = Date.now();
  const cached = responseCache.get(key);

  // Return cached result if still valid
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return cached.data;
  }

  // Make fresh request
  const result = await requestFn();
  
  // Cache successful result
  responseCache.set(key, {
    data: result,
    timestamp: now,
    ttl
  });

  return result;
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = (): void => {
  const now = Date.now();
  
  for (const [key, cached] of responseCache.entries()) {
    if ((now - cached.timestamp) >= cached.ttl) {
      responseCache.delete(key);
    }
  }
};