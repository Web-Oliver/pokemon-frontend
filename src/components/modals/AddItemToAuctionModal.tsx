/**
 * Add Item to Auction Modal Component
 * Refactored to use generic ItemSelectorModal following CLAUDE.md principles:
 * - Single Responsibility: Auction-specific item selection logic
 * - Open/Closed: Uses generic modal, extends for auction-specific features
 * - DRY: Eliminates duplicate modal UI code
 */

import React, { useMemo } from 'react';
import { Calendar, DollarSign, Star } from 'lucide-react';
import {
  FilterOption,
  ItemRenderProps,
  ItemSelectorModal,
  SelectableItem,
} from './ItemSelectorModal';
import { useCollectionOperations } from '../../hooks/useCollectionOperations';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';

interface AddItemToAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (
    items: { itemId: string; itemCategory: string }[]
  ) => Promise<void>;
  currentAuctionItems?: { itemId: string; itemCategory: string }[];
}

// Extend SelectableItem for collection items
type CollectionItem = SelectableItem & {
  itemType: 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
  setName?: string;
  dateAdded: string;
  grade?: number; // For PSA cards
  condition?: string; // For raw cards
} & (IPsaGradedCard | IRawCard | ISealedProduct);

const AddItemToAuctionModal: React.FC<AddItemToAuctionModalProps> = ({
  isOpen,
  onClose,
  onAddItems,
  currentAuctionItems = [],
}) => {
  const { psaCards, rawCards, sealedProducts, loading, error } =
    useCollectionOperations();

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) {
      return undefined;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:3000${imagePath}`;
  };

  // Create exclusion list for items already in auction
  const excludedItems = useMemo(
    () =>
      currentAuctionItems.map((item) => `${item.itemId}-${item.itemCategory}`),
    [currentAuctionItems]
  );

  // Transform collection items into SelectableItem format
  const collectionItems = useMemo(() => {
    const allItems: CollectionItem[] = [
      ...psaCards
        .filter((card) => !card.sold)
        .map((card) => ({
          ...card,
          id: card.id || (card as any)._id,
          itemType: 'PsaGradedCard' as const,
          displayName: `${(card as any).cardId?.cardName || (card as any).cardName || (card as any).baseName || 'Unknown Card'} - Grade ${card.grade}`,
          displayPrice: card.myPrice,
          displayImage: getImageUrl(card.images?.[0]),
          category: 'PSA Graded Card',
          setName: (card as any).setName,
          dateAdded: card.dateAdded,
          grade: card.grade,
        })),
      ...rawCards
        .filter((card) => !card.sold)
        .map((card) => ({
          ...card,
          id: card.id || (card as any)._id,
          itemType: 'RawCard' as const,
          displayName: `${(card as any).cardId?.cardName || (card as any).cardName || (card as any).baseName || 'Unknown Card'} - ${card.condition}`,
          displayPrice: card.myPrice,
          displayImage: getImageUrl(card.images?.[0]),
          category: 'Raw Card',
          setName: (card as any).setName,
          dateAdded: card.dateAdded,
          condition: card.condition,
        })),
      ...sealedProducts
        .filter((product) => !product.sold)
        .map((product) => ({
          ...product,
          id: product.id || (product as any)._id,
          itemType: 'SealedProduct' as const,
          displayName: `${product.name || 'Unknown Product'} - ${product.setName}`,
          displayPrice: product.myPrice,
          displayImage: getImageUrl(product.images?.[0]),
          category: 'Sealed Product',
          setName: product.setName,
          dateAdded: product.dateAdded,
        })),
    ];

    return allItems;
  }, [psaCards, rawCards, sealedProducts]);

  // Filter options for the modal
  const filterOptions: FilterOption[] = [
    { value: 'PsaGradedCard', label: 'PSA Graded Cards' },
    { value: 'RawCard', label: 'Raw Cards' },
    { value: 'SealedProduct', label: 'Sealed Products' },
  ];

  // Custom search filter
  const searchFilter = (item: CollectionItem, searchTerm: string) => {
    const term = searchTerm.toLowerCase();
    return (
      item.displayName.toLowerCase().includes(term) ||
      (item.setName && item.setName.toLowerCase().includes(term))
    );
  };

  // Custom category filter
  const categoryFilter = (item: CollectionItem, category: string) => {
    return item.itemType === category;
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  // Handle item selection
  const handleSelectItems = async (selectedItems: CollectionItem[]) => {
    const itemsToAdd = selectedItems.map((item) => ({
      itemId: item.id,
      itemCategory: item.itemType,
    }));

    await onAddItems(itemsToAdd);
  };

  // Custom item renderer with auction-specific styling
  const renderItem = ({
    item,
    isSelected,
    onToggle,
  }: ItemRenderProps<CollectionItem>) => (
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
            {isSelected && (
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
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
              <div className="mt-1 flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-900 dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 dark:text-zinc-100">
                  {item.category}
                </span>
                {item.itemType === 'PsaGradedCard' && item.grade && (
                  <span className="inline-flex items-center text-xs text-gray-600 dark:text-zinc-400 dark:text-zinc-300">
                    <Star className="w-3 h-3 mr-1" />
                    Grade {item.grade}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className="flex items-center text-sm font-medium text-gray-900 dark:text-zinc-100 dark:text-white">
                <DollarSign className="w-4 h-4 mr-1" />
                {new Intl.NumberFormat('da-DK', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(item.displayPrice)}{' '}
                kr.
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-zinc-500 dark:text-zinc-400 space-x-4">
            {item.setName && <span>Set: {item.setName}</span>}
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Added {formatDate(item.dateAdded)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ItemSelectorModal<CollectionItem>
      isOpen={isOpen}
      onClose={onClose}
      onSelectItems={handleSelectItems}
      items={collectionItems}
      loading={loading}
      error={error}
      excludedItems={excludedItems}
      title="Add Items to Auction"
      emptyStateMessage={'No unsold items available in your collection.'}
      searchPlaceholder="Search items by name or set..."
      filterOptions={filterOptions}
      renderItem={renderItem}
      searchFilter={searchFilter}
      categoryFilter={categoryFilter}
      allowMultipleSelection={true}
    />
  );
};

export default AddItemToAuctionModal;
