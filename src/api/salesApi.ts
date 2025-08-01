/**
 * Sales Analytics API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for sales-related API operations
 * - OCP: Open for extension via createResourceOperations configuration
 * - LSP: Maintains ISale interface compatibility
 * - ISP: Provides specific sales operations interface
 * - DIP: Depends on genericApiOperations abstraction
 *
 * DRY: Uses createResourceOperations to eliminate boilerplate CRUD patterns
 */

import { createResourceOperations, SALES_CONFIG } from './genericApiOperations';
import { unifiedApiClient } from './unifiedApiClient';
import { ISale, ISalesGraphData, ISalesSummary } from '../domain/models/sale';

// ========== INTERFACES (ISP Compliance) ==========

export interface SalesDataParams {
  startDate?: string;
  endDate?: string;
  category?: string;
}

export interface SalesSummaryParams {
  startDate?: string;
  endDate?: string;
}

export interface SalesGraphDataParams {
  startDate?: string;
  endDate?: string;
}

/**
 * Sale creation payload interface
 */
type ISaleCreatePayload = Omit<ISale, 'id'>;

/**
 * Sale update payload interface
 */
type ISaleUpdatePayload = Partial<ISaleCreatePayload>;

// ========== DATA TRANSFORMATION UTILITIES ==========

/**
 * Transform backend sales data to match ISale interface
 * Eliminates data transformation duplication across components
 */
const transformSalesData = (rawData: any[]): ISale[] => {
  if (!rawData || !Array.isArray(rawData)) {
    return [];
  }

  return rawData.map((item: any) => {
    let itemName = 'Unknown Item';

    // Extract item name based on item type
    if (item.itemType === 'sealedProduct') {
      itemName = item.name || 'Unknown Sealed Product';
    } else if (
      item.itemType === 'psaGradedCard' ||
      item.itemType === 'rawCard'
    ) {
      if (item.cardId?.cardName) {
        itemName = item.cardId.cardName;
        // Add set name if available
        if (item.cardId.setId?.setName) {
          itemName += ` (${item.cardId.setId.setName})`;
        }
        // Add grade for PSA cards
        if (item.itemType === 'psaGradedCard' && item.grade) {
          itemName += ` - PSA ${item.grade}`;
        }
      }
    }

    // Handle Decimal128 conversion for myPrice
    let myPrice = 0;
    if (item.myPrice) {
      if (typeof item.myPrice === 'object' && item.myPrice.$numberDecimal) {
        myPrice = parseFloat(item.myPrice.$numberDecimal);
      } else {
        myPrice = Number(item.myPrice);
      }
    }

    // Handle Decimal128 conversion for actualSoldPrice
    let actualSoldPrice = 0;
    if (item.saleDetails?.actualSoldPrice) {
      if (
        typeof item.saleDetails.actualSoldPrice === 'object' &&
        item.saleDetails.actualSoldPrice.$numberDecimal
      ) {
        actualSoldPrice = parseFloat(
          item.saleDetails.actualSoldPrice.$numberDecimal
        );
      } else {
        actualSoldPrice = Number(item.saleDetails.actualSoldPrice);
      }
    }

    // Generate thumbnail URL from first image with -thumb suffix
    let thumbnailUrl: string | undefined;
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const firstImage = item.images[0];
      if (firstImage && typeof firstImage === 'string') {
        // Extract filename and add -thumb suffix
        const lastDotIndex = firstImage.lastIndexOf('.');
        if (lastDotIndex > 0) {
          const nameWithoutExt = firstImage.substring(0, lastDotIndex);
          const ext = firstImage.substring(lastDotIndex);
          thumbnailUrl = `${nameWithoutExt}-thumb${ext}`;
        }
      }
    }

    return {
      id: item._id || item.id,
      itemCategory: item.category || 'Unknown',
      itemName,
      myPrice,
      actualSoldPrice,
      dateSold: item.saleDetails?.dateSold || '',
      source: item.saleDetails?.source || 'Unknown',
      thumbnailUrl,
    };
  });
};

// ========== GENERIC RESOURCE OPERATIONS ==========

/**
 * Core CRUD operations for sales using createResourceOperations
 * Eliminates boilerplate patterns and ensures consistency with other API files
 */
const salesOperations = createResourceOperations<
  ISale,
  ISaleCreatePayload,
  ISaleUpdatePayload
>(SALES_CONFIG, {
  includeExportOperations: true,
  // includeBatchOperations removed - not used by any frontend components
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get sales data with optional filters and transformation
 * @param params - Optional filter parameters
 * @returns Promise<ISale[]> - Array of sales transactions
 */
export const getSalesData = async (
  params?: SalesDataParams
): Promise<ISale[]> => {
  const rawData = await salesOperations.getAll(params);
  return transformSalesData(rawData as any[]);
};

// ALL BASIC SALES CRUD OPERATIONS REMOVED - Not used by any frontend components

// BULK/BATCH CREATE OPERATIONS REMOVED - Not used by any frontend components

/**
 * Export sales data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportSales = salesOperations.export;

// ========== SALES-SPECIFIC ANALYTICS OPERATIONS ==========

/**
 * Get sales summary analytics
 * @param params - Optional filter parameters
 * @returns Promise<ISalesSummary> - Sales summary data
 */
export const getSalesSummary = async (
  params?: SalesSummaryParams
): Promise<ISalesSummary> => {
  const response = await unifiedApiClient.apiGet<ISalesSummary>(
    '/sales/summary',
    'sales summary analytics',
    { params }
  );
  return response;
};

/**
 * Get sales graph data for charting
 * @param params - Optional filter parameters
 * @returns Promise<ISalesGraphData[]> - Array of time-series sales data
 */
export const getSalesGraphData = async (
  params?: SalesGraphDataParams
): Promise<ISalesGraphData[]> => {
  const response = await unifiedApiClient.apiGet<ISalesGraphData[]>(
    '/sales/graph-data',
    'sales graph data',
    { params }
  );
  return response;
};
