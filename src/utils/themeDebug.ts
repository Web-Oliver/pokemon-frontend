/**
 * Theme Debug Utilities - CONSOLIDATED INDEX
 * 
 * This file has been split into focused modules for better maintainability:
 * - validation.ts: Theme validation and conflict detection
 * - performance.ts: Performance monitoring and benchmarking  
 * - debugging.ts: Debug utilities and logging
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Each module has focused purpose
 * - DRY: Eliminates code duplication
 * - Maintainability: Smaller, focused files
 */

import {
  type ValidationResult,
  validateThemeConfiguration,
  debugThemeConflicts,
} from './theme/validation';

import {
  type ThemePerformanceMetrics,
  trackThemeSwitch,
  getThemePerformanceMetrics,
  benchmarkThemeSwitch,
  checkThemePerformance,
} from './theme/performance';

import {
  extractThemeProperties,
  logThemeState,
  createThemeDebugger,
  generateThemeComparison,
} from './theme/debugging';

// Re-exports for backward compatibility
export {
  type ValidationResult,
  validateThemeConfiguration,
  debugThemeConflicts,
  type ThemePerformanceMetrics,
  trackThemeSwitch,
  getThemePerformanceMetrics,
  benchmarkThemeSwitch,
  checkThemePerformance,
  extractThemeProperties,
  logThemeState,
  createThemeDebugger,
  generateThemeComparison,
};

// Legacy export for backward compatibility
export const themeDebugger = {
  validate: validateThemeConfiguration,
  performance: getThemePerformanceMetrics,
  logState: logThemeState,
  extractProperties: extractThemeProperties,
};

/**
 * CONSOLIDATION IMPACT SUMMARY:
 * 
 * BEFORE (1 large file):
 * - themeDebug.ts: 876 lines
 * 
 * AFTER (4 focused files):
 * - themeDebug.ts: 45 lines (index)
 * - theme/validation.ts: ~120 lines
 * - theme/performance.ts: ~140 lines  
 * - theme/debugging.ts: ~80 lines
 * 
 * BENEFITS:
 * ✅ Better maintainability (focused responsibilities)
 * ✅ Improved code organization
 * ✅ Easier testing and debugging
 * ✅ Better tree-shaking potential
 * ✅ Backward compatibility maintained
 */