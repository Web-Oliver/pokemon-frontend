/**
 * CardMarket Reference Products API Client
 * Handles CardMarket reference data for sealed products
 */

import unifiedApiClient from './unifiedApiClient';
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

export interface OptimizedProductSearchParams {
  query: string;
  category?: string;
  setName?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  limit?: number;
  page?: number;
}

export interface OptimizedProductSearchResponse {
  success: boolean;
  query: string;
  count: number;
  data: ICardMarketReferenceProduct[];
}

/**
 * Get CardMarket reference products (non-paginated) - USES NEW UNIFIED SEARCH API
 * @param params - Optional filter parameters
 * @returns Promise<ICardMarketReferenceProduct[]> - Array of reference products
 */
export const getCardMarketRefProducts = async (
  params?: CardMarketRefProductsParams
): Promise<ICardMarketReferenceProduct[]> => {
  if (params?.search && params.search.trim()) {
    // Use search endpoint when there's a search term
    const optimizedParams: OptimizedProductSearchParams = {
      query: params.search.trim(),
      category: params?.category,
      setName: params?.setName,
      availableOnly: params?.available,
      limit: params?.limit || 100,
      page: params?.page || 1,
    };

    const response = await searchProductsOptimized(optimizedParams);
    return response.data;
  } else {
    // Use the main cardmarket-ref-products endpoint for browsing
    const queryParams = new URLSearchParams({
      ...(params?.category && { category: params.category }),
      ...(params?.setName && { setName: params.setName }),
      ...(params?.available !== undefined && { available: params.available.toString() }),
      ...(params?.limit && { limit: params.limit.toString() }),
      ...(params?.page && { page: params.page.toString() }),
    });

    const response = await unifiedApiClient.get(`/cardmarket-ref-products?${queryParams.toString()}`);
    
    // Handle both array and paginated response formats
    if (Array.isArray(response)) {
      return response;
    } else {
      return response.products || [];
    }
  }
};

/**
 * Get paginated CardMarket reference products - USES NEW UNIFIED SEARCH API
 * @param params - Optional pagination and filter parameters
 * @returns Promise<PaginatedCardMarketRefProductsResponse> - Paginated products response
 */
export const getPaginatedCardMarketRefProducts = async (
  params?: CardMarketRefProductsParams
): Promise<PaginatedCardMarketRefProductsResponse> => {
  const { page = 1, limit = 20, category, setName, available, search } = params || {};

  if (search && search.trim()) {
    // Use optimized search when there's a search term
    const optimizedParams: OptimizedProductSearchParams = {
      query: search.trim(),
      page,
      limit,
      category,
      setName,
      availableOnly: available,
    };

    const response = await searchProductsOptimized(optimizedParams);

    // Calculate pagination for optimized search
    const totalPages = Math.ceil(response.count / limit);
    return {
      products: response.data,
      total: response.count,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } else {
    // Use the main cardmarket-ref-products endpoint for browsing without search
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(setName && { setName }),
      ...(available !== undefined && { available: available.toString() }),
    });

    const response = await unifiedApiClient.get(`/cardmarket-ref-products?${queryParams.toString()}`);

    return {
      products: response.products || [],
      total: response.total || 0,
      currentPage: response.currentPage || page,
      totalPages: response.totalPages || 1,
      hasNextPage: response.hasNextPage || false,
      hasPrevPage: response.hasPrevPage || false,
    };
  }
};

/**
 * Get CardMarket reference product by ID - KEEPS LEGACY ENDPOINT (ID lookup)
 * @param id - Product ID
 * @returns Promise<ICardMarketReferenceProduct> - Single reference product
 */
export const getCardMarketRefProductById = async (
  id: string
): Promise<ICardMarketReferenceProduct> => {
  const response = await unifiedApiClient.get(`/cardmarket-ref-products/${id}`);
  return response.data || response;
};

// Import consolidated search functions
export { 
  searchProductsOptimized,
  getProductSuggestionsOptimized,
  getBestMatchProductOptimized,
  searchProductsInSet,
  searchProductsByCategory,
  searchProductsByPriceRange,
  searchAvailableProducts,
  getCardMarketSetNames,
  searchCardMarketSetNames
} from './consolidatedSearch';

