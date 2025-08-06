/**
 * CardMarket API Client
 * Layer 1: Core/Foundation/API Client
 *
 * Modern API client for CardMarket operations.
 * Separate from the hierarchical search system used for autosuggestion.
 */

import { ICardMarketReferenceProduct } from '../../domain/models/sealedProduct';
import { unifiedHttpClient } from '../base/UnifiedHttpClient';

export interface CardMarketSearchParams {
  page?: number;
  limit?: number;
  category?: string;
  setName?: string;
  availableOnly?: boolean;
}

export interface CardMarketSearchResponse {
  success: boolean;
  data: {
    products: ICardMarketReferenceProduct[];
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      total: number;
    };
  };
}

export interface CategoryDetails {
  totalProducts: number;
  availableProducts: number;
  totalAvailable: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
}

/**
 * Search CardMarket reference products with pagination
 */
export const searchProducts = async (
  params: CardMarketSearchParams
): Promise<CardMarketSearchResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params.category) {
    queryParams.append('category', params.category);
  }
  if (params.setName) {
    queryParams.append('setName', params.setName);
  }
  if (params.availableOnly) {
    queryParams.append('availableOnly', 'true');
  }

  return unifiedHttpClient.get<CardMarketSearchResponse>(
    `/api/cardmarket/search?${queryParams.toString()}`,
    {
      operation: 'fetch CardMarket products',
    }
  );
};

/**
 * Get all product categories with counts
 */
export const getCategories = async (): Promise<
  Array<{ name: string; count: number }>
> => {
  const response = await unifiedHttpClient.get<{data: Array<{ name: string; count: number }>}>(
    '/api/cardmarket/categories',
    {
      operation: 'fetch CardMarket categories',
    }
  );

  return response.data;
};

/**
 * Get detailed information about a specific category
 */
export const getCategoryDetails = async (
  category: string
): Promise<CategoryDetails> => {
  const response = await unifiedHttpClient.get<{data: CategoryDetails}>(
    `/api/cardmarket/categories/${encodeURIComponent(category)}`,
    {
      operation: `fetch CardMarket category details for ${category}`,
    }
  );

  return response.data;
};
