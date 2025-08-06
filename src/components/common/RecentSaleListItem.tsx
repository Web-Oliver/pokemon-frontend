/**
 * RecentSaleListItem Component - DRY Violation Fix
 *
 * Reusable recent sale list item component extracted from SalesAnalytics.tsx
 * to prevent JSX duplication for individual sale items in the recent sales list.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles rendering of a single sale item
 * - DRY: Eliminates repeated sale item JSX structures
 * - Reusability: Can be used across different sale displays
 * - Design System Integration: Uses consistent styling patterns
 */

import React from 'react';
import { PokemonCard } from '../design-system/PokemonCard';

interface SaleItem {
  id?: string;
  itemName?: string;
  itemCategory?: string;
  thumbnailUrl?: string;
  dateSold?: string;
  source?: string;
  actualSoldPrice?: number | string;
  myPrice?: number | string;
}

interface RecentSaleListItemProps {
  /** Sale data to display */
  sale: SaleItem;
  /** Index for fallback key generation */
  index: number;
  /** Additional CSS classes */
  className?: string;
}

const RecentSaleListItem: React.FC<RecentSaleListItemProps> = ({
  sale,
  index,
  className = '',
}) => {
  const actualPrice = Number(sale.actualSoldPrice) || 0;
  const myPrice = Number(sale.myPrice) || 0;

  return (
    <PokemonCard
      cardType="sale"
      variant="glass"
      size="sm"
      sale={sale}
      title={sale.itemName}
      category={sale.itemCategory}
      actualSoldPrice={actualPrice}
      myPrice={myPrice}
      source={sale.source}
      dateSold={sale.dateSold}
      index={index}
      interactive={true}
      className={`transition-all duration-300 hover:scale-[1.01] ${className}`}
    />
  );
};