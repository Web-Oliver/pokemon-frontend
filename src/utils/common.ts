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
} from './responseTransformer';

// Re-export React hooks
export { useDebounce, useDebouncedCallback } from '../hooks/useDebounce';

// Re-export theme utilities
export { cn } from './themeUtils';

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
} from './formatting';

export {
  API_BASE_URL,
  PaymentMethod,
  DeliveryMethod,
  Source,
  SEARCH_CONFIG,
  getStatusColor,
  getStatusPriority,
} from './constants';

/**
 * Safe array access utility
 * Provides safe access to array elements with fallback
 */
export const safeArrayAccess = <T>(
  array: T[] | undefined | null,
  index: number,
  fallback?: T
): T | undefined => {
  if (!Array.isArray(array) || index < 0 || index >= array.length) {
    return fallback;
  }
  return array[index];
};

/**
 * Deep clone utility using JSON methods
 * Safe for objects without functions, symbols, or circular references
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('[COMMON UTILS] Failed to deep clone object:', error);
    return obj;
  }
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
};

/**
 * Debounce utility function
 * Delays function execution until after wait milliseconds have elapsed since the last invocation
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

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

/**
 * Generate unique ID utility
 * Creates a simple unique identifier for temporary use
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to kebab-case
 */
export const toKebabCase = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return str;
  }
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
};

/**
 * Convert string to camelCase
 */
export const toCamelCase = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return str;
  }
  return str
    .toLowerCase()
    .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
    .replace(/\s+([a-z])/g, (match, letter) => letter.toUpperCase());
};

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
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if running in production environment
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
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
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Create array of specified length with fill value or function
 */
export const createArray = <T>(
  length: number,
  fillValue: T | ((index: number) => T)
): T[] => {
  return Array.from({ length }, (_, index) =>
    typeof fillValue === 'function' ? (fillValue as (index: number) => T)(index) : fillValue
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
