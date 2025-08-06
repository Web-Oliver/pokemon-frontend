/**
 * CardMarket API Client
 * Layer 1: Core/Foundation/API Client
 *
 * Modern API client for CardMarket operations.
 * Separate from the hierarchical search system used for autosuggestion.
 */

import { ICardMarketReferenceProduct } from '../../domain/models/sealedProduct';

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

const BASE_URL = 'http://localhost:3000/api/cardmarket';

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

  const response = await fetch(`${BASE_URL}/search?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get all product categories with counts
 */
export const getCategories = async (): Promise<
  Array<{ name: string; count: number }>
> => {
  const response = await fetch(`${BASE_URL}/categories`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const { data } = await response.json();
  return data;
};

/**
 * Get detailed information about a specific category
 */
export const getCategoryDetails = async (
  category: string
): Promise<CategoryDetails> => {
  const response = await fetch(
    `${BASE_URL}/categories/${encodeURIComponent(category)}`
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const { data } = await response.json();
  return data;
};
