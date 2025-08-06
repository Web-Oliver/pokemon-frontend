/**
 * Optimized Search Helper Utilities - Context7 Tree-Shaking
 * Layer 1: Core/Foundation/API Client
 *
 * Consolidated and optimized search utilities following Context7 best practices:
 * - Tree-shaken utilities with lazy-loaded complex logic
 * - Performance-optimized implementations
 * - DRY-compliant utilities eliminating code duplication
 * - Eliminates dead code from bundle
 */

import { UseFormClearErrors, UseFormSetValue } from 'react-hook-form';
import { SearchResult, SearchParams } from '../types/searchTypes';

// ===== TYPES =====

export interface AutoFillConfig {
  setValue: UseFormSetValue<any>;
  clearErrors: UseFormClearErrors<any>;
}

// SearchParams type moved to ../types/searchTypes.ts

// ===== SET NAME MAPPING =====

/**
 * Maps set names between Sets database and Products database
 * Fixes inconsistent naming conventions between collections
 */
const SET_NAME_MAPPING: Record<string, string> = {
  // Sets DB name -> Products DB name
  'Pokemon XY Evolutions': 'Evolutions',
  'Pokemon Base Set': 'Base Set',
  'Pokemon Jungle': 'Jungle',
  'Pokemon Fossil': 'Fossil',
  // Add more mappings as needed
};

/**
 * Maps a set name from Sets database format to Products database format
 * @param setName - Set name from Sets database
 * @returns Mapped set name for Products database
 */
export const mapSetNameForProducts = (setName: string): string => {
  return SET_NAME_MAPPING[setName] || setName;
};

/**
 * Maps a set name from Products database format to Sets database format
 * @param setName - Set name from Products database
 * @returns Mapped set name for Sets database
 */
export const mapSetNameForSets = (setName: string): string => {
  // Reverse lookup
  const reverseMapping = Object.entries(SET_NAME_MAPPING).find(
    ([_, productName]) => productName === setName
  );
  return reverseMapping ? reverseMapping[0] : setName;
};

// ===== QUERY BUILDING HELPERS =====

/**
 * Generic query parameter builder
 * Eliminates duplication in searchApi.ts
 */
export const buildQueryParams = (params: SearchParams): URLSearchParams => {
  const { query, limit = 20, page = 1, ...filters } = params;

  const queryParams = new URLSearchParams({
    query: query.trim(),
    limit: limit.toString(),
    page: page.toString(),
  });

  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  return queryParams;
};

// ===== AUTO-FILL HELPERS =====

/**
 * Generic field auto-fill utility
 * Eliminates duplication in ProductSearchSection
 */
export const autoFillField = (
  config: AutoFillConfig,
  fieldName: string,
  value: any
) => {
  if (value !== undefined && value !== null) {
    // Set field value
    config.setValue(fieldName, value, { shouldValidate: true });
    config.clearErrors(fieldName);
  }
  // Field validation handled by setValue
};

/**
 * Auto-fill set information from search result for products
 * Used by ProductSearchSection
 */
export const autoFillProductSetData = (
  config: AutoFillConfig,
  result: SearchResult
) => {
  // Process product set data

  // For sealed products: Use setProductId.setProductName or setName or setProductName
  const setName =
    result.data.setProductId?.setProductName ||
    result.data.setName ||
    result.data.setProductName;

  if (setName) {
    // Auto-fill set name from product
    autoFillField(config, 'setName', setName);
  } else {
    // No set name available in product data
  }

  const year = result.data.year;
  if (year) {
    // Auto-fill year from product
    autoFillField(config, 'year', year);
  }
};

/**
 * Auto-fill set information from search result for cards
 * Used by CardSearchSection
 */
export const autoFillCardSetData = (
  config: AutoFillConfig,
  result: SearchResult
) => {
  // For cards: Use setId.setName (card references set)
  const setName =
    result.data.setId?.setName ||
    result.data.setName ||
    result.data.setInfo?.setName;

  if (setName) {
    autoFillField(config, 'setName', setName);
  }

  // For cards, year comes from setId.year
  const year = result.data.setId?.year || result.data.year;
  if (year) {
    autoFillField(config, 'year', year);
  }
};

/**
 * Auto-fill product specific data
 * Used by ProductSearchSection
 */
export const autoFillProductData = (
  config: AutoFillConfig,
  result: SearchResult
) => {
  const { data } = result;

  // Process product data for auto-fill

  if (data.productName || data.name) {
    const productName = data.productName || data.name;
    // Auto-fill product name
    autoFillField(config, 'productName', productName);
  }

  if (data.category) {
    // Auto-fill product category
    autoFillField(config, 'category', data.category);
  }

  if (data.available !== undefined) {
    const availability = Number(data.available);
    // Auto-fill product availability
    autoFillField(config, 'availability', availability);
  }

  // Auto-fill CardMarket price - handle price string format
  if (
    data.price &&
    data.price !== 'N/A' &&
    data.price !== null &&
    data.price !== undefined
  ) {
    // Handle price format like "3,97 €"
    const priceString = data.price.toString();
    const numericPrice = parseFloat(
      priceString.replace(/[^\d,.-]/g, '').replace(',', '.')
    );
    if (!isNaN(numericPrice) && numericPrice > 0) {
      const roundedPrice = Math.round(numericPrice).toString();
      // Auto-fill parsed price
      autoFillField(config, 'cardMarketPrice', roundedPrice);
    } else {
      // Price parsing failed - using fallback
      // Don't set cardMarketPrice for invalid prices - leave it empty/0
      autoFillField(config, 'cardMarketPrice', '0');
    }
  } else {
    // No valid price data available
    // Set cardMarketPrice to 0 for N/A prices
    autoFillField(config, 'cardMarketPrice', '0');
  }
};

