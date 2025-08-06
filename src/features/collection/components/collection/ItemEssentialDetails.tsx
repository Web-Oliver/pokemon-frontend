/**
 * Item Essential Details Component
 *
 * Extracted from CollectionItemDetail god class to follow CLAUDE.md principles:
 * - Single Responsibility: Only handles essential item information display
 * - DRY: Reusable detail display pattern
 * - Reusability: Can be used by other item components
 */

import React from 'react';
import { CollectionItem } from '../../hooks/collection/useCollectionItem';
import { PokemonCard } from '../../../../shared/components/atoms/design-system/PokemonCard';
import {
  formatCurrency,
  formatDate,
} from '../../../../shared/utils/helpers/itemDisplayHelpers';
import { navigationHelper } from '../../../../shared/utils/helpers/navigation';

export interface ItemEssentialDetailsProps {
  item: CollectionItem;
  className?: string;
}

/**
 * Component for displaying essential item information
 * Shows current value, date added, status, category, images count, and condition
 */
export const ItemEssentialDetails: React.FC<ItemEssentialDetailsProps> = ({
  item,
  className = '',
}) => {
  // Get item type from URL for category display
  const getItemCategory = () => {
    const { type } = navigationHelper.getCollectionItemParams();
    switch (type) {
      case 'psa':
        return 'PSA Graded';
      case 'raw':
        return 'Raw Card';
      case 'sealed':
        return 'Sealed Product';
      default:
        return 'Unknown';
    }
  };

  // Get condition display based on item type
  const getConditionDisplay = () => {
    if ('grade' in item) {
      return `Grade ${item.grade}`;
    }
    if ('condition' in item) {
      return item.condition;
    }
    return 'Sealed';
  };

  return (
    <PokemonCard
      title="Essential Details"
      subtitle="Core item information"
      variant="outlined"
      className={`h-full ${className}`}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[var(--theme-text-secondary)]">
            Current Value
          </span>
          <span className="font-bold text-[var(--theme-status-success)]">
            {formatCurrency(item.myPrice || 0)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[var(--theme-text-secondary)]">Date Added</span>
          <span className="font-medium text-[var(--theme-accent-primary)]">
            {formatDate(item.dateAdded)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[var(--theme-text-secondary)]">Status</span>
          <span
            className={`font-bold px-3 py-1 rounded-lg ${
              item.sold
                ? 'bg-[var(--theme-status-error)]/20 text-[var(--theme-status-error)]'
                : 'bg-[var(--theme-status-success)]/20 text-[var(--theme-status-success)]'
            }`}
          >
            {item.sold ? 'Sold' : 'Available'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[var(--theme-text-secondary)]">Category</span>
          <span className="font-medium text-[var(--theme-accent-secondary)]">
            {getItemCategory()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[var(--theme-text-secondary)]">Images</span>
          <span className="font-bold text-cyan-400">
            {item.images?.length || 0}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[var(--theme-text-secondary)]">Condition</span>
          <span className="font-bold text-yellow-400">
            {getConditionDisplay()}
          </span>
        </div>
      </div>
    </PokemonCard>
  );
};
