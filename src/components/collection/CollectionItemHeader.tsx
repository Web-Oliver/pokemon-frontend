/**
 * Collection Item Header Component - MIGRATED TO UNIFIED SYSTEM
 * 
 * Following CLAUDE.md principles:
 * - DRY: Now uses UnifiedHeader eliminating duplicate styling
 * - Single Responsibility: Header display and actions unified in one component
 * - Reusability: Uses UnifiedHeader system for consistent styling
 */

import React from 'react';
import { ArrowLeft, Edit, Check, Trash2, Star } from 'lucide-react';
import { CollectionItem } from '../../hooks/collection/useCollectionItem';
import UnifiedHeader, { HeaderAction } from '../common/UnifiedHeader';

export interface CollectionItemHeaderProps {
  item: CollectionItem;
  title: string;
  subtitle: string;
  setName: string;
  onEdit: () => void;
  onMarkSold: () => void;
  onDelete: () => void;
  onBackToCollection: () => void;
  className?: string;
}

/**
 * Header component for collection item detail pages
 * Displays item information and primary action buttons
 */
export const CollectionItemHeader: React.FC<CollectionItemHeaderProps> = ({
  item,
  title,
  subtitle,
  setName,
  onEdit,
  onMarkSold,
  onDelete,
  onBackToCollection,
  className = '',
}) => {
  // Create actions for UnifiedHeader
  const actions: HeaderAction[] = [
    {
      icon: Edit,
      label: 'Edit Item',
      onClick: onEdit,
      variant: 'primary',
    },
    // Only show Mark Sold if not already sold
    ...(!item.sold ? [{
      icon: Check,
      label: 'Mark Sold',
      onClick: onMarkSold,
      variant: 'success' as const,
    }] : []),
    {
      icon: Trash2,
      label: 'Delete',
      onClick: onDelete,
      variant: 'danger',
    },
  ];

  // Enhanced subtitle with item details
  const enhancedSubtitle = `${subtitle} • Set: ${setName} • ${item.myPrice || '0'} kr • ${item.sold ? 'Sold' : 'Available'}`;

  return (
    <div className={className}>
      <UnifiedHeader
        title={title}
        subtitle={enhancedSubtitle}
        icon={Star}
        variant="glassmorphism"
        size="lg"
        actions={actions}
        showBackButton={true}
        onBack={onBackToCollection}
        className="mb-8"
      />
    </div>
  );
};