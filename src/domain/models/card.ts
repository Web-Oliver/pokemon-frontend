/**
 * Card-related TypeScript interfaces
 * Corresponds to Card, Set, PsaGradedCard, and RawCard Mongoose schemas
 */

import { IPriceHistoryEntry, ISaleDetails } from './common';

// Database document types (with _id from MongoDB)
export interface IPsaGradedCardDocument extends IPsaGradedCard {
  _id: string;
}

export interface IRawCardDocument extends IRawCard {
  _id: string;
}

export interface ICardDocument extends ICard {
  _id: string;
}

export interface ISet {
  id: string;
  setName: string;
  year: number;
  setUrl?: string;
  totalCardsInSet?: number;
  uniqueSetId: number; // NEW: Unique identifier for database rebuilding
  total_grades: { // NEW: Updated PSA grade structure (replaces totalPsaPopulation)
    grade_1: number;
    grade_2: number;
    grade_3: number;
    grade_4: number;
    grade_5: number;
    grade_6: number;
    grade_7: number;
    grade_8: number;
    grade_9: number;
    grade_10: number;
    total_graded: number;
  };
}

export interface ISetDocument extends ISet {
  _id: string;
}

// Updated to match new backend schema: grade_1 through grade_10
export interface IGrades {
  grade_1: number;
  grade_2: number;
  grade_3: number;
  grade_4: number;
  grade_5: number;
  grade_6: number;
  grade_7: number;
  grade_8: number;
  grade_9: number;
  grade_10: number;
  grade_total: number; // NEW: Total graded count
}

export interface ICard {
  id: string;
  setId: string; // References Set model
  cardNumber: string; // UPDATED: Changed from pokemonNumber
  cardName: string;
  variety?: string;
  uniquePokemonId: number; // NEW: Unique identifier for database rebuilding
  uniqueSetId: number; // NEW: Unique Set identifier
  grades: IGrades; // UPDATED: New grades structure (replaces psaGrades)
  // Additional fields for UI purposes
  setName?: string; // Populated from Set reference
  year?: number; // Populated from Set reference
}

export interface IPsaGradedCard {
  id: string;
  cardId: string; // References Card model
  grade: string; // PSA grade as string (backend schema uses String type)
  images: string[]; // Array of image URLs/paths
  myPrice: number; // Decimal128 in backend, converted to number in response
  priceHistory: IPriceHistoryEntry[];
  dateAdded: string; // ISO date string
  sold: boolean;
  saleDetails?: ISaleDetails;
  // Additional fields for UI purposes
  cardName?: string; // Populated from Card reference
  setName?: string; // Populated from Card->Set reference
  cardNumber?: string; // UPDATED: Changed from pokemonNumber
  variety?: string; // Populated from Card reference
}

export interface IRawCard {
  id: string;
  cardId: string; // References Card model
  condition: string; // Condition of the raw card (e.g., "Near Mint", "Played", etc.)
  images: string[]; // Array of image URLs/paths
  myPrice: number; // Decimal128 in backend, number in frontend
  priceHistory: IPriceHistoryEntry[];
  dateAdded: string; // ISO date string
  sold: boolean;
  saleDetails?: ISaleDetails;
  // Additional fields for UI purposes
  cardName?: string; // Populated from Card reference
  setName?: string; // Populated from Card->Set reference
  cardNumber?: string; // UPDATED: Changed from pokemonNumber
  variety?: string; // Populated from Card reference
}

export interface ISealedProduct {
  id: string;
  productId: string; // UPDATED: Now references Product model (was CardMarketReferenceProduct)
  category: string; // Must match backend enum
  setName: string; // Required
  name: string; // Required
  availability: number; // Required - from Product reference data
  cardMarketPrice: number; // Decimal128 in backend, number in frontend
  myPrice: number; // Required - Decimal128 in backend, number in frontend
  priceHistory: IPriceHistoryEntry[];
  images: string[]; // Array of image URLs/paths
  dateAdded: string; // ISO date string
  sold: boolean;
  saleDetails?: ISaleDetails;
}
