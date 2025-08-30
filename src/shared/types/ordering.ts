/**
 * Item Ordering TypeScript interfaces
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles ordering-related types
 * - Interface Segregation: Specific interfaces for different ordering concerns
 * - Dependency Inversion: Abstract interfaces for ordering operations
 */

import { IPsaGradedCard, IRawCard } from '@/shared/domain/models/card';
import { ISealedProduct } from '@/shared/domain/models/sealedProduct';

/**
 * Union type for all collection items that can be ordered
 */
export type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;

/**
 * Item category enumeration for ordering
 * Matches existing ItemCategory from auction.ts
 */
export type ItemCategory = 'PSA_CARD' | 'RAW_CARD' | 'SEALED_PRODUCT';

/**
 * Sort method enumeration
 */
export type SortMethod = 'manual' | 'price_desc' | 'price_asc' | null;

/**
 * Standard collection item with ordering metadata
 */
export type OrderedCollectionItem = CollectionItem & {
  orderIndex: number;
  category: ItemCategory;
  sortablePrice: number; // Normalized price for consistent sorting
};

/**
 * Item ordering state interface
 * Manages both global and category-specific ordering
 */
export interface ItemOrderingState {
  globalOrder: string[]; // All items in desired order
  categoryOrders: {
    PSA_CARD: string[];
    RAW_CARD: string[];
    SEALED_PRODUCT: string[];
  };
  lastSortMethod: SortMethod;
  lastSortTimestamp: Date;
}

/**
 * Ordering error enumeration
 */
export type OrderingError =
  | 'INVALID_ORDER_SEQUENCE'
  | 'MISSING_ITEMS_IN_ORDER'
  | 'DUPLICATE_ITEMS_IN_ORDER'
  | 'CATEGORY_MISMATCH'
  | 'SORT_OPERATION_FAILED';

/**
 * Ordering error context for error handling
 */
export interface OrderingErrorContext {
  errorType: OrderingError;
  affectedItems: string[];
  recoveryAction: 'RESET_ORDER' | 'REMOVE_DUPLICATES' | 'RESTORE_BACKUP';
  originalError?: string;
}

/**
 * Item ordering validation result
 */
export interface OrderValidationResult {
  isValid: boolean;
  errors: string[] | OrderingErrorContext[];
  correctedOrder?: string[];
}

/**
 * Category-specific ordering options
 */
export interface CategoryOrderingOptions {
  category: ItemCategory;
  sortByPrice?: boolean;
  ascending?: boolean;
  maintainCategoryBoundaries?: boolean;
}

/**
 * Global ordering options
 */
export interface GlobalOrderingOptions {
  sortByPrice?: boolean;
  ascending?: boolean;
  groupByCategory?: boolean;
  categoryOrder?: ItemCategory[];
}
