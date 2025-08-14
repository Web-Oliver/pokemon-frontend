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

  // Render product thumbnail with category badge
  const renderThumbnail = () => (
    <div className="flex-shrink-0 relative">
      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--theme-surface)] to-zinc-800/20 border border-[var(--theme-border)] overflow-hidden backdrop-blur-sm">
        {sale.thumbnailUrl ? (
          <img
            src={getImageUrl(sale.thumbnailUrl)}
            alt={sale.itemName}
            className="w-full h-full object-cover"
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
          className="w-full h-full flex items-center justify-center text-zinc-400 text-lg"
          style={{
            display: sale.thumbnailUrl ? 'none' : 'flex',
          }}
        >
          {getCategoryEmoji(sale.itemCategory)}
        </div>
      </div>

      {/* Category badge - Premium glassmorphism */}
      <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-cyan-300 border border-blue-400/30 backdrop-blur-sm">
        {getCategoryBadge(sale.itemCategory)}
      </div>
    </div>
  );

  // Render product name and details
  const renderTitle = () => (
    <div className="flex-1 min-w-0">
      <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] group-hover:text-cyan-200 transition-colors mb-1 truncate">
        {sale.itemName || 'Unknown Item'}
      </h3>
      <div className="flex items-center space-x-4 text-sm text-[var(--theme-text-secondary)]">
        <span>
          📅{' '}
          {sale.dateSold
            ? new Date(sale.dateSold).toLocaleDateString('da-DK', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : 'Unknown'}
        </span>
        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-zinc-700/20 to-zinc-600/10 text-[var(--theme-text-secondary)] border border-[var(--theme-border)] backdrop-blur-sm">
          {getSourceEmoji(sale.source)} {sale.source || 'Unknown'}
        </span>
      </div>
    </div>
  );

  // Render price information
  const renderPriceInfo = () => (
    <div className="flex items-center space-x-8">
      <div className="text-right">
        <div className="text-xs text-[var(--theme-text-muted)] uppercase tracking-wide mb-1">
          My Price
        </div>
        <div className="text-sm font-semibold text-[var(--theme-text-secondary)]">
          {displayPrice(myPrice)}
        </div>
      </div>

      <div className="text-right">
        <div className="text-xs text-emerald-400 uppercase tracking-wide mb-1">
          Sale Price
        </div>
        <div className="text-lg font-bold text-emerald-300">
          {displayPrice(actualPrice)}
        </div>
      </div>
    </div>
  );

  return (
    <BaseListItem
      itemKey={sale.id || `sale-${index}`}
      variant="hover"
      size="lg"
      interactive
      showHoverEffect
      leading={renderThumbnail()}
      title={renderTitle()}
      trailing={renderPriceInfo()}
      className={`backdrop-blur-sm ${className}`}
    />
  );
};

export default RecentSaleListItem;
