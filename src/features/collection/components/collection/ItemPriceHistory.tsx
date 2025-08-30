/**
 * Item Price History Component
 *
 * Extracted from CollectionItemDetail god class to follow CLAUDE.md principles:
 * - Single Responsibility: Only handles price history and price update functionality
 * - DRY: Reusable price management pattern
 * - Reusability: Can be used by other item components
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { CollectionItem } from '../../hooks/collection/useCollectionItem';
import { PokemonCard } from '@/shared/components/atoms/design-system/PokemonCard';
import { PriceHistoryDisplay } from '@/components/PriceHistoryDisplay';

export interface ItemPriceHistoryProps {
  item: CollectionItem;
  newPrice: string;
  onPriceInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCustomPriceUpdate: () => void;
  isValidPrice: boolean;
  isPriceChanged: boolean;
  className?: string;
}

/**
 * Component for displaying price history and handling price updates
 * Shows value timeline and provides price update interface
 */
export const ItemPriceHistory: React.FC<ItemPriceHistoryProps> = ({
  item,
  newPrice,
  onPriceInputChange,
  onCustomPriceUpdate,
  isValidPrice,
  isPriceChanged,
  className = '',
}) => {
  const canUpdatePrice = !item.sold && isValidPrice && isPriceChanged;

  return (
    <PokemonCard
      title="Value Timeline"
      subtitle="Price tracking & history"
      variant="outline"
      className={`h-full ${className}`}
    >
      <div className="space-y-6">
        <PriceHistoryDisplay
          priceHistory={item.priceHistory || []}
          currentPrice={item.myPrice}
          onPriceUpdate={undefined} // Not used in this context
        />

        {/* Price Update Section */}
        {!item.sold && (
          <div className="pt-6 border-t border-[var(--theme-border)]">
            <h3 className="text-lg font-bold text-[var(--theme-text-primary)] mb-4">
              Update Price
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter new price (e.g., 1500)"
                value={newPrice}
                onChange={onPriceInputChange}
                className="w-full p-3 rounded-xl bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)] focus:ring-2 focus:ring-[var(--theme-accent-primary)] focus:border-[var(--theme-accent-primary)] transition-all"
              />
              <button
                onClick={onCustomPriceUpdate}
                disabled={!canUpdatePrice}
                className="w-full px-4 py-3 bg-[var(--theme-accent-primary)] text-white rounded-xl hover:bg-[var(--theme-accent-primary)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Update Price</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </PokemonCard>
  );
};
