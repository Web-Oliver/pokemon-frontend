/**
 * CardMarket Reference Products API Client
 * Handles CardMarket reference data for sealed products
 */

import { apiClient } from './apiClient';
import { ICardMarketReferenceProduct } from '../domain/models/sealedProduct';

export interface CardMarketRefProductsParams {
  category?: string;
  setName?: string;
  available?: boolean;
  search?: string;
}

/**
 * Get CardMarket reference products
 * @param params - Optional filter parameters
 * @returns Promise<ICardMarketReferenceProduct[]> - Array of reference products
 */
export const getCardMarketRefProducts = async (
  params?: CardMarketRefProductsParams
): Promise<ICardMarketReferenceProduct[]> => {
  const response = await apiClient.get('/cardmarket-ref-products', { params });
  return response.data.data || response.data;
};

/**
 * Get CardMarket reference product by ID
 * @param id - Product ID
 * @returns Promise<ICardMarketReferenceProduct> - Single reference product
 */
export const getCardMarketRefProductById = async (
  id: string
): Promise<ICardMarketReferenceProduct> => {
  const response = await apiClient.get(`/cardmarket-ref-products/${id}`);
  return response.data.data || response.data;
};

/**
 * Search CardMarket reference products
 * @param query - Search query string
 * @param params - Optional search parameters
 * @returns Promise<ICardMarketReferenceProduct[]> - Array of matching products
 */
export const searchCardMarketRefProducts = async (
  query: string,
  params?: { limit?: number; category?: string }
): Promise<ICardMarketReferenceProduct[]> => {
  const response = await apiClient.get('/cardmarket-ref-products/search', {
    params: { q: query, ...params }
  });
  return response.data.data || response.data;
};