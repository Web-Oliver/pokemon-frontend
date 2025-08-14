/**
 * Pure Number/Math Utilities - Layer 1 Core
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Handles only number formatting and calculations
 * DRY: Single source for math utilities
 * No external dependencies - pure functions only
 */

/**
 * Format number in compact notation (1K, 1M, etc.)
 */
export const formatCompact = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K`;
  }
  return num.toString();
};

/**
 * Format bytes in human readable format
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Format percentage with consistent decimal places
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format number with locale separators
 */
export const formatWithSeparators = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Calculate percentage change between two values
 */
export const calculatePercentageChange = (
  oldValue: number,
  newValue: number
): number => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Clamp number between min and max
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

/**
 * Round to specified decimal places
 */
export const roundTo = (num: number, decimals: number): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};