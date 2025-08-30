/**
 * Item Ordering Hook - PHASE 2 REFACTORING  
 * Extracted from useCollectionExport monster hook (672 lines)
 * 
 * SOLID Principles:
 * - SRP: Only handles item ordering/sorting logic (no export, no selection)
 * - DIP: Depends on abstractions (ordering utilities)
 */

import { useCallback, useState } from 'react';
import { CollectionItem, ItemCategory, ItemOrderingState, SortMethod } from '@/types/ordering';
import {
  applyItemOrder,
  generateOrderFromItems,
  getItemCategory,
  moveItemDown,
  moveItemUp,
  resetToDefaultOrder,
  sortItemsByPrice,
} from '../../utils/helpers/orderingUtils';

export interface UseItemOrderingReturn {
  /** Current item order */
  itemOrder: string[];
  /** Current ordering state with category breakdown */
  orderingState: ItemOrderingState;
  /** Reorder items manually */
  reorderItems: (newOrder: string[]) => void;
  /** Move specific item up in order */
  moveItemUp: (itemId: string) => void;
  /** Move specific item down in order */
  moveItemDown: (itemId: string) => void;
  /** Auto-sort all items by price */
  autoSortByPrice: (items: CollectionItem[], ascending?: boolean) => void;
  /** Sort specific category by price */
  sortCategoryByPrice: (
    items: CollectionItem[],
    category: ItemCategory,
    ascending?: boolean
  ) => void;
  /** Reset to default order */
  resetOrder: (items: CollectionItem[]) => void;
  /** Apply saved order to items */
  applyOrder: (items: CollectionItem[]) => CollectionItem[];
}

const initialOrderingState: ItemOrderingState = {
  globalOrder: [],
  categoryOrders: {
    PSA_CARD: [],
    RAW_CARD: [],
    SEALED_PRODUCT: [],
  },
  lastSortMethod: 'custom',
  lastSortTimestamp: new Date(),
};

/**
 * Focused item ordering hook - single responsibility for ordering logic only
 * Replaces 150+ lines from useCollectionExport monster
 */
export const useItemOrdering = (
  initialOrder: string[] = [],
  onOrderChange?: (newOrder: string[], orderingState: ItemOrderingState) => void
): UseItemOrderingReturn => {
  const [itemOrder, setItemOrder] = useState<string[]>(initialOrder);
  const [orderingState, setOrderingState] = useState<ItemOrderingState>(initialOrderingState);

  // Update ordering state and sync with category orders
  const updateOrderingState = useCallback(
    (newOrder: string[], sortMethod: SortMethod, items?: CollectionItem[]) => {
      setItemOrder(newOrder);

      // Update category orders if items are provided
      const categoryOrders = orderingState.categoryOrders;
      if (items && Array.isArray(items)) {
        const safeItems = items || [];
        const grouped = safeItems.reduce(
          (acc, item) => {
            const category = getItemCategory(item);
            if (!acc[category]) {
              acc[category] = [];
            }
            const itemId = item.id || (item as any)._id;
            if (newOrder.includes(itemId)) {
              acc[category].push(itemId);
            }
            return acc;
          },
          {} as Record<ItemCategory, string[]>
        );

        categoryOrders.PSA_CARD = grouped.PSA_CARD || [];
        categoryOrders.RAW_CARD = grouped.RAW_CARD || [];
        categoryOrders.SEALED_PRODUCT = grouped.SEALED_PRODUCT || [];
      }

      const newOrderingState = {
        globalOrder: newOrder,
        categoryOrders,
        lastSortMethod: sortMethod,
        lastSortTimestamp: new Date(),
      };

      setOrderingState(newOrderingState);

      // Notify parent of change
      if (onOrderChange) {
        onOrderChange(newOrder, newOrderingState);
      }
    },
    [orderingState.categoryOrders, onOrderChange]
  );

  const reorderItems = useCallback(
    (newOrder: string[]) => {
      updateOrderingState(newOrder, 'custom');
    },
    [updateOrderingState]
  );

  const moveItemUpCallback = useCallback(
    (itemId: string) => {
      const newOrder = moveItemUp(itemOrder, itemId);
      updateOrderingState(newOrder, 'custom');
    },
    [itemOrder, updateOrderingState]
  );

  const moveItemDownCallback = useCallback(
    (itemId: string) => {
      const newOrder = moveItemDown(itemOrder, itemId);
      updateOrderingState(newOrder, 'custom');
    },
    [itemOrder, updateOrderingState]
  );

  const autoSortByPrice = useCallback(
    (items: CollectionItem[], ascending: boolean = true) => {
      const sortedOrder = sortItemsByPrice(items, ascending);
      updateOrderingState(sortedOrder, ascending ? 'price-asc' : 'price-desc', items);
    },
    [updateOrderingState]
  );

  const sortCategoryByPrice = useCallback(
    (items: CollectionItem[], category: ItemCategory, ascending: boolean = true) => {
      const categoryItems = items.filter(item => getItemCategory(item) === category);
      const sortedCategoryOrder = sortItemsByPrice(categoryItems, ascending);
      
      // Update only the category portion of the global order
      const newGlobalOrder = [...itemOrder];
      const categoryStartIndex = newGlobalOrder.findIndex(id => 
        categoryItems.some(item => (item.id || (item as any)._id) === id)
      );
      
      if (categoryStartIndex !== -1) {
        // Remove all category items from current position
        const filteredOrder = newGlobalOrder.filter(id => 
          !sortedCategoryOrder.includes(id)
        );
        
        // Insert sorted category items at the appropriate position
        filteredOrder.splice(categoryStartIndex, 0, ...sortedCategoryOrder);
        updateOrderingState(filteredOrder, ascending ? 'price-asc' : 'price-desc', items);
      }
    },
    [itemOrder, updateOrderingState]
  );

  const resetOrder = useCallback(
    (items: CollectionItem[]) => {
      const defaultOrder = resetToDefaultOrder(items);
      updateOrderingState(defaultOrder, 'default', items);
    },
    [updateOrderingState]
  );

  const applyOrder = useCallback(
    (items: CollectionItem[]) => {
      return applyItemOrder(items, itemOrder);
    },
    [itemOrder]
  );

  return {
    itemOrder,
    orderingState,
    reorderItems,
    moveItemUp: moveItemUpCallback,
    moveItemDown: moveItemDownCallback,
    autoSortByPrice,
    sortCategoryByPrice,
    resetOrder,
    applyOrder,
  };
};

export default useItemOrdering;