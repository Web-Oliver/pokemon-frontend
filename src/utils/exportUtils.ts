/**
 * Unified Export Utilities
 * Layer 1: Core/Foundation/API Client
 * 
 * Consolidated utility functions for all export operations
 * Following CLAUDE.md principles:
 * - DRY: Eliminates duplication across export functions
 * - Single Responsibility: Each function has one clear purpose
 * - Reusability: Functions can be used across different export contexts
 */

import { ExportItemType, ExportFormat } from '../interfaces/api/IExportApiService';

/**
 * Export configuration interface
 */
export interface ExportConfig {
  itemType: ExportItemType;
  format: ExportFormat;
  fileExtension: string;
  mimeType: string;
  defaultFilename: string;
}

/**
 * Export format configurations
 * Centralized configuration following DRY principles
 */
export const EXPORT_CONFIGS: Record<string, ExportConfig> = {
  'psa-card-zip': {
    itemType: 'psa-card',
    format: 'zip',
    fileExtension: '.zip',
    mimeType: 'application/zip',
    defaultFilename: 'psa_cards_images',
  },
  'raw-card-zip': {
    itemType: 'raw-card',
    format: 'zip',
    fileExtension: '.zip',
    mimeType: 'application/zip',
    defaultFilename: 'raw_cards_images',
  },
  'sealed-product-zip': {
    itemType: 'sealed-product',
    format: 'zip',
    fileExtension: '.zip',
    mimeType: 'application/zip',
    defaultFilename: 'sealed_products_images',
  },
  'auction-zip': {
    itemType: 'auction',
    format: 'zip',
    fileExtension: '.zip',
    mimeType: 'application/zip',
    defaultFilename: 'auction_images',
  },
  'collection-facebook': {
    itemType: 'psa-card', // Generic, since format determines behavior
    format: 'facebook-text',
    fileExtension: '.txt',
    mimeType: 'text/plain',
    defaultFilename: 'collection_facebook_export',
  },
  'collection-dba': {
    itemType: 'psa-card', // Generic, since format determines behavior
    format: 'dba',
    fileExtension: '.json',
    mimeType: 'application/json',
    defaultFilename: 'collection_dba_export',
  },
};

/**
 * Generate standardized filename for exports
 * Eliminates filename generation duplication
 */
export const generateExportFilename = (
  config: ExportConfig,
  itemCount?: number,
  customName?: string
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const countSuffix = itemCount !== undefined ? `_${itemCount}` : '';
  const baseName = customName || config.defaultFilename;
  
  return `${baseName}${countSuffix}_${timestamp}${config.fileExtension}`;
};

/**
 * Get export configuration by key
 * Provides type-safe access to export configurations
 */
export const getExportConfig = (configKey: string): ExportConfig => {
  const config = EXPORT_CONFIGS[configKey];
  if (!config) {
    throw new Error(`Unknown export configuration: ${configKey}`);
  }
  return config;
};

/**
 * Generate export configuration key from item type and format
 * Consolidates key generation logic
 */
export const getExportConfigKey = (itemType: ExportItemType, format: ExportFormat): string => {
  if (format === 'zip') {
    return `${itemType}-zip`;
  } else if (format === 'facebook-text') {
    return 'collection-facebook';
  } else if (format === 'dba') {
    return 'collection-dba';
  }
  
  throw new Error(`Unsupported export combination: ${itemType} + ${format}`);
};

/**
 * Validate export request parameters
 * Centralized validation logic
 */
export const validateExportRequest = (
  itemType: ExportItemType,
  format: ExportFormat,
  itemIds?: string[]
): void => {
  if (!itemType) {
    throw new Error('Item type is required for export');
  }
  
  if (!format) {
    throw new Error('Export format is required');
  }
  
  // Auction exports require specific item ID
  if (itemType === 'auction' && (!itemIds || itemIds.length !== 1)) {
    throw new Error('Auction export requires exactly one auction ID');
  }
  
  // Check if combination is supported
  try {
    getExportConfigKey(itemType, format);
  } catch (error) {
    throw new Error(`Unsupported export combination: ${itemType} with ${format}`);
  }
};

/**
 * Format success message for export operations
 * Standardizes success messaging across export types
 */
export const formatExportSuccessMessage = (
  itemCount: number,
  format: ExportFormat,
  itemType?: ExportItemType
): string => {
  const formatLabels: Record<ExportFormat, string> = {
    'zip': 'image archive',
    'facebook-text': 'Facebook text file',
    'dba': 'DBA export file',
    'json': 'JSON file',
  };
  
  const formatLabel = formatLabels[format] || format;
  const typeLabel = itemType ? ` ${itemType.replace('-', ' ')}` : '';
  
  return `Successfully exported ${itemCount}${typeLabel} items as ${formatLabel}!`;
};

/**
 * Format error message for export operations
 * Standardizes error messaging across export types
 */
export const formatExportErrorMessage = (
  format: ExportFormat,
  itemType?: ExportItemType,
  originalError?: string
): string => {
  const formatLabel = format.replace('-', ' ');
  const typeLabel = itemType ? ` ${itemType.replace('-', ' ')}` : '';
  
  let message = `Failed to export${typeLabel} items as ${formatLabel}`;
  
  if (originalError) {
    message += `: ${originalError}`;
  }
  
  return message;
};

/**
 * Check if export format supports batch operations
 * Determines whether multiple items can be exported together
 */
export const supportsBatchExport = (format: ExportFormat): boolean => {
  return ['zip', 'facebook-text', 'dba'].includes(format);
};

/**
 * Get recommended batch size for export format
 * Helps prevent memory issues with large exports
 */
export const getRecommendedBatchSize = (format: ExportFormat): number => {
  switch (format) {
    case 'zip':
      return 50; // Limit to prevent memory issues with image processing
    case 'facebook-text':
    case 'dba':
    case 'json':
      return 100; // Text-based exports can handle more items
    default:
      return 25; // Conservative default
  }
};

/**
 * Determine if export should be processed in chunks
 * Helps manage large export operations
 */
export const shouldChunkExport = (itemCount: number, format: ExportFormat): boolean => {
  const batchSize = getRecommendedBatchSize(format);
  return itemCount > batchSize;
};