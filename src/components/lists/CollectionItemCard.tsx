/**
 * Collection Item Card Component
 *
 * Reusable card component for displaying collection items (PSA, Raw Cards, Sealed Products)
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles item card display
 * - Open/Closed: Extensible for different item types
 * - DRY: Reusable across all collection item types
 * - Layer 3: UI Building Block component
 */

import React from 'react';
import { Package, Star, Archive, CheckCircle, Eye, DollarSign } from 'lucide-react';
import { ImageSlideshow } from '../common/ImageSlideshow';
import { formatCardNameForDisplay } from '../../utils/cardUtils';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';

export type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;

export interface CollectionItemCardProps {
  item: CollectionItem;
  itemType: 'psa' | 'raw' | 'sealed';
  activeTab: 'psa-graded' | 'raw-cards' | 'sealed-products' | 'sold-items';
  showMarkAsSoldButton?: boolean;
  onViewDetails: (item: CollectionItem, itemType: 'psa' | 'raw' | 'sealed') => void;
  onMarkAsSold?: (item: CollectionItem, itemType: 'psa' | 'raw' | 'sealed') => void;
}

export const CollectionItemCard: React.FC<CollectionItemCardProps> = ({
  item,
  itemType,
  activeTab,
  showMarkAsSoldButton = true,
  onViewDetails,
  onMarkAsSold,
}) => {
  // Get item display name
  const getItemName = () => {
    const itemRecord = item as unknown as Record<string, unknown>;
    const cardName = (
      (itemRecord.cardId as Record<string, unknown>)?.cardName ||
      itemRecord.cardName ||
      itemRecord.name ||
      'Unknown Item'
    ) as string;
    
    // Format card name for display (remove hyphens and parentheses)
    return formatCardNameForDisplay(cardName);
  };

  // Get item badge content based on type and tab
  const getBadgeContent = () => {
    const itemRecord = item as unknown as Record<string, unknown>;
    switch (activeTab) {
      case 'psa-graded':
        return (
          <>
            <Star className='w-4 h-4 mr-1 text-yellow-500' />
            Grade {itemRecord.grade || 'N/A'}
          </>
        );
      case 'raw-cards':
        return (
          <>
            <Package className='w-4 h-4 mr-1 text-emerald-500' />
            {itemRecord.condition || 'N/A'}
          </>
        );
      case 'sealed-products':
        return (
          <>
            <Archive className='w-4 h-4 mr-1 text-purple-500' />
            {itemRecord.category || 'N/A'}
          </>
        );
      case 'sold-items':
        return (
          <>
            <CheckCircle className='w-4 h-4 mr-1 text-green-500' />
            {(item as any).saleDetails?.dateSold
              ? new Date((item as any).saleDetails.dateSold).toLocaleDateString()
              : 'N/A'}
          </>
        );
      default:
        return null;
    }
  };

  const isUnsoldTab = activeTab !== 'sold-items';

  return (
    <div className='group relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 hover:scale-105 hover:border-indigo-200/50 overflow-hidden flex flex-col'>
      {/* Card Background Pattern */}
      <div className='absolute inset-0 bg-gradient-to-br from-slate-50/50 to-indigo-50/30 opacity-60'></div>

      {/* Card Image Slideshow */}
      <div className='relative z-10 mb-6'>
        <ImageSlideshow
          images={item.images || []}
          fallbackIcon={<Package className='w-8 h-8 text-indigo-600' />}
          autoplay={false}
          autoplayDelay={4000}
          className='w-full group-hover:scale-105 transition-transform duration-300'
          showThumbnails={false}
          adaptiveLayout={true}
          enableAspectRatioDetection={true}
        />
      </div>

      {/* Card Content - Flexible space */}
      <div className='relative z-10 flex flex-col flex-1'>
        <div className='flex-1 space-y-4'>
          <div className='text-center'>
            <h4 className='text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-700 transition-colors duration-300'>
              {getItemName()}
            </h4>

            {/* Grade/Condition Badge */}
            <div className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200/50'>
              {getBadgeContent()}
            </div>
          </div>

          {/* Price Display */}
          <div className='text-center space-y-2'>
            <p className='text-2xl font-bold text-slate-900'>{item.myPrice || '0'} kr.</p>

            {item.sold && (
              <div className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200/50'>
                <CheckCircle className='w-4 h-4 mr-1' />
                Sold
              </div>
            )}

            {activeTab === 'sold-items' && (item as any).saleDetails?.actualSoldPrice && (
              <p className='text-sm font-medium text-green-600'>
                Sold: {(item as any).saleDetails.actualSoldPrice} kr.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons - Always at bottom */}
        <div className='flex flex-col gap-3 pt-4 mt-auto'>
          {/* View Details Button - Always visible */}
          <button
            onClick={() => onViewDetails(item, itemType)}
            className='w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          >
            <Eye className='w-5 h-5 mr-2' />
            View Details
          </button>

          {/* Mark as Sold Button - Only for unsold items */}
          {showMarkAsSoldButton && isUnsoldTab && !item.sold && onMarkAsSold && (
            <button
              onClick={e => {
                e.stopPropagation();
                onMarkAsSold(item, itemType);
              }}
              className='w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
            >
              <DollarSign className='w-5 h-5 mr-2' />
              Mark as Sold
            </button>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl'></div>
    </div>
  );
};

export default CollectionItemCard;
