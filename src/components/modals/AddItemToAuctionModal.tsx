/**
 * Add Item to Auction Modal Component
 * Phase 9.2 - Implement Add Item to Auction Modal
 * Allows browsing and selecting collection items to add to auctions
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Package, Star, Calendar, DollarSign, Check } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import LoadingSpinner from '../common/LoadingSpinner';
import { useCollectionOperations } from '../../hooks/useCollectionOperations';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';

interface AddItemToAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: { itemId: string; itemCategory: string }[]) => Promise<void>;
  currentAuctionItems?: { itemId: string; itemCategory: string }[];
}

type CollectionItem = (IPsaGradedCard | IRawCard | ISealedProduct) & {
  itemType: 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
  displayName: string;
  displayPrice: number;
  displayImage?: string;
};

const AddItemToAuctionModal: React.FC<AddItemToAuctionModalProps> = ({
  isOpen,
  onClose,
  onAddItems,
  currentAuctionItems = [],
}) => {
  const { psaCards, rawCards, sealedProducts, loading, error } = useCollectionOperations();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filteredItems, setFilteredItems] = useState<CollectionItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) {
      return undefined;
    }
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // If it's a relative path, prepend the backend server URL
    return `http://localhost:3000${imagePath}`;
  };

  // Create a set of items already in auction for quick lookup (memoized to prevent infinite loop)
  const auctionItemsSet = useMemo(
    () => new Set(currentAuctionItems.map(item => `${item.itemId}-${item.itemCategory}`)),
    [currentAuctionItems]
  );

  // Combine all collection items into a unified format
  useEffect(() => {
    const allItems: CollectionItem[] = [
      ...psaCards
        .filter(card => !card.sold)
        .filter(card => !auctionItemsSet.has(`${card.id || (card as any)._id}-PsaGradedCard`))
        .map(card => ({
          ...card,
          itemType: 'PsaGradedCard' as const,
          displayName: `${(card as any).cardId?.cardName || (card as any).cardName || (card as any).baseName || 'Unknown Card'} - Grade ${card.grade}`,
          displayPrice: card.myPrice,
          displayImage: getImageUrl(card.images?.[0]),
        })),
      ...rawCards
        .filter(card => !card.sold)
        .filter(card => !auctionItemsSet.has(`${card.id || (card as any)._id}-RawCard`))
        .map(card => ({
          ...card,
          itemType: 'RawCard' as const,
          displayName: `${(card as any).cardId?.cardName || (card as any).cardName || (card as any).baseName || 'Unknown Card'} - ${card.condition}`,
          displayPrice: card.myPrice,
          displayImage: getImageUrl(card.images?.[0]),
        })),
      ...sealedProducts
        .filter(product => !product.sold)
        .filter(
          product => !auctionItemsSet.has(`${product.id || (product as any)._id}-SealedProduct`)
        )
        .map(product => ({
          ...product,
          itemType: 'SealedProduct' as const,
          displayName: `${product.name || 'Unknown Product'} - ${product.setName}`,
          displayPrice: product.myPrice,
          displayImage: getImageUrl(product.images?.[0]),
        })),
    ];

    // Apply filters
    let filtered = allItems;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.displayName.toLowerCase().includes(term) ||
          (item.setName && item.setName.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.itemType === filterCategory);
    }

    // Sort by display name
    filtered.sort((a, b) => a.displayName.localeCompare(b.displayName));

    setFilteredItems(filtered);
  }, [psaCards, rawCards, sealedProducts, searchTerm, filterCategory, auctionItemsSet]);

  // Format currency
  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('da-DK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} kr.`;
  };

  // Format date
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

  // Get item category color
  const getItemCategoryColor = (category: string) => {
    switch (category) {
      case 'PsaGradedCard':
        return 'bg-purple-100 text-purple-800';
      case 'RawCard':
        return 'bg-blue-100 text-blue-800';
      case 'SealedProduct':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format item category for display
  const formatItemCategory = (category: string) => {
    switch (category) {
      case 'PsaGradedCard':
        return 'PSA Graded';
      case 'RawCard':
        return 'Raw Card';
      case 'SealedProduct':
        return 'Sealed Product';
      default:
        return category;
    }
  };

  // Handle item selection
  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)));
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (selectedItems.size === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsToAdd = Array.from(selectedItems).map(itemId => {
        const item = filteredItems.find(i => i.id === itemId);
        return {
          itemId,
          itemCategory: item?.itemType || 'PsaGradedCard',
        };
      });

      await onAddItems(itemsToAdd);
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title='Add Items to Auction' maxWidth='2xl'>
      <div className='space-y-6'>
        {/* Search and Filters */}
        <div className='space-y-4'>
          <div className='flex items-center space-x-4'>
            <div className='flex-1'>
              <Input
                type='text'
                placeholder='Search items by name or set...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full'
                startIcon={<Search className='w-4 h-4 text-gray-400' />}
              />
            </div>
            <div className='w-48'>
              <Select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'PsaGradedCard', label: 'PSA Graded Cards' },
                  { value: 'RawCard', label: 'Raw Cards' },
                  { value: 'SealedProduct', label: 'Sealed Products' },
                ]}
              />
            </div>
          </div>

          {/* Selection Controls */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Button
                onClick={handleSelectAll}
                variant='outline'
                size='sm'
                disabled={filteredItems.length === 0}
              >
                {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className='text-sm text-gray-600'>
                {selectedItems.size} of {filteredItems.length} items selected
              </span>
            </div>
            <span className='text-sm text-gray-600'>{filteredItems.length} items available</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className='py-12'>
            <LoadingSpinner text='Loading collection items...' />
          </div>
        ) : error ? (
          <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
            <p className='text-sm text-red-600'>{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className='py-12 text-center'>
            <Package className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No items found</h3>
            <p className='text-gray-600'>
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No unsold items available in your collection.'}
            </p>
          </div>
        ) : (
          <div className='max-h-96 overflow-y-auto border border-gray-200 rounded-lg'>
            <div className='divide-y divide-gray-200'>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedItems.has(item.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleItemToggle(item.id)}
                >
                  <div className='flex items-start space-x-4'>
                    {/* Selection Checkbox */}
                    <div className='flex-shrink-0 mt-1'>
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedItems.has(item.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedItems.has(item.id) && <Check className='w-3 h-3 text-white' />}
                      </div>
                    </div>

                    {/* Item Image */}
                    {item.displayImage && (
                      <div className='flex-shrink-0'>
                        <img
                          src={item.displayImage}
                          alt={item.displayName}
                          className='w-16 h-16 object-cover rounded-lg border border-gray-200'
                        />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1 min-w-0'>
                          <h4 className='text-sm font-medium text-gray-900 truncate'>
                            {item.displayName}
                          </h4>
                          <div className='mt-1 flex items-center space-x-2'>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getItemCategoryColor(item.itemType)}`}
                            >
                              {formatItemCategory(item.itemType)}
                            </span>
                            {item.itemType === 'PsaGradedCard' && (
                              <span className='inline-flex items-center text-xs text-gray-600'>
                                <Star className='w-3 h-3 mr-1' />
                                Grade {(item as IPsaGradedCard).grade}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='ml-4 text-right'>
                          <div className='flex items-center text-sm font-medium text-gray-900'>
                            <DollarSign className='w-4 h-4 mr-1' />
                            {formatCurrency(item.displayPrice)}
                          </div>
                        </div>
                      </div>

                      <div className='mt-2 flex items-center text-xs text-gray-500 space-x-4'>
                        {item.setName && <span>Set: {item.setName}</span>}
                        <span className='flex items-center'>
                          <Calendar className='w-3 h-3 mr-1' />
                          Added {formatDate(item.dateAdded)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='flex items-center justify-end space-x-3 pt-4 border-t'>
          <Button onClick={handleClose} variant='outline' disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedItems.size === 0 || isSubmitting}
            className='min-w-[120px]'
          >
            {isSubmitting ? (
              <div className='flex items-center'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                Adding...
              </div>
            ) : (
              `Add ${selectedItems.size} Item${selectedItems.size !== 1 ? 's' : ''}`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddItemToAuctionModal;
