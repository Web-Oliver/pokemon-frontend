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

    const response = await apiClient.get(`/cardmarket-ref-products?${queryParams.toString()}`);
    
    // Handle both array and paginated response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      return response.data.products || [];
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

    const response = await apiClient.get(`/cardmarket-ref-products?${queryParams.toString()}`);
    const data = response.data;

    return {
      products: data.products || [],
      total: data.total || 0,
      currentPage: data.currentPage || page,
      totalPages: data.totalPages || 1,
      hasNextPage: data.hasNextPage || false,
      hasPrevPage: data.hasPrevPage || false,
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
  const response = await apiClient.get(`/cardmarket-ref-products/${id}`);
  return response.data.data || response.data;
};

/**
 * New Optimized Product Search using unified search endpoints
 * @param params - Search parameters with enhanced filtering
 * @returns Promise<OptimizedProductSearchResponse> - Enhanced search results with fuzzy matching
 */
export const searchProductsOptimized = async (
  params: OptimizedProductSearchParams
): Promise<OptimizedProductSearchResponse> => {
  const { query, limit = 20, page = 1, ...filters } = params;


  const queryParams = new URLSearchParams({
    query: query.trim(),
    limit: limit.toString(),
    page: page.toString(),
  });

  // Add filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await apiClient.get(`/search/products?${queryParams.toString()}`);
  const data = response.data;

  return {
    success: data.success,
    query: data.query,
    count: data.count,
    data: data.data || [],
  };
};

/**
 * Enhanced Product Suggestions using new suggest endpoint
 * @param query - Search query string
 * @param limit - Maximum number of suggestions
 * @returns Promise<ICardMarketReferenceProduct[]> - Array of suggestion products with relevance scoring
 */
export const getProductSuggestionsOptimized = async (
  query: string,
  limit: number = 10
): Promise<ICardMarketReferenceProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  const queryParams = new URLSearchParams({
    query: query.trim(),
    types: 'products',
    limit: limit.toString(),
  });

  const response = await apiClient.get(`/search/suggest?${queryParams.toString()}`);
  const data = response.data;

  // Extract product suggestions from the response
  const productSuggestions = data.suggestions?.products?.data || [];
  return productSuggestions;
};

/**
 * Get best match product using optimized search with limit=1
 * @param query - Search query string
 * @param setContext - Optional set context for better matching
 * @param categoryContext - Optional category context for better matching
 * @returns Promise<ICardMarketReferenceProduct | null> - Best matching product or null
 */
export const getBestMatchProductOptimized = async (
  query: string,
  setContext?: string,
  categoryContext?: string
): Promise<ICardMarketReferenceProduct | null> => {
  if (!query.trim()) {
    return null;
  }

  const params: OptimizedProductSearchParams = {
    query: query.trim(),
    limit: 1,
    page: 1,
  };

  if (setContext) {
    params.setName = setContext;
  }

  if (categoryContext) {
    params.category = categoryContext;
  }

  const response = await searchProductsOptimized(params);

  return response.data.length > 0 ? response.data[0] : null;
};

/**
 * Search products within a specific set using optimized endpoint
 * @param query - Search query string
 * @param setName - Set name to filter by
 * @param limit - Maximum number of results
 * @returns Promise<ICardMarketReferenceProduct[]> - Array of products from the specified set
 */
export const searchProductsInSet = async (
  query: string,
  setName: string,
  limit: number = 15
): Promise<ICardMarketReferenceProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedProductSearchParams = {
    query: query.trim(),
    setName,
    limit,
    page: 1,
  };

  const response = await searchProductsOptimized(params);
  return response.data;
};

/**
 * Search products by category using optimized endpoint
 * @param query - Search query string
 * @param category - Category to filter by
 * @param limit - Maximum number of results
 * @returns Promise<ICardMarketReferenceProduct[]> - Array of products from the specified category
 */
export const searchProductsByCategory = async (
  query: string,
  category: string,
  limit: number = 15
): Promise<ICardMarketReferenceProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedProductSearchParams = {
    query: query.trim(),
    category,
    limit,
    page: 1,
  };

  const response = await searchProductsOptimized(params);
  return response.data;
};

/**
 * Search products by price range using optimized endpoint
 * @param query - Search query string
 * @param minPrice - Minimum price filter
 * @param maxPrice - Maximum price filter
 * @param limit - Maximum number of results
 * @returns Promise<ICardMarketReferenceProduct[]> - Array of products within price range
 */
export const searchProductsByPriceRange = async (
  query: string,
  minPrice: number,
  maxPrice: number,
  limit: number = 15
): Promise<ICardMarketReferenceProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedProductSearchParams = {
    query: query.trim(),
    minPrice,
    maxPrice,
    limit,
    page: 1,
  };

  const response = await searchProductsOptimized(params);
  return response.data;
};

/**
 * Search only available products using optimized endpoint
 * @param query - Search query string
 * @param limit - Maximum number of results
 * @returns Promise<ICardMarketReferenceProduct[]> - Array of available products
 */
export const searchAvailableProducts = async (
  query: string,
  limit: number = 15
): Promise<ICardMarketReferenceProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedProductSearchParams = {
    query: query.trim(),
    availableOnly: true,
    limit,
    page: 1,
  };

  const response = await searchProductsOptimized(params);
  return response.data;
};
