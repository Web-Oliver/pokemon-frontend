/**
 * CardMarket Reference Products API Client
 * Handles CardMarket reference data for sealed products
 */

import apiClient from './apiClient';
import { ICardMarketReferenceProduct } from '../domain/models/sealedProduct';

export interface CardMarketRefProductsParams {
  category?: string;
  setName?: string;
  available?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCardMarketRefProductsResponse {
  products: ICardMarketReferenceProduct[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Get CardMarket reference products (non-paginated)
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
 * Get paginated CardMarket reference products
 * @param params - Optional pagination and filter parameters
 * @returns Promise<PaginatedCardMarketRefProductsResponse> - Paginated products response
 */
export const getPaginatedCardMarketRefProducts = async (
  params?: CardMarketRefProductsParams
): Promise<PaginatedCardMarketRefProductsResponse> => {
  // Convert 'search' to 'q' to match backend parameter and clean up params
  const backendParams: any = { ...params };
  
  if (params?.search) {
    backendParams.q = params.search;
    delete backendParams.search;
  }
  
  const response = await apiClient.get('/cardmarket-ref-products', { params: backendParams });
  
  // Backend returns: { products, currentPage, totalPages, total, hasNextPage, hasPrevPage }
  // Transform to match frontend interface
  const backendData = response.data;
  return {
    products: backendData.products || [],
    total: backendData.total || 0,
    currentPage: backendData.currentPage || 1,
    totalPages: backendData.totalPages || 1,
    hasNextPage: backendData.hasNextPage || false,
    hasPrevPage: backendData.hasPrevPage || false,
  };
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
    params: { q: query, ...params },
  });
  return response.data.data || response.data;
};
