/**
 * Collection Display Types
 * Layer 1: Core/Foundation - Display-specific type definitions
 *
 * Types for UI display and transformation of collection items
 * Separated from domain models to follow SOLID principles
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Display/transformation types only
 * - Interface Segregation: Specific interfaces for display needs
 * - DRY: Centralized display types for reuse across features
 */

import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';

/**
 * Unified collection item interface for display purposes
 * Used when different collection item types need to be displayed uniformly
 * (e.g., in auction lists, search results, etc.)
 */
export interface UnifiedCollectionItem {
  id: string;
  itemType: 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
  displayName: string;
  displayPrice: number;
  displayImage?: string;
  images?: string[];
  setName?: string;
  grade?: string;
  condition?: string;
  category?: string;
  originalItem: IPsaGradedCard | IRawCard | ISealedProduct;
}

/**
 * Collection item type for URL/routing purposes
 * Maps to backend API endpoints and URL patterns
 */
export type CollectionItemUrlType = 'psa' | 'raw' | 'sealed';

/**
 * Collection item type for internal processing
 * Standardized naming for consistent internal usage
 */
export type CollectionItemType = 'psa-graded' | 'raw-card' | 'sealed-product';

/**
 * Item edit data structure
 * Used for editing operations across different item types
 */
export interface ItemEditData {
  item: IPsaGradedCard | IRawCard | ISealedProduct;
  itemType: CollectionItemType;
}

/**
 * Mapping utilities between different type naming conventions
 */
export const ItemTypeMapping = {
  // URL type to internal type
  urlToInternal: {
    psa: 'psa-graded',
    raw: 'raw-card',
    sealed: 'sealed-product',
  } as const,

  // Internal type to URL type
  internalToUrl: {
    'psa-graded': 'psa',
    'raw-card': 'raw',
    'sealed-product': 'sealed',
  } as const,

  // Internal type to display type
  internalToDisplay: {
    'psa-graded': 'PsaGradedCard',
    'raw-card': 'RawCard',
    'sealed-product': 'SealedProduct',
  } as const,
} as const;

/**
 * Type guards for collection item display types
 */
export function isUnifiedCollectionItem(
  item: any
): item is UnifiedCollectionItem {
  return (
    item &&
    typeof item.id === 'string' &&
    typeof item.itemType === 'string' &&
    typeof item.displayName === 'string' &&
    typeof item.displayPrice === 'number' &&
    item.originalItem
  );
}

/**
 * Helper function to convert URL type to internal type
 */
export function urlTypeToInternalType(
  urlType: CollectionItemUrlType
): CollectionItemType {
  return ItemTypeMapping.urlToInternal[urlType];
}

/**
 * Helper function to convert internal type to URL type
 */
export function internalTypeToUrlType(
  internalType: CollectionItemType
): CollectionItemUrlType {
  return ItemTypeMapping.internalToUrl[internalType];
}

/**
 * Helper function to convert internal type to display type
 */
export function internalTypeToDisplayType(
  internalType: CollectionItemType
): string {
  return ItemTypeMapping.internalToDisplay[internalType];
}
