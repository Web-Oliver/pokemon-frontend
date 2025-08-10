/**
 * Core Utilities - Layer 1 Foundation
 *
 * ZERO DEPENDENCIES - This file cannot import from any other utility files
 * Following CLAUDE.md Layered Architecture - This is the foundational layer
 *
 * Contains only pure utility functions with no external dependencies
 * to prevent circular dependency issues.
 */

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
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''));
};

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
    console.warn('[CORE UTILS] Failed to deep clone object:', error);
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
 * Simple debounce function - no external dependencies
 */
export const simpleDebounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * Simple throttle function - no external dependencies
 */
export const simpleThrottle = <T extends (...args: any[]) => any>(
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
