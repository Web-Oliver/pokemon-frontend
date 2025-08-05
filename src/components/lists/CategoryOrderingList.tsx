/**
 * Category Ordering List Component
 *
 * Groups collection items by category and provides category-specific ordering
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles category-based item ordering and display
 * - Open/Closed: Extensible for different ordering methods and display options
 * - DRY: Reuses existing components and utilities
 * - Layer 3: UI Building Block component
 */

import React, { memo, useCallback, useMemo } from 'react';
import {
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Package,
  Star,
} from 'lucide-react';
import { OrderableItemCard } from './OrderableItemCard';
import { CollectionItem, ItemCategory } from '../../domain/models/ordering';
import {
  applyItemOrder,
  getItemCategory,
  groupItemsByCategory,
} from '../../utils/orderingUtils';

export interface CategoryOrderingListProps {
  items: CollectionItem[];
  itemOrder: string[];
  selectedItemIds?: string[];
  onReorderItems: (newOrder: string[]) => void;
  onMoveItemUp: (itemId: string) => void;
  onMoveItemDown: (itemId: string) => void;
  onSortCategoryByPrice: (category: ItemCategory, ascending?: boolean) => void;
  onToggleItemSelection?: (itemId: string) => void;
  showSelection?: boolean;
  showDragHandles?: boolean;
  enableCategoryCollapse?: boolean;
  className?: string;
}

interface CategoryConfig {
  title: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const CATEGORY_CONFIGS: Record<ItemCategory, CategoryConfig> = {
  PSA_CARD: {
    title: 'PSA Graded Cards',
    icon: Star,
    description: 'Professional graded cards with PSA certification',
    color: 'blue',
  },
  RAW_CARD: {
    title: 'Raw Cards',
    icon: Archive,
    description: 'Ungraded cards in various conditions',
    color: 'green',
  },
  SEALED_PRODUCT: {
    title: 'Sealed Products',
    icon: Package,
    description: 'Booster packs, boxes, and other sealed items',
    color: 'purple',
  },
};

const CategoryOrderingListComponent: React.FC<CategoryOrderingListProps> = ({
  items,
  itemOrder,
  selectedItemIds = [],
  onReorderItems,
  onMoveItemUp,
  onMoveItemDown,
  onSortCategoryByPrice,
  onToggleItemSelection,
  showSelection = false,
  showDragHandles = false,
  enableCategoryCollapse = true,
  className = '',
}) => {
  // Group items by category and apply ordering
  const categorizedItems = useMemo(() => {
    const orderedItems =
      itemOrder.length > 0 ? applyItemOrder(items, itemOrder) : items;

    // Re-group the ordered items to maintain order within categories
    const orderedGrouped: Record<ItemCategory, CollectionItem[]> = {
      PSA_CARD: [],
      RAW_CARD: [],
      SEALED_PRODUCT: [],
    };

    orderedItems.forEach((item) => {
      const category = getItemCategory(item);
      orderedGrouped[category].push(item);
    });

    return orderedGrouped;
  }, [items, itemOrder]);

  // Category collapse state
  const [collapsedCategories, setCollapsedCategories] = React.useState<
    Set<ItemCategory>
  >(new Set());

  // Toggle category collapse
  const toggleCategoryCollapse = useCallback(
    (category: ItemCategory) => {
      if (!enableCategoryCollapse) {
        return;
      }

      setCollapsedCategories((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(category)) {
          newSet.delete(category);
        } else {
          newSet.add(category);
        }
        return newSet;
      });
    },
    [enableCategoryCollapse]
  );

  // Get item index in global order
  const getItemIndex = useCallback(
    (itemId: string): number => {
      if (itemOrder.length === 0) {
        return items.findIndex((item) => item.id === itemId);
      }
      return itemOrder.indexOf(itemId);
    },
    [itemOrder, items]
  );

  // Category sort handlers
  const handleSortCategory = useCallback(
    (category: ItemCategory, ascending: boolean) => {
      onSortCategoryByPrice(category, ascending);
    },
    [onSortCategoryByPrice]
  );

