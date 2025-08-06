/**
 * AuctionItemCard Component
 * 
 * Extracted from AuctionDetail.tsx to follow SRP principle
 * Handles display of individual auction items with actions
 * Following CLAUDE.md principles: Single Responsibility, reusable UI components
 */

import React from 'react';
import { PokemonCard } from '../design-system/PokemonCard';
import { getItemDisplayData } from '../../utils/itemDisplayHelpers';

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
    <PokemonCard
      cardType="auction"
      variant="glass"
      size="md"
      item={item}
      title={displayData.itemName}
      subtitle={displayData.setName}
      category={displayData.itemCategory}
      images={displayData.itemImage ? [displayData.itemImage] : undefined}
      price={displayData.itemPrice}
      sold={isSold}
      isItemSold={isItemSold}
      onMarkSold={onMarkSold}
      onRemoveItem={onRemoveItem}
      disabled={disabled}
      interactive={!disabled}
      className="group hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300"
    />
  );
};