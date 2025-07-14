/**
 * Cards API Client
 * Handles all card-related API operations matching the backend endpoints
 */

import { apiClient } from './apiClient';
import { ICard } from '../domain/models/card';

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

/**
 * Get cards with optional filtering parameters
 * @param params - Optional filter parameters
 * @returns Promise<ICard[]> - Array of cards
 */
export const getCards = async (params?: CardsSearchParams): Promise<ICard[]> => {
  const response = await apiClient.get('/cards', { params });
  return response.data.data || response.data;
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
    params: { q: query, ...params }
  });
  return response.data.data || response.data;
};

/**
 * Get card suggestions for autocomplete
 * @param query - Search query string
 * @param limit - Maximum number of suggestions (default: 10)
 * @returns Promise<string[]> - Array of suggestion strings
 */
export const getCardSuggestions = async (
  query: string,
  limit: number = 10
): Promise<string[]> => {
  const response = await apiClient.get('/cards/suggestions', {
    params: { q: query, limit }
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
    params: { q: query }
  });
  return response.data.data || response.data;
};

/**
 * Get card by ID
 * @param id - Card ID
 * @returns Promise<ICard> - Single card with population data
 */
export const getCardById = async (id: string): Promise<ICard> => {
  const response = await apiClient.get(`/cards/${id}`);
  return response.data.data || response.data;
};