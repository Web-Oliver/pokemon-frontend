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
import { PokemonCard } from '../../../../../shared/components/atoms/design-system/PokemonCard';

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
    <PokemonCard
      variant="glass"
      size="lg"
      className="min-h-[400px] w-full"
    >
      {/* Section Header */}
      <div className="px-8 py-6 border-b border-white/20 flex items-center justify-between bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
        <div>
          <h2 className="text-3xl font-bold tracking-wide mb-2 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-lg font-medium text-cyan-200">
            {items.length} item{items.length !== 1 ? 's' : ''} currently in this auction
          </p>
        </div>
        <PokemonButton
          variant="success"
          size="lg"
          onClick={onAddItems}
          startIcon={<Plus className="w-6 h-6" />}
          className="px-8 py-4 text-lg font-semibold"
        >
          Add Items
        </PokemonButton>
      </div>

      {/* Empty State or Items Content */}
      {items.length === 0 ? (
        <div className="p-16 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-8 animate-pulse border border-cyan-400/30">
            <Package className="w-16 h-16 text-white" />
          </div>
          <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
            {emptyStateMessage}
          </h3>
          <p className="text-lg text-cyan-200 font-medium max-w-lg mx-auto leading-relaxed mb-10">
            {emptyStateDescription}
          </p>
          <PokemonButton
            variant="success"
            size="lg"
            onClick={onAddItems}
            startIcon={<Plus className="w-6 h-6" />}
            className="px-10 py-5 text-lg font-semibold"
          >
            Add First Item
          </PokemonButton>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border-t border-white/10">
          {children}
        </div>
      )}
    </PokemonCard>
  );
};

export default AuctionItemsSection;
