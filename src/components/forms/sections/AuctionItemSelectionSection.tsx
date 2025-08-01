/**
 * Auction Item Selection Section Component
 * Layer 3: Components (UI Building Blocks)
 *
 * Handles the selection and ordering of collection items for auctions
 * Uses proper form components and Context7 design patterns
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Item selection and ordering only
 * - DRY: Reusable item selection logic
 * - Open/Closed: Extensible through props and callbacks
 */

import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  Hash,
  TrendingUp,
  Eye,
  CheckCircle,
  Circle,
  X,
  Grid3X3,
  Users,
  ChevronRight,
} from 'lucide-react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Select from '../../common/Select';

interface UnifiedCollectionItem {
  id: string;
  itemType: 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
  displayName: string;
  displayPrice: number;
  displayImage?: string;
  images?: string[];
  setName?: string;
  grade?: string;
  condition?: string;
  category?: string;
  originalItem: any;
}

interface AuctionItemSelectionSectionProps {
  /** Collection Items */
  items: UnifiedCollectionItem[];
  loading: boolean;
  error?: string;

  /** Selection State */
  selectedItemIds: Set<string>;
  onToggleSelection: (itemId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;

  /** Summary Information */
  selectedItemsValue: number;

  /** Filter State */
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterType: 'all' | 'PsaGradedCard' | 'RawCard' | 'SealedProduct';
  onFilterChange: (
    filter: 'all' | 'PsaGradedCard' | 'RawCard' | 'SealedProduct'
  ) => void;

  /** Preview */
  showPreview: boolean;
  onTogglePreview: () => void;
  selectedItemsByType?: {
    PsaGradedCard: UnifiedCollectionItem[];
    RawCard: UnifiedCollectionItem[];
    SealedProduct: UnifiedCollectionItem[];
  };
}

const AuctionItemSelectionSection: React.FC<
  AuctionItemSelectionSectionProps
> = ({
  items,
  loading,
  error,
  selectedItemIds,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  selectedItemsValue,
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  showPreview,
  onTogglePreview,
  selectedItemsByType,
}) => {
  // Filter items based on search term and filter type
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.itemType === filterType);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.displayName.toLowerCase().includes(search) ||
          item.setName?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [items, filterType, searchTerm]);

  if (loading) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          <span className="ml-3 text-zinc-300">
            Loading collection items...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h4 className="text-lg font-bold text-red-400 mb-2">
            Error Loading Items
          </h4>
          <p className="text-zinc-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-zinc-100 tracking-wide flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-3">
            <Package className="w-4 h-4 text-white" />
          </div>
          Select Items for Auction
        </h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-zinc-300">
            <Hash className="w-4 h-4" />
            <span>{selectedItemIds.size} selected</span>
            {selectedItemIds.size > 0 && (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 font-bold">
                  {selectedItemsValue.toLocaleString()} kr.
                </span>
              </>
            )}
          </div>
          {selectedItemIds.size > 0 && (
            <Button
              type="button"
              onClick={onTogglePreview}
              variant="outline"
              size="sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Preview Selection'}
            </Button>
          )}
        </div>
      </div>

      {/* Selection Preview Panel */}
      {showPreview && selectedItemIds.size > 0 && selectedItemsByType && (
        <div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 rounded-2xl border-2 border-blue-800 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-blue-100 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Auction Preview ({selectedItemIds.size} items)
            </h4>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-4 h-4 text-teal-600" />
                <span className="font-medium text-zinc-200">
                  PSA: {selectedItemsByType.PsaGradedCard.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-zinc-200">
                  Raw: {selectedItemsByType.RawCard.length}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-zinc-200">
                  Sealed: {selectedItemsByType.SealedProduct.length}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-emerald-900/20 rounded-xl border border-emerald-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-100">
                Total Auction Value
              </span>
              <span className="text-xl font-bold text-emerald-600">
                {selectedItemsValue.toLocaleString()} kr.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Selection Interface */}
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50"></div>

        <div className="relative z-10 space-y-6">
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search items..."
              startIcon={<Search className="w-5 h-5 text-zinc-500" />}
              fullWidth
            />
            <Select
              value={filterType}
              onChange={(e) => onFilterChange(e.target.value as any)}
              options={[
                { value: 'all', label: 'All Items' },
                { value: 'PsaGradedCard', label: 'PSA Graded Cards' },
                { value: 'RawCard', label: 'Raw Cards' },
                { value: 'SealedProduct', label: 'Sealed Products' },
              ]}
              fullWidth
            />
          </div>

          {/* Bulk Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                type="button"
                onClick={onSelectAll}
                variant="outline"
                size="sm"
                disabled={filteredItems.length === 0}
              >
                Select All ({filteredItems.length})
              </Button>
              {selectedItemIds.size > 0 && (
                <Button
                  type="button"
                  onClick={onClearSelection}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear Selection
                </Button>
              )}
            </div>
            <p className="text-sm text-zinc-400 font-medium">
              {filteredItems.length} items available
            </p>
          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-gray-200 rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-zinc-400" />
              </div>
              <h4 className="text-lg font-bold text-zinc-100 mb-2">
                No items found
              </h4>
              <p className="text-zinc-300 font-medium">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter.'
                  : 'Add items to your collection first.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const isSelected = selectedItemIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => onToggleSelection(item.id)}
                    className={`group relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col h-full hover:scale-102 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/10 shadow-lg transform scale-105'
                        : 'border-zinc-700/40 bg-zinc-800/80 hover:border-amber-400/60 hover:shadow-md'
                    }`}
                  >
                    {/* Selection Indicator */}
                    <div className="absolute top-3 right-3 z-10">
                      {isSelected ? (
                        <CheckCircle className="w-6 h-6 text-amber-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
                      )}
                    </div>

                    {/* Item Type Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          item.itemType === 'PsaGradedCard'
                            ? 'bg-teal-100 text-teal-700 border border-teal-200'
                            : item.itemType === 'RawCard'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-purple-100 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {item.itemType === 'PsaGradedCard'
                          ? `PSA ${item.grade}`
                          : item.itemType === 'RawCard'
                            ? item.condition
                            : 'Sealed'}
                      </span>
                    </div>

                    {/* Item Image */}
                    <div className="w-full mb-3 mt-8">
                      <div className="w-full h-48 bg-zinc-700 rounded-xl flex items-center justify-center overflow-hidden">
                        {item.displayImage ? (
                          <img
                            src={item.displayImage}
                            alt={item.displayName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-zinc-500" />
                        )}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex flex-col flex-1 space-y-2">
                      <div className="flex-1">
                        <h5 className="font-bold text-zinc-100 text-sm line-clamp-2 mb-2">
                          {item.displayName}
                        </h5>
                        {item.setName && (
                          <p className="text-xs text-zinc-400 font-medium truncate mb-2">
                            {item.setName}
                          </p>
                        )}
                      </div>

                      {/* Price - Always at bottom */}
                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-700">
                        <span className="text-xs font-medium text-zinc-300">
                          Price
                        </span>
                        <span className="font-bold text-emerald-600 text-lg">
                          {item.displayPrice.toLocaleString()} kr.
                        </span>
                      </div>
                    </div>

                    {/* Selection Overlay Effect */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-2xl pointer-events-none"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick selection summary */}
          {selectedItemIds.size > 0 && !showPreview && (
            <div className="bg-gradient-to-r from-amber-50/10 to-orange-50/10 rounded-xl border border-amber-200/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-300">
                      {selectedItemIds.size} items selected
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold">
                    {selectedItemsValue.toLocaleString()} kr. total
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => onTogglePreview()}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View & Order
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuctionItemSelectionSection;
