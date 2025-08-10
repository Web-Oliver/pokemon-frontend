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

import { ExportFormat, ExportItemType, OrderedExportRequest } from '../interfaces/api/IExportApiService';
import { CollectionItem, OrderValidationResult } from '../types/ordering';
import { applyItemOrder, sortCategoriesByPrice, sortItemsByPrice, validateItemOrder } from './orderingUtils';

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
export const getExportConfigKey = (
  itemType: ExportItemType,
  format: ExportFormat
): string => {
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
  } catch (_error) {
    throw new Error(
      `Unsupported export combination: ${itemType} with ${format}`
    );
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
    zip: 'image archive',
    'facebook-text': 'Facebook text file',
    dba: 'DBA export file',
    json: 'JSON file',
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
export const shouldChunkExport = (
  itemCount: number,
  format: ExportFormat
): boolean => {
  const batchSize = getRecommendedBatchSize(format);
  return itemCount > batchSize;
};

// ========================================
// ORDERING-RELATED EXPORT UTILITIES
// ========================================

/**
 * Standard export request validation with ordering support
 * Extends existing validation with ordering-specific checks
 */
export const validateOrderedExportRequest = (
  request: OrderedExportRequest,
  items?: CollectionItem[]
): OrderValidationResult & { exportValid: boolean; exportError?: string } => {
  let exportValid = true;
  let exportError: string | undefined;

  // First, validate the base export request
  try {
    validateExportRequest(request.itemType, request.format, request.itemIds);
  } catch (error) {
    exportValid = false;
    exportError =
      error instanceof Error ? error.message : 'Export validation failed';
  }

  // If no items provided or no ordering specified, return basic validation
  if (!items || !request.itemOrder) {
    return {
      isValid: exportValid,
      errors: [],
      exportValid,
      exportError,
    };
  }

  // Validate the ordering
  const orderValidation = validateItemOrder(request.itemOrder, items);

  return {
    ...orderValidation,
    exportValid: exportValid && orderValidation.isValid,
    exportError:
      exportError ||
      (orderValidation.errors.length > 0 ? 'Invalid item ordering' : undefined),
  };
};

/**
 * Apply ordering to items based on export request
 * Handles both manual ordering and automatic sorting
 */
export const applyExportOrdering = (
  items: CollectionItem[],
  request: OrderedExportRequest
): CollectionItem[] => {
  // If no ordering specified, return items as-is
  if (!request.itemOrder && !request.sortByPrice) {
    return items;
  }

  let orderedItems = [...items];

  // Apply automatic price sorting if requested
  if (request.sortByPrice) {
    if (request.maintainCategoryGrouping) {
      orderedItems = sortCategoriesByPrice(orderedItems, request.sortAscending);
    } else {
      orderedItems = sortItemsByPrice(orderedItems, request.sortAscending);
    }
  }

  // Apply manual ordering if specified (takes precedence over sorting)
  if (request.itemOrder && request.itemOrder.length > 0) {
    orderedItems = applyItemOrder(orderedItems, request.itemOrder);
  }

  return orderedItems;
};

/**
 * Generate filename with ordering information
 * Extends existing filename generation to include ordering details
 */
export const generateOrderedExportFilename = (
  config: ExportConfig,
  itemCount?: number,
  customName?: string,
  orderingInfo?: {
    sorted?: boolean;
    sortByPrice?: boolean;
    ascending?: boolean;
  }
): string => {
  let suffix = '';

  if (orderingInfo?.sorted) {
    if (orderingInfo.sortByPrice) {
      suffix = orderingInfo.ascending ? '_price_asc' : '_price_desc';
    } else {
      suffix = '_custom_order';
    }
  }

  const baseName = customName || config.defaultFilename;
  const timestamp = new Date().toISOString().split('T')[0];
  const countSuffix = itemCount !== undefined ? `_${itemCount}` : '';

  return `${baseName}${suffix}${countSuffix}_${timestamp}${config.fileExtension}`;
};

/**
 * Prepare items for ordered export
 * Combines validation, ordering, and preparation steps
 */
export const prepareItemsForOrderedExport = (
  items: CollectionItem[],
  request: OrderedExportRequest
): {
  orderedItems: CollectionItem[];
  validation: OrderValidationResult & {
    exportValid: boolean;
    exportError?: string;
  };
  orderingApplied: boolean;
} => {
  // Validate the request
  const validation = validateOrderedExportRequest(request, items);

  // If validation failed, return original items
  if (!validation.exportValid) {
    return {
      orderedItems: items,
      validation,
      orderingApplied: false,
    };
  }

  // Apply ordering
  const orderedItems = applyExportOrdering(items, request);
  const orderingApplied =
    request.itemOrder !== undefined || request.sortByPrice === true;

  return {
    orderedItems,
    validation,
    orderingApplied,
  };
};

/**
 * Get ordering summary for export success message
 * Provides user-friendly description of applied ordering
 */
export const getOrderingSummary = (request: OrderedExportRequest): string => {
  if (!request.itemOrder && !request.sortByPrice) {
    return 'default order';
  }

  if (request.sortByPrice) {
    const direction = request.sortAscending
      ? 'lowest to highest'
      : 'highest to lowest';
    const grouping = request.maintainCategoryGrouping
      ? ' (grouped by category)'
      : '';
    return `sorted by price ${direction}${grouping}`;
  }

  if (request.itemOrder) {
    return 'custom order';
  }

  return 'default order';
};

/**
 * Standard success message for ordered exports
 * Extends existing success message with ordering information
 */
export const formatOrderedExportSuccessMessage = (
  itemCount: number,
  format: ExportFormat,
  request: OrderedExportRequest,
  itemType?: ExportItemType
): string => {
  const baseMessage = formatExportSuccessMessage(itemCount, format, itemType);
  const orderingSummary = getOrderingSummary(request);

  if (orderingSummary !== 'default order') {
    return `${baseMessage} Items arranged in ${orderingSummary}.`;
  }

  return baseMessage;
};
