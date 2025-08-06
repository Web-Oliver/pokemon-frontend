/**
 * Auction Items Section Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for displaying auction items section
 * - OCP: Open for extension via configuration props
 * - DRY: Eliminates AuctionDetail/AuctionEdit duplication (37+ lines)
 * - DIP: Depends on abstractions via props interface
 */

import React, { ReactNode } from 'react';
import { Plus, Package } from 'lucide-react';
import { PokemonButton } from '../../design-system/PokemonButton';
import { SectionContainer, EmptyState } from '../../common';

interface AuctionItem {
  id: string;
  // Other auction item properties as needed
}

interface AuctionItemsSectionProps {
  items: AuctionItem[];
  onAddItems: () => void;
  title?: string;
  emptyStateMessage?: string;
  emptyStateDescription?: string;
  children?: ReactNode; // For custom item rendering
}

const AuctionItemsSection: React.FC<AuctionItemsSectionProps> = ({
  items,
  onAddItems,
  title = 'Auction Items',
  emptyStateMessage = 'No items in auction',
  emptyStateDescription = 'Add items from your collection to this auction.',
  children
}) => {
  return (
    <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-status-success)]/3 via-teal-500/3 to-[var(--theme-accent-primary)]/3"></div>
      
      <div className="relative z-10">
        {/* Section Header */}
        <div className="px-8 py-6 border-b border-[var(--theme-border)] flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] tracking-wide">
            {title} ({items.length})
          </h2>
          <PokemonButton
            onClick={onAddItems}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-500/20"
          >
            <Plus className="w-5 h-5 mr-3" />
            Add Items
          </PokemonButton>
        </div>

        {/* Empty State or Items Content */}
        {items.length === 0 ? (
          <EmptyState
            icon={Package}
            title={emptyStateMessage}
            description={emptyStateDescription}
            action={{
              label: "Add First Item",
              onClick: onAddItems,
              variant: "primary"
            }}
            variant="default"
          />
        ) : (
          // Custom content area for items
          children
        )}
      </div>
    </div>
  );
};

export default AuctionItemsSection;