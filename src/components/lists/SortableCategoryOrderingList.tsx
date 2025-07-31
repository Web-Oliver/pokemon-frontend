/**
 * Sortable Category Ordering List Component
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles sortable category-based item ordering
 * - Open/Closed: Extends CategoryOrderingList with drag & drop functionality
 * - DRY: Reuses existing CategoryOrderingList with added sortable capabilities
 * - Layer 3: UI Building Block component
 */

import React, { memo, useCallback, useState, useMemo } from 'react';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { Grid3X3, Package, Users, ArrowUpDown } from 'lucide-react';
import {
  DragDropProvider,
  SortableList,
  reorderArray,
  isDragAllowed,
} from '../../contexts/DragDropContext';
import { SortableItemCard } from './SortableItemCard';
import { CollectionItem, ItemCategory } from '../../domain/models/ordering';
import { getItemCategory } from '../../utils/orderingUtils';

export interface SortableCategoryOrderingListProps {
  items: CollectionItem[];
  itemOrder: string[];
  selectedItemIds: string[];
  onReorderItems: (newOrder: string[]) => void;
  onMoveItemUp: (itemId: string) => void;
  onMoveItemDown: (itemId: string) => void;
  onSortCategoryByPrice: (category: ItemCategory, ascending?: boolean) => void;
  onToggleItemSelection?: (itemId: string) => void;
  showSelection?: boolean;
  showDragHandles?: boolean;
  showMoveButtons?: boolean;
  enableCategoryCollapse?: boolean;
  dragConstraints?: {
    allowCrossCategoryDrag?: boolean;
    restrictToSelectedItems?: boolean;
  };
  className?: string;
}

/**
 * Sortable Category Ordering List Component
 * Provides drag & drop functionality for category-based item ordering
 */
const SortableCategoryOrderingListComponent: React.FC<
  SortableCategoryOrderingListProps
