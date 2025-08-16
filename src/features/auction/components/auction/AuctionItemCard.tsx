/**
 * AuctionItemCard Component
 *
 * Extracted from AuctionDetail.tsx to follow SRP principle
 * Handles display of individual auction items with actions
 * Following CLAUDE.md principles: Single Responsibility, reusable UI components
 *
 * REFACTORED: Now uses PokemonCard with unified design system for consistent glassmorphism styling
 */

import React from 'react';
import { DollarSign, Package, Trash2 } from 'lucide-react';
import { ImageCollectionCard } from '../../../../shared/components/molecules/common/ImageCollectionCard';
import { PokemonButton } from '../../../../shared/components/atoms/design-system/PokemonButton';
import {
  formatCurrency,
  formatItemCategory,
  getItemDisplayData,
} from '../../../../shared/utils/helpers/itemDisplayHelpers';

export interface AuctionItemCardProps {
  item: any;
  isItemSold: (item: any) => boolean;
  onMarkSold: (item: any) => void;
  onRemoveItem: (item: any) => void;
  disabled?: boolean;
}

export const AuctionItemCard: React.FC<AuctionItemCardProps> = ({
  item,
  isItemSold,
  onMarkSold,
  onRemoveItem,
  disabled = false,
}) => {
  const displayData = getItemDisplayData(item);
  const isSold = isItemSold(item);

  return (
    <ImageCollectionCard
      title={displayData.itemName}
      subtitle={displayData.setName}
      imageUrl={displayData.itemImage}
      imageAlt={displayData.itemName}
      price={displayData.price}
      badge={{
        text: isSold ? 'SOLD' : formatItemCategory(item.itemCategory),
        variant: isSold ? 'success' : 'info',
      }}
      showSoldOverlay={isSold}
      actions={[
        ...(!isSold
          ? [
              {
                label: 'Mark Sold',
                onClick: () => onMarkSold(item),
                icon: <DollarSign size={16} />,
                variant: 'success' as const,
              },
            ]
          : []),
        {
          label: 'Remove',
          onClick: () => onRemoveItem(item),
          icon: <Trash2 size={16} />,
          variant: 'danger' as const,
        },
      ]}
      extraDetails={[
        ...(displayData.setName
          ? [{ label: 'Set', value: displayData.setName }]
          : []),
        ...(displayData.cardNumber
          ? [{ label: 'Card #', value: displayData.cardNumber }]
          : []),
        ...(displayData.grade
          ? [{ label: 'Grade', value: displayData.grade }]
          : []),
        ...(displayData.condition
          ? [{ label: 'Condition', value: displayData.condition }]
          : []),
      ]}
      disabled={disabled}
      className="group"
    />
  );
};
