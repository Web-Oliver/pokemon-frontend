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
import { motion } from 'framer-motion';
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
          <h3 className='text-lg font-medium text-zinc-100 mb-2'>Error Loading Collection</h3>
          <p className='text-zinc-400 mb-4'>{error}</p>
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
          <h3 className='text-lg font-medium text-zinc-100 mb-2'>No Items Found</h3>
          <p className='text-zinc-400 mb-4'>{emptyMessage}</p>
          <button
            onClick={onAddNewItem}
            className='bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors inline-flex items-center'
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

    // Render collection items grid with guaranteed unique keys and futuristic animations
    return (
      <motion.div
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-8xl mx-auto'
        initial='hidden'
        animate='show'
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2,
            },
          },
        }}
      >
        {data.map((item: CollectionItem, index: number) => {
          const itemType = getItemType(item, activeTab);
          // Ensure absolutely unique key by combining ID with index as fallback
          const uniqueKey =
            item.id || (item as any)._id
              ? `${item.id || (item as any)._id}-${index}`
              : `fallback-${activeTab}-${index}`;

          return (
            <motion.div
              key={uniqueKey}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 60,
                  scale: 0.8,
                  rotateX: -15,
                },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotateX: 0,
                  transition: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                    duration: 0.6,
                  },
                },
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                },
              }}
              viewport={{ once: true, margin: '-50px' }}
              className='mx-auto w-full max-w-sm'
            >
              <CollectionItemCard
                item={item}
                itemType={itemType}
                activeTab={activeTab}
                onViewDetails={onViewItemDetail}
                onMarkAsSold={onMarkAsSold}
              />
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className='bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl relative overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5'></div>

      <div className='relative z-10'>
        {/* Tab Navigation */}
        <div className='border-b border-zinc-700/50 px-8 pt-8'>
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
                      ? 'border-cyan-500 text-cyan-400 bg-cyan-900/30 shadow-lg'
                      : 'border-transparent text-zinc-400 hover:text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg scale-110'
                          : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-300'
                      }`}
                    >
                      <Icon className='w-4 h-4' />
                    </div>
                    <span className='tracking-wide'>{tab.name}</span>
                  </div>
                  {isActive && (
                    <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg animate-pulse'></div>
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
