/**
 * Utils Index - Main Entry Point
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Single export point for all utilities
 * DRY: Prevents import duplication across the application
 * Layered Architecture: Exposes clean API for all utility layers
 */

// Layer 1: Core utilities (no dependencies)
export * from './core';
export * from './math/numbers';
export * from './time/formatting';

// Layer 2: Domain utilities (depends on Layer 1)
export * from './formatting';
export * from './validation';

// Layer 3: UI utilities (may have external dependencies)
export { conditional, multiConditional, responsive, sizeClasses, focusRing, loadingState, disabledState, errorState } from './ui/classNames';
// Export cn function from classNameUtils (primary implementation)
export { cn } from './ui/classNameUtils';
export * from './ui/imageUtils';
// Theme utilities removed - use new theme system at /src/theme/

// Storage utilities
export * from './storage';

// API utilities
export * from './api/ZipImageUtility';

// File utilities
export * from './file/csvExport';
export * from './file/exportFormats';
export * from './file/imageProcessing';