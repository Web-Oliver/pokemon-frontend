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
  totalPsaPopulation?: number;
}

export interface ISetDocument extends ISet {
  _id: string;
}

// Updated to match actual backend schema: psa_1 through psa_10
export interface IPsaGrades {
  psa_1?: number;
  psa_2?: number;
  psa_3?: number;
  psa_4?: number;
  psa_5?: number;
  psa_6?: number;
  psa_7?: number;
  psa_8?: number;
  psa_9?: number;
  psa_10?: number;
}

export interface ICard {
  id: string;
  setId: string; // References Set model
  pokemonNumber: string;
  cardName: string;
  baseName: string;
  variety?: string;
  psaGrades?: IPsaGrades;
  psaTotalGradedForCard?: number;
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
  pokemonNumber?: string; // Populated from Card reference
  baseName?: string; // Populated from Card reference
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
  pokemonNumber?: string; // Populated from Card reference
  baseName?: string; // Populated from Card reference
  variety?: string; // Populated from Card reference
}