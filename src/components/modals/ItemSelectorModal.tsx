/**
 * Generic Item Selector Modal Component
 * Following CLAUDE.md principles:
 * - Single Responsibility: Generic item selection functionality
 * - Open/Closed: Extensible for different item types through generics and render props
 * - DRY: Eliminates duplicate modal logic across different selection scenarios
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Check, Package, Search } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import LoadingSpinner from '../common/LoadingSpinner';

// Generic item interface that all selectable items must extend
export interface SelectableItem {
  id: string;
  displayName: string;
  displayPrice?: number;
  displayImage?: string;
  category?: string;
  [key: string]: any; // Allow additional properties
}

// Filter option interface
export interface FilterOption {
  value: string;
  label: string;
}

// Render props for item display
export interface ItemRenderProps<T extends SelectableItem> {
  item: T;
  isSelected: boolean;
  onToggle: (itemId: string) => void;
}

// Generic props interface
export interface ItemSelectorModalProps<T extends SelectableItem> {
  /** Whether modal is open */
  isOpen: boolean;
  /** Function to close modal */
  onClose: () => void;
  /** Function called when items are selected */
  onSelectItems: (items: T[]) => Promise<void>;
  /** Array of items to choose from */
  items: T[];
  /** Loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Items to exclude from selection (already selected elsewhere) */
  excludedItems?: string[];
  /** Modal title */
  title: string;
  /** Empty state message */
  emptyStateMessage?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Filter options for categorizing items */
  filterOptions?: FilterOption[];
  /** Custom render function for each item */
  renderItem?: (props: ItemRenderProps<T>) => React.ReactNode;
  /** Custom filter function for search */
  searchFilter?: (item: T, searchTerm: string) => boolean;
  /** Custom filter function for category filtering */
  categoryFilter?: (item: T, category: string) => boolean;
  /** Maximum number of items that can be selected */
  maxSelection?: number;
  /** Whether multiple selection is allowed */
  allowMultipleSelection?: boolean;
}

/**
 * Generic Item Selector Modal
 * Can be used for selecting any type of items (collection items, users, etc.)
 */
export function ItemSelectorModal<T extends SelectableItem>({
  isOpen,
  onClose,
  onSelectItems,
  items,
  loading = false,
  error,
  excludedItems = [],
  title,
  emptyStateMessage = 'No items found',
  searchPlaceholder = 'Search items...',
  filterOptions = [],
  renderItem,
  searchFilter,
  categoryFilter,
  maxSelection,
  allowMultipleSelection = true,
}: ItemSelectorModalProps<T>) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create exclusion set for performance
  const excludedSet = useMemo(() => new Set(excludedItems), [excludedItems]);

  // Filter and process items
  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => !excludedSet.has(item.id));

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      if (searchFilter) {
        filtered = filtered.filter((item) => searchFilter(item, term));
      } else {
        // Default search implementation
        filtered = filtered.filter(
          (item) =>
            item.displayName.toLowerCase().includes(term) ||
            (item.category && item.category.toLowerCase().includes(term))
        );
      }
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      if (categoryFilter) {
        filtered = filtered.filter((item) =>
          categoryFilter(item, filterCategory)
        );
      } else {
        // Default category filtering
        filtered = filtered.filter((item) => item.category === filterCategory);
      }
    }

    // Sort by display name
    filtered.sort((a, b) => a.displayName.localeCompare(b.displayName));

    return filtered;
  }, [
    items,
    excludedSet,
    searchTerm,
    filterCategory,
    searchFilter,
    categoryFilter,
  ]);

  // Default item renderer
  const defaultRenderItem = ({
    item,
    isSelected,
    onToggle,
  }: ItemRenderProps<T>) => (
    <div
      key={item.id}
      className={`p-4 hover:bg-gray-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
      onClick={() => onToggle(item.id)}
    >
      <div className="flex items-start space-x-4">
        {/* Selection Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}
          >
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>

        {/* Item Image */}
        {item.displayImage && (
          <div className="flex-shrink-0">
            <img
              src={item.displayImage}
              alt={item.displayName}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-zinc-700 dark:border-zinc-700"
            />
          </div>
        )}

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-zinc-100 dark:text-white truncate">
                {item.displayName}
              </h4>
              {item.category && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-900 dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 dark:text-zinc-100">
                    {item.category}
                  </span>
                </div>
              )}
            </div>
            {item.displayPrice !== undefined && (
              <div className="ml-4 text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-zinc-100 dark:text-white">
                  {new Intl.NumberFormat('da-DK', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(item.displayPrice)}{' '}
                  kr.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Handle item selection
  const handleItemToggle = (itemId: string) => {
    if (!allowMultipleSelection) {
      // Single selection mode
      setSelectedItems(new Set([itemId]));
      return;
    }

    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      // Check max selection limit
      if (maxSelection && newSelected.size >= maxSelection) {
        return; // Don't add if limit reached
      }
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (!allowMultipleSelection) {
      return;
    }

    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      const itemsToSelect = maxSelection
        ? filteredItems.slice(0, maxSelection)
        : filteredItems;
      setSelectedItems(new Set(itemsToSelect.map((item) => item.id)));
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (selectedItems.size === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedItemObjects = Array.from(selectedItems)
        .map((itemId) => filteredItems.find((item) => item.id === itemId))
        .filter((item): item is T => item !== undefined);

      await onSelectItems(selectedItemObjects);
      setSelectedItems(new Set());
      onClose();
    } catch (err) {
      // Error handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedItems(new Set());
      setSearchTerm('');
      setFilterCategory('all');
    }
  }, [isOpen]);

  const selectedCount = selectedItems.size;
  const canSelectMore = !maxSelection || selectedCount < maxSelection;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="2xl">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                startIcon={
                  <Search className="w-4 h-4 text-gray-400 dark:text-zinc-600 dark:text-zinc-500" />
                }
              />
            </div>
            {filterOptions.length > 0 && (
              <div className="w-48">
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Categories' },
                    ...filterOptions,
                  ]}
                />
              </div>
            )}
          </div>

          {/* Selection Controls */}
          {allowMultipleSelection && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleSelectAll}
                  variant="outline"
                  size="sm"
                  disabled={filteredItems.length === 0}
                >
                  {selectedCount === filteredItems.length
                    ? 'Deselect All'
                    : 'Select All'}
                </Button>
                <span className="text-sm text-gray-600 dark:text-zinc-400 dark:text-zinc-300">
                  {selectedCount} of {filteredItems.length} items selected
                  {maxSelection && ` (max ${maxSelection})`}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-zinc-400 dark:text-zinc-300">
                {filteredItems.length} items available
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12">
            <LoadingSpinner text="Loading items..." />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-400 dark:text-zinc-600 dark:text-zinc-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100 dark:text-white mb-2">
              No items found
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 dark:text-zinc-300">
              {emptyStateMessage}
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-zinc-700 dark:border-zinc-700 rounded-lg">
            <div className="divide-y divide-gray-200 dark:divide-zinc-700">
              {filteredItems.map((item) => {
                const isSelected = selectedItems.has(item.id);
                const renderFunction = renderItem || defaultRenderItem;
                return renderFunction({
                  item,
                  isSelected,
                  onToggle: handleItemToggle,
                });
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedCount === 0 || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white dark:border-zinc-700 dark:border-zinc-800 border-t-transparent rounded-full animate-spin mr-2" />
                Selecting...
              </div>
            ) : (
              `Select ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ItemSelectorModal;
