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
 */

import React, { memo, useCallback, useMemo } from 'react';
import { ImageProductView } from '../common/ImageProductView';
import { formatCardNameForDisplay } from '../../utils/formatting';
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

  return (
    <ImageProductView
      images={item.images || []}
      title={itemName}
      subtitle={setName}
      price={item.myPrice}
      type={itemType}
      grade={activeTab === 'psa-graded' ? (item as any).grade : undefined}
      condition={
        activeTab === 'raw-cards' ? (item as any).condition : undefined
      }
      category={
        activeTab === 'sealed-products' ? (item as any).category : undefined
      }
      sold={activeTab === 'sold-items'}
      saleDate={
        activeTab === 'sold-items'
          ? (item as any).saleDetails?.dateSold
          : undefined
      }
      variant="card"
      size="md"
      aspectRatio="card"
      showBadge={true}
      showPrice={true}
      showActions={showMarkAsSoldButton && activeTab !== 'sold-items'}
      enableInteractions={true}
      onView={handleClick}
      _onMarkSold={
        showMarkAsSoldButton && activeTab !== 'sold-items'
          ? handleMarkSold
          : undefined
      }
      className="mx-auto w-full h-full"
    />
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
