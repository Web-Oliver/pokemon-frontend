/**
 * RecentSaleListItem Component - DRY Violation Fix
 *
 * Reusable recent sale list item component extracted from SalesAnalytics.tsx
 * to prevent JSX duplication for individual sale items in the recent sales list.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles rendering of a single sale item
 * - DRY: Eliminates repeated sale item JSX structures using BaseListItem
 * - Reusability: Can be used across different sale displays
 * - Design System Integration: Uses BaseListItem foundation for consistency
 */

import React from 'react';
import BaseListItem from './BaseListItem';
import { displayPrice } from '../../../utils';
import { getImageUrl } from '../../../utils/ui/imageUtils';

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

  const getCategoryEmoji = (category?: string) => {
    if (!category) return '🎴';
    if (category.includes('PSA')) return '🏆';
    if (category.includes('Sealed')) return '📦';
    if (category.includes('Raw')) return '🃏';
    return '🎴';
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return 'Card';
    if (category.includes('PSA')) return 'PSA';
    if (category.includes('Sealed')) return 'Sealed';
    if (category.includes('Raw')) return 'Raw';
    return 'Card';
  };

  const getSourceEmoji = (source?: string) => {
    if (source === 'Facebook') return '📘';
    if (source === 'DBA') return '🏪';
    return '🌐';
  };

  // Render product thumbnail with category badge - NATURAL ASPECT RATIO NO SQUARES
  const renderThumbnail = () => (
    <div className="flex-shrink-0 relative">
      <div className="rounded-2xl bg-white/10 border border-white/20 overflow-hidden backdrop-blur-sm shadow-lg p-4">
        {sale.thumbnailUrl ? (
          <img
            src={getImageUrl(sale.thumbnailUrl)}
            alt={sale.itemName}
            className="w-48 md:w-64 lg:w-80 h-auto object-contain max-h-none"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallbackDiv = target.nextElementSibling as HTMLElement;
              if (fallbackDiv) {
                fallbackDiv.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div
          className="w-48 md:w-64 lg:w-80 aspect-square flex items-center justify-center text-white/80 text-6xl"
          style={{
            display: sale.thumbnailUrl ? 'none' : 'flex',
          }}
        >
          {getCategoryEmoji(sale.itemCategory)}
        </div>
      </div>

      {/* Category badge - Premium glassmorphism */}
      <div className="absolute -top-3 -right-3 px-3 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500/80 to-purple-500/80 text-white border border-blue-400/70 backdrop-blur-md shadow-lg">
        {getCategoryBadge(sale.itemCategory)}
      </div>
    </div>
  );

  // Render product name and details - CLEAN READABLE TEXT
  const renderTitle = () => (
    <div className="flex-1 min-w-0 py-6 px-6">
      <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-cyan-200 transition-colors mb-4 leading-relaxed line-clamp-2">
        {sale.itemName || 'Unknown Item'}
      </h3>
      <div className="flex flex-col space-y-3">
        <div className="flex items-center text-cyan-200/90">
          <span className="text-xl mr-2">📅</span>
          <span className="text-base font-medium">
            {sale.dateSold
              ? new Date(sale.dateSold).toLocaleDateString('da-DK', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'Unknown Date'}
          </span>
        </div>
        <div className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-sm w-fit">
          <span className="text-base mr-2">{getSourceEmoji(sale.source)}</span>
          {sale.source || 'Unknown Source'}
        </div>
      </div>
    </div>
  );

  // Render price information - CLEAN PRICE DISPLAY
  const renderPriceInfo = () => (
    <div className="flex flex-col space-y-4 px-6 py-6 min-w-[180px]">
      <div className="text-center">
        <div className="text-sm text-white/70 uppercase tracking-wider mb-2 font-medium">
          My Price
        </div>
        <div className="text-lg font-semibold text-white/90 bg-white/10 rounded-lg py-2 px-4 border border-white/20">
          {displayPrice(myPrice)}
        </div>
      </div>

      <div className="text-center">
        <div className="text-sm text-emerald-400 uppercase tracking-wider mb-2 font-medium">
          Sale Price
        </div>
        <div className="text-2xl font-bold text-emerald-400 bg-emerald-500/20 rounded-lg py-3 px-4 border border-emerald-400/30">
          {displayPrice(actualPrice)}
        </div>
      </div>
    </div>
  );

  return (
    <BaseListItem
      itemKey={sale.id || `sale-${index}`}
      variant="glass"
      size="xl"
      interactive
      showHoverEffect
      leading={renderThumbnail()}
      title={renderTitle()}
      trailing={renderPriceInfo()}
      className={`backdrop-blur-sm bg-white/5 border border-white/20 rounded-2xl shadow-xl hover:bg-white/10 hover:border-white/30 hover:shadow-2xl transition-all duration-300 ${className}`}
    />
  );
};

export default RecentSaleListItem;
