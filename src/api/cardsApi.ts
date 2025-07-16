/**
 * Cards API Client
 * Handles all card-related API operations matching the backend endpoints
 */

import apiClient from './apiClient';
import { ICard } from '../domain/models/card';

/**
 * Helper function to map _id to id for MongoDB compatibility
 * @param card - Card object or array of cards
 * @returns Card(s) with id field mapped from _id
 */
const mapCardIds = (card: unknown): unknown => {
  if (!card) {
    return card;
  }

  if (Array.isArray(card)) {
    return card.map(mapCardIds);
  }

  if (card._id && !card.id) {
    card.id = card._id;
  }

  return card;
};

export interface CardsSearchParams {
  setId?: string;
  cardName?: string;
  baseName?: string;
}

export interface SearchResponse {
  cards: ICard[];
  searchMeta?: {
    cached?: boolean;
    hitRate?: number;
    queryTime?: number;
  };
}

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

export interface OptimizedSearchResponse {
  success: boolean;
  query: string;
  count: number;
  data: ICard[];
}

/**
 * Get cards with optional filtering parameters
 * @param params - Optional filter parameters
 * @returns Promise<ICard[]> - Array of cards
 */
export const getCards = async (params?: CardsSearchParams): Promise<ICard[]> => {
  const response = await apiClient.get('/cards', { params });
  const data = response.data.data || response.data;
  return mapCardIds(data);
};

/**
 * Search cards with query and optional parameters
 * @param query - Search query string
 * @param params - Optional search parameters
 * @returns Promise<ICard[]> - Array of search results with scoring
 */
export const searchCards = async (
  query: string,
  params?: { limit?: number; setName?: string }
): Promise<ICard[]> => {
  const response = await apiClient.get('/cards/search', {
    params: { q: query, ...params },
  });
  const data = response.data.data || response.data;
  return mapCardIds(data);
};

/**
 * Get card suggestions for autocomplete
 * @param query - Search query string
 * @param limit - Maximum number of suggestions (default: 10)
 * @returns Promise<string[]> - Array of suggestion strings
 */
export const getCardSuggestions = async (query: string, limit: number = 10): Promise<string[]> => {
  const response = await apiClient.get('/cards/suggestions', {
    params: { q: query, limit },
  });
  return response.data.data || response.data;
};

/**
 * Get best match card for auto-fill functionality
 * @param query - Search query string
 * @returns Promise<ICard | null> - Best matching card or null
 */
export const getBestMatchCard = async (query: string): Promise<ICard | null> => {
  const response = await apiClient.get('/cards/search-best-match', {
    params: { q: query },
  });

  const data = response.data.data || response.data;

  // If backend returns an array, return the first item or null if empty
  let card = null;
  if (Array.isArray(data)) {
    card = data.length > 0 ? data[0] : null;
  } else {
    card = data || null;
  }

  return mapCardIds(card);
};

/**
 * Get card by ID
 * @param id - Card ID
 * @returns Promise<ICard> - Single card with population data
 */
export const getCardById = async (id: string): Promise<ICard> => {
  const response = await apiClient.get(`/cards/${id}`);
  const data = response.data.data || response.data;
  return mapCardIds(data);
};

/**
 * New Optimized Card Search using unified search endpoints
 * @param params - Search parameters with enhanced filtering
 * @returns Promise<OptimizedSearchResponse> - Enhanced search results with fuzzy matching
 */
export const searchCardsOptimized = async (params: OptimizedSearchParams): Promise<OptimizedSearchResponse> => {
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

  const response = await apiClient.get(`/search/cards?${queryParams.toString()}`);
  const data = response.data;

  // Map the response data
  const mappedData = {
    ...data,
    data: mapCardIds(data.data) as ICard[],
  };

  return mappedData;
};

/**
 * Enhanced Card Suggestions using new suggest endpoint
 * @param query - Search query string
 * @param limit - Maximum number of suggestions
 * @returns Promise<ICard[]> - Array of suggestion cards with relevance scoring
 */
export const getCardSuggestionsOptimized = async (query: string, limit: number = 10): Promise<ICard[]> => {
  if (!query.trim()) {
    return [];
  }

  const queryParams = new URLSearchParams({
    query: query.trim(),
    types: 'cards',
    limit: limit.toString(),
  });

  const response = await apiClient.get(`/search/suggest?${queryParams.toString()}`);
  const data = response.data;

  // Extract card suggestions from the response
  const cardSuggestions = data.suggestions?.cards?.data || [];
  return mapCardIds(cardSuggestions) as ICard[];
};

/**
 * Get best match card using optimized search with limit=1
 * @param query - Search query string
 * @param setContext - Optional set context for better matching
 * @returns Promise<ICard | null> - Best matching card or null
 */
export const getBestMatchCardOptimized = async (query: string, setContext?: string): Promise<ICard | null> => {
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
 * @param query - Search query string
 * @param setName - Set name to filter by
 * @param limit - Maximum number of results
 * @returns Promise<ICard[]> - Array of cards from the specified set
 */
export const searchCardsInSet = async (query: string, setName: string, limit: number = 15): Promise<ICard[]> => {
  if (!query.trim()) {
    return [];
  }

  const params: OptimizedSearchParams = {
    query: query.trim(),
    setName,
    limit,
    page: 1,
  };

  const response = await searchCardsOptimized(params);
  return response.data;
};

/**
 * Search cards by Pokemon number
 * @param pokemonNumber - Pokemon number to search for
 * @param setName - Optional set name to filter by
 * @param limit - Maximum number of results
 * @returns Promise<ICard[]> - Array of cards with matching Pokemon number
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
 * @param query - Search query string
 * @param variety - Variety/rarity to filter by
 * @param limit - Maximum number of results
 * @returns Promise<ICard[]> - Array of cards with matching variety
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
