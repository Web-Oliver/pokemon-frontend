/**
 * Pure TanStack Query Search API - Context7 Optimal Caching Strategy
 * Layer 1: Core/Foundation/API Client
 *
 * CONTEXT7 PURE TANSTACK QUERY IMPLEMENTATION:
 * - Eliminates all UnifiedApiClient dependencies for pure native fetch
 * - Direct HTTP calls with optimal error handling
 * - No internal caching - TanStack Query handles all caching
 * - Memory-efficient single source of truth
 */

import { ICard, ISet } from '../domain/models/card';
import { IProduct } from '../domain/models/product';
import { ISetProduct } from '../domain/models/setProduct';
import { buildQueryParams } from '../utils/helpers/searchHelpers';

// ===== PURE TANSTACK QUERY TYPE DEFINITIONS =====

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
  setProductId?: string; // NEW: Direct SetProduct filtering
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  limit?: number;
  page?: number;
}

export interface SetProductSearchParams {
  query: string;
  limit?: number;
  page?: number;
}

export interface SearchResponse<T> {
  success: boolean;
  query: string;
  count: number;
  data: T[];
}

// ===== CONTEXT7 PURE FETCH HELPERS =====

/**
 * Pure fetch with optimal error handling for TanStack Query
 * No caching layers - TanStack Query handles all caching
 */
const pureFetch = async (url: string): Promise<any> => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Import unified transformation system
import { ApiTransformers } from '../utils/transformers/unifiedResponseTransformer';

// ===== CONTEXT7 PURE TANSTACK QUERY CARDS API =====

/**
 * Pure TanStack Query Card Search - No internal caching
 * TanStack Query handles all caching, deduplication, and optimization
 */
export const searchCards = async (
  params: CardSearchParams
): Promise<SearchResponse<ICard>> => {
  const { query } = params;

  if (!query.trim()) {
    return { success: true, query, count: 0, data: [] };
  }

  const queryParams = buildQueryParams(params);
  const fullResponse = await pureFetch(
    `http://localhost:3000/api/search/cards?${queryParams.toString()}`
  );

  // Use unified transformation system for consistent response handling
  return ApiTransformers.search<SearchResponse<ICard>>(fullResponse);
};

/**
 * Pure TanStack Query Card Suggestions - No UnifiedApiClient dependency
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

  const response = await pureFetch(
    `http://localhost:3000/api/search/suggest?${queryParams.toString()}`
  );

  const cardSuggestions =
    response.suggestions?.cards?.data || response.data?.cards || [];
  return ApiTransformers.direct<ICard[]>(cardSuggestions);
};

/**
 * Pure TanStack Query Best Match Card
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
 * Pure TanStack Query Cards in Set Search
 */
export const searchCardsInSet = async (
  query: string,
  setName: string,
  limit: number = 15
): Promise<ICard[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: CardSearchParams = {
    query: query.trim(),
    setName,
    limit,
    page: 1,
  };

  const response = await searchCards(params);
  return response.data;
};

/**
 * Pure TanStack Query Cards by Pokemon Number
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
 * Pure TanStack Query Cards by Variety
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

// ===== CONTEXT7 PURE TANSTACK QUERY SETS API =====

/**
 * Pure TanStack Query Set Search - No internal caching
 */
export const searchSets = async (
  params: SetSearchParams
): Promise<SearchResponse<ISet>> => {
  const queryParams = buildQueryParams(params);
  const fullResponse = await pureFetch(
    `http://localhost:3000/api/search/sets?${queryParams.toString()}`
  );

  return {
    success: fullResponse.success || true,
    query: fullResponse.meta?.query || params.query,
    count: fullResponse.meta?.totalResults || fullResponse.data?.total || 0,
    data: fullResponse.data?.sets || fullResponse.data || [],
  };
};

/**
 * Pure TanStack Query Set Suggestions
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

  const response = await pureFetch(
    `http://localhost:3000/api/search/suggest?${queryParams.toString()}`
  );

  return response.suggestions?.sets?.data || response.data?.sets || [];
};

/**
 * Pure TanStack Query Best Match Set
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

// YEAR-SPECIFIC SEARCH DISABLED

// YEAR RANGE SEARCH DISABLED

// PSA POPULATION SEARCH DISABLED

// CARD COUNT SEARCH DISABLED

// ===== CONTEXT7 PURE TANSTACK QUERY PRODUCTS API =====

/**
 * Pure TanStack Query Product Search - Updated for new backend
 */
