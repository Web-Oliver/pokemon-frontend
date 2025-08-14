/**
 * Pure String Utilities - Layer 1 Core
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Handles only string manipulation operations
 * DRY: Single source for string utilities
 * No external dependencies - pure functions only
 */

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  if (!str || typeof str !== 'string') return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert to kebab-case
 */
export const toKebabCase = (str: string): string => {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase();
};

/**
 * Convert to camelCase
 */
export const toCamelCase = (str: string): string => {
  if (!str || typeof str !== 'string') return str;
  return str
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''));
};

/**
 * Check if string is empty (null, undefined, or whitespace)
 */
export const isEmpty = (str: string | null | undefined): boolean => {
  return !str || str.trim() === '';
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str: string, length: number): string => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length).trim() + '...';
};

/**
 * Remove extra whitespace and normalize
 */
export const normalize = (str: string): string => {
  if (!str) return str;
  return str.replace(/\s+/g, ' ').trim();
};