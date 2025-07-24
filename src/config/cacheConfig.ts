/**
 * Centralized Cache Configuration
 * Standardizes TTL values across all API operations for consistency
 * 
 * Following CLAUDE.md DRY + SOLID principles:
 * - Single Responsibility: Only handles cache configuration
 * - Open/Closed: Extensible by adding new cache types
 * - DRY: Single source of truth for all cache TTL values
 * - Replaces scattered TTL values throughout the codebase
 */

/**
 * Cache TTL values in milliseconds
 * Organized by data volatility and update frequency
 */
export const CACHE_TTL = {
  // Reference data (rarely changes)
  SETS: 10 * 60 * 1000,           // 10 minutes - Set information doesn't change often
  CATEGORIES: 15 * 60 * 1000,     // 15 minutes - Product categories are very stable
  
  // Collection data (moderate changes)
  COLLECTION_ITEMS: 2 * 60 * 1000, // 2 minutes - User's collection can change frequently
  PRICE_HISTORY: 5 * 60 * 1000,    // 5 minutes - Price updates are moderately frequent
  
  // Search data (frequent changes)
  CARDS: 5 * 60 * 1000,           // 5 minutes - Card data updates regularly
  PRODUCTS: 5 * 60 * 1000,        // 5 minutes - Product availability changes
  SEARCH_SUGGESTIONS: 3 * 60 * 1000, // 3 minutes - Suggestions can be dynamic
  
  // API optimizations
  UNIFIED_CLIENT_DEFAULT: 5 * 60 * 1000, // 5 minutes - Default for unified API client
  PREFETCH_DATA: 10 * 60 * 1000,  // 10 minutes - Prefetched data can be cached longer
  
  // Short-term caching
  REQUEST_DEDUPLICATION: 30 * 1000, // 30 seconds - Prevent duplicate requests
  AUTOCOMPLETE: 1 * 60 * 1000,     // 1 minute - Autocomplete suggestions
} as const;

/**
 * Cache configuration presets for different use cases
 * Provides semantic meaning to cache durations
 */
export const CACHE_PRESETS = {
  // For reference data that rarely changes
  STABLE: CACHE_TTL.SETS,
  
  // For data that changes moderately
  MODERATE: CACHE_TTL.CARDS,
  
  // For frequently changing data
  DYNAMIC: CACHE_TTL.SEARCH_SUGGESTIONS,
  
  // For real-time or very fresh data
  FRESH: CACHE_TTL.REQUEST_DEDUPLICATION,
} as const;

/**
 * Helper function to get TTL by data type
 * Provides type safety and consistent naming
 */
export const getCacheTTL = (dataType: keyof typeof CACHE_TTL): number => {
  return CACHE_TTL[dataType];
};

/**
 * Helper function to get cache preset
 * Provides semantic cache duration selection
 */
export const getCachePreset = (preset: keyof typeof CACHE_PRESETS): number => {
  return CACHE_PRESETS[preset];
};

/**
 * Cache configuration for specific API operations
 * Maps API operations to appropriate TTL values
 */
export const API_CACHE_CONFIG = {
  // Search API operations
  searchCards: CACHE_TTL.CARDS,
  searchProducts: CACHE_TTL.PRODUCTS,
  searchSets: CACHE_TTL.SETS,
  searchCategories: CACHE_TTL.CATEGORIES,
  searchSuggestions: CACHE_TTL.SEARCH_SUGGESTIONS,
  
  // Collection API operations
  getPsaCards: CACHE_TTL.COLLECTION_ITEMS,
  getRawCards: CACHE_TTL.COLLECTION_ITEMS,
  getSealedProducts: CACHE_TTL.COLLECTION_ITEMS,
  
  // Reference data operations
  getSets: CACHE_TTL.SETS,
  getCategories: CACHE_TTL.CATEGORIES,
  getPriceHistory: CACHE_TTL.PRICE_HISTORY,
  
  // Default fallback
  default: CACHE_TTL.UNIFIED_CLIENT_DEFAULT,
} as const;

/**
 * Helper function to get cache TTL for specific API operations
 * Provides operation-specific cache durations
 */
export const getApiCacheTTL = (operation: keyof typeof API_CACHE_CONFIG): number => {
  return API_CACHE_CONFIG[operation];
};

/**
 * Cache cleanup configuration
 * Defines when and how to clean up expired cache entries
 */
export const CACHE_CLEANUP = {
  // How often to run cleanup (5 minutes)
  CLEANUP_INTERVAL: 5 * 60 * 1000,
  
  // Maximum cache size before forcing cleanup
  MAX_CACHE_SIZE: 1000,
  
  // Age threshold for aggressive cleanup (30 minutes)
  AGGRESSIVE_CLEANUP_AGE: 30 * 60 * 1000,
} as const;

/**
 * Development/debugging cache configuration
 * Shorter TTLs for development environment
 */
export const DEV_CACHE_TTL = {
  SETS: 2 * 60 * 1000,           // 2 minutes in dev
  CARDS: 1 * 60 * 1000,          // 1 minute in dev
  COLLECTION_ITEMS: 30 * 1000,   // 30 seconds in dev
  SEARCH_SUGGESTIONS: 30 * 1000, // 30 seconds in dev
} as const;

/**
 * Get cache TTL based on environment
 * Uses shorter TTLs in development for better debugging
 */
export const getEnvironmentCacheTTL = (dataType: keyof typeof CACHE_TTL): number => {
  if (process.env.NODE_ENV === 'development' && dataType in DEV_CACHE_TTL) {
    return DEV_CACHE_TTL[dataType as keyof typeof DEV_CACHE_TTL];
  }
  return CACHE_TTL[dataType];
};

export default CACHE_TTL;