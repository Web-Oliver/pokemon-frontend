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
import SectionContainer from '../common/SectionContainer';
import { formatCurrency, formatDate } from '../../utils/itemDisplayHelpers';
import { navigationHelper } from '../../utils/navigation';

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

  // Create details array for clean rendering
  const details = [
    {
      label: 'Current Value',
      value: formatCurrency(item.myPrice || 0),
      className: 'font-bold text-[var(--theme-status-success)]',
    },
    {
      label: 'Date Added',
      value: formatDate(item.dateAdded),
      className: 'font-medium text-[var(--theme-accent-primary)]',
    },
    {
      label: 'Status',
      value: item.sold ? 'Sold' : 'Available',
      className: `font-bold px-3 py-1 rounded-lg ${
        item.sold 
          ? 'bg-[var(--theme-status-error)]/20 text-[var(--theme-status-error)]' 
          : 'bg-[var(--theme-status-success)]/20 text-[var(--theme-status-success)]'
      }`,
    },
    {
      label: 'Category',
      value: getItemCategory(),
      className: 'font-medium text-[var(--theme-accent-secondary)]',
    },
    {
      label: 'Images',
      value: item.images?.length || 0,
      className: 'font-bold text-cyan-400',
    },
    {
      label: 'Condition',
      value: getConditionDisplay(),
      className: 'font-bold text-yellow-400',
    },
  ];

  return (
    <SectionContainer
      title="Essential Details"
      subtitle="Core item information"
      variant="stats"
      size="md"
      className={`h-full ${className}`}
    >
      <div className="space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-[var(--theme-text-secondary)]">{detail.label}</span>
            <span className={detail.className}>
              {detail.value}
            </span>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
};