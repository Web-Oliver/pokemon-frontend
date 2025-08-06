/**
 * Collection Item Card Component
 *
 * UPDATED: Now works with new field structures and SetProduct → Product hierarchy
 * Reusable card component for displaying collection items (PSA, Raw Cards, Sealed Products)
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles item card display
 * - Open/Closed: Extensible for different item types
 * - DRY: Reusable across all collection item types
 * - Layer 3: UI Building Block component
 * 
 * REFACTORED: Now uses BaseCard instead of ImageProductView for consistency
 */

import React, { memo, useCallback, useMemo } from 'react';
import { Package, Star, CheckCircle, DollarSign, Eye } from 'lucide-react';
import { BaseCard } from '../../shared/components/molecules/common/BaseCard';
import { formatCardNameForDisplay } from '../../shared/utils/helpers/formatting';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';

export type CollectionItem = IPsaGradedCard | IRawCard | ISealedProduct;

export interface CollectionItemCardProps {
  item: CollectionItem;
  itemType: 'psa' | 'raw' | 'sealed';
  activeTab: 'psa-graded' | 'raw-cards' | 'sealed-products' | 'sold-items';
  showMarkAsSoldButton?: boolean;
  onViewDetails: (
    item: CollectionItem,
    itemType: 'psa' | 'raw' | 'sealed'
  ) => void;
  onMarkAsSold?: (
    item: CollectionItem,
    itemType: 'psa' | 'raw' | 'sealed'
  ) => void;
}

