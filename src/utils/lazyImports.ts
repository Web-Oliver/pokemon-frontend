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
  if (process.env.NODE_ENV === 'production') {
    // Return empty component for production
    return (() => null) as T;
  }
  
  return lazy(importFn) as T;
};

/**
 * Lazy load theme debugging utilities
 * Massive bundle size reduction for production
 */
export const ThemeDebuggerLazy = lazyLoadDevComponent(
  () => import('../components/theme/ThemeDebugger')
);

/**
 * Lazy load heavy theme utilities
 * Code splitting for better performance
 */
export const themeUtilsLazy = {
  async loadThemeDebug() {
    if (process.env.NODE_ENV === 'development') {
      return import('../utils/themeDebug');
    }
    return {
      // Return minimal stub for production
      validateTheme: () => true,
      debugTheme: () => {},
      exportThemeDebug: () => ({}),
    };
  },

  async loadThemeExport() {
    return import('../utils/themeExport');
  },

  async loadFileOperations() {
    return import('../utils/fileOperations');
  },
};

/**
 * Bundle splitting configuration
 * Separates heavy utilities into their own chunks
 */
export const bundleConfig = {
  // Development-only chunks
  devOnly: ['themeDebug'],
  
  // Heavy utility chunks
  utilityChunks: ['themeExport', 'fileOperations', 'responseTransformer'],
  
  // Core utilities (keep in main bundle)
  core: ['common', 'formatting', 'constants'],
};