  // Render category header
  const renderCategoryHeader = useCallback(
    (category: ItemCategory, categoryItems: CollectionItem[]) => {
      const config = CATEGORY_CONFIGS[category];
      const Icon = config.icon;
      const isCollapsed = collapsedCategories.has(category);
      const itemCount = categoryItems.length;

      if (itemCount === 0) {
        return null;
      }

      return (
        <div className="flex items-center justify-between p-4 bg-zinc-900/50 border-b border-zinc-700 rounded-t-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleCategoryCollapse(category)}
              className="flex items-center space-x-2 hover:bg-zinc-800 p-2 rounded-lg transition-colors"
              disabled={!enableCategoryCollapse}
            >
              <div
                className={`p-2 rounded-lg ${
                  config.color === 'blue'
                    ? 'bg-blue-100 dark:bg-blue-900/50'
                    : config.color === 'green'
                      ? 'bg-green-100 dark:bg-green-900/50'
                      : 'bg-purple-100 dark:bg-purple-900/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    config.color === 'blue'
                      ? 'text-blue-600 dark:text-blue-400'
                      : config.color === 'green'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-purple-600 dark:text-purple-400'
                  }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {config.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} •{' '}
                  {config.description}
                </p>
              </div>
              {enableCategoryCollapse && (
                <ArrowUpDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sort by price controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleSortCategory(category, false)}
                className="p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Sort by highest price first"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleSortCategory(category, true)}
                className="p-2 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Sort by lowest price first"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>

            {/* Category stats */}
            <div className="text-sm text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
      );
    },
    [
      collapsedCategories,
      enableCategoryCollapse,
      toggleCategoryCollapse,
      handleSortCategory,
    ]
  );

  // Render category items
  const renderCategoryItems = useCallback(
    (category: ItemCategory, categoryItems: CollectionItem[]) => {
      const isCollapsed = collapsedCategories.has(category);

      if (isCollapsed || categoryItems.length === 0) {
        return null;
      }

      return (
        <div className="p-4 space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categoryItems.map((item) => {
              const itemIndex = getItemIndex(item.id);
              const isSelected = selectedItemIds.includes(item.id);

              return (
                <OrderableItemCard
                  key={item.id}
                  item={item}
                  index={itemIndex}
                  isSelected={isSelected}
                  onMoveUp={onMoveItemUp}
                  onMoveDown={onMoveItemDown}
                  onToggleSelection={onToggleItemSelection}
                  showMoveButtons={true}
                  showDragHandle={showDragHandles}
                  showSelection={showSelection}
                  className="w-full"
                />
              );
            })}
          </div>
        </div>
      );
    },
    [
      collapsedCategories,
      getItemIndex,
      selectedItemIds,
      onMoveItemUp,
      onMoveItemDown,
      onToggleItemSelection,
      showDragHandles,
      showSelection,
    ]
  );

  // Get categories with items (in display order)
  const categoriesWithItems = useMemo(() => {
    return Object.entries(categorizedItems)
      .filter(([_, items]) => items.length > 0)
      .map(([category, items]) => ({
        category: category as ItemCategory,
        items,
      }));
  }, [categorizedItems]);

  if (categoriesWithItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-400 dark:text-zinc-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No items to order
        </h3>
        <p className="text-gray-500 dark:text-zinc-400">
          Select some items to see them organized by category here.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {categoriesWithItems.map(({ category, items: categoryItems }) => (
        <div
          key={category}
          className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-sm"
        >
          {renderCategoryHeader(category, categoryItems)}
          {renderCategoryItems(category, categoryItems)}
        </div>
      ))}

      {/* Summary */}
      <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-100">Ordering Summary</h4>
            <p className="text-sm text-blue-300">
              {items.length} items across {categoriesWithItems.length}{' '}
              categories
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              {selectedItemIds.length > 0 &&
                `${selectedItemIds.length} selected • `}
              Use the arrow buttons to reorder items within each category
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Custom memo comparison function for CategoryOrderingList
 * Optimizes re-rendering by performing shallow comparison on critical props
 */
const arePropsEqual = (
  prevProps: CategoryOrderingListProps,
  nextProps: CategoryOrderingListProps
): boolean => {
  return (
    prevProps.items === nextProps.items &&
    prevProps.itemOrder === nextProps.itemOrder &&
    prevProps.selectedItemIds === nextProps.selectedItemIds &&
    prevProps.showSelection === nextProps.showSelection &&
    prevProps.showDragHandles === nextProps.showDragHandles &&
    prevProps.enableCategoryCollapse === nextProps.enableCategoryCollapse &&
    prevProps.className === nextProps.className &&
    prevProps.onReorderItems === nextProps.onReorderItems &&
    prevProps.onMoveItemUp === nextProps.onMoveItemUp &&
    prevProps.onMoveItemDown === nextProps.onMoveItemDown &&
    prevProps.onSortCategoryByPrice === nextProps.onSortCategoryByPrice &&
    prevProps.onToggleItemSelection === nextProps.onToggleItemSelection
  );
};

/**
 * Memoized CategoryOrderingList component
 * Prevents unnecessary re-renders when props haven't changed
 */
export const CategoryOrderingList = memo(
  CategoryOrderingListComponent,
  arePropsEqual
);

export default CategoryOrderingList;
