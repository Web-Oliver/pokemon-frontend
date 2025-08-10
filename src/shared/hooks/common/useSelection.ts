/**
 * useSelection Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Standardized selection state management hook
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles item selection logic
 * - DRY: Eliminates repetitive selectedItems patterns
 * - Reusability: Generic hook for any selection needs
 */

import { useCallback, useMemo, useState } from 'react';

export interface UseSelectionReturn<T> {
  /** Currently selected items */
  selectedItems: T[];
  /** Selected item IDs for performance */
  selectedIds: Set<string>;
  /** Whether an item is selected */
  isSelected: (item: T) => boolean;
  /** Whether an item ID is selected */
  isIdSelected: (id: string) => boolean;
  /** Toggle selection of an item */
  toggleSelection: (item: T) => void;
  /** Toggle selection by ID */
  toggleSelectionById: (id: string, item?: T) => void;
  /** Select an item */
  selectItem: (item: T) => void;
  /** Deselect an item */
  deselectItem: (item: T) => void;
  /** Select multiple items */
  selectItems: (items: T[]) => void;
  /** Select all items from a list */
  selectAll: (allItems: T[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Set selection to specific items */
  setSelection: (items: T[]) => void;
  /** Get count of selected items */
  selectedCount: number;
  /** Whether any items are selected */
  hasSelection: boolean;
  /** Whether all items from a list are selected */
  isAllSelected: (allItems: T[]) => boolean;
}

/**
 * Custom hook for item selection management
 * Replaces repetitive selectedItems useState patterns
 *
 * @param getItemId - Function to extract unique ID from item
 * @param initialSelection - Initial selected items
 * @returns Selection management interface
 *
 * @example
 * ```typescript
 * // Replace: const [selectedItems, setSelectedItems] = useState<User[]>([]);
 * const selection = useSelection<User>(
 *   (user) => user.id,
 *   []
 * );
 *
 * // Usage:
 * selection.toggleSelection(user);
 * selection.selectAll(allUsers);
 * selection.clearSelection();
 * const isSelected = selection.isSelected(user);
 * ```
 */
export const useSelection = <T>(
  getItemId: (item: T) => string,
  initialSelection: T[] = []
): UseSelectionReturn<T> => {
  const [selectedItems, setSelectedItems] = useState<T[]>(initialSelection);

  // Memoized set of selected IDs for performance
  const selectedIds = useMemo(() => {
    return new Set(selectedItems.map(getItemId));
  }, [selectedItems, getItemId]);

  // Check if item is selected
  const isSelected = useCallback(
    (item: T): boolean => {
      return selectedIds.has(getItemId(item));
    },
    [selectedIds, getItemId]
  );

  // Check if ID is selected
  const isIdSelected = useCallback(
    (id: string): boolean => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  // Toggle selection of an item
  const toggleSelection = useCallback(
    (item: T) => {
      const itemId = getItemId(item);
      setSelectedItems((prev) => {
        const isCurrentlySelected = prev.some(
          (selected) => getItemId(selected) === itemId
        );
        if (isCurrentlySelected) {
          return prev.filter((selected) => getItemId(selected) !== itemId);
        } else {
          return [...prev, item];
        }
      });
    },
    [getItemId]
  );

  // Toggle selection by ID (with optional item)
  const toggleSelectionById = useCallback(
    (id: string, item?: T) => {
      setSelectedItems((prev) => {
        const isCurrentlySelected = prev.some(
          (selected) => getItemId(selected) === id
        );
        if (isCurrentlySelected) {
          return prev.filter((selected) => getItemId(selected) !== id);
        } else if (item) {
          return [...prev, item];
        }
        return prev; // Can't add without item
      });
    },
    [getItemId]
  );

  // Select an item
  const selectItem = useCallback(
    (item: T) => {
      const itemId = getItemId(item);
      setSelectedItems((prev) => {
        const isAlreadySelected = prev.some(
          (selected) => getItemId(selected) === itemId
        );
        if (!isAlreadySelected) {
          return [...prev, item];
        }
        return prev;
      });
    },
    [getItemId]
  );

  // Deselect an item
  const deselectItem = useCallback(
    (item: T) => {
      const itemId = getItemId(item);
      setSelectedItems((prev) =>
        prev.filter((selected) => getItemId(selected) !== itemId)
      );
    },
    [getItemId]
  );

  // Select multiple items
  const selectItems = useCallback(
    (items: T[]) => {
      setSelectedItems((prev) => {
        const prevIds = new Set(prev.map(getItemId));
        const newItems = items.filter((item) => !prevIds.has(getItemId(item)));
        return [...prev, ...newItems];
      });
    },
    [getItemId]
  );

  // Select all items from a list
  const selectAll = useCallback((allItems: T[]) => {
    setSelectedItems(allItems);
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Set selection to specific items
  const setSelection = useCallback((items: T[]) => {
    setSelectedItems(items);
  }, []);

  // Check if all items from a list are selected
  const isAllSelected = useCallback(
    (allItems: T[]): boolean => {
      if (allItems.length === 0) return false;
      return allItems.every((item) => selectedIds.has(getItemId(item)));
    },
    [selectedIds, getItemId]
  );

  // Computed values
  const selectedCount = selectedItems.length;
  const hasSelection = selectedCount > 0;

  return {
    selectedItems,
    selectedIds,
    isSelected,
    isIdSelected,
    toggleSelection,
    toggleSelectionById,
    selectItem,
    deselectItem,
    selectItems,
    selectAll,
    clearSelection,
    setSelection,
    selectedCount,
    hasSelection,
    isAllSelected,
  };
};

/**
 * Hook for managing multi-select with shift/ctrl key support
 * Extends basic selection with keyboard interaction patterns
 *
 * @example
 * ```typescript
 * const selection = useMultiSelection<User>(
 *   (user) => user.id,
 *   allUsers
 * );
 *
 * // Handle click with keyboard modifiers
 * const handleItemClick = (user: User, event: React.MouseEvent) => {
 *   selection.handleItemClick(user, event);
 * };
 * ```
 */
export interface UseMultiSelectionReturn<T> extends UseSelectionReturn<T> {
  /** Handle item click with keyboard modifiers */
  handleItemClick: (item: T, event: React.MouseEvent) => void;
  /** Last clicked item for range selection */
  lastClickedItem: T | null;
}

export const useMultiSelection = <T>(
  getItemId: (item: T) => string,
  allItems: T[] = [],
  initialSelection: T[] = []
): UseMultiSelectionReturn<T> => {
  const baseSelection = useSelection(getItemId, initialSelection);
  const [lastClickedItem, setLastClickedItem] = useState<T | null>(null);

  const handleItemClick = useCallback(
    (item: T, event: React.MouseEvent) => {
      const { ctrlKey, metaKey, shiftKey } = event;
      const isCommandClick = ctrlKey || metaKey;

      if (shiftKey && lastClickedItem) {
        // Range selection
        const lastIndex = allItems.findIndex(
          (i) => getItemId(i) === getItemId(lastClickedItem)
        );
        const currentIndex = allItems.findIndex(
          (i) => getItemId(i) === getItemId(item)
        );

        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          const rangeItems = allItems.slice(start, end + 1);
          baseSelection.selectItems(rangeItems);
        }
      } else if (isCommandClick) {
        // Toggle individual selection
        baseSelection.toggleSelection(item);
        setLastClickedItem(item);
      } else {
        // Single selection (replace all)
        baseSelection.setSelection([item]);
        setLastClickedItem(item);
      }
    },
    [allItems, getItemId, lastClickedItem, baseSelection]
  );

  return {
    ...baseSelection,
    handleItemClick,
    lastClickedItem,
  };
};

export default useSelection;
