/**
 * Item Selection Hook - PHASE 2 REFACTORING
 * Extracted from useCollectionExport monster hook (672 lines)
 * 
 * SOLID Principles:
 * - SRP: Only handles item selection logic (no export, no ordering)
 * - DIP: Depends on abstractions (persistence service)
 */

import { useCallback, useState } from 'react';
import { CollectionItem } from '@/types/ordering';

export interface UseItemSelectionReturn {
  /** Currently selected item IDs */
  selectedItems: string[];
  /** Toggle individual item selection */
  toggleItemSelection: (itemId: string) => void;
  /** Select all items */
  selectAllItems: (items: CollectionItem[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Check if item is selected */
  isItemSelected: (itemId: string) => boolean;
  /** Get count of selected items */
  selectedCount: number;
}

/**
 * Focused item selection hook - single responsibility for selection state only
 * Replaces 80+ lines from useCollectionExport monster
 */
export const useItemSelection = (
  initialSelection: string[] = [],
  onSelectionChange?: (selectedIds: string[]) => void
): UseItemSelectionReturn => {
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelection);

  const toggleItemSelection = useCallback(
    (itemId: string) => {
      setSelectedItems((prev) => {
        const newSelection = prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId];

        // Notify parent of change
        if (onSelectionChange) {
          onSelectionChange(newSelection);
        }

        return newSelection;
      });
    },
    [onSelectionChange]
  );

  const selectAllItems = useCallback(
    (items: CollectionItem[]) => {
      const safeItems = items || [];
      const allIds = safeItems.map((item) => item.id || (item as any)._id);
      setSelectedItems(allIds);

      // Notify parent of change
      if (onSelectionChange) {
        onSelectionChange(allIds);
      }
    },
    [onSelectionChange]
  );

  const clearSelection = useCallback(() => {
    setSelectedItems([]);

    // Notify parent of change
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

  const isItemSelected = useCallback(
    (itemId: string) => {
      return selectedItems.includes(itemId);
    },
    [selectedItems]
  );

  return {
    selectedItems,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
    isItemSelected,
    selectedCount: selectedItems.length,
  };
};

export default useItemSelection;