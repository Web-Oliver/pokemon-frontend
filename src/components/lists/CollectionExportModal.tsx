/**
 * Collection Export Modal Component
 *
 * Modal for selecting and exporting collection items
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles export modal UI and interactions
 * - Open/Closed: Extensible for different export types
 * - DRY: Reusable modal pattern with export-specific logic
 * - Layer 3: UI Building Block component
 */

import React from 'react';
import { Download } from 'lucide-react';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import { CollectionItem } from './CollectionItemCard';

export interface CollectionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CollectionItem[];
  selectedItemIds: string[];
  isExporting: boolean;
  onToggleItemSelection: (itemId: string) => void;
  onSelectAllItems: () => void;
  onClearSelection: () => void;
  onExportSelected: () => void;
}

export const CollectionExportModal: React.FC<CollectionExportModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedItemIds,
  isExporting,
  onToggleItemSelection,
  onSelectAllItems,
  onClearSelection,
  onExportSelected,
}) => {
  // Get item type for display
  const getItemType = (item: CollectionItem): string => {
    if ((item as any).grade !== undefined) {
      return 'PSA Graded';
    }
    if ((item as any).condition !== undefined) {
      return 'Raw Card';
    }
    return 'Sealed Product';
  };

  // Get item name for display
  const getItemName = (item: CollectionItem): string => {
    return (
      (item as any).cardId?.cardName ||
      (item as any).cardName ||
      (item as any).name ||
      'Unknown Item'
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Select Items to Export' maxWidth='2xl'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <p className='text-gray-600'>
            Select items from your collection to include in the Facebook text file export.
          </p>
          <div className='flex items-center space-x-2'>
            <button
              onClick={onSelectAllItems}
              className='text-blue-600 hover:text-blue-700 text-sm font-medium'
            >
              Select All
            </button>
            <span className='text-gray-300'>|</span>
            <button
              onClick={onClearSelection}
              className='text-gray-600 hover:text-gray-700 text-sm font-medium'
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Selected count */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <p className='text-blue-800 font-medium'>
            {selectedItemIds.length} items selected for export
          </p>
        </div>

        {/* Items list */}
        <div className='max-h-96 overflow-y-auto space-y-2'>
          {items.map(item => {
            const itemId = item.id;
            const isSelected = selectedItemIds.includes(itemId);
            const itemType = getItemType(item);
            const itemName = getItemName(item);

            return (
              <div
                key={itemId}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onToggleItemSelection(itemId)}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={isSelected}
                      onChange={() => onToggleItemSelection(itemId)}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3'
                    />
                    <div>
                      <h4 className='font-medium text-gray-900'>{itemName}</h4>
                      <p className='text-sm text-gray-500'>
                        {itemType} • {item.myPrice || '0'} kr.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      itemType === 'PSA Graded'
                        ? 'bg-blue-100 text-blue-800'
                        : itemType === 'Raw Card'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {itemType}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Export actions */}
        <div className='flex items-center justify-end space-x-3 pt-4 border-t border-gray-200'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={onExportSelected}
            disabled={selectedItemIds.length === 0 || isExporting}
            className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center'
          >
            {isExporting ? (
              <LoadingSpinner size='sm' className='mr-2' />
            ) : (
              <Download className='w-4 h-4 mr-2' />
            )}
            Export Selected ({selectedItemIds.length})
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CollectionExportModal;
