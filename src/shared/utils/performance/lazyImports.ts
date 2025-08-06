/**
 * LAZY IMPORTS UTILITY
 * Phase 2 Bundle Optimization - Development/Production Splitting
 *
 * Following CLAUDE.md principles for performance optimization
 * ARCHITECTURE LAYER: Layer 1 (Foundation/API Client)
 */

import { lazy, ComponentType } from 'react';

/**
 * Lazy load development-only components
 * These are excluded from production builds automatically
 */
export const lazyLoadDevComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): T => {
  if (import.meta.env.MODE === 'production') {
    // Return empty component for production
    return (() => null) as T;
  }

  return lazy(importFn) as T;
};

/**
 * Lazy load heavy theme utilities
 * Code splitting for better performance
 */
export const themeUtilsLazy = {
  async loadFileOperations() {
    return import('../utils/fileOperations');
  },
};

/**
 * Bundle splitting configuration
 * Separates heavy utilities into their own chunks
 */
export const bundleConfig = {
  // Heavy utility chunks
  utilityChunks: ['fileOperations', 'responseTransformer'],

  // Core utilities (keep in main bundle)
  core: ['common', 'formatting', 'constants'],
};
