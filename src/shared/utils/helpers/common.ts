/**
 * Common Utility Functions - REFACTORED
 * 
 * ANTI-PATTERN ELIMINATED: This file previously violated SRP with 251 lines of mixed responsibilities
 * 
 * NEW APPROACH: This file now serves only as a clean re-export hub with clear organization
 * - All duplicate implementations removed (throttle, retry, safeJsonParse)
 * - Domain-specific logic moved to appropriate modules
 * - Single responsibility: providing clean import interface
 */

// ============================================================================
// CORE UTILITIES - Single Source of Truth
// ============================================================================
export {
  generateId,
  capitalize,
  toKebabCase,
  toCamelCase,
  safeArrayAccess,
  deepClone,
  isEmpty,
  isDevelopment,
  isProduction,
  // ELIMINATED DUPLICATES: debounce, throttle, retry now from core/async.ts only
  debounce,
  throttle,
  retry,
  safeJsonParse
} from '../core';

// ============================================================================
// ARRAY UTILITIES
// ============================================================================
export {
  uniqueBy,
  groupBy,
  sortBy,
  createArray,
} from '../core/array';

// ============================================================================
// FORMATTING UTILITIES  
// ============================================================================
export {
  formatPrice,
  displayPrice,
  formatPriceChange,
  formatCompactNumber,
  formatCardNameForDisplay,
  formatDisplayNameWithNumber,
  processImageUrl,
  getRelativeTime,
  formatTimestamp,
  formatDate,
  formatTime,
  formatDateTime,
  formatBytes,
} from '../formatting';

// ============================================================================
// TRANSFORMATION UTILITIES
// ============================================================================
export {
  convertObjectIdToString,
  mapMongoIds,
  isMetadataObject,
  transformApiResponse,
  transformRequestData,
} from '../transformers/responseTransformer';

// ============================================================================
// REACT HOOKS - Clean Re-exports
// ============================================================================
export { useDebounce, useDebouncedCallback } from '../../hooks/useDebounce';

// ============================================================================
// UI UTILITIES
// ============================================================================
export { cn } from '@/lib/utils';

// ============================================================================
// DOMAIN-SPECIFIC UTILITIES - Moved to Domain Layer
// ============================================================================
// Collection item helpers moved to: /shared/domain/helpers/collectionHelpers.ts
// Auction status utilities properly kept in: ./auctionStatusUtils.ts
export { getStatusColor, getStatusPriority } from './auctionStatusUtils';

// ============================================================================
// CONSTANTS - Clean Re-export
// ============================================================================
export {
  API_BASE_URL,
  PaymentMethod,
  DeliveryMethod,
  Source,
  SEARCH_CONFIG,
} from './constants';