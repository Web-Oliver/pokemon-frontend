/**
 * Sales Analytics API Client
 * Handles sales data, analytics, and financial tracking operations
 */

import apiClient from './apiClient';
import { ISale, ISalesSummary, ISalesGraphData } from '../domain/models/sale';

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
 * Get sales data with optional filters
 * @param params - Optional filter parameters
 * @returns Promise<ISale[]> - Array of sales transactions
 */
export const getSalesData = async (params?: SalesDataParams): Promise<ISale[]> => {
  const response = await apiClient.get('/sales', { params });
  const rawData = response.data.data || response.data;
  
  // Transform backend data to match ISale interface
  return rawData.map((item: any) => {
    let itemName = 'Unknown Item';
    
    // Extract item name based on item type
    if (item.itemType === 'sealedProduct') {
      itemName = item.name || 'Unknown Sealed Product';
    } else if (item.itemType === 'psaGradedCard' || item.itemType === 'rawCard') {
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
      if (typeof item.saleDetails.actualSoldPrice === 'object' && item.saleDetails.actualSoldPrice.$numberDecimal) {
        actualSoldPrice = parseFloat(item.saleDetails.actualSoldPrice.$numberDecimal);
      } else {
        actualSoldPrice = Number(item.saleDetails.actualSoldPrice);
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
    };
  });
};

/**
 * Get sales summary analytics
 * @param params - Optional filter parameters
 * @returns Promise<ISalesSummary> - Sales summary data
 */
export const getSalesSummary = async (params?: SalesSummaryParams): Promise<ISalesSummary> => {
  const response = await apiClient.get('/sales/summary', { params });
  return response.data.data || response.data;
};

/**
 * Get sales graph data for charting
 * @param params - Optional filter parameters
 * @returns Promise<ISalesGraphData[]> - Array of time-series sales data
 */
export const getSalesGraphData = async (
  params?: SalesGraphDataParams
): Promise<ISalesGraphData[]> => {
  const response = await apiClient.get('/sales/graph-data', { params });
  return response.data.data || response.data;
};
