/**
 * Sales Analytics API Client
 * Handles sales data, analytics, and financial tracking operations
 */

import { apiClient } from './apiClient';
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
  return response.data.data || response.data;
};

/**
 * Get sales summary analytics
 * @param params - Optional filter parameters
 * @returns Promise<ISalesSummary> - Sales summary data
 */
export const getSalesSummary = async (
  params?: SalesSummaryParams
): Promise<ISalesSummary> => {
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