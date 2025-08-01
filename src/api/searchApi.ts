/**
 * Consolidated Search API - DRY Implementation
 * Layer 1: Core/Foundation/API Client
 * Consolidates ALL search functionality from cardsApi.ts, setsApi.ts, cardMarketRefProductsApi.ts
 * Preserves EXACT functionality while eliminating duplicate code patterns
 */

import { unifiedApiClient } from './unifiedApiClient';
import { ICard, ISet } from '../domain/models/card';
import { ICardMarketReferenceProduct } from '../domain/models/sealedProduct';
import { buildQueryParams } from '../utils/searchHelpers';

// ===== TYPE DEFINITIONS =====
// Re-export all interfaces for backward compatibility

export interface CardSearchParams {
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

export interface SetSearchParams {
  query: string;
  year?: number;
  minYear?: number;
  maxYear?: number;
  minPsaPopulation?: number;
  minCardCount?: number;
  limit?: number;
  page?: number;
}

export interface ProductSearchParams {
  query: string;
  category?: string;
  setName?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  limit?: number;
  page?: number;
}

export interface SearchResponse<T> {
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
 * Card Search using unified search endpoints
 * Preserves all functionality from cardsApi.ts
 */
export const searchCards = async (
  params: CardSearchParams
): Promise<SearchResponse<ICard>> => {
  const { query } = params;

  if (!query.trim()) {
    return {
      success: true,
      query,
      count: 0,
      data: [],
    };
  }

  const queryParams = buildQueryParams(params);

  // Use direct fetch to get full response like searchProducts
  const response = await fetch(
    `http://localhost:3000/api/search/cards?${queryParams.toString()}`
  );
  const fullResponse = await response.json();

  console.log('[CARDS SEARCH] Full API response:', fullResponse);
  console.log('[CARDS SEARCH] Response.data:', fullResponse.data);
  console.log('[CARDS SEARCH] Response.meta:', fullResponse.meta);
  console.log(
    '[CARDS SEARCH] Response.meta?.totalResults:',
    fullResponse.meta?.totalResults
  );

  const result = {
    success: fullResponse.success || true,
    query: fullResponse.meta?.query || params.query,
    count: fullResponse.meta?.totalResults || fullResponse.count || 0,
    data: mapCardIds(fullResponse.data || []) as ICard[],
  };

  console.log('[CARDS SEARCH] Final result:', result);
  console.log('[CARDS SEARCH] Final result.count:', result.count);
  console.log('[CARDS SEARCH] Final result.data.length:', result.data.length);

  return result;
};

/**
 * Get Card Suggestions using suggest endpoint
 * Preserves all functionality from cardsApi.ts
 */
export const getCardSuggestions = async (
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
 * Get best match card using search with limit=1
 * Preserves all functionality from cardsApi.ts
 */
export const getBestMatchCard = async (
  query: string,
  setContext?: string
): Promise<ICard | null> => {
  if (!query.trim()) {
    return null;
  }

  const params: CardSearchParams = {
    query: query.trim(),
    limit: 1,
    page: 1,
  };

  if (setContext) {
    params.setName = setContext;
  }

  const response = await searchCards(params);

  return response.data.length > 0 ? response.data[0] : null;
};

/**
 * Search cards within a specific set
 * Preserves all functionality from cardsApi.ts
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

  const params: CardSearchParams = {
    query: query.trim(),
    setName,
    limit,
    page: 1,
  };

  console.log('[CARDS API] searchCardsInSet params:', params);

  const response = await searchCards(params);

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
 * Preserves all functionality from cardsApi.ts
 */
export const searchCardsByPokemonNumber = async (
  pokemonNumber: string,
  setName?: string,
  limit: number = 15
): Promise<ICard[]> => {
  if (!pokemonNumber.trim()) {
    return [];
  }

  const params: CardSearchParams = {
    query: pokemonNumber.trim(),
    pokemonNumber: pokemonNumber.trim(),
    limit,
    page: 1,
  };

  if (setName) {
    params.setName = setName;
  }

  const response = await searchCards(params);
  return response.data;
};

/**
 * Search cards by variety/rarity
 * Preserves functionality from cardsApi.ts - preserves all functionality
 */
export const searchCardsByVariety = async (
  query: string,
  variety: string,
  limit: number = 15
): Promise<ICard[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: CardSearchParams = {
    query: query.trim(),
    variety,
    limit,
    page: 1,
  };

  const response = await searchCards(params);
  return response.data;
};

// ===== SETS SEARCH FUNCTIONS =====

/**
 * Standard Set Search using unified search endpoints
 * Preserves functionality from setsApi.ts - preserves all functionality
 */
export const searchSets = async (
  params: SetSearchParams
): Promise<SearchResponse<ISet>> => {
  const queryParams = buildQueryParams(params);

  // Use direct fetch to get full response like searchProducts
  const response = await fetch(
    `http://localhost:3000/api/search/sets?${queryParams.toString()}`
  );
  const fullResponse = await response.json();

  console.log('[SETS SEARCH] Full API response:', fullResponse);
  console.log('[SETS SEARCH] Response.data:', fullResponse.data);
  console.log('[SETS SEARCH] Response.meta:', fullResponse.meta);
  console.log(
    '[SETS SEARCH] Response.meta?.totalResults:',
    fullResponse.meta?.totalResults
  );

  const result = {
    success: fullResponse.success || true,
    query: fullResponse.meta?.query || params.query,
    count: fullResponse.meta?.totalResults || fullResponse.count || 0,
    data: fullResponse.data || [],
  };

  console.log('[SETS SEARCH] Final result:', result);
  console.log('[SETS SEARCH] Final result.count:', result.count);
  console.log('[SETS SEARCH] Final result.data.length:', result.data.length);

  return result;
};

/**
 * Standard Set Suggestions using new suggest endpoint
 * Preserves functionality from setsApi.ts - preserves all functionality
 */
export const getSetSuggestions = async (
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
 * Get best match set using standard search with limit=1
 * Preserves functionality from setsApi.ts - preserves all functionality
 */
export const getBestMatchSet = async (query: string): Promise<ISet | null> => {
  if (!query.trim()) {
    return null;
  }

  const params: SetSearchParams = {
    query: query.trim(),
    limit: 1,
    page: 1,
  };

  const response = await searchSets(params);

  return response.data.length > 0 ? response.data[0] : null;
};

/**
 * Search sets by year using standard endpoint
 * Preserves functionality from setsApi.ts - preserves all functionality
 */
export const searchSetsByYear = async (
  query: string,
  year: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: SetSearchParams = {
    query: query.trim(),
    year,
    limit,
    page: 1,
  };

  const response = await searchSets(params);
  return response.data;
};

/**
 * Search sets by year range using standard endpoint
 * Preserves functionality from setsApi.ts - preserves all functionality
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

  const params: SetSearchParams = {
    query: query.trim(),
    minYear,
    maxYear,
    limit,
    page: 1,
  };

  const response = await searchSets(params);
  return response.data;
};

/**
 * Search sets by PSA population using standard endpoint
 * Preserves functionality from setsApi.ts - preserves all functionality
 */
export const searchSetsByPsaPopulation = async (
  query: string,
  minPsaPopulation: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: SetSearchParams = {
    query: query.trim(),
    minPsaPopulation,
    limit,
    page: 1,
  };

  const response = await searchSets(params);
  return response.data;
};

/**
 * Search sets by card count using standard endpoint
 * Preserves functionality from setsApi.ts - preserves all functionality
 */
export const searchSetsByCardCount = async (
  query: string,
  minCardCount: number,
  limit: number = 15
): Promise<ISet[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: SetSearchParams = {
    query: query.trim(),
    minCardCount,
    limit,
    page: 1,
  };

  const response = await searchSets(params);
  return response.data;
};

// ===== PRODUCTS SEARCH FUNCTIONS =====

/**
 * Standard Product Search using unified search endpoints
 * Preserves functionality from cardMarketRefProductsApi.ts - preserves all functionality
 */
export const searchProducts = async (
  params: ProductSearchParams
): Promise<SearchResponse<ICardMarketReferenceProduct>> => {
  const queryParams = buildQueryParams(params);

  // unifiedApiClient.get() returns the transformed data array directly via transformApiResponse()
  // We need the full response object to get meta information, so use axios directly
  const response = await fetch(
    `http://localhost:3000/api/search/products?${queryParams.toString()}`
  );
  const fullResponse = await response.json();

  console.log('[PRODUCTS SEARCH] Full API response:', fullResponse);
  console.log('[PRODUCTS SEARCH] Response.data:', fullResponse.data);
  console.log('[PRODUCTS SEARCH] Response.meta:', fullResponse.meta);
  console.log(
    '[PRODUCTS SEARCH] Response.meta?.totalResults:',
    fullResponse.meta?.totalResults
  );

  const result = {
    success: fullResponse.success || true,
    query: fullResponse.meta?.query || params.query,
    count: fullResponse.meta?.totalResults || fullResponse.count || 0,
    data: fullResponse.data || [],
  };

  console.log('[PRODUCTS SEARCH] Final result:', result);
  console.log('[PRODUCTS SEARCH] Final result.count:', result.count);
  console.log(
    '[PRODUCTS SEARCH] Final result.data.length:',
    result.data.length
  );

  return result;
};

/**
 * Standard Product Suggestions using new suggest endpoint
 * Preserves functionality from cardMarketRefProductsApi.ts - preserves all functionality
 */
export const getProductSuggestions = async (
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
 * Get best match product using standard search with limit=1
 * Preserves functionality from cardMarketRefProductsApi.ts - preserves all functionality
 */
export const getBestMatchProduct = async (
  query: string,
  setContext?: string,
  categoryContext?: string
): Promise<ICardMarketReferenceProduct | null> => {
  if (!query.trim()) {
    return null;
  }

  const params: ProductSearchParams = {
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

  const response = await searchProducts(params);

  return response.data.length > 0 ? response.data[0] : null;
};

/**
 * Search products within a specific set using standard endpoint
 * Preserves functionality from cardMarketRefProductsApi.ts - preserves all functionality
 */
export const searchProductsInSet = async (
  query: string,
  setName: string,
  limit: number = 15
): Promise<ICardMarketReferenceProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: ProductSearchParams = {
    query: query.trim(),
    setName,
    limit,
    page: 1,
  };

  const response = await searchProducts(params);
  return response.data;
};

/**
 * Search products by category using standard endpoint
 * Preserves functionality from cardMarketRefProductsApi.ts - preserves all functionality
 */
export const searchProductsByCategory = async (
  query: string,
  category: string,
  limit: number = 15
): Promise<ICardMarketReferenceProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: ProductSearchParams = {
    query: query.trim(),
    category,
    limit,
    page: 1,
  };

  const response = await searchProducts(params);
  return response.data;
};

/**
 * Search products by price range using standard endpoint
 * Preserves functionality from cardMarketRefProductsApi.ts - preserves all functionality
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

  const params: ProductSearchParams = {
    query: query.trim(),
    minPrice,
    maxPrice,
    limit,
    page: 1,
  };

  const response = await searchProducts(params);
  return response.data;
};

/**
 * Search only available products using standard endpoint
 * Preserves functionality from cardMarketRefProductsApi.ts - preserves all functionality
 */
export const searchAvailableProducts = async (
  query: string,
  limit: number = 15
): Promise<ICardMarketReferenceProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: ProductSearchParams = {
    query: query.trim(),
    availableOnly: true,
    limit,
    page: 1,
  };

  const response = await searchProducts(params);
  return response.data;
};

/**
 * Get CardMarket reference set names
 * Preserves functionality from cardMarketRefProductsApi.ts - preserves all functionality
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
 * Preserves functionality from cardMarketRefProductsApi.ts - preserves all functionality
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
