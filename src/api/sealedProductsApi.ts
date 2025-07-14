/**
 * Sealed Products API Client
 * Handles sealed product reference data operations
 */

import { apiClient } from './apiClient';
import { ISealedProduct } from '../domain/models/sealedProduct';

export interface SealedProductsParams {
  category?: string;
  setName?: string;
  sold?: boolean;
  search?: string;
}

/**
 * Get sealed products with optional filters
 * @param params - Optional filter parameters
 * @returns Promise<ISealedProduct[]> - Array of sealed products
 */
export const getSealedProducts = async (
  params?: SealedProductsParams
): Promise<ISealedProduct[]> => {
  const response = await apiClient.get('/sealed-products', { params });
  return response.data.data || response.data;
};

/**
 * Get sealed product by ID
 * @param id - Sealed product ID
 * @returns Promise<ISealedProduct> - Single sealed product
 */
export const getSealedProductById = async (id: string): Promise<ISealedProduct> => {
  const response = await apiClient.get(`/sealed-products/${id}`);
  return response.data.data || response.data;
};

/**
 * Search sealed products by category
 * @param category - Product category
 * @param params - Optional search parameters
 * @returns Promise<ISealedProduct[]> - Array of matching products
 */
export const searchSealedProductsByCategory = async (
  category: string,
  params?: { setName?: string; available?: boolean }
): Promise<ISealedProduct[]> => {
  const response = await apiClient.get('/sealed-products/search', {
    params: { category, ...params }
  });
  return response.data.data || response.data;
};