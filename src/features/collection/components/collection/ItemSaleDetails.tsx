/**
 * Item Sale Details Component
 *
 * Extracted from CollectionItemDetail god class to follow CLAUDE.md principles:
 * - Single Responsibility: Only handles sale information display
 * - DRY: Reusable sale details pattern
 * - Reusability: Can be used by other item components
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { CollectionItem } from '../../hooks/collection/useCollectionItem';

export interface ItemSaleDetailsProps {
  item: CollectionItem;
  className?: string;
}

/**
 * Component for displaying sale transaction details
 * Shows comprehensive sale information when item is sold
 */
export const ItemSaleDetails: React.FC<ItemSaleDetailsProps> = ({
  item,
  className = '',
}) => {
  // Only render if item is sold and has sale details
  if (!item.sold || !item.saleDetails) {
    return null;
  }

  return (
    <div className={`mb-8 relative overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-pink-900/10 to-rose-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_70%)]"></div>

      <div className="relative bg-[var(--theme-surface)] backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-[var(--theme-border)] p-8 ring-1 ring-[var(--theme-border)]/50">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[var(--theme-status-error)]/20 to-[var(--theme-accent-secondary)]/20 backdrop-blur-xl border border-[var(--theme-border)] shadow-lg">
            <CheckCircle className="w-6 h-6 text-[var(--theme-status-error)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--theme-text-primary)] via-[var(--theme-status-error)]/80 to-[var(--theme-accent-secondary)]/80 bg-clip-text text-transparent">
              Sale Completed
            </h2>
            <p className="text-[var(--theme-text-secondary)] text-sm">
              Transaction details
            </p>
          </div>
        </div>

        {/* Sale Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--theme-surface-secondary)] backdrop-blur-xl border border-[var(--theme-border)]">
              <span className="text-[var(--theme-text-secondary)] font-medium">
                Sale Price
              </span>
              <span className="font-bold text-[var(--theme-status-success)] text-lg">
                {item.saleDetails.actualSoldPrice} kr
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--theme-surface-secondary)] backdrop-blur-xl border border-[var(--theme-border)]">
              <span className="text-[var(--theme-text-secondary)] font-medium">
                Payment
              </span>
              <span className="font-medium text-[var(--theme-accent-primary)]">
                {item.saleDetails.paymentMethod}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--theme-surface-secondary)] backdrop-blur-xl border border-[var(--theme-border)]">
              <span className="text-[var(--theme-text-secondary)] font-medium">
                Delivery
              </span>
              <span className="font-medium text-[var(--theme-accent-secondary)]">
                {item.saleDetails.deliveryMethod}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--theme-surface-secondary)] backdrop-blur-xl border border-[var(--theme-border)]">
              <span className="text-[var(--theme-text-secondary)] font-medium">
                Date Sold
              </span>
              <span className="font-medium text-cyan-300">
                {item.saleDetails.dateSold
                  ? new Date(item.saleDetails.dateSold).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--theme-surface-secondary)] backdrop-blur-xl border border-[var(--theme-border)]">
              <span className="text-[var(--theme-text-secondary)] font-medium">
                Buyer
              </span>
              <span className="font-medium text-yellow-300">
                {item.saleDetails.buyerFullName || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--theme-surface-secondary)] backdrop-blur-xl border border-[var(--theme-border)]">
              <span className="text-[var(--theme-text-secondary)] font-medium">
                Tracking
              </span>
              <span className="font-medium text-pink-300">
                {item.saleDetails.trackingNumber || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Breathing Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-pink-500/5 to-rose-500/5 rounded-[2rem] animate-pulse opacity-30 pointer-events-none"></div>
      </div>
    </div>
  );
};