> = ({
  items,
  itemOrder,
  selectedItemIds,
  onReorderItems,
  onMoveItemUp,
  onMoveItemDown,
  onSortCategoryByPrice,
  onToggleItemSelection,
  showSelection = false,
  showDragHandles = true,
  showMoveButtons = true,
  enableCategoryCollapse = true,
  dragConstraints = {},
  className = '',
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<CollectionItem | null>(null);

  // Group items by category with proper ordering
  const categorizedItems = useMemo(() => {
    const categories: Record<ItemCategory, CollectionItem[]> = {
      PSA_CARD: [],
      RAW_CARD: [],
      SEALED_PRODUCT: [],
    };

    // Get items in the correct order
    const orderedItems =
      itemOrder.length > 0
        ? (itemOrder
            .map((id) => items.find((item) => item.id === id))
            .filter(Boolean) as CollectionItem[])
        : items;

    // Group by category while maintaining order
    orderedItems.forEach((item) => {
      const category = getItemCategory(item);
      categories[category].push(item);
    });

    return categories;
  }, [items, itemOrder]);

  // Get the active dragged item
  const activeItem = useMemo(() => {
    if (!activeId) {
      return null;
    }
    return items.find((item) => item.id === activeId) || null;
  }, [activeId, items]);

  // Handle drag start
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      setActiveId(active.id as string);

      const item = items.find((item) => item.id === active.id);
      setDraggedItem(item || null);
    },
    [items]
  );

  // Handle drag over (for visual feedback)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Could add visual feedback here if needed
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);
      setDraggedItem(null);

      if (!over || active.id === over.id) {
        return;
      }

      const activeItemId = active.id as string;
      const overItemId = over.id as string;

      // Check if drag operation is allowed
      const activeItem = items.find((item) => item.id === activeItemId);
      const overItem = items.find((item) => item.id === overItemId);

      if (!activeItem || !overItem) {
        return;
      }

      // Check category constraints
      const activeCategory = getItemCategory(activeItem);
      const overCategory = getItemCategory(overItem);

      if (
        !dragConstraints.allowCrossCategoryDrag &&
        activeCategory !== overCategory
      ) {
        return; // Don't allow cross-category dragging
      }

      // Check selection constraints
      if (dragConstraints.restrictToSelectedItems) {
        if (
          !selectedItemIds.includes(activeItemId) ||
          !selectedItemIds.includes(overItemId)
        ) {
          return; // Only allow dragging within selected items
        }
      }

      // Perform the reorder
      const currentOrder =
        itemOrder.length > 0 ? itemOrder : items.map((item) => item.id);
      const newOrder = reorderArray(currentOrder, activeItemId, overItemId);

      onReorderItems(newOrder);
    },
    [items, itemOrder, selectedItemIds, dragConstraints, onReorderItems]
  );

  // Create drag overlay content
  const dragOverlay = useMemo(() => {
    if (!draggedItem) {
      return null;
    }

    return (
      <div className="rotate-3 opacity-95">
        <SortableItemCard
          id={draggedItem.id}
          item={draggedItem}
          index={0}
          totalItems={1}
          isSelected={selectedItemIds.includes(draggedItem.id)}
          onToggleSelection={() => {}}
          onMoveUp={() => {}}
          onMoveDown={() => {}}
          showSelection={false}
          showMoveButtons={false}
          showDragHandle={false}
          showDragFeedback={false}
          className="shadow-2xl ring-2 ring-blue-500"
        />
      </div>
    );
  }, [draggedItem, selectedItemIds]);

  // Render category section
  const renderCategorySection = useCallback(
    (
      category: ItemCategory,
      categoryItems: CollectionItem[],
      categoryConfig: {
        title: string;
        icon: React.ComponentType<any>;
        color: string;
      }
    ) => {
      if (categoryItems.length === 0) {
        return null;
      }

      const categoryItemIds = categoryItems.map((item) => item.id);

      return (
        <div key={category} className="space-y-3">
          {/* Category Header */}
          <div className="flex items-center justify-between p-4 bg-zinc-900/50 border-b border-zinc-700 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                <categoryConfig.icon
                  className={`w-5 h-5 ${
                    categoryConfig.color === 'teal'
                      ? 'text-teal-400'
                      : categoryConfig.color === 'blue'
                        ? 'text-blue-400'
                        : 'text-purple-400'
                  }`}
                />
                <h5 className="text-sm font-bold text-white">
                  {categoryConfig.title} ({categoryItems.length})
                </h5>
              </div>
            </div>

            {/* Category Sort Controls */}
            <div className="flex items-center space-x-2">
              <select
                className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  categoryConfig.color === 'teal'
                    ? 'bg-teal-900/30 border border-teal-600/40 text-teal-300'
                    : categoryConfig.color === 'blue'
                      ? 'bg-blue-900/30 border border-blue-600/40 text-blue-300'
                      : 'bg-purple-900/30 border border-purple-600/40 text-purple-300'
                }`}
                onChange={(e) => {
                  if (e.target.value === 'price-high') {
                    onSortCategoryByPrice(category, false);
                  } else if (e.target.value === 'price-low') {
                    onSortCategoryByPrice(category, true);
                  }
                }}
              >
                <option value="order">Manual Order</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>

          {/* Sortable Items */}
          <SortableList items={categoryItemIds}>
            <div className="grid gap-2">
              {categoryItems.map((item, index) => (
                <SortableItemCard
                  key={item.id}
                  id={item.id}
                  item={item}
                  index={index}
                  totalItems={categoryItems.length}
                  isSelected={selectedItemIds.includes(item.id)}
                  onToggleSelection={onToggleItemSelection || (() => {})}
                  onMoveUp={onMoveItemUp}
                  onMoveDown={onMoveItemDown}
                  showSelection={showSelection}
                  showMoveButtons={showMoveButtons}
                  showDragHandle={showDragHandles}
                  dragConstraints={{
                    sameCategory: !dragConstraints.allowCrossCategoryDrag,
                    allowedCategories: [category],
                  }}
                  showDragFeedback={true}
                  className={`border-2 transition-all duration-200 cursor-move hover:shadow-md ${
                    categoryConfig.color === 'teal'
                      ? 'border-teal-200 hover:border-teal-300'
                      : categoryConfig.color === 'blue'
                        ? 'border-blue-200 hover:border-blue-300'
                        : 'border-purple-200 hover:border-purple-300'
                  }`}
                />
              ))}
            </div>
          </SortableList>
        </div>
      );
    },
    [
      selectedItemIds,
      onToggleItemSelection,
      onMoveItemUp,
      onMoveItemDown,
      onSortCategoryByPrice,
      showSelection,
      showMoveButtons,
      showDragHandles,
      dragConstraints,
    ]
  );

  // Category configurations
  const categoryConfigs = {
    PSA_CARD: {
      title: 'PSA Graded Cards',
      icon: Grid3X3,
      color: 'teal',
    },
    RAW_CARD: {
      title: 'Raw Cards',
      icon: Package,
      color: 'blue',
    },
    SEALED_PRODUCT: {
      title: 'Sealed Products',
      icon: Users,
      color: 'purple',
    },
  };

  return (
    <DragDropProvider
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      dragOverlay={dragOverlay}
    >
      <div className={`space-y-6 ${className}`}>
        {/* Drag Instructions */}
        <div className="flex items-center space-x-2 text-xs font-medium text-zinc-400 mb-4">
          <ArrowUpDown className="w-4 h-4" />
          <span>
            {dragConstraints.allowCrossCategoryDrag
              ? 'Drag to reorder items within and between categories'
              : 'Drag to reorder items within categories'}
          </span>
        </div>

        {/* Category Sections */}
        {Object.entries(categorizedItems).map(([category, categoryItems]) =>
          renderCategorySection(
            category as ItemCategory,
            categoryItems,
            categoryConfigs[category as ItemCategory]
          )
        )}

        {/* Summary */}
        {items.length > 0 && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-100">Ordering Summary</h4>
                <p className="text-sm text-blue-300">
                  {items.length} items across{' '}
                  {
                    Object.values(categorizedItems).filter(
                      (items) => items.length > 0
                    ).length
                  }{' '}
                  categories
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-300">
                  {dragConstraints.allowCrossCategoryDrag
                    ? 'Cross-category'
                    : 'Within-category'}{' '}
                  dragging enabled
                </p>
                <p className="text-xs text-blue-400">
                  {selectedItemIds.length} items selected
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropProvider>
  );
};

/**
 * Custom memo comparison function for SortableCategoryOrderingList
 * Optimizes re-rendering by performing shallow comparison on critical props
 */
const arePropsEqual = (
  prevProps: SortableCategoryOrderingListProps,
  nextProps: SortableCategoryOrderingListProps
): boolean => {
  return (
    prevProps.items === nextProps.items &&
    prevProps.itemOrder === nextProps.itemOrder &&
    prevProps.selectedItemIds === nextProps.selectedItemIds &&
    prevProps.showSelection === nextProps.showSelection &&
    prevProps.showDragHandles === nextProps.showDragHandles &&
    prevProps.showMoveButtons === nextProps.showMoveButtons &&
    prevProps.enableCategoryCollapse === nextProps.enableCategoryCollapse &&
    prevProps.className === nextProps.className &&
    JSON.stringify(prevProps.dragConstraints) ===
      JSON.stringify(nextProps.dragConstraints) &&
    prevProps.onReorderItems === nextProps.onReorderItems &&
    prevProps.onMoveItemUp === nextProps.onMoveItemUp &&
    prevProps.onMoveItemDown === nextProps.onMoveItemDown &&
    prevProps.onSortCategoryByPrice === nextProps.onSortCategoryByPrice &&
    prevProps.onToggleItemSelection === nextProps.onToggleItemSelection
  );
};

/**
 * Memoized SortableCategoryOrderingList component
 * Prevents unnecessary re-renders when props haven't changed
 */
export const SortableCategoryOrderingList = memo(
  SortableCategoryOrderingListComponent,
  arePropsEqual
);

export default SortableCategoryOrderingList;