const CollectionItemCardComponent: React.FC<CollectionItemCardProps> = ({
  item,
  itemType,
  activeTab,
  showMarkAsSoldButton = true,
  onViewDetails,
  onMarkAsSold,
}) => {
  // Memoized item display name calculation - UPDATED for new field structure
  const itemName = useMemo(() => {
    const itemRecord = item as Record<string, unknown>;

    // Handle different item types with new structure
    const cardName =
      // For PSA/Raw cards - check populated fields first, then direct fields
      ((itemRecord.cardId as Record<string, unknown>)?.cardName ||
        itemRecord.cardName ||
        // For sealed products - use name or productName
        itemRecord.name ||
        (itemRecord.productId as Record<string, unknown>)?.productName ||
        itemRecord.productName ||
        'Unknown Item') as string;

    // Format card name for display (remove hyphens and parentheses)
    return formatCardNameForDisplay(cardName);
  }, [item]);

  // Memoized set name calculation - UPDATED for new field structure
  const setName = useMemo(() => {
    const itemRecord = item as Record<string, unknown>;

    return (
      // For PSA/Raw cards - check populated fields from Card->Set reference
      (itemRecord.cardId as Record<string, unknown>)?.setId?.setName ||
      itemRecord.setName ||
      (itemRecord.cardId as Record<string, unknown>)?.setName ||
      // For sealed products - check Product->SetProduct reference
      (itemRecord.productId as Record<string, unknown>)?.setProductName ||
      itemRecord.setProductName ||
      'Unknown Set'
    );
  }, [item]);

  // Memoized click handler to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    onViewDetails(item, itemType);
  }, [onViewDetails, item, itemType]);

  // Memoized mark sold handler to prevent unnecessary re-renders
  const handleMarkSold = useCallback(() => {
    if (onMarkAsSold && !item.sold) {
      onMarkAsSold(item, itemType);
    }
  }, [onMarkAsSold, item, itemType]);

  // Get item badge content
  const getBadgeContent = () => {
    if (activeTab === 'sold-items' && item.sold) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
          <CheckCircle className="w-3 h-3" />
          Sold
        </div>
      );
    }

    switch (itemType) {
      case 'psa':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
            <Star className="w-3 h-3" />
            Grade {(item as any).grade || 'N/A'}
          </div>
        );
      case 'raw':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
            <Package className="w-3 h-3" />
            {(item as any).condition || 'N/A'}
          </div>
        );
      case 'sealed':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
            <Package className="w-3 h-3" />
            {(item as any).category || 'N/A'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <BaseCard
      variant="glass"
      size="md"
      interactive={true}
      onClick={handleClick}
      status={item.sold ? 'success' : 'default'}
      className="group cursor-pointer"
      elevated={true}
    >
      {/* Image Section */}
      <div className="relative mb-4">
        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-700/50">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={itemName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-zinc-500" />
            </div>
          )}
          
          {/* Sold overlay */}
          {item.sold && (
            <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-white mx-auto mb-2" />
                <span className="text-white font-bold text-sm">SOLD</span>
              </div>
            </div>
          )}
        </div>

        {/* Badge */}
        <div className="absolute top-3 left-3 z-10">
          {getBadgeContent()}
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-3">
        {/* Title and Subtitle */}
        <div>
          <h3 className="font-bold text-[var(--theme-text-primary)] text-lg leading-tight truncate group-hover:text-[var(--theme-accent-primary)] transition-colors">
            {itemName}
          </h3>
          <p className="text-[var(--theme-text-secondary)] text-sm mt-1 truncate">
            {setName}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--theme-border)]">
          <span className="text-[var(--theme-text-secondary)] text-sm font-medium">
            Price:
          </span>
          <span className="font-bold text-[var(--theme-accent-primary)] text-lg">
            {item.myPrice ? `${item.myPrice} kr` : 'Not set'}
          </span>
        </div>

        {/* Action Buttons */}
        {showMarkAsSoldButton && activeTab !== 'sold-items' && !item.sold && (
          <div className="pt-3 border-t border-[var(--theme-border)]">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-xl font-semibold text-sm hover:bg-blue-500/30 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkSold();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl font-semibold text-sm hover:bg-emerald-500/30 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Sell
              </button>
            </div>
          </div>
        )}

        {/* Sale date for sold items */}
        {activeTab === 'sold-items' && (item as any).saleDetails?.dateSold && (
          <div className="pt-2 border-t border-[var(--theme-border)]">
            <div className="text-xs text-[var(--theme-text-muted)] text-center">
              Sold on {new Date((item as any).saleDetails.dateSold).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
    </BaseCard>
  );
};

/**
 * Custom memo comparison function for CollectionItemCard
 * UPDATED: Now handles new field structures and references
 * Optimizes re-rendering by performing shallow comparison on critical props
 * Following CLAUDE.md performance optimization principles
 */
const arePropsEqual = (
  prevProps: CollectionItemCardProps,
  nextProps: CollectionItemCardProps
): boolean => {
  // Check if the item itself has changed (by reference or critical properties)
  if (prevProps.item !== nextProps.item) {
    // Perform deeper comparison for item properties that affect rendering
    const prevItem = prevProps.item as Record<string, unknown>;
    const nextItem = nextProps.item as Record<string, unknown>;

    // Check critical properties that affect card display
    if (
      prevItem.id !== nextItem.id ||
      prevItem.myPrice !== nextItem.myPrice ||
      prevItem.images !== nextItem.images ||
      // UPDATED: Check both cardId and productId references
      JSON.stringify(prevItem.cardId) !== JSON.stringify(nextItem.cardId) ||
      JSON.stringify(prevItem.productId) !==
        JSON.stringify(nextItem.productId) ||
      JSON.stringify(prevItem.saleDetails) !==
        JSON.stringify(nextItem.saleDetails) ||
      // NEW: Check field name changes
      prevItem.cardNumber !== nextItem.cardNumber ||
      prevItem.setProductName !== nextItem.setProductName ||
      prevItem.productName !== nextItem.productName
    ) {
      return false;
    }
  }

  // Check other critical props
  return (
    prevProps.itemType === nextProps.itemType &&
    prevProps.activeTab === nextProps.activeTab &&
    prevProps.showMarkAsSoldButton === nextProps.showMarkAsSoldButton &&
    prevProps.onViewDetails === nextProps.onViewDetails &&
    prevProps.onMarkAsSold === nextProps.onMarkAsSold
  );
};

/**
 * Memoized CollectionItemCard component
 * Prevents unnecessary re-renders when props haven't changed
 * Optimizes performance for large collection grids with hundreds of cards
 */
export const CollectionItemCard = memo(
  CollectionItemCardComponent,
  arePropsEqual
);

export default CollectionItemCard;