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
const mapCardIds = (card: any): any => {
  if (!card) return card;
  
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
    params: { q: query, ...params }
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