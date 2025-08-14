/**
 * Core Utilities - Layer 1 Foundation
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Single export point for all core utilities
 * DRY: Prevents duplication across the application
 * No external dependencies - pure functions only
 */

// Re-export all core utilities
export * from './array';
export * from './string';
export * from './object';
export * from './async';

// Environment utilities
export const isDevelopment = (): boolean => {
  return import.meta.env.MODE === 'development';
};

export const isProduction = (): boolean => {
  return import.meta.env.MODE === 'production';
};