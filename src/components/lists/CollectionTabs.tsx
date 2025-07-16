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

import React from 'react';
import { Package, Star, Archive, CheckCircle, Plus } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import CollectionItemCard, { CollectionItem } from './CollectionItemCard';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';

export type TabType = 'psa-graded' | 'raw-cards' | 'sealed-products' | 'sold-items';

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
  onViewItemDetail: (item: CollectionItem, type: 'psa' | 'raw' | 'sealed') => void;
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

export const CollectionTabs: React.FC<CollectionTabsProps> = ({
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
        return { data: psaCards, emptyMessage: 'No PSA graded cards in your collection yet.' };
      case 'raw-cards':
        return { data: rawCards, emptyMessage: 'No raw cards in your collection yet.' };
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
  const getItemType = (item: any, activeTab: string): 'psa' | 'raw' | 'sealed' => {
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
        <div className='flex justify-center items-center py-12'>
          <LoadingSpinner size='lg' />
        </div>
      );
    }

    if (error) {
      return (
        <div className='text-center py-12'>
          <div className='text-red-500 mb-4'>
            <Package className='mx-auto w-12 h-12' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>Error Loading Collection</h3>
          <p className='text-gray-500 mb-4'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors'
          >
            Retry
          </button>
        </div>
      );
    }

    const { data, emptyMessage } = getTabData();

    if (data.length === 0) {
      return (
        <div className='text-center py-12'>
          <div className='text-gray-400 mb-4'>
            {React.createElement(tabs.find(tab => tab.id === activeTab)?.icon || Package, {
              className: 'mx-auto w-12 h-12',
            })}
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>No Items Found</h3>
          <p className='text-gray-500 mb-4'>{emptyMessage}</p>
          <button
            onClick={onAddNewItem}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center'
          >
            <Plus className='w-4 h-4 mr-2' />
            Add First Item
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
          productId: (item as any).productId
        });
      }
      usedKeys.add(key);
    });

    if (duplicateKeys.length > 0) {
      console.error(`[COLLECTION TABS] Found ${duplicateKeys.length} duplicate keys in ${activeTab} tab:`, duplicateKeys);
    }

    // Render collection items grid with guaranteed unique keys
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'>
        {data.map((item: CollectionItem, index: number) => {
          const itemType = getItemType(item, activeTab);
          // Ensure absolutely unique key by combining ID with index as fallback
          const uniqueKey = item.id || (item as any)._id 
            ? `${item.id || (item as any)._id}-${index}`
            : `fallback-${activeTab}-${index}`;

          return (
            <CollectionItemCard
              key={uniqueKey}
              item={item}
              itemType={itemType}
              activeTab={activeTab}
              onViewDetails={onViewItemDetail}
              onMarkAsSold={onMarkAsSold}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/3 via-purple-500/3 to-blue-500/3'></div>

      <div className='relative z-10'>
        {/* Tab Navigation */}
        <div className='border-b border-slate-200/50 px-8 pt-8'>
          <nav className='-mb-px flex space-x-1'>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`whitespace-nowrap py-4 px-6 border-b-3 font-bold text-sm transition-all duration-300 rounded-t-2xl relative group ${
                    isActive
                      ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50 shadow-lg'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-110'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                      }`}
                    >
                      <Icon className='w-4 h-4' />
                    </div>
                    <span className='tracking-wide'>{tab.name}</span>
                  </div>
                  {isActive && (
                    <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg animate-pulse'></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className='p-10'>{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default CollectionTabs;
