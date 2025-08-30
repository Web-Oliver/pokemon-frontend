/**
 * DBA Items Without Timers Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for displaying items available for DBA selection
 * - OCP: Open for extension via props interface
 * - DIP: Depends on abstractions via props interface
 */

import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { PokemonCard } from '@/shared/components/atoms/design-system/PokemonCard';

interface DbaItemsWithoutTimersProps {
  psaCards: any[];
  rawCards: any[];
  sealedProducts: any[];
  getDbaInfo: (id: string, type: string) => any;
  renderItemCard: (
    item: any,
    type: 'psa' | 'raw' | 'sealed'
  ) => React.ReactNode;
}

const DbaItemsWithoutTimers: React.FC<DbaItemsWithoutTimersProps> = ({
  psaCards,
  rawCards,
  sealedProducts,
  getDbaInfo,
  renderItemCard,
}) => {
  // Get all items that have NOT been previously selected for DBA
  const psaWithoutTimers = psaCards.filter(
    (card) => !getDbaInfo(card.id || card._id, 'psa')
  );
  const rawWithoutTimers = rawCards.filter(
    (card) => !getDbaInfo(card.id || card._id, 'raw')
  );
  const sealedWithoutTimers = sealedProducts.filter(
    (product) => !getDbaInfo(product.id || product._id, 'sealed')
  );

  const totalWithoutTimers =
    psaWithoutTimers.length +
    rawWithoutTimers.length +
    sealedWithoutTimers.length;

  if (totalWithoutTimers === 0) {
    return null;
  }

  return (
    <PokemonCard
      variant="glass"
      size="xl"
      className="group overflow-hidden"
    >
      {/* Holographic background */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-cyan-500/15 to-white/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700"></div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1600 ease-out rounded-3xl"></div>

      <div className="relative z-10">
        {/* Cosmic header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-white/20 via-cyan-500/50 to-white/20 mb-6 shadow-[0_0_40px_rgba(6,182,212,0.5)] animate-pulse border border-white/20">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-white mb-4">
            AVAILABLE FOR SELECTION
          </h3>
          <p className="text-lg text-cyan-200">
            Items available for DBA export
          </p>

          {/* Statistics */}
          <div className="mt-6 inline-flex items-center px-6 py-3 bg-white/10 border border-cyan-400/30 rounded-2xl backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-cyan-400 mr-2 animate-pulse" />
            <span className="text-white font-bold text-lg">
              {totalWithoutTimers} items available
            </span>
          </div>
        </div>

        {/* Items Grid */}
        <div className="space-y-8">
          {/* PSA Cards without Timers */}
          {psaWithoutTimers.length > 0 && (
            <div>
              <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                PSA Graded Cards ({psaWithoutTimers.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {psaWithoutTimers.map((card) => renderItemCard(card, 'psa'))}
              </div>
            </div>
          )}

          {/* Raw Cards without Timers */}
          {rawWithoutTimers.length > 0 && (
            <div>
              <h4 className="text-2xl font-bold text-cyan-200 mb-6 flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                Raw Cards ({rawWithoutTimers.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {rawWithoutTimers.map((card) => renderItemCard(card, 'raw'))}
              </div>
            </div>
          )}

          {/* Sealed Products without Timers */}
          {sealedWithoutTimers.length > 0 && (
            <div>
              <h4 className="text-2xl font-bold text-cyan-200 mb-6 flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                Sealed Products ({sealedWithoutTimers.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sealedWithoutTimers.map((product) =>
                  renderItemCard(product, 'sealed')
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PokemonCard>
  );
};

export default DbaItemsWithoutTimers;
