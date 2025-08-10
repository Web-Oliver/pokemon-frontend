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
import { Package, Plus } from 'lucide-react';
import { PokemonButton } from '../../../../../shared/components/atoms/design-system/PokemonButton';
import { GlassmorphismContainer } from '../../../../../shared/components/organisms/effects/GlassmorphismContainer';

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
  children,
}) => {
  return (
    <GlassmorphismContainer
      variant="intense"
      colorScheme="primary"
      size="lg"
      rounded="3xl"
      glow="intense"
      pattern="waves"
      className="min-h-[400px] w-full"
    >
      {/* Section Header */}
      <div className="px-8 py-6 border-b border-[var(--theme-border)] flex items-center justify-between bg-gradient-to-r from-blue-600/5 to-indigo-600/5">
        <div>
          <h2 className="text-3xl font-bold text-[var(--theme-text-primary)] tracking-wide mb-2">
            {title}
          </h2>
          <p className="text-lg font-medium text-[var(--theme-text-secondary)]">
            {items.length} item{items.length !== 1 ? 's' : ''} currently in this auction
          </p>
        </div>
        <PokemonButton
          onClick={onAddItems}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-500/20 text-lg font-semibold"
        >
          <Plus className="w-6 h-6 mr-3" />
          Add Items
        </PokemonButton>
      </div>

      {/* Empty State or Items Content */}
      {items.length === 0 ? (
        <div className="p-16 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-[var(--theme-accent-primary)] to-[var(--theme-accent-secondary)] rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
            <Package className="w-16 h-16 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-4">
            {emptyStateMessage}
          </h3>
          <p className="text-lg text-[var(--theme-text-secondary)] font-medium max-w-lg mx-auto leading-relaxed mb-10">
            {emptyStateDescription}
          </p>
          <PokemonButton
            onClick={onAddItems}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-10 py-5 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 text-lg font-semibold"
          >
            <Plus className="w-6 h-6 mr-3" />
            Add First Item
          </PokemonButton>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10">
          {children}
        </div>
      )}
    </GlassmorphismContainer>
  );
};

export default AuctionItemsSection;
