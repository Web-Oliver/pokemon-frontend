/**
 * Pure Array Utilities - Layer 1 Core
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Handles only array manipulation operations
 * DRY: Single source for array utilities
 * No external dependencies - pure functions only
 */

/**
 * Safe array access with fallback
 */
export const safeGet = <T>(
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
 * Remove duplicates by key function
 */
export const uniqueBy = <T>(array: T[], keyFn: (item: T) => any): T[] => {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
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
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    },
    {} as Record<string | number, T[]>
  );
};

/**
 * Sort by multiple criteria
 */
export const sortBy = <T>(
  array: T[],
  ...sortFns: Array<(item: T) => any>
): T[] => {
  return [...array].sort((a, b) => {
    for (const sortFn of sortFns) {
      const aVal = sortFn(a);
      const bVal = sortFn(b);
      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
};

/**
 * Create array with length and fill value/function
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
 * Check if array is empty or null/undefined
 */
export const isEmpty = (array: any[] | null | undefined): boolean => {
  return !Array.isArray(array) || array.length === 0;
};