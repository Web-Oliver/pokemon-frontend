/**
 * Collection Item Card Component - UNIFIED STRUCTURE
 * Migrated from /components/lists/ to unified architecture
 * 
 * Layer 3: Molecules - Complex UI Building Block component
 * Reusable card component for displaying collection items (PSA, Raw Cards, Sealed Products)
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles item card display
 * - Open/Closed: Extensible for different item types
 * - DRY: Reusable across all collection item types
 */

import React, { memo, useCallback, useMemo } from 'react';
import { CheckCircle, DollarSign, Eye, Package, Star } from 'lucide-react';
import { ImageCollectionCard } from '../common/ImageCollectionCard';
import { formatCardName } from '../../../utils';
import { getImageUrl } from '../../../utils/ui/imageUtils';
import { IPsaGradedCard, IRawCard } from '../../../domain/models/card';
import { ISealedProduct } from '../../../domain/models/sealedProduct';

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
  // Memoized item display name calculation - FIXED for circular reference issues
  const itemName = useMemo(() => {
    const itemRecord = item as Record<string, unknown>;

    try {
      let cardName = 'Unknown Item';

      // For PSA/Raw cards - safely access nested properties
      const cardId = itemRecord.cardId as any;
      if (cardId && typeof cardId === 'object' && cardId.cardName && typeof cardId.cardName === 'string') {
        cardName = cardId.cardName;
      }
      // Direct card name on item
      else if (itemRecord.cardName && typeof itemRecord.cardName === 'string') {
        cardName = itemRecord.cardName;
      }
      // For sealed products - safely access Product name
      else if (itemRecord.name && typeof itemRecord.name === 'string') {
        cardName = itemRecord.name;
      }
      else {
        const productId = itemRecord.productId as any;
        if (productId && typeof productId === 'object' && productId.productName && typeof productId.productName === 'string') {
          cardName = productId.productName;
        }
        else if (itemRecord.productName && typeof itemRecord.productName === 'string') {
          cardName = itemRecord.productName;
        }
      }

      // Format card name for display (remove hyphens and parentheses)
      return formatCardName(cardName);
    } catch (error) {
      console.error('[COLLECTION ITEM] Error extracting item name:', error);
      return 'Unknown Item';
    }
  }, [item]);

  // Memoized set name calculation - FIXED for circular reference issues
  const setName = useMemo(() => {
    const itemRecord = item as Record<string, unknown>;

    try {
      // For PSA/Raw cards - safely access nested properties
      const cardId = itemRecord.cardId as any;
      if (cardId && typeof cardId === 'object') {
        const setId = cardId.setId;
        if (setId && typeof setId === 'object' && setId.setName && typeof setId.setName === 'string') {
          return setId.setName;
        }
      }

      // Direct set name on item
      if (itemRecord.setName && typeof itemRecord.setName === 'string') {
        return itemRecord.setName;
      }

      // For sealed products, try the Product relation
      const productId = itemRecord.productId as any;
      if (productId && typeof productId === 'object') {
        const productSetName = productId.setName;
        if (productSetName && typeof productSetName === 'string') {
          return productSetName;
        }

        const setId = productId.setId;
        if (setId && typeof setId === 'object' && setId.setName && typeof setId.setName === 'string') {
          return setId.setName;
        }
      }

      return 'Unknown Set';
    } catch (error) {
      console.error('[COLLECTION ITEM] Error extracting set name:', error);
      return 'Unknown Set';
    }
  }, [item]);

  // Memoized images calculation
  const images = useMemo(() => {
    const itemRecord = item as Record<string, unknown>;
    return (itemRecord.images as string[]) || [];
  }, [item]);

  // Memoized price calculation
  const price = useMemo(() => {
    const itemRecord = item as Record<string, unknown>;
    return (itemRecord.myPrice as number) || 0;
  }, [item]);

  // Get grade for PSA cards only
  const grade = useMemo(() => {
    if (itemType !== 'psa') return undefined;
    const itemRecord = item as Record<string, unknown>;
    return (itemRecord.grade as number) || undefined;
  }, [item, itemType]);

  // Get condition for Raw cards only
  const condition = useMemo(() => {
    if (itemType !== 'raw') return undefined;
    const itemRecord = item as Record<string, unknown>;
    return (itemRecord.condition as string) || undefined;
  }, [item, itemType]);

  // Get category for sealed products only
  const category = useMemo(() => {
    if (itemType !== 'sealed') return undefined;
    const itemRecord = item as Record<string, unknown>;
    return (itemRecord.category as string) || undefined;
  }, [item, itemType]);

  // Check if item is sold
  const isSold = useMemo(() => {
    const itemRecord = item as Record<string, unknown>;
    return (itemRecord.sold as boolean) || false;
  }, [item]);

  // Primary image URL
  const primaryImage = useMemo(() => {
    return images.length > 0 ? getImageUrl(images[0]) : null;
  }, [images]);

  // Handle view details
  const handleViewDetails = useCallback(() => {
    onViewDetails(item, itemType);
  }, [item, itemType, onViewDetails]);

  // Handle mark as sold
  const handleMarkAsSold = useCallback(() => {
    if (onMarkAsSold) {
      onMarkAsSold(item, itemType);
    }
  }, [item, itemType, onMarkAsSold]);

  // Get display badge text
  const badgeText = useMemo(() => {
    if (isSold) return 'SOLD';
    
    switch (itemType) {
      case 'psa':
        return grade ? `PSA ${grade}` : 'PSA';
      case 'raw':
        return condition || 'Raw';
      case 'sealed':
        return category || 'Sealed';
      default:
        return 'Item';
    }
  }, [itemType, grade, condition, category, isSold]);

  // Get badge variant
  const badgeVariant = useMemo(() => {
    if (isSold) return 'sold';
    
    switch (itemType) {
      case 'psa':
        return 'psa';
      case 'raw':
        return 'raw';
      case 'sealed':
        return 'sealed';
      default:
        return 'default';
    }
  }, [itemType, isSold]);

  return (
    <ImageCollectionCard
      title={itemName}
      subtitle={setName}
      imageUrl={primaryImage}
      imageAlt={`${itemName} from ${setName}`}
      badge={{
        text: badgeText,
        variant: badgeVariant as any,
      }}
      price={price}
      showSoldOverlay={isSold}
      actions={[
        {
          label: 'View Details',
          onClick: handleViewDetails,
          icon: <Eye className="w-4 h-4" />,
          variant: 'primary',
        },
        ...(showMarkAsSoldButton && !isSold
          ? [
              {
                label: 'Mark as Sold',
                onClick: handleMarkAsSold,
                icon: <CheckCircle className="w-4 h-4" />,
                variant: 'secondary' as const,
              },
            ]
          : []),
      ]}
      extraDetails={[
        ...(itemType === 'psa' && grade
          ? [{ label: 'Grade', value: grade.toString() }]
          : []),
        ...(itemType === 'raw' && condition
          ? [{ label: 'Condition', value: condition }]
          : []),
        ...(itemType === 'sealed' && category
          ? [{ label: 'Category', value: category }]
          : []),
        ...(images.length > 1
          ? [{ label: 'Images', value: images.length.toString() }]
          : []),
      ]}
    />
  );
};

// Memoize the component for performance
const CollectionItemCard = memo(CollectionItemCardComponent);
CollectionItemCard.displayName = 'CollectionItemCard';

export default CollectionItemCard;
export { CollectionItemCard };