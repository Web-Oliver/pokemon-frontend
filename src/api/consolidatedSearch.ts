/**
 * Consolidated Search API - DRY Implementation
 * Layer 1: Core/Foundation/API Client
 * Consolidates ALL search functionality from cardsApi.ts, setsApi.ts, cardMarketRefProductsApi.ts
 * Preserves EXACT functionality while eliminating duplicate code patterns
 */

import unifiedApiClient from './unifiedApiClient';
import { ICard, ISet } from '../domain/models/card';
import { ICardMarketReferenceProduct } from '../domain/models/sealedProduct';

// ===== TYPE DEFINITIONS =====
// Re-export all interfaces for backward compatibility

export interface OptimizedSearchParams {
  query: string;
  setId?: string;
  setName?: string;
  year?: number;
  pokemonNumber?: string;
  variety?: string;
  minPsaPopulation?: number;
  limit?: number;
  page?: number;
}

export interface OptimizedSetSearchParams {
  query: string;
  year?: number;
  minYear?: number;
  maxYear?: number;
  minPsaPopulation?: number;
  minCardCount?: number;
  limit?: number;
  page?: number;
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

export interface OptimizedSearchResponse<T> {
  success: boolean;
  query: string;
  count: number;
  data: T[];
}

// ===== HELPER FUNCTIONS =====

/**
 * Helper function to map _id to id for MongoDB compatibility
 * Copied from cardsApi.ts to preserve exact functionality
 */
const mapCardIds = (card: unknown): unknown => {
  if (!card) {
    return card;
  }

  if (Array.isArray(card)) {
    return card.map(mapCardIds);
  }

  if (
    typeof card === 'object' &&
    card !== null &&
    '_id' in card &&
    !('id' in card)
  ) {
    (card as Record<string, unknown>).id = (
      card as Record<string, unknown>
    )._id;
  }

  return card;
};

// ===== CARDS SEARCH FUNCTIONS =====

/**
 * New Optimized Card Search using unified search endpoints
 * EXACT copy from cardsApi.ts - preserves all functionality
 */
export const searchCardsOptimized = async (
  params: OptimizedSearchParams
): Promise<OptimizedSearchResponse<ICard>> => {
  const { query, limit = 20, page = 1, ...filters } = params;

  if (!query.trim()) {
    return {
      success: true,
      query,
      count: 0,
      data: [],
    };
  }

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

  const response = (await unifiedApiClient.get(
    `/search/cards?${queryParams.toString()}`
  )) as any;
  const data = response.data || response;

  // Map the response data
  const mappedData = {
    success: data.success || true,
    query: data.query || query,
    count: data.count || 0,
    data: mapCardIds(data.data || []) as ICard[],
  };

  return mappedData;
};

/**
 * Enhanced Card Suggestions using new suggest endpoint
 * EXACT copy from cardsApi.ts - preserves all functionality
 */
export const getCardSuggestionsOptimized = async (
  query: string,
  limit: number = 10
): Promise<ICard[]> => {
  if (!query.trim()) {
    return [];
  }

  const queryParams = new URLSearchParams({
    query: query.trim(),
    types: 'cards',
    limit: limit.toString(),
  });

  const response = (await unifiedApiClient.get(
    `/search/suggest?${queryParams.toString()}`
  )) as any;
  const data = response.data || response;

  // Extract card suggestions from the response
  const cardSuggestions = data.suggestions?.cards?.data || [];
  return mapCardIds(cardSuggestions) as ICard[];
};

/**
 * Get best match card using optimized search with limit=1
 * EXACT copy from cardsApi.ts - preserves all functionality
 */
export const getBestMatchCardOptimized = async (
  query: string,
  setContext?: string
): Promise<ICard | null> => {
  if (!query.trim()) {
    return null;
  }

  const params: OptimizedSearchParams = {
    query: query.trim(),
    limit: 1,
    page: 1,
  };

  if (setContext) {
    params.setName = setContext;
  }

  const response = await searchCardsOptimized(params);

  return response.data.length > 0 ? response.data[0] : null;
};

/**
 * Search cards within a specific set using optimized endpoint
 * EXACT copy from cardsApi.ts - preserves all functionality
 */
export const searchCardsInSet = async (
  query: string,
  setName: string,
  limit: number = 15
): Promise<ICard[]> => {
  if (!query.trim()) {
    return [];
  }

  console.log('[CARDS API] searchCardsInSet called with:', {
    query,
    setName,
    limit,
  });

  const params: OptimizedSearchParams = {
    query: query.trim(),
    setName,
    limit,
    page: 1,
  };

  console.log('[CARDS API] searchCardsInSet params:', params);

  const response = await searchCardsOptimized(params);

  console.log('[CARDS API] searchCardsInSet response:', {
    success: response.success,
    count: response.count,
    dataLength: response.data.length,
    firstResult: response.data[0] || null,
  });

  return response.data;
};

/**
 * Search cards by Pokemon number
 * EXACT copy from cardsApi.ts - preserves all functionality
 */
export const searchCardsByPokemonNumber = async (
  pokemonNumber: string,
  setName?: string,
  limit: number = 15
): Promise<ICard[]> => {
  if (!pokemonNumber.trim()) {
    return [];
  }

  const params: OptimizedSearchParams = {
    query: pokemonNumber.trim(),
    pokemonNumber: pokemonNumber.trim(),
    limit,
    page: 1,
  };

  if (setName) {
    params.setName = setName;
  }

  const response = await searchCardsOptimized(params);
  return response.data;
};

/**
 * Search cards by variety/rarity
 * EXACT copy from cardsApi.ts - preserves all functionality
 */
export const searchCardsByVariety = async (
  query: string,
  variety: string,
  limit: number = 15
): Promise<ICard[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedSearchParams = {
    query: query.trim(),
    variety,
    limit,
    page: 1,
  };

  const response = await searchCardsOptimized(params);
  return response.data;
};

// ===== SETS SEARCH FUNCTIONS =====

/**
 * New Optimized Set Search using unified search endpoints
 * EXACT copy from setsApi.ts - preserves all functionality
 */
export const searchSetsOptimized = async (
  params: OptimizedSetSearchParams
): Promise<OptimizedSearchResponse<ISet>> => {
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

  const response = (await unifiedApiClient.get(
    `/search/sets?${queryParams.toString()}`
  )) as any;

  return {
    success: response.success || true,
    query: response.query || query,
    count: response.count || 0,
    data: response.data || [],
  };
};

/**
 * Enhanced Set Suggestions using new suggest endpoint
 * EXACT copy from setsApi.ts - preserves all functionality
 */
export const getSetSuggestionsOptimized = async (
  query: string,
  limit: number = 10
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const queryParams = new URLSearchParams({
    query: query.trim(),
    types: 'sets',
    limit: limit.toString(),
  });

  const response = (await unifiedApiClient.get(
    `/search/suggest?${queryParams.toString()}`
  )) as any;

  // Extract set suggestions from the response
  const setSuggestions = response.suggestions?.sets?.data || [];
  return setSuggestions;
};

/**
 * Get best match set using optimized search with limit=1
 * EXACT copy from setsApi.ts - preserves all functionality
 */
export const getBestMatchSetOptimized = async (
  query: string
): Promise<ISet | null> => {
  if (!query.trim()) {
    return null;
  }

  const params: OptimizedSetSearchParams = {
    query: query.trim(),
    limit: 1,
    page: 1,
  };

  const response = await searchSetsOptimized(params);

  return response.data.length > 0 ? response.data[0] : null;
};

/**
 * Search sets by year using optimized endpoint
 * EXACT copy from setsApi.ts - preserves all functionality
 */
export const searchSetsByYear = async (
  query: string,
  year: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedSetSearchParams = {
    query: query.trim(),
    year,
    limit,
    page: 1,
  };

  const response = await searchSetsOptimized(params);
  return response.data;
};

/**
 * Search sets by year range using optimized endpoint
 * EXACT copy from setsApi.ts - preserves all functionality
 */
export const searchSetsByYearRange = async (
  query: string,
  minYear: number,
  maxYear: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedSetSearchParams = {
    query: query.trim(),
    minYear,
    maxYear,
    limit,
    page: 1,
  };

  const response = await searchSetsOptimized(params);
  return response.data;
};

/**
 * Search sets by PSA population using optimized endpoint
 * EXACT copy from setsApi.ts - preserves all functionality
 */
export const searchSetsByPsaPopulation = async (
  query: string,
  minPsaPopulation: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedSetSearchParams = {
    query: query.trim(),
    minPsaPopulation,
    limit,
    page: 1,
  };

  const response = await searchSetsOptimized(params);
  return response.data;
};

/**
 * Search sets by card count using optimized endpoint
 * EXACT copy from setsApi.ts - preserves all functionality
 */
export const searchSetsByCardCount = async (
  query: string,
  minCardCount: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedSetSearchParams = {
    query: query.trim(),
    minCardCount,
    limit,
    page: 1,
  };

  const response = await searchSetsOptimized(params);
  return response.data;
};

// ===== PRODUCTS SEARCH FUNCTIONS =====

/**
 * New Optimized Product Search using unified search endpoints
 * EXACT copy from cardMarketRefProductsApi.ts - preserves all functionality
 */
export const searchProductsOptimized = async (
  params: OptimizedProductSearchParams
): Promise<OptimizedSearchResponse<ICardMarketReferenceProduct>> => {
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

  const response = (await unifiedApiClient.get(
    `/search/products?${queryParams.toString()}`
  )) as any;

  return {
    success: response.success || true,
    query: response.query || query,
    count: response.count || 0,
    data: response.data || [],
  };
};

/**
 * Enhanced Product Suggestions using new suggest endpoint
 * EXACT copy from cardMarketRefProductsApi.ts - preserves all functionality
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

  const response = (await unifiedApiClient.get(
    `/search/suggest?${queryParams.toString()}`
  )) as any;

  // Extract product suggestions from the response
  const productSuggestions = response.suggestions?.products?.data || [];
  return productSuggestions;
};

/**
 * Get best match product using optimized search with limit=1
 * EXACT copy from cardMarketRefProductsApi.ts - preserves all functionality
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
 * EXACT copy from cardMarketRefProductsApi.ts - preserves all functionality
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
 * EXACT copy from cardMarketRefProductsApi.ts - preserves all functionality
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
 * EXACT copy from cardMarketRefProductsApi.ts - preserves all functionality
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
 * EXACT copy from cardMarketRefProductsApi.ts - preserves all functionality
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

/**
 * Get CardMarket reference set names
 * EXACT copy from cardMarketRefProductsApi.ts - preserves all functionality
 */
export const getCardMarketSetNames = async (
  query?: string,
  limit: number = 50
): Promise<
  Array<{
    setName: string;
    count: number;
    totalAvailable: number;
    categoryCount: number;
    averagePrice: number;
    score?: number;
  }>
> => {
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
  });

  if (query && query.trim()) {
    queryParams.append('search', query.trim());
  }

  const response = (await unifiedApiClient.get(
    `/cardmarket-ref-products/set-names?${queryParams.toString()}`
  )) as any;

  console.log('[CONSOLIDATED SEARCH] Raw API response:', response);
  console.log('[CONSOLIDATED SEARCH] Response.data:', response.data);

  // Handle wrapped response format {success: true, data: [...]}
  const data = response.data?.data || response.data || response;
  console.log('[CONSOLIDATED SEARCH] Extracted data:', data);

  return Array.isArray(data) ? data : [];
};

/**
 * Search CardMarket reference set names
 * EXACT copy from cardMarketRefProductsApi.ts - preserves all functionality
 */
export const searchCardMarketSetNames = async (
  query: string,
  limit: number = 15
): Promise<
  Array<{
    setName: string;
    count: number;
    totalAvailable: number;
    categoryCount: number;
    averagePrice: number;
    score?: number;
  }>
> => {
  if (!query.trim()) {
    return [];
  }

  return getCardMarketSetNames(query, limit);
};
