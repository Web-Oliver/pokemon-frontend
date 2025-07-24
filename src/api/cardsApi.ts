/**
 * Cards API Client
 * Handles all card-related API operations matching the backend endpoints
 */

import unifiedApiClient from './unifiedApiClient';
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

  if (typeof card === 'object' && card !== null && '_id' in card && !('id' in card)) {
    (card as Record<string, unknown>).id = (card as Record<string, unknown>)._id;
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
 * Get cards with optional filtering parameters - USES NEW UNIFIED SEARCH API
 * @param params - Optional filter parameters
 * @returns Promise<ICard[]> - Array of cards
 */
export const getCards = async (params?: CardsSearchParams): Promise<ICard[]> => {
  // Use new unified search API instead of legacy endpoint
  const searchParams: OptimizedSearchParams = {
    query: params?.cardName || params?.baseName || '*', // Use wildcard if no specific search
    setId: params?.setId,
    limit: 50,
  };

  const response = await searchCardsOptimized(searchParams);
  return response.data;
};

/**
 * Get card by ID
 * @param id - Card ID
 * @returns Promise<ICard> - Single card with population data
 */
export const getCardById = async (id: string): Promise<ICard> => {
  const response = await unifiedApiClient.get(`/cards/${id}`);
  const data = response.data.data || response.data;
  return mapCardIds(data) as ICard;
};

// Import consolidated search functions
export { 
  searchCardsOptimized,
  getCardSuggestionsOptimized,
  getBestMatchCardOptimized,
  searchCardsInSet,
  searchCardsByPokemonNumber,
  searchCardsByVariety
} from './consolidatedSearch';

