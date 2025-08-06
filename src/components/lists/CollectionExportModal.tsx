/**
 * Unified Collection Export Modal Component
 *
 * Modal for selecting and exporting collection items with multiple format support
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles export modal UI and interactions
 * - Open/Closed: Extensible for different export types and formats
 * - DRY: Consolidated export modal eliminating format-specific duplicates
 * - Layer 3: UI Building Block component
 */

import React, { useState } from 'react';
import { ArrowUpDown, Download, FileText, Image, Package } from 'lucide-react';
import { PokemonModal } from '../../shared/components/atoms/design-system/PokemonModal';
import LoadingSpinner from '../../shared/components/molecules/common/LoadingSpinner';
import { CollectionItem } from './CollectionItemCard';
import {
  ExportFormat,
  OrderedExportRequest,
} from '../../interfaces/api/IExportApiService';
import { ItemOrderingSection } from './ItemOrderingSection';
import { ItemCategory, SortMethod } from '../../domain/models/ordering';

export interface CollectionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CollectionItem[];
  selectedItemIds: string[];
  isExporting: boolean;
  onToggleItemSelection: (itemId: string) => void;
  onSelectAllItems: () => void;
  onClearSelection: () => void;
  onExportSelected: (format: ExportFormat) => void;

  // Ordering props
  itemOrder?: string[];
  lastSortMethod?: SortMethod;
  onReorderItems?: (newOrder: string[]) => void;
  onMoveItemUp?: (itemId: string) => void;
  onMoveItemDown?: (itemId: string) => void;
  onAutoSortByPrice?: (ascending?: boolean) => void;
  onSortCategoryByPrice?: (category: ItemCategory, ascending?: boolean) => void;
  onResetOrder?: () => void;
  onExportOrderedItems?: (request: OrderedExportRequest) => void;
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

  // Ordering props with defaults
  itemOrder = [],
  lastSortMethod = null,
  onReorderItems,
  onMoveItemUp,
  onMoveItemDown,
  onAutoSortByPrice,
  onSortCategoryByPrice,
  onResetOrder,
  onExportOrderedItems,
}) => {
  const [selectedFormat, setSelectedFormat] =
    useState<ExportFormat>('facebook-text');
  const [activeTab, setActiveTab] = useState<'selection' | 'ordering'>(
    'selection'
  );

  // Export format options with metadata
  const exportFormats = [
    {
      value: 'facebook-text' as ExportFormat,
      label: 'Facebook Text',
      icon: FileText,
      description: 'Text file for Facebook marketplace posts',
      extension: '.txt',
    },
    {
      value: 'zip' as ExportFormat,
      label: 'Image Archive',
      icon: Image,
      description: 'ZIP file containing all item images',
      extension: '.zip',
    },
    {
      value: 'dba' as ExportFormat,
      label: 'DBA Export',
      icon: Package,
      description: 'JSON export for DBA.dk integration',
      extension: '.json',
    },
  ];

  const handleExport = () => {
    if (onExportOrderedItems && (itemOrder.length > 0 || lastSortMethod)) {
      // Use ordered export if ordering is available
      const orderedRequest: OrderedExportRequest = {
        itemType: 'psa-card', // Generic, format determines behavior
        format: selectedFormat,
        itemIds: selectedItemIds,
        itemOrder: itemOrder.length > 0 ? itemOrder : undefined,
        sortByPrice:
          lastSortMethod === 'price_asc' || lastSortMethod === 'price_desc',
        sortAscending: lastSortMethod === 'price_asc',
      };
      onExportOrderedItems(orderedRequest);
    } else {
      // Fallback to regular export
      onExportSelected(selectedFormat);
    }
  };
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

  const hasOrderingFeatures = onReorderItems && onMoveItemUp && onMoveItemDown;

  return (
    <PokemonModal
      open={isOpen}
      onClose={onClose}
      title="Export Collection Items"
      size="xl"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        {hasOrderingFeatures && (
          <div className="border-b border-zinc-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('selection')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'selection'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
                }`}
              >
                Item Selection
              </button>
              <button
                onClick={() => setActiveTab('ordering')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'ordering'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600'
                }`}
              >
                <ArrowUpDown className="w-4 h-4 mr-2 inline" />
                Item Ordering
              </button>
            </nav>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'selection' ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-zinc-300">
                Select items from your collection to include in the export.
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSelectAllItems}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Select All
                </button>
                <span className="text-zinc-700">|</span>
                <button
                  onClick={onClearSelection}
                  className="text-zinc-300 hover:text-zinc-300 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Export format selection */}
            <div className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-3">
                  Export Format
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {exportFormats.map((format) => {
                    const Icon = format.icon;
                    return (
                      <label
                        key={format.value}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${selectedFormat === format.value ? 'border-blue-500 bg-blue-900/20' : 'border-zinc-600 hover:border-zinc-500'}`}
                      >
                        <input
                          type="radio"
                          name="exportFormat"
                          value={format.value}
                          checked={selectedFormat === format.value}
                          onChange={(e) =>
                            setSelectedFormat(e.target.value as ExportFormat)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-600 mt-0.5"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center">
                            <Icon className="w-4 h-4 text-zinc-400 mr-2" />
                            <span className="text-sm font-medium text-white">
                              {format.label}
                            </span>
                            <span className="ml-2 text-xs text-zinc-400">
                              {format.extension}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 mt-1">
                            {format.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Selected count */}
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <p className="text-blue-300 font-medium">
                  {selectedItemIds.length} items selected for export as{' '}
                  {exportFormats.find((f) => f.value === selectedFormat)?.label}
                </p>
              </div>
            </div>

            {/* Items list */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {items.map((item) => {
                const itemId = item.id;
                const isSelected = selectedItemIds.includes(itemId);
                const itemType = getItemType(item);
                const itemName = getItemName(item);

                return (
                  <div
                    key={itemId}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-zinc-600 hover:border-zinc-500'}`}
                    onClick={() => onToggleItemSelection(itemId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleItemSelection(itemId)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-600 rounded mr-3"
                        />
                        <div>
                          <h4 className="font-medium text-white">{itemName}</h4>
                          <p className="text-sm text-zinc-400">
                            {itemType} • {item.myPrice || '0'} kr.
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${itemType === 'PSA Graded' ? 'bg-blue-100 text-blue-800' : itemType === 'Raw Card' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}
                      >
                        {itemType}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Ordering Tab */
          hasOrderingFeatures &&
          onReorderItems &&
          onMoveItemUp &&
          onMoveItemDown && (
            <ItemOrderingSection
              items={items.filter((item) => selectedItemIds.includes(item.id))}
              itemOrder={itemOrder}
              selectedItemIds={selectedItemIds}
              lastSortMethod={lastSortMethod}
              onReorderItems={onReorderItems}
              onMoveItemUp={onMoveItemUp}
              onMoveItemDown={onMoveItemDown}
              onAutoSortByPrice={onAutoSortByPrice || (() => {})}
              onSortCategoryByPrice={onSortCategoryByPrice || (() => {})}
              onResetOrder={onResetOrder || (() => {})}
              onToggleItemSelection={onToggleItemSelection}
              showSelection={false}
            />
          )
        )}

        {/* Export actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selectedItemIds.length === 0 || isExporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {isExporting ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export as{' '}
            {exportFormats.find((f) => f.value === selectedFormat)?.label} (
            {selectedItemIds.length})
          </button>
        </div>
      </div>
    </PokemonModal>
  );
};

export default CollectionExportModal;
