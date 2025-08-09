/**
 * Item Ordering Utilities
 * Layer 1: Core/Foundation/API Client
 *
 * Utility functions for item ordering operations
 * Following CLAUDE.md principles:
 * - DRY: Central utilities avoiding duplication
 * - Single Responsibility: Each function has one clear purpose
 * - Reusability: Functions can be used across different ordering contexts
 */

import {
  CollectionItem,
  ItemCategory,
  OrderedCollectionItem,
  OrderValidationResult,
} from '../types/ordering';

/**
 * Determine the category of a collection item
 * Leverages existing pattern from CollectionExportModal
 */
export const getItemCategory = (item: CollectionItem): ItemCategory => {
  if ((item as any).grade !== undefined) {
    return 'PSA_CARD';
  }
  if ((item as any).condition !== undefined) {
    return 'RAW_CARD';
  }
  return 'SEALED_PRODUCT';
};

/**
 * Get display name for collection item
 * Leverages existing pattern from CollectionExportModal
 */
export const getItemDisplayName = (item: CollectionItem): string => {
  return (
    (item as any).cardId?.cardName ||
    (item as any).cardName ||
    (item as any).name ||
    'Unknown Item'
  );
};

/**
 * Get sortable price for collection item
 * Normalizes price values for consistent sorting
 */
export const getSortablePrice = (item: CollectionItem): number => {
  const price = item.myPrice;

  if (typeof price === 'number') {
    return price;
  }

  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

/**
 * Convert collection item to ordered collection item
 */
export const toOrderedCollectionItem = (
  item: CollectionItem,
  orderIndex: number
): OrderedCollectionItem => {
  return {
    ...item,
    orderIndex,
    category: getItemCategory(item),
    sortablePrice: getSortablePrice(item),
  };
};

/**
 * Sort collection items by price
 * @param items - Items to sort
 * @param ascending - Sort direction (default: false for highest to lowest)
 */
export const sortItemsByPrice = (
  items: CollectionItem[],
  ascending: boolean = false
): CollectionItem[] => {
  return [...items].sort((a, b) => {
    const priceA = getSortablePrice(a);
    const priceB = getSortablePrice(b);
    return ascending ? priceA - priceB : priceB - priceA;
  });
};

/**
 * Group items by category
 */
export const groupItemsByCategory = (
  items: CollectionItem[]
): Record<ItemCategory, CollectionItem[]> => {
  const groups: Record<ItemCategory, CollectionItem[]> = {
    PSA_CARD: [],
    RAW_CARD: [],
    SEALED_PRODUCT: [],
  };

  items.forEach((item) => {
    const category = getItemCategory(item);
    groups[category].push(item);
  });

  return groups;
};

/**
 * Sort items within each category by price
 */
export const sortCategoriesByPrice = (
  items: CollectionItem[],
  ascending: boolean = false
): CollectionItem[] => {
  const grouped = groupItemsByCategory(items);
  const sortedGroups: CollectionItem[] = [];

  // Sort each category and maintain category grouping
  Object.entries(grouped).forEach(([, categoryItems]) => {
    if (categoryItems.length > 0) {
      const sortedItems = sortItemsByPrice(categoryItems, ascending);
      sortedGroups.push(...sortedItems);
    }
  });

  return sortedGroups;
};

/**
 * Apply custom order to items array
 */
export const applyItemOrder = (
  items: CollectionItem[],
  order: string[]
): CollectionItem[] => {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const orderedItems: CollectionItem[] = [];

  // Add items in specified order
  order.forEach((itemId) => {
    const item = itemMap.get(itemId);
    if (item) {
      orderedItems.push(item);
      itemMap.delete(itemId);
    }
  });

  // Add any remaining items that weren't in the order
  itemMap.forEach((item) => {
    orderedItems.push(item);
  });

  return orderedItems;
};

/**
 * Validate item order array
 */
export const validateItemOrder = (
  order: string[],
  items: CollectionItem[]
): OrderValidationResult => {
  const errors: string[] = [];

  // Handle edge cases
  if (!order || order.length === 0) {
    errors.push('Order array is empty');
  }

  if (!items || items.length === 0) {
    errors.push('Items array is empty');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      correctedOrder: undefined,
    };
  }

  const itemIds = new Set(items.map((item) => item.id));
  const orderSet = new Set(order);

  // Check for duplicates in order
  if (order.length !== orderSet.size) {
    const duplicates = order.filter((id, index) => order.indexOf(id) !== index);
    const uniqueDuplicates = Array.from(new Set(duplicates));
    errors.push(`Duplicate items in order: ${uniqueDuplicates.join(', ')}`);
  }

  // Check for missing items
  const missingItems = Array.from(itemIds).filter((id) => !orderSet.has(id));
  if (missingItems.length > 0) {
    errors.push(`Missing items in order: ${missingItems.join(', ')}`);
  }

  // Check for extra items in order
  const extraItems = order.filter((id) => !itemIds.has(id));
  if (extraItems.length > 0) {
    errors.push(`Extra items in order: ${extraItems.join(', ')}`);
  }

  const isValid = errors.length === 0;
  let correctedOrder: string[] | undefined;

  if (!isValid) {
    // Generate corrected order by removing duplicates and extra items, adding missing items
    const validOrder = Array.from(
      new Set(order.filter((id) => itemIds.has(id)))
    );
    correctedOrder = [...validOrder, ...missingItems];
  }

  return {
    isValid,
    errors,
    correctedOrder,
  };
};

/**
 * Move item in array from one index to another
 */
export const moveItemInArray = <T>(
  array: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  if (
    fromIndex < 0 ||
    fromIndex >= array.length ||
    toIndex < 0 ||
    toIndex >= array.length
  ) {
    return [...array]; // Return copy if indices are out of bounds
  }

  if (fromIndex === toIndex) {
    return [...array]; // No movement needed
  }

  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);

  return newArray;
};

/**
 * Move item up in order array
 */
export const moveItemUp = (order: string[], itemId: string): string[] => {
  const index = order.indexOf(itemId);
  if (index <= 0) {
    return order;
  } // Already at top or not found

  const newOrder = [...order];
  [newOrder[index - 1], newOrder[index]] = [
    newOrder[index],
    newOrder[index - 1],
  ];
  return newOrder;
};

/**
 * Move item down in order array
 */
export const moveItemDown = (order: string[], itemId: string): string[] => {
  const index = order.indexOf(itemId);
  if (index < 0 || index >= order.length - 1) {
    return order;
  } // Not found or already at bottom

  const newOrder = [...order];
  [newOrder[index], newOrder[index + 1]] = [
    newOrder[index + 1],
    newOrder[index],
  ];
  return newOrder;
};

/**
 * Reset order to default (original item order)
 */
export const resetToDefaultOrder = (items: CollectionItem[]): string[] => {
  return items.map((item) => item.id);
};

/**
 * Generate order from sorted items
 */
export const generateOrderFromItems = (items: CollectionItem[]): string[] => {
  return items.map((item) => item.id);
};
