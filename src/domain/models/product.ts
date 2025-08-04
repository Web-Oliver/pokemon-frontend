/**
 * Product TypeScript interfaces
 * Corresponds to Product Mongoose schema from new backend architecture
 * Replaces CardMarketReferenceProduct with hierarchical SetProduct → Product structure
 */

import { ISetProduct } from './setProduct';

// Product category enum matching backend schema
export enum ProductCategory {
  BLISTERS = 'Blisters',
  BOOSTER_BOXES = 'Booster-Boxes',
  BOOSTERS = 'Boosters',
  BOX_SETS = 'Box-Sets',
  ELITE_TRAINER_BOXES = 'Elite-Trainer-Boxes',
  THEME_DECKS = 'Theme-Decks',
  TINS = 'Tins',
  TRAINER_KITS = 'Trainer-Kits',
}

// Product interface - NEW hierarchical structure
export interface IProduct {
  id: string;
  setProductId: string; // References SetProduct model
  productName: string; // e.g., "Booster Box"
  available: number; // Number of available items
  price: string; // Price as string from backend
  category: ProductCategory;
  url: string; // Product URL
  uniqueProductId: number; // Unique identifier for database rebuilding
  
  // Populated fields (when populated from SetProduct reference)
  setProductName?: string; // From SetProduct reference
  setProduct?: ISetProduct; // Full SetProduct object when populated
}

// Database document type (with _id from MongoDB)
export interface IProductDocument extends IProduct {
  _id: string;
}