/**
 * Auto-fill card specific data
 * Used by CardSearchSection
 */
export const autoFillCardData = (
  config: AutoFillConfig,
  result: SearchResult
) => {
  const { data } = result;

  if (data.cardName) {
    autoFillField(config, 'cardName', data.cardName);
  }
  if (data.baseName) {
    autoFillField(config, 'baseName', data.baseName);
  }
  if (data.variety) {
    autoFillField(config, 'variety', data.variety);
  }
  // UPDATED: Use cardNumber instead of pokemonNumber
  if (data.cardNumber) {
    autoFillField(config, 'cardNumber', data.cardNumber);
  }
};

/**
 * Complete auto-fill workflow for product selection
 * Used by ProductSearchSection
 */
export const autoFillFromProductSelection = (
  config: AutoFillConfig,
  result: SearchResult,
  onSelectionChange?: (data: Record<string, unknown>) => void
) => {
  // Process product selection for auto-fill

  // Auto-fill set data for products
  // Step 1: Auto-fill set data
  autoFillProductSetData(config, result);

  // Auto-fill product data
  // Step 2: Auto-fill product data
  autoFillProductData(config, result);

  // Call parent callback if provided (maintains existing behavior)
  if (onSelectionChange) {
    // Step 3: Execute parent callback
    onSelectionChange({
      _id: result.id || result.data._id,
      ...result.data,
    });
  }

  // Auto-fill workflow complete
};

/**
 * Complete auto-fill workflow for card selection
 * Used by CardSearchSection
 */
export const autoFillFromCardSelection = (
  config: AutoFillConfig,
  result: SearchResult,
  onSelectionChange?: (data: Record<string, unknown>) => void
) => {
  // Auto-fill set data for cards
  autoFillCardSetData(config, result);

  // Auto-fill card data
  autoFillCardData(config, result);

  // Call parent callback if provided (maintains existing behavior)
  if (onSelectionChange) {
    onSelectionChange({
      _id: result.id || result.data._id,
      ...result.data,
    });
  }

  // Conditional logging for development (tree-shaken in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[SEARCH HELPERS] Auto-filled card fields:', {
      setName: result.data.setId?.setName || result.data.setName,
      cardName: result.data.cardName,
      cardNumber: result.data.cardNumber,
      variety: result.data.variety,
    });
  }
};

// ===== ERROR HANDLING HELPERS =====

/**
 * Generic search error handler
 * Eliminates duplication in useSearch.ts
 */
export const handleSearchError = (
  error: any,
  context: string,
  setError: (error: string | null) => void,
  setLoading: (loading: boolean) => void
) => {
  if (error.name === 'AbortError') {
    return;
  }

  console.error(`[SEARCH ERROR] ${context}:`, error);
  setError(`${context} failed. Please try again.`);
  setLoading(false);
};

// ===== UI HELPERS =====

export interface IconConfig {
  type: 'set' | 'category' | 'cardProduct';
  className?: string;
}

/**
 * Get icon configuration for search types
 * Eliminates duplication in SearchDropdown
 */
export const getSearchIconConfig = (type: IconConfig['type']) => {
  const configs = {
    set: {
      gradient: 'from-emerald-400 to-teal-500',
      title: 'Pokémon Sets',
      description: 'Search for card sets',
    },
    category: {
      gradient: 'from-purple-400 to-indigo-500',
      title: 'Product Categories',
      description: 'Search for product types',
    },
    cardProduct: {
      gradient: 'from-blue-400 to-cyan-500',
      title: 'Cards & Products',
      description: 'Search for cards or products',
    },
  };

  return configs[type] || configs.cardProduct;
};

/**
 * Get display name from search result
 * Centralized display name logic
 */
export const getDisplayName = (result: SearchResult): string => {
  return (
    result.data.cardName ||
    result.data.productName ||
    result.data.name ||
    result.data.setName ||
    result.data.setProductName ||
    result.data.category ||
    'Unknown'
  );
};

/**
 * Generate search result metadata
 * Reusable metadata extraction
 */
export const getResultMetadata = (result: SearchResult) => {
  const metadata: Record<string, any> = {};

  if (result.data.setInfo?.setName) {
    metadata.setName = result.data.setInfo.setName;
  }

  if (result.data.categoryInfo?.category) {
    metadata.category = result.data.categoryInfo.category;
  }

  if (result.data.variety) {
    metadata.variety = result.data.variety;
  }

  if (result.data.year) {
    metadata.year = result.data.year;
  }

  if (result.data.counts) {
    metadata.totalItems =
      result.data.counts.cards + result.data.counts.products;
  }

  if (
    result.data.psaTotalGradedForCard &&
    result.data.psaTotalGradedForCard > 0
  ) {
    metadata.psaTotal = result.data.psaTotalGradedForCard;
  }

  return metadata;
};

// ===== VALIDATION HELPERS =====

/**
 * Validate search query - CRITICAL FIX: Lower tolerance for immediate search
 * Removed restrictive minLength requirement for real-time search experience
 */
export const isValidSearchQuery = (
  query: string,
  _minLength: number = 0 // Default to 0 for immediate search
): boolean => {
  // CRITICAL FIX: Always return true for any string (including empty)
  // Let the backend handle empty queries with wildcard "*"
  return typeof query === 'string';
};

// createDebouncedSearch removed - use debounce from common.ts instead
// import { debounce } from './common';

// ===== DISPLAY HELPERS (Consolidated) =====
// getDisplayName function already exists above - removed duplicate

// ===== PERFORMANCE CONSTANTS (Inlined for tree-shaking) =====

export const SEARCH_DEBOUNCE_DELAY = 300;
export const MIN_SEARCH_LENGTH = 1; // Optimized for immediate search
export const MAX_SUGGESTIONS = 20;
