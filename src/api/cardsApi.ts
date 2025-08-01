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
  CARD_CONFIG,
  createResourceOperations,
  idMapper,
} from './genericApiOperations';
import { ICard } from '../domain/models/card';
import { searchCards as searchCardsApi } from './searchApi';

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

export interface SearchResponse {
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
  // includeBatchOperations removed - not used by any frontend components
});

// ========== EXPORTED API OPERATIONS ==========

// getCards removed - not used by any frontend components

// ALL BASIC CARD CRUD OPERATIONS REMOVED - Not used by any frontend components

/**
 * Search cards with parameters - consolidated implementation
 * @param searchParams - Card search parameters
 * @returns Promise<ICard[]> - Search results
 */
export const searchCards = async (searchParams: any): Promise<ICard[]> => {
  const result = await searchCardsApi(searchParams);
  return result.data;
};

// BULK/BATCH CREATE OPERATIONS REMOVED - Not used by any frontend components

/**
 * Export cards data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportCards = cardOperations.export;

// getCardMetrics removed - not used by any frontend components

// ========== CARD-SPECIFIC OPERATIONS ==========

// Import consolidated search functions for card-specific search operations
export {
  searchCardsApi,
  getCardSuggestions,
  getBestMatchCard,
  searchCardsInSet,
  searchCardsByPokemonNumber,
  searchCardsByVariety,
} from './searchApi';
