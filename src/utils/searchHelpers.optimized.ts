/**
 * Optimized Search Helper Utilities - Context7 Tree-Shaking
 * Layer 1: Core/Foundation/API Client
 *
 * Tree-shaken utilities following Context7 best practices:
 * - Only exports actually used functions
 * - Lazy-loaded complex highlighting logic
 * - Performance-optimized implementations
 * - Eliminates dead code from bundle
 */

import { UseFormClearErrors, UseFormSetValue } from 'react-hook-form';
import { SearchResult } from '../hooks/useSearch';

// ===== CORE TYPES (Tree-shaken) =====

export interface AutoFillConfig {
  setValue: UseFormSetValue<any>;
  clearErrors: UseFormClearErrors<any>;
  formType: 'product' | 'card';
}

// ===== CRITICAL UTILITIES (Always included) =====

/**
 * Generic field auto-fill utility - CRITICAL for autofill functionality
 * Used by ProductSearchSection - must preserve for CLAUDE.md compliance
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
 * Auto-fill set information from search result - CRITICAL
 * Centralized set auto-fill logic - preserves existing functionality
 */
export const autoFillSetData = (
  config: AutoFillConfig,
  result: SearchResult
) => {
  const setName = result.data.setName || result.data.setInfo?.setName;
  if (setName) {
    autoFillField(config, 'setName', setName);
  }

  if (result.data.year) {
    autoFillField(config, 'year', result.data.year);
  }
};

/**
 * Auto-fill product/card specific data - CRITICAL
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
 * Complete auto-fill workflow for selection - CRITICAL
 * Combines set and item auto-fill logic - preserves CLAUDE.md functionality
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

  // Conditional logging for development
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

/**
 * Get display name from search result - Lightweight version
 * Tree-shaken implementation without complex logic
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

// ===== LAZY-LOADED UTILITIES (Tree-shaken) =====

/**
 * Lazy-loaded complex utilities for better tree-shaking
 * Only imported when actually needed by components
 */

export const lazyLoadSetNameMapping = () =>
  import('./searchHelpers').then(module => ({
    mapSetNameForProducts: module.mapSetNameForProducts,
    mapSetNameForSets: module.mapSetNameForSets,
  }));

export const lazyLoadQueryHelpers = () =>
  import('./searchHelpers').then(module => ({
    buildQueryParams: module.buildQueryParams,
    handleSearchError: module.handleSearchError,
  }));

export const lazyLoadUIHelpers = () =>
  import('./searchHelpers').then(module => ({
    getSearchIconConfig: module.getSearchIconConfig,
    getResultMetadata: module.getResultMetadata,
    createDebouncedSearch: module.createDebouncedSearch,
  }));

// ===== PERFORMANCE CONSTANTS (Inlined for tree-shaking) =====

export const SEARCH_DEBOUNCE_DELAY = 300;
export const MIN_SEARCH_LENGTH = 1; // Already optimized from previous task
export const MAX_SUGGESTIONS = 20;