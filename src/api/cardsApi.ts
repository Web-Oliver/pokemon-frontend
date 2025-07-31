/**
 * Cards API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for card-related API operations
 * - OCP: Open for extension via createResourceOperations configuration
 * - LSP: Maintains ICard interface compatibility
 * - ISP: Provides specific card operations interface
 * - DIP: Depends on genericApiOperations abstraction
 *
 * DRY: Uses createResourceOperations to eliminate boilerplate CRUD patterns
 */

import {
  createResourceOperations,
  CARD_CONFIG,
  idMapper,
} from './genericApiOperations';
import { ICard } from '../domain/models/card';
import { searchCardsOptimized } from './consolidatedSearch';

// ========== INTERFACES (ISP Compliance) ==========

/**
 * Card-specific search parameters
 */
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
 * Card metrics response interface
 */
export interface CardMetrics {
  totalCards: number;
  cardsBySet: Record<string, number>;
  gradeDistribution: Record<string, number>;
  topPsaPopulations: Array<{
    cardId: string;
    cardName: string;
    setName: string;
    psaTotalGradedForCard: number;
  }>;
  recentlyAdded: ICard[];
  averagePsaPopulation: number;
}

/**
 * Card creation payload interface
 */
interface ICardCreatePayload extends Omit<ICard, 'id' | '_id'> {}

/**
 * Card update payload interface
 */
interface ICardUpdatePayload extends Partial<ICardCreatePayload> {}

// ========== GENERIC RESOURCE OPERATIONS ==========

/**
 * Core CRUD operations for cards using createResourceOperations
 * Eliminates boilerplate patterns and ensures consistency with other API files
 */
const cardOperations = createResourceOperations<
  ICard,
  ICardCreatePayload,
  ICardUpdatePayload
>(CARD_CONFIG, {
  includeExportOperations: true,
  includeBatchOperations: true,
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get all cards with optional filtering parameters
 * @param params - Optional filter parameters
 * @returns Promise<ICard[]> - Array of cards
 */
export const getCards = async (
  params?: CardsSearchParams
): Promise<ICard[]> => {
  // If specific search parameters provided, use search instead
  if (params?.cardName || params?.baseName) {
    const searchParams: OptimizedSearchParams = {
      query: params.cardName || params.baseName || '*',
      setId: params.setId,
      limit: 50,
    };
    const response = await searchCardsOptimized(searchParams);
    return response.data;
  }

  // Otherwise use generic getAll with ID mapping
  return cardOperations.getAll(params, {
    transform: idMapper,
  });
};

/**
 * Get card by ID
 * @param id - Card ID
 * @returns Promise<ICard> - Single card with population data
 */
export const getCardById = async (id: string): Promise<ICard> => {
  return cardOperations.getById(id, {
    transform: idMapper,
  });
};

/**
 * Create a new card
 * @param cardData - Card creation data
 * @returns Promise<ICard> - Created card
 */
export const createCard = cardOperations.create;

/**
 * Update existing card
 * @param id - Card ID
 * @param cardData - Card update data
 * @returns Promise<ICard> - Updated card
 */
export const updateCard = cardOperations.update;

/**
 * Delete card
 * @param id - Card ID
 * @returns Promise<void>
 */
export const removeCard = cardOperations.remove;

/**
 * Search cards with parameters
 * @param searchParams - Card search parameters
 * @returns Promise<ICard[]> - Search results
 */
export const searchCards = cardOperations.search;

/**
 * Bulk create cards
 * @param cardsData - Array of card creation data
 * @returns Promise<ICard[]> - Created cards
 */
export const bulkCreateCards = cardOperations.bulkCreate;

/**
 * Export cards data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportCards = cardOperations.export;

/**
 * Batch operation on cards
 * @param operation - Operation name
 * @param ids - Card IDs
 * @param operationData - Operation-specific data
 * @returns Promise<ICard[]> - Operation results
 */
export const batchCardOperation = cardOperations.batchOperation;

/**
 * Get comprehensive card metrics and statistics
 * Uses the enhanced /api/cards/enhanced/metrics endpoint with 15-minute caching
 * @returns Promise<CardMetrics> - Card metrics and statistics
 */
export const getCardMetrics = async (): Promise<CardMetrics> => {
  return cardOperations.client.get('/cards/enhanced/metrics');
};

// ========== CARD-SPECIFIC OPERATIONS ==========

// Import consolidated search functions for card-specific search operations
export {
  searchCardsOptimized,
  getCardSuggestionsOptimized,
  getBestMatchCardOptimized,
  searchCardsInSet,
  searchCardsByPokemonNumber,
  searchCardsByVariety,
} from './consolidatedSearch';
