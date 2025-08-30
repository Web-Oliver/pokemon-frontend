/**
 * Sealed Product TypeScript interfaces
 * UPDATED: Now corresponds to SetProduct → Product hierarchy and SealedProduct Mongoose schemas
 * Migration: CardMarketReferenceProduct replaced with Product model
 */

import { IPriceHistoryEntry, ISaleDetails } from '@/types/common';

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

// DEPRECATED: CardMarketReferenceProduct interface - Use IProduct instead
// Kept for backward compatibility during migration
export interface ICardMarketReferenceProduct {
  _id: string;
  name: string;
  setName: string;
  available: number; // Number of available items from CardMarket
  price: string; // Price as string from CardMarket
  category: string;
  url?: string; // CardMarket URL
  lastUpdated: string; // ISO date string
}

// Updated to match new backend SealedProduct schema with SetProduct → Product hierarchy
export interface ISealedProduct {
  id: string;
  productId: string; // UPDATED: Now references Product model (was CardMarketReferenceProduct)
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
  // Additional fields for UI purposes (populated from Product → SetProduct references)
  productName?: string; // From Product model
  productUrl?: string; // From Product model
  setProductName?: string; // NEW: From SetProduct model via Product reference
  setProductId?: string; // NEW: SetProduct ID for hierarchical filtering
}
