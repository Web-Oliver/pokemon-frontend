/**
 * Common Utility Functions
 * Centralized location for shared utility functions to eliminate duplication
 *
 * Following CLAUDE.md DRY principles:
 * - Single source of truth for common operations
 * - Reusable functions across the application
 * - Consistent behavior for common tasks
 */

// Re-export commonly used utilities from other files to provide a single import point
export {
  convertObjectIdToString,
  mapMongoIds,
  isMetadataObject,
  transformApiResponse,
  transformRequestData,
} from '../transformers/responseTransformer';

// Re-export React hooks
export { useDebounce, useDebouncedCallback } from '../../hooks/useDebounce';

// Re-export core utilities from single source of truth
export {
  generateId,
  capitalize,
  toKebabCase,
  toCamelCase,
  safeArrayAccess,
  deepClone,
  isEmpty,
} from '../core';

// Re-export cn from single source of truth
export { cn } from '../ui/classNameUtils';

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
} from './formatting';

export {
  API_BASE_URL,
  PaymentMethod,
  DeliveryMethod,
  Source,
  SEARCH_CONFIG,
} from './constants';

export { getStatusColor, getStatusPriority } from './auctionStatusUtils';

// Core utility functions now imported from ../core/index.ts to prevent circular dependencies

/**
 * Debounce utility function - CONSOLIDATED
 * Re-exported from debounceUtils to eliminate duplication
 */
export { debounce } from './debounceUtils';

/**
 * Throttle utility function
 * Ensures function is called at most once per wait milliseconds
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, wait);
    }
  };
};

// Functions moved to ../core/index.ts to break circular dependencies

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.warn('[COMMON UTILS] Failed to parse JSON:', error);
    return fallback;
  }
};

/**
 * Check if running in development environment
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.MODE === 'development';
};

/**
 * Check if running in production environment
 */
export const isProduction = (): boolean => {
  return import.meta.env.MODE === 'production';
};

/**
 * Retry utility function
 * Retries a function up to maxAttempts times with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry function should not reach this point');
};

/**
 * Create array of specified length with fill value or function
 */
export const createArray = <T>(
  length: number,
  fillValue: T | ((index: number) => T)
): T[] => {
  return Array.from({ length }, (_, index) =>
    typeof fillValue === 'function'
      ? (fillValue as (index: number) => T)(index)
      : fillValue
  );
};

/**
 * Remove duplicates from array based on key function
 */
export const uniqueBy = <T>(array: T[], keyFn: (item: T) => any): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Group array items by key function
 */
export const groupBy = <T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string | number, T[]> => {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    },
    {} as Record<string | number, T[]>
  );
};

/**
 * Sort array by multiple criteria
 */
export const sortBy = <T>(
  array: T[],
  ...sortFns: Array<(item: T) => any>
): T[] => {
  return [...array].sort((a, b) => {
    for (const sortFn of sortFns) {
      const aVal = sortFn(a);
      const bVal = sortFn(b);

      if (aVal < bVal) {
        return -1;
      }
      if (aVal > bVal) {
        return 1;
      }
    }
    return 0;
  });
};

/**
 * Collection Item Helper Functions
 * Following CLAUDE.md Layer 1 (Core/Foundation) principles
 */

export const getItemTitle = (item: any): string => {
  if (!item) {
    return 'Loading...';
  }

  // For PSA and Raw cards, check cardId.cardName first, then cardName
  if ('cardId' in item || 'cardName' in item) {
    return item.cardId?.cardName || item.cardName || 'Unknown Card';
  }

  // For sealed products, check productId object structure
  if ('productId' in item && item.productId) {
    // Get productName from productId object
    if (item.productId?.productName) {
      return item.productId.productName;
    }

    // Fallback to category from productId
    if (item.productId?.category) {
      return item.productId.category.replace(/-/g, ' ');
    }
  }

  return 'Unknown Item';
};

export const getItemSubtitle = (item: any): string => {
  if (!item) {
    return '';
  }

  if ('grade' in item) {
    return `PSA Grade ${item.grade}`;
  }

  if ('condition' in item) {
    return `Condition: ${item.condition}`;
  }

  // For sealed products with productId structure
  if ('productId' in item && item.productId) {
    if (item.productId?.category) {
      return `Category: ${item.productId.category.replace(/-/g, ' ')}`;
    }
  }

  return '';
};

export const getSetName = (item: any): string => {
  if (!item) {
    return '';
  }

  // For cards
  if ('cardId' in item && item.cardId?.setId?.setName) {
    return item.cardId.setId.setName;
  }

  // For sealed products with productId structure
  if ('productId' in item && item.productId) {
    // Try to extract set name from product name
    if (item.productId?.productName) {
      const productName = item.productId.productName;
      const setName = productName
        .replace(/(Booster|Box|Pack|Elite Trainer Box|ETB).*$/i, '')
        .trim();
      return setName || 'Set Name Pending';
    }

    if (item.productId?.setProductId) {
      return 'Set Name Pending'; // Would need API call to resolve setProductId
    }
  }

  return 'Unknown Set';
};

export const getItemType = (
  item: any
): 'psa' | 'raw' | 'sealed' | 'unknown' => {
  if (!item) return 'unknown';

  if ('grade' in item) return 'psa';
  if ('condition' in item) return 'raw';
  if ('category' in item) return 'sealed';

  return 'unknown';
};

export const getItemDisplayData = (item: any) => {
  return {
    title: getItemTitle(item),
    subtitle: getItemSubtitle(item),
    setName: getSetName(item),
    type: getItemType(item),
    price: formatPrice(item?.myPrice),
    sold: item?.sold || false,
    images: item?.images || [],
  };
};
