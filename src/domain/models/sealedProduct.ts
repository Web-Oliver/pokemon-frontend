/**
 * Sealed Product TypeScript interfaces
 * Corresponds to CardMarketReferenceProduct and SealedProduct Mongoose schemas
 */

import { IPriceHistoryEntry, ISaleDetails } from './common';

// Database document types (with _id from MongoDB)
export interface ISealedProductDocument extends ISealedProduct {
  _id: string;
}

// Category enum matching backend schema
export enum SealedProductCategory {
  BLISTERS = 'Blisters',
  BOOSTER_BOXES = 'Booster-Boxes',
  BOOSTERS = 'Boosters',
  BOX_SETS = 'Box-Sets',
  ELITE_TRAINER_BOXES = 'Elite-Trainer-Boxes',
  THEME_DECKS = 'Theme-Decks',
  TINS = 'Tins',
  TRAINER_KITS = 'Trainer-Kits',
}

// CardMarketReferenceProduct interface
export interface ICardMarketReferenceProduct {
  id: string;
  name: string;
  setName: string;
  available: boolean;
  price: number; // CardMarket reference price
  category: string;
  url?: string; // CardMarket URL
  lastUpdated: string; // ISO date string
}

// Updated to match actual backend SealedProduct schema
export interface ISealedProduct {
  id: string;
  productId: string; // References CardMarketReferenceProduct model
  category: SealedProductCategory;
  setName: string;
  name: string;
  availability: number; // Backend uses Number type
  cardMarketPrice: number; // Decimal128 in backend, converted to number
  myPrice: number; // Decimal128 in backend, converted to number
  priceHistory: IPriceHistoryEntry[];
  images: string[]; // Array of image URLs/paths
  dateAdded: string; // ISO date string
  sold: boolean;
  saleDetails?: ISaleDetails;
  // Additional fields for UI purposes (populated from references)
  productName?: string; // From CardMarketReferenceProduct
  productUrl?: string; // From CardMarketReferenceProduct
}
