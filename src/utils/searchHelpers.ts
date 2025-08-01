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
import { SearchResult } from '../hooks/useSearch';

// ===== TYPES =====

export interface AutoFillConfig {
  setValue: UseFormSetValue<any>;
  clearErrors: UseFormClearErrors<any>;
  formType: 'product' | 'card';
}

export interface SearchParams {
  query: string;
  limit?: number;
  page?: number;
  [key: string]: any;
}

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
    config.setValue(fieldName, value, { shouldValidate: true });
    config.clearErrors(fieldName);
  }
};

/**
 * Auto-fill set information from search result
 * Centralized set auto-fill logic
 */
export const autoFillSetData = (
  config: AutoFillConfig,
  result: SearchResult
) => {
  let setName: string | undefined;
  
  if (config.formType === 'product') {
    // For sealed products: ONLY use CardMarketReferenceProduct.setName
    setName = result.data.setName;
  } else {
    // For cards: Use Set->Card relationship
    setName = result.data.setName || result.data.setInfo?.setName;
  }
  
  if (setName) {
    autoFillField(config, 'setName', setName);
  }

  if (result.data.year) {
    autoFillField(config, 'year', result.data.year);
  }
};

/**
 * Auto-fill product/card specific data
 * Handles both product and card types with shared logic
 */
export const autoFillItemData = (
  config: AutoFillConfig,
  result: SearchResult
) => {
  const { formType } = config;
  const { data } = result;

  // Auto-fill based on form type
  if (formType === 'product') {
    if (data.name) {
      autoFillField(config, 'productName', data.name);
    }
  } else if (formType === 'card') {
    if (data.cardName) {
      autoFillField(config, 'cardName', data.cardName);
    }
    if (data.baseName) {
      autoFillField(config, 'baseName', data.baseName);
    }
    if (data.variety) {
      autoFillField(config, 'variety', data.variety);
    }
    if (data.pokemonNumber) {
      autoFillField(config, 'pokemonNumber', data.pokemonNumber);
    }
  }

  // Common fields
  if (data.category) {
    autoFillField(config, 'category', data.category);
  }

  if (data.available !== undefined) {
    autoFillField(config, 'availability', Number(data.available));
  }

  // Auto-fill CardMarket price
  if (data.price) {
    const price = parseFloat(data.price);
    if (!isNaN(price)) {
      autoFillField(config, 'cardMarketPrice', Math.round(price).toString());
    }
  }
};

/**
 * Complete auto-fill workflow for selection
 * Combines set and item auto-fill logic
 */
export const autoFillFromSelection = (
  config: AutoFillConfig,
  result: SearchResult,
  onSelectionChange?: (data: Record<string, unknown>) => void
) => {
  // Auto-fill set data
  autoFillSetData(config, result);

  // Auto-fill item data
  autoFillItemData(config, result);

  // Call parent callback if provided (maintains existing behavior)
  if (onSelectionChange) {
    onSelectionChange({
      _id: result._id,
      ...result.data,
    });
  }

  // Conditional logging for development (tree-shaken in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('[SEARCH HELPERS] Auto-filled fields:', {
      setName: result.data.setName || result.data.setInfo?.setName,
      itemName:
        config.formType === 'product' ? result.data.name : result.data.cardName,
      category: result.data.category,
      availability: result.data.available,
      cardMarketPrice: result.data.price
        ? Math.round(parseFloat(result.data.price))
        : null,
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
    result.data.name ||
    result.data.setName ||
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
  minLength: number = 0 // Default to 0 for immediate search
): boolean => {
  // CRITICAL FIX: Always return true for any string (including empty)
  // Let the backend handle empty queries with wildcard "*"
  return typeof query === 'string';
};

/**
 * Debounce utility for search operations
 * Generic debounce implementation
 */
export const createDebouncedSearch = <T extends any[]>(
  fn: (...args: T) => void,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// ===== DISPLAY HELPERS (Consolidated) =====
// getDisplayName function already exists above - removed duplicate

// ===== PERFORMANCE CONSTANTS (Inlined for tree-shaking) =====

export const SEARCH_DEBOUNCE_DELAY = 300;
export const MIN_SEARCH_LENGTH = 1; // Optimized for immediate search
export const MAX_SUGGESTIONS = 20;
