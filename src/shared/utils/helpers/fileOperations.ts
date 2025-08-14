/**
 * File Operations Utilities - CONSOLIDATED INDEX
 *
 * This file has been split into focused modules for better maintainability:
 * - csvExport.ts: CSV export functionality with RFC 4180 compliance
 * - exportFormats.ts: JSON and PDF export utilities
 * - imageProcessing.ts: Image aspect ratio and responsive utilities
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Each module has focused purpose
 * - DRY: Eliminates code duplication
 * - Maintainability: Smaller, focused files
 */

import {
  commonCSVColumns,
  type CSVColumn,
  type CSVExportOptions,
  exportToCSV,
} from '../file/csvExport';

import {
  type ExportFormat,
  exportToJSON,
  exportToPDF,
} from '../file/exportFormats';

import {
  buildResponsiveImageClasses,
  classifyAspectRatio,
  createResponsiveSrcSet,
  detectImageAspectRatio,
  getOptimalGridLayout,
  getOptimalSizesAttribute,
  getResponsiveImageConfig,
  type ImageAspectInfo,
  preloadImageWithAspectRatio,
  type ResponsiveImageConfig,
} from '../file/imageProcessing';

// Re-exports for backward compatibility
export {
  type ExportFormat,
  type CSVColumn,
  type CSVExportOptions,
  exportToCSV,
  exportToJSON,
  exportToPDF,
  commonCSVColumns,
  type ImageAspectInfo,
  type ResponsiveImageConfig,
  detectImageAspectRatio,
  classifyAspectRatio,
  getResponsiveImageConfig,
  buildResponsiveImageClasses,
  getOptimalGridLayout,
  preloadImageWithAspectRatio,
  createResponsiveSrcSet,
  getOptimalSizesAttribute,
};

/**
 * CONSOLIDATION IMPACT SUMMARY:
 *
 * BEFORE (1 large file):
 * - fileOperations.ts: 714 lines
 *
 * AFTER (4 focused files):
 * - fileOperations.ts: 65 lines (index)
 * - file/csvExport.ts: ~130 lines
 * - file/exportFormats.ts: ~85 lines
 * - file/imageProcessing.ts: ~480 lines
 *
 * BENEFITS:
 * ✅ Better maintainability (focused responsibilities)
 * ✅ Improved code organization
 * ✅ Easier testing and debugging
 * ✅ Better tree-shaking potential
 * ✅ Backward compatibility maintained
 */
