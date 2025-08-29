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
import { Archive, CheckCircle, Package, Plus, Star, Eye } from 'lucide-react';
import GenericLoadingState from '../../molecules/common/GenericLoadingState';
import { CollectionItem } from '../../molecules/collection/CollectionItemCard';
import { PokemonCard } from '../../atoms/design-system/PokemonCard';
import { IPsaGradedCard, IRawCard } from '../../../domain/models/card';
import { ISealedProduct } from '../../../domain/models/sealedProduct';
import { formatCardName } from '../../../utils';
import { getImageUrl } from '../../../utils/ui/imageUtils';
import { useApiErrorHandler } from '../../../hooks/error/useErrorHandler';

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
    const errorHandler = useApiErrorHandler('COLLECTION_TABS');
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
            <GenericLoadingState variant="spinner" size="lg" />
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
          if (import.meta.env.MODE === 'development') {
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
        }
        usedKeys.add(key);
      });

      if (duplicateKeys.length > 0) {
        errorHandler.handleError(new Error(`Duplicate keys detected in ${activeTab} tab`), {
          context: 'DUPLICATE_KEYS_DETECTED',
          severity: 'medium',
          showToast: false,
          metadata: {
            activeTab,
            duplicateCount: duplicateKeys.length,
            duplicateKeys,
          },
        });
      }

      // Performance optimization: Remove Framer Motion animations
      // These were causing 76 extra renders and 253ms of "other time"
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 md:gap-12 lg:gap-14 max-w-full mx-auto p-6 sm:p-8 md:p-10">
          {data.map((item: CollectionItem, index: number) => {
            const itemType = getItemType(item, activeTab);
            // Ensure absolutely unique key by combining ID with index as fallback
            const uniqueKey =
              item.id || (item as any)._id
                ? `${item.id || (item as any)._id}-${index}`
                : `fallback-${activeTab}-${index}`;

            // Extract item data for PokemonCard
            const itemRecord = item as Record<string, unknown>;
            
            // Get item name
            let itemName = 'Unknown Item';
            const cardId = itemRecord.cardId as any;
            if (cardId && typeof cardId === 'object' && cardId.cardName && typeof cardId.cardName === 'string') {
              itemName = cardId.cardName;
            } else if (itemRecord.cardName && typeof itemRecord.cardName === 'string') {
              itemName = itemRecord.cardName;
            } else if (itemRecord.name && typeof itemRecord.name === 'string') {
              itemName = itemRecord.name;
            } else {
              const productId = itemRecord.productId as any;
              if (productId && typeof productId === 'object' && productId.productName && typeof productId.productName === 'string') {
                itemName = productId.productName;
              } else if (itemRecord.productName && typeof itemRecord.productName === 'string') {
                itemName = itemRecord.productName;
              }
            }

            // Get set name
            let setName = 'Unknown Set';
            if (cardId && typeof cardId === 'object') {
              const setId = cardId.setId;
              if (setId && typeof setId === 'object' && setId.setName && typeof setId.setName === 'string') {
                setName = setId.setName;
              }
            }
            if (itemRecord.setName && typeof itemRecord.setName === 'string') {
              setName = itemRecord.setName;
            }

            // Get other properties
            const images = (itemRecord.images as string[]) || [];
            const price = (itemRecord.myPrice as number) || 0;
            const grade = itemType === 'psa' ? (itemRecord.grade as number) : undefined;
            const condition = itemType === 'raw' ? (itemRecord.condition as string) : undefined;
            const category = itemType === 'sealed' ? (itemRecord.category as string) : undefined;
            const isSold = (itemRecord.sold as boolean) || false;

            return (
              <div key={uniqueKey} className="w-full">
                <PokemonCard
                  cardType="collection"
                  variant="glass"
                  size="lg"
                  interactive={true}
                  title={formatCardName(itemName)}
                  subtitle={setName}
                  images={images.map(img => getImageUrl(img))}
                  price={price}
                  grade={grade}
                  condition={condition}
                  category={category}
                  sold={isSold}
                  showBadge={true}
                  showPrice={true}
                  showActions={true}
                  onView={() => onViewItemDetail(item, itemType)}
                  onMarkSold={activeTab !== 'sold-items' ? () => onMarkAsSold(item, itemType) : undefined}
                />
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <PokemonCard variant="glass" size="xl" className="relative">
        <div className="relative z-10">
          {renderTabContent()}
        </div>
      </PokemonCard>
    );
  }
);

CollectionTabs.displayName = 'CollectionTabs';

export default CollectionTabs;
