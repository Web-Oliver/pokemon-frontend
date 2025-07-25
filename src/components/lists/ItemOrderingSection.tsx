/**
 * Item Ordering Section Component
 *
 * Main ordering interface container with global controls and category display
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles main ordering interface orchestration
 * - Open/Closed: Extensible for different ordering methods and display modes
 * - DRY: Reuses existing components and consolidates ordering logic
 * - Layer 3: UI Building Block component
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  RotateCcw,
  List,
  Grid3X3,
  SortAsc,
  SortDesc,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { CategoryOrderingList } from './CategoryOrderingList';
import { SortableCategoryOrderingList } from './SortableCategoryOrderingList';
import { CollectionItem, ItemCategory, SortMethod } from '../../domain/models/ordering';

export interface ItemOrderingSectionProps {
  items: CollectionItem[];
  itemOrder: string[];
  selectedItemIds: string[];
  lastSortMethod: SortMethod;
  onReorderItems: (newOrder: string[]) => void;
  onMoveItemUp: (itemId: string) => void;
  onMoveItemDown: (itemId: string) => void;
  onAutoSortByPrice: (ascending?: boolean) => void;
  onSortCategoryByPrice: (category: ItemCategory, ascending?: boolean) => void;
  onResetOrder: () => void;
  onToggleItemSelection?: (itemId: string) => void;
  showSelection?: boolean;
  className?: string;
}

type ViewMode = 'categories' | 'list';
type SortDirection = 'asc' | 'desc' | null;

const ItemOrderingSectionComponent: React.FC<ItemOrderingSectionProps> = ({
  items,
  itemOrder,
  selectedItemIds,
  lastSortMethod,
  onReorderItems,
  onMoveItemUp,
  onMoveItemDown,
  onAutoSortByPrice,
  onSortCategoryByPrice,
  onResetOrder,
  onToggleItemSelection,
  showSelection = false,
  className = '',
}) => {
  // Local state for UI controls
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  // Determine current sort direction from last sort method
  const currentSortDirection: SortDirection = useMemo(() => {
    if (lastSortMethod === 'price_asc') return 'asc';
    if (lastSortMethod === 'price_desc') return 'desc';
    return null;
  }, [lastSortMethod]);

  // Calculate ordering stats
  const orderingStats = useMemo(() => {
    const totalItems = items.length;
    const selectedCount = selectedItemIds.length;
    const isCustomOrdered = itemOrder.length > 0 && lastSortMethod === 'manual';
    const isPriceSorted = lastSortMethod === 'price_asc' || lastSortMethod === 'price_desc';

    return {
      totalItems,
      selectedCount,
      isCustomOrdered,
      isPriceSorted,
      hasOrdering: itemOrder.length > 0,
    };
  }, [items.length, selectedItemIds.length, itemOrder.length, lastSortMethod]);

  // Event handlers
  const handleGlobalSortByPrice = useCallback((ascending: boolean) => {
    onAutoSortByPrice(ascending);
  }, [onAutoSortByPrice]);

  const handleResetOrder = useCallback(() => {
    onResetOrder();
  }, [onResetOrder]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const toggleAdvancedControls = useCallback(() => {
    setShowAdvancedControls(prev => !prev);
  }, []);

  // Render global controls header
  const renderGlobalControls = useCallback(() => {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-sm">
        <div className="p-6 border-b border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Item Ordering
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Arrange your items in the order they should appear in exports
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-zinc-900 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('categories')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'categories'
                      ? 'bg-zinc-700 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4 mr-2 inline" />
                  Categories
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-zinc-700 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4 mr-2 inline" />
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Controls */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            {/* Sort Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-zinc-300">
                  Sort by price:
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleGlobalSortByPrice(false)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      currentSortDirection === 'desc'
                        ? 'bg-blue-900/20 border-blue-800 text-blue-300'
                        : 'bg-zinc-900 border-zinc-600 text-zinc-300 hover:bg-zinc-800'
                    }`}
                    title="Sort by highest price first"
                  >
                    <SortDesc className="w-4 h-4 mr-1 inline" />
                    High to Low
                  </button>
                  <button
                    onClick={() => handleGlobalSortByPrice(true)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      currentSortDirection === 'asc'
                        ? 'bg-blue-900/20 border-blue-800 text-blue-300'
                        : 'bg-zinc-900 border-zinc-600 text-zinc-300 hover:bg-zinc-800'
                    }`}
                    title="Sort by lowest price first"
                  >
                    <SortAsc className="w-4 h-4 mr-1 inline" />
                    Low to High
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetOrder}
                disabled={!orderingStats.hasOrdering}
                className="px-3 py-2 bg-zinc-900 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset to original order"
              >
                <RotateCcw className="w-4 h-4 mr-2 inline" />
                Reset Order
              </button>
            </div>

            {/* Advanced Controls Toggle */}
            <button
              onClick={toggleAdvancedControls}
              className="px-3 py-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              {showAdvancedControls ? 'Hide' : 'Show'} Options
            </button>
          </div>

          {/* Advanced Controls */}
          {showAdvancedControls && (
            <div className="mt-4 pt-4 border-t border-zinc-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showSelection}
                      readOnly
                      className="w-4 h-4 text-blue-600 bg-zinc-800 border-zinc-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-zinc-300">
                      Show selection checkboxes
                    </span>
                  </label>
                </div>

                <div className="text-sm text-emerald-400">
                  ✓ Drag & drop enabled - Use handles to reorder items
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-zinc-900/50 border-t border-zinc-700 rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-zinc-400">
                {orderingStats.totalItems} total items
              </span>
              {orderingStats.selectedCount > 0 && (
                <span className="text-blue-400">
                  {orderingStats.selectedCount} selected
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {orderingStats.isPriceSorted && (
                <span className="text-green-400">
                  ✓ Sorted by price ({currentSortDirection === 'asc' ? 'ascending' : 'descending'})
                </span>
              )}
              {orderingStats.isCustomOrdered && (
                <span className="text-blue-400">
                  ✓ Custom order applied
                </span>
              )}
              {!orderingStats.hasOrdering && (
                <span className="text-zinc-500">
                  Using default order
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    viewMode,
    currentSortDirection,
    orderingStats,
    showAdvancedControls,
    showSelection,
    handleViewModeChange,
    handleGlobalSortByPrice,
    handleResetOrder,
    toggleAdvancedControls,
  ]);

  if (items.length === 0) {
    return (
      <div className={`${className}`}>
        {renderGlobalControls()}
        <div className="mt-6 text-center py-12 bg-zinc-800 border border-zinc-700 rounded-lg">
          <ArrowUpDown className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No items to order
          </h3>
          <p className="text-zinc-400">
            Items you select for export will appear here where you can reorder them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {renderGlobalControls()}

      {/* Ordering Content */}
      {viewMode === 'categories' ? (
        <SortableCategoryOrderingList
          items={items}
          itemOrder={itemOrder}
          selectedItemIds={selectedItemIds}
          onReorderItems={onReorderItems}
          onMoveItemUp={onMoveItemUp}
          onMoveItemDown={onMoveItemDown}
          onSortCategoryByPrice={onSortCategoryByPrice}
          onToggleItemSelection={onToggleItemSelection}
          showSelection={showSelection}
          showDragHandles={true} // Now enabled with drag & drop implementation
          showMoveButtons={true}
          enableCategoryCollapse={true}
          dragConstraints={{
            allowCrossCategoryDrag: false, // Restrict to same category for better UX
            restrictToSelectedItems: false,
          }}
        />
      ) : (
        // List view - simplified single list (future implementation)
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
          <p className="text-center text-zinc-400 py-8">
            List view will be available in a future update. Use Categories view for now.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Custom memo comparison function for ItemOrderingSection
 * Optimizes re-rendering by performing shallow comparison on critical props
 */
const arePropsEqual = (
  prevProps: ItemOrderingSectionProps,
  nextProps: ItemOrderingSectionProps
): boolean => {
  return (
    prevProps.items === nextProps.items &&
    prevProps.itemOrder === nextProps.itemOrder &&
    prevProps.selectedItemIds === nextProps.selectedItemIds &&
    prevProps.lastSortMethod === nextProps.lastSortMethod &&
    prevProps.showSelection === nextProps.showSelection &&
    prevProps.className === nextProps.className &&
    prevProps.onReorderItems === nextProps.onReorderItems &&
    prevProps.onMoveItemUp === nextProps.onMoveItemUp &&
    prevProps.onMoveItemDown === nextProps.onMoveItemDown &&
    prevProps.onAutoSortByPrice === nextProps.onAutoSortByPrice &&
    prevProps.onSortCategoryByPrice === nextProps.onSortCategoryByPrice &&
    prevProps.onResetOrder === nextProps.onResetOrder &&
    prevProps.onToggleItemSelection === nextProps.onToggleItemSelection
  );
};

/**
 * Memoized ItemOrderingSection component
 * Prevents unnecessary re-renders when props haven't changed
 */
export const ItemOrderingSection = memo(
  ItemOrderingSectionComponent,
  arePropsEqual
);

export default ItemOrderingSection;