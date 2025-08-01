/**
 * Collection Tabs Component
 *
 * Tabbed navigation for collection management with Context7 premium design
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles tab navigation and content rendering
 * - Open/Closed: Extensible for new tab types
 * - DRY: Reusable tab pattern
 * - Layer 3: UI Building Block component
 */

import React, { memo } from 'react';
import { Archive, CheckCircle, Package, Plus, Star } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import CollectionItemCard, { CollectionItem } from './CollectionItemCard';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';

export type TabType =
  | 'psa-graded'
  | 'raw-cards'
  | 'sealed-products'
  | 'sold-items';

export interface TabConfig {
  id: TabType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface CollectionTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  psaCards: IPsaGradedCard[];
  rawCards: IRawCard[];
  sealedProducts: ISealedProduct[];
  soldItems: (IPsaGradedCard | IRawCard | ISealedProduct)[];
  loading: boolean;
  error: string | null;
  onAddNewItem: () => void;
  onViewItemDetail: (
    item: CollectionItem,
    type: 'psa' | 'raw' | 'sealed'
  ) => void;
  onMarkAsSold: (item: CollectionItem, type: 'psa' | 'raw' | 'sealed') => void;
}

const tabs: TabConfig[] = [
  {
    id: 'psa-graded',
    name: 'PSA Graded Cards',
    icon: Star,
    color: 'blue',
  },
  {
    id: 'raw-cards',
    name: 'Raw Cards',
    icon: Package,
    color: 'green',
  },
  {
    id: 'sealed-products',
    name: 'Sealed Products',
    icon: Archive,
    color: 'purple',
  },
  {
    id: 'sold-items',
    name: 'Sold Items',
    icon: CheckCircle,
    color: 'yellow',
  },
];

export const CollectionTabs: React.FC<CollectionTabsProps> = memo(
  ({
    activeTab,
    onTabChange,
    psaCards,
    rawCards,
    sealedProducts,
    soldItems,
    loading,
    error,
    onAddNewItem,
    onViewItemDetail,
    onMarkAsSold,
  }) => {
    // Get data for the current tab
    const getTabData = () => {
      switch (activeTab) {
        case 'psa-graded':
          return {
            data: psaCards,
            emptyMessage: 'No PSA graded cards in your collection yet.',
          };
        case 'raw-cards':
          return {
            data: rawCards,
            emptyMessage: 'No raw cards in your collection yet.',
          };
        case 'sealed-products':
          return {
            data: sealedProducts,
            emptyMessage: 'No sealed products in your collection yet.',
          };
        case 'sold-items':
          return { data: soldItems, emptyMessage: 'No sold items yet.' };
        default:
          return { data: [], emptyMessage: 'No items found.' };
      }
    };

    // Determine item type based on tab and item properties
    const getItemType = (
      item: any,
      activeTab: string
    ): 'psa' | 'raw' | 'sealed' => {
      if (activeTab === 'psa-graded') {
        return 'psa';
      }
      if (activeTab === 'raw-cards') {
        return 'raw';
      }
      if (activeTab === 'sealed-products') {
        return 'sealed';
      }

      // For sold items, detect type based on item properties
      if (activeTab === 'sold-items') {
        if ('grade' in item || item.grade !== undefined) {
          return 'psa';
        }
        if ('condition' in item || item.condition !== undefined) {
          return 'raw';
        }
        if ('category' in item || item.category !== undefined) {
          return 'sealed';
        }

        // Fallback: check if item has cardId (PSA/Raw cards) or productId (sealed)
        if (item.cardId || item.cardName) {
          return item.grade ? 'psa' : 'raw';
        }
        if (item.productId || item.name) {
          return 'sealed';
        }
      }

      return 'sealed'; // Default fallback
    };

    const renderTabContent = () => {
      if (loading) {
        return (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        );
      }

      if (error) {
        return (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Error Loading Collection
              </h3>
              <p className="text-white/60 text-lg max-w-md mx-auto mb-8">
                {error}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 px-8 py-4 rounded-xl transition-all duration-300 font-semibold"
            >
              Try Again
            </button>
          </div>
        );
      }

      const { data, emptyMessage } = getTabData();

      if (data.length === 0) {
        const activeTabConfig = tabs.find((tab) => tab.id === activeTab);
        const Icon = activeTabConfig?.icon || Package;
        
        return (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Icon className="w-10 h-10 text-white/60" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No {activeTabConfig?.name || 'Items'} Yet
              </h3>
              <p className="text-white/60 text-lg max-w-md mx-auto mb-8">
                {emptyMessage}
              </p>
            </div>
            <button
              onClick={onAddNewItem}
              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white px-8 py-4 rounded-xl transition-all duration-300 inline-flex items-center font-semibold"
            >
              <Plus className="w-5 h-5 mr-3" />
              Add Your First Item
            </button>
          </div>
        );
      }

      // Debug: Check for duplicate IDs
      const usedKeys = new Set<string>();
      const duplicateKeys: string[] = [];

      data.forEach((item: CollectionItem, index: number) => {
        const key = item.id || (item as any)._id || `fallback-${index}`;
        if (usedKeys.has(key)) {
          duplicateKeys.push(key);
          console.warn(`[COLLECTION TABS] Duplicate key detected: ${key}`, {
            item,
            index,
            activeTab,
            itemId: item.id,
            itemMongoId: (item as any)._id,
            cardId: (item as any).cardId,
            productId: (item as any).productId,
          });
        }
        usedKeys.add(key);
      });

      if (duplicateKeys.length > 0) {
        console.error(
          `[COLLECTION TABS] Found ${duplicateKeys.length} duplicate keys in ${activeTab} tab:`,
          duplicateKeys
        );
      }

      // Performance optimization: Remove Framer Motion animations
      // These were causing 76 extra renders and 253ms of "other time"
      return (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10 max-w-full mx-auto p-4 sm:p-6 md:p-8">
          {data.map((item: CollectionItem, index: number) => {
            const itemType = getItemType(item, activeTab);
            // Ensure absolutely unique key by combining ID with index as fallback
            const uniqueKey =
              item.id || (item as any)._id
                ? `${item.id || (item as any)._id}-${index}`
                : `fallback-${activeTab}-${index}`;

            return (
              <div key={uniqueKey} className="w-full aspect-[3/5]">
                <CollectionItemCard
                  item={item}
                  itemType={itemType}
                  activeTab={activeTab}
                  onViewDetails={onViewItemDetail}
                  onMarkAsSold={onMarkAsSold}
                />
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {renderTabContent()}
      </div>
    );
  }
);

CollectionTabs.displayName = 'CollectionTabs';

export default CollectionTabs;
