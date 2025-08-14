/**
 * Collection Types with Discriminated Unions
 * Layer 1: Core/Foundation - Type Definitions
 *
 * Discriminated union types for collection items eliminating 'any' usage
 * Provides type-safe handling of different collection item types
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Collection type definitions only
 * - Interface Segregation: Specific interfaces for each item type
 * - Liskov Substitution: All item types are substitutable through base interface
 */

// ============================================================================
// BASE COLLECTION ITEM INTERFACE
// ============================================================================

/**
 * Base interface for all collection items
 * Common properties shared across all item types
 */
interface BaseCollectionItem {
  _id: string;
  dateAdded: string;
  myPrice: number;
  priceHistory: Array<{
    price: number;
    dateUpdated: string;
  }>;
  images: string[];
  sold: boolean;
  saleDetails?: SaleDetails;
}

/**
 * Sale details interface
 * Shared structure for sale information across all item types
 */
export interface SaleDetails {
  price: number;
  buyer: string;
  date: string;
  platform: string;
  paymentMethod?: 'paypal' | 'bank_transfer' | 'cash' | 'other';
  shippingMethod?: 'standard' | 'express' | 'pickup' | 'other';
  trackingNumber?: string;
  notes?: string;
}

// ============================================================================
// DISCRIMINATED UNION TYPES
// ============================================================================

/**
 * PSA Graded Card Item
 * Discriminated by itemType: 'psa'
 */
export interface PsaGradedCard extends BaseCollectionItem {
  readonly itemType: 'psa';
  cardId: string;
  grade: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  certificationNumber?: string;
  gradingCompany: 'PSA' | 'BGS' | 'CGC' | 'SGC';
}

/**
 * Raw Card Item
 * Discriminated by itemType: 'raw'
 */
export interface RawCard extends BaseCollectionItem {
  readonly itemType: 'raw';
  cardId: string;
  condition:
    | 'mint'
    | 'near_mint'
    | 'excellent'
    | 'very_good'
    | 'good'
    | 'fair'
    | 'poor';
  conditionNotes?: string;
}

/**
 * Sealed Product Item
 * Discriminated by itemType: 'sealed'
 */
export interface SealedProduct extends BaseCollectionItem {
  readonly itemType: 'sealed';
  productId: string;
  category:
    | 'booster_box'
    | 'elite_trainer_box'
    | 'booster_pack'
    | 'starter_deck'
    | 'theme_deck'
    | 'collection_box'
    | 'other';
  setName: string;
  productName: string;
  sealed: boolean;
  language: 'english' | 'japanese' | 'other';
}

/**
 * Discriminated Union of All Collection Item Types
 * Enables type-safe handling based on itemType discriminant
 */
export type CollectionItem = PsaGradedCard | RawCard | SealedProduct;

// ============================================================================
// CARD REFERENCE TYPES
// ============================================================================

/**
 * Card Reference Information
 * Shared between PSA and Raw cards
 */
export interface CardReference {
  _id: string;
  setId: string;
  setName: string;
  cardNumber: string;
  cardName: string;
  variety?: string;
  rarity?: string;
  artist?: string;
  releaseDate?: string;
  psaGrades: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    6: number;
    7: number;
    8: number;
    9: number;
    10: number;
  };
  psaTotalGradedForCard: number;
}

/**
 * Set Reference Information
 * Metadata about Pokemon card sets
 */
export interface SetReference {
  _id: string;
  setName: string;
  year: number;
  totalCards: number;
  setUrl?: string;
  totalPsaPopulation: number;
  series?: string;
}

/**
 * Product Reference Information
 * Metadata about sealed products
 */
export interface ProductReference {
  _id: string;
  name: string;
  setName: string;
  category: string;
  available: boolean;
  price: number;
  url?: string;
  lastUpdated: string;
}

// ============================================================================
// TYPE GUARDS FOR DISCRIMINATED UNIONS
// ============================================================================

/**
 * Type guard to check if item is a PSA graded card
 */
export function isPsaGradedCard(item: CollectionItem): item is PsaGradedCard {
  return item.itemType === 'psa';
}

/**
 * Type guard to check if item is a raw card
 */
export function isRawCard(item: CollectionItem): item is RawCard {
  return item.itemType === 'raw';
}

/**
 * Type guard to check if item is a sealed product
 */
export function isSealedProduct(item: CollectionItem): item is SealedProduct {
  return item.itemType === 'sealed';
}

/**
 * Type guard to check if item is any type of card (PSA or Raw)
 */
export function isCard(item: CollectionItem): item is PsaGradedCard | RawCard {
  return item.itemType === 'psa' || item.itemType === 'raw';
}

/**
 * Type guard to check if item is sold
 */
export function isSoldItem(
  item: CollectionItem
): item is CollectionItem & { sold: true; saleDetails: SaleDetails } {
  return item.sold === true && item.saleDetails !== undefined;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract item type from collection item
 */
export type ItemType = CollectionItem['itemType'];

/**
 * Extract specific item type by discriminant
 */
export type ItemByType<T extends ItemType> = Extract<
  CollectionItem,
  { itemType: T }
>;

/**
 * Collection item with required sale details
 */
export type SoldCollectionItem = CollectionItem & {
  sold: true;
  saleDetails: SaleDetails;
};

/**
 * Collection item without sale details (active items)
 */
export type ActiveCollectionItem = CollectionItem & {
  sold: false;
  saleDetails?: undefined;
};

/**
 * Collection statistics by item type
 */
export interface CollectionStatistics {
  total: number;
  byType: Record<ItemType, number>;
  totalValue: number;
  totalSoldValue: number;
  soldCount: number;
  activeCount: number;
}

/**
 * Collection filter criteria
 */
export interface CollectionFilters {
  itemType?: ItemType | ItemType[];
  sold?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
  grade?: number | number[]; // For PSA cards
  condition?: string | string[]; // For raw cards
  setName?: string;
  category?: string; // For sealed products
  dateRange?: {
    start?: string;
    end?: string;
  };
}

/**
 * Collection sort options
 */
export interface CollectionSortOptions {
  field: 'dateAdded' | 'myPrice' | 'grade' | 'condition' | 'setName';
  direction: 'asc' | 'desc';
}

// Form data types moved to types/form/FormTypes.ts to eliminate duplication
// Import form types from there when needed for type safety

// ============================================================================
// AUCTION TYPES
// ============================================================================

/**
 * Auction item reference
 * Links collection items to auctions
 */
export interface AuctionItem {
  itemCategory: ItemType;
  itemId: string;
  startingPrice: number;
  reservePrice?: number;
  currentBid?: number;
  bidCount?: number;
}

/**
 * Auction entity
 */
export interface Auction {
  _id: string;
  topText: string;
  bottomText: string;
  auctionDate: string;
  status: 'draft' | 'active' | 'sold' | 'expired';
  items: AuctionItem[];
  totalValue: number;
  soldValue?: number;
  generatedFacebookPost?: string;
  isActive: boolean;
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  BaseCollectionItem,
  ItemType,
  ItemByType,
  SoldCollectionItem,
  ActiveCollectionItem,
  CollectionStatistics,
  CollectionFilters,
  CollectionSortOptions,
  CardReference,
  SetReference,
  ProductReference,
  AuctionItem,
  Auction,
};