export const searchProducts = async (
  params: ProductSearchParams
): Promise<SearchResponse<IProduct>> => {
  const queryParams = buildQueryParams(params);
  const fullResponse = await pureFetch(
    `http://localhost:3000/api/search/products?${queryParams.toString()}`
  );

  return {
    success: fullResponse.success || true,
    query: fullResponse.meta?.query || params.query,
    count: fullResponse.meta?.totalResults || fullResponse.data?.total || 0,
    data: fullResponse.data?.products || fullResponse.data || [],
  };
};

/**
 * Pure TanStack Query Product Suggestions
 */
export const getProductSuggestions = async (
  query: string,
  limit: number = 10
): Promise<IProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  const queryParams = new URLSearchParams({
    query: query.trim(),
    types: 'products',
    limit: limit.toString(),
  });

  const response = await pureFetch(
    `http://localhost:3000/api/search/suggest?${queryParams.toString()}`
  );

  return response.suggestions?.products?.data || response.data?.products || [];
};

/**
 * Pure TanStack Query Best Match Product
 */
export const getBestMatchProduct = async (
  query: string,
  setContext?: string,
  categoryContext?: string
): Promise<IProduct | null> => {
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
 * Pure TanStack Query Products in Set
 */
export const searchProductsInSet = async (
  query: string,
  setName: string,
  limit: number = 15
): Promise<IProduct[]> => {
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
 * Pure TanStack Query Products by Category
 */
export const searchProductsByCategory = async (
  query: string,
  category: string,
  limit: number = 15
): Promise<IProduct[]> => {
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
 * Pure TanStack Query Products by Price Range
 */
export const searchProductsByPriceRange = async (
  query: string,
  minPrice: number,
  maxPrice: number,
  limit: number = 15
): Promise<IProduct[]> => {
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
 * Pure TanStack Query Available Products Only
 */
export const searchAvailableProducts = async (
  query: string,
  limit: number = 15
): Promise<IProduct[]> => {
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

// ===== CONTEXT7 PURE TANSTACK QUERY SETPRODUCTS API =====

/**
 * Pure TanStack Query SetProduct Search - NEW
 */
export const searchSetProducts = async (
  params: SetProductSearchParams
): Promise<SearchResponse<ISetProduct>> => {
  console.log('[API DEBUG] searchSetProducts called with params:', params);

  const queryParams = new URLSearchParams({
    query: params.query.trim(),
    types: 'setProducts',
    limit: (params.limit || 15).toString(),
    page: (params.page || 1).toString(),
  });

  const url = `http://localhost:3000/api/search?${queryParams.toString()}`;
  console.log('[API DEBUG] Making SetProducts API request to:', url);

  const fullResponse = await pureFetch(url);
  console.log('[API DEBUG] SetProducts API response:', fullResponse);

  return {
    success: fullResponse.success || true,
    query: fullResponse.meta?.query || params.query,
    count: fullResponse.data?.setProducts?.length || 0,
    data: fullResponse.data?.setProducts || [],
  };
};

/**
 * Pure TanStack Query SetProduct Suggestions
 */
export const getSetProductSuggestions = async (
  query: string,
  limit: number = 10
): Promise<ISetProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  const queryParams = new URLSearchParams({
    query: query.trim(),
    types: 'setProducts',
    limit: limit.toString(),
  });

  const response = await pureFetch(
    `http://localhost:3000/api/search/suggest?${queryParams.toString()}`
  );

  return (
    response.suggestions?.setProducts?.data || response.data?.setProducts || []
  );
};

/**
 * Pure TanStack Query Best Match SetProduct
 */
export const getBestMatchSetProduct = async (
  query: string
): Promise<ISetProduct | null> => {
  if (!query.trim()) {
    return null;
  }

  const params: SetProductSearchParams = {
    query: query.trim(),
    limit: 1,
    page: 1,
  };

  const response = await searchSetProducts(params);
  return response.data.length > 0 ? response.data[0] : null;
};
