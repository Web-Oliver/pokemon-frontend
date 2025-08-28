/**
 * DBA Items With Timers Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for displaying items with active DBA timers
 * - OCP: Open for extension via props interface
 * - DIP: Depends on abstractions via props interface
 */

import React from 'react';
import { Clock, Star } from 'lucide-react';
import { PokemonCard } from '../../../../shared/components/atoms/design-system/PokemonCard';

interface DbaItemsWithTimersProps {
  psaCards: any[];
  rawCards: any[];
  sealedProducts: any[];
  getDbaInfo: (id: string, type: string) => any;
  renderItemCard: (
    item: any,
    type: 'psa' | 'raw' | 'sealed'
  ) => React.ReactNode;
}

const DbaItemsWithTimers: React.FC<DbaItemsWithTimersProps> = ({
  psaCards,
  rawCards,
  sealedProducts,
  getDbaInfo,
  renderItemCard,
}) => {
  // Get all items that have been previously selected for DBA
  const psaWithTimers = psaCards.filter((card) =>
    getDbaInfo(card.id || card._id, 'psa')
  );
  const rawWithTimers = rawCards.filter((card) =>
    getDbaInfo(card.id || card._id, 'raw')
  );
  const sealedWithTimers = sealedProducts.filter((product) =>
    getDbaInfo(product.id || product._id, 'sealed')
  );

  const totalWithTimers =
    psaWithTimers.length + rawWithTimers.length + sealedWithTimers.length;

  if (totalWithTimers === 0) {
    return null;
  }

  return (
    <div className="relative group overflow-hidden">
      {/* Holographic background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700"></div>

      <PokemonCard variant="glass" size="xl" className="relative p-10">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1800 ease-out rounded-3xl"></div>

        <div className="relative z-10">
          {/* Cosmic header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 mb-6 shadow-[0_0_40px_rgba(6,182,212,0.5)] animate-pulse">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-purple-300 mb-4">
              ACTIVE DBA TIMERS
            </h3>
            <p className="text-lg text-zinc-400">
              Items with active DBA countdown timers
            </p>

            {/* Statistics */}
            <div className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600/30 to-purple-600/30 border border-cyan-400/30 rounded-2xl backdrop-blur-sm">
              <Star className="w-5 h-5 text-cyan-400 mr-2 animate-pulse" />
              <span className="text-cyan-200 font-bold text-lg">
                {totalWithTimers} items on countdown
              </span>
            </div>
          </div>

          {/* Items Grid */}
          <div className="space-y-8">
            {/* PSA Cards with Timers */}
            {psaWithTimers.length > 0 && (
              <div>
                <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                  PSA Graded Cards ({psaWithTimers.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {psaWithTimers.map((card) => renderItemCard(card, 'psa'))}
                </div>
              </div>
            )}

            {/* Raw Cards with Timers */}
            {rawWithTimers.length > 0 && (
              <div>
                <h4 className="text-2xl font-bold text-cyan-200 mb-6 flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                  Raw Cards ({rawWithTimers.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {rawWithTimers.map((card) => renderItemCard(card, 'raw'))}
                </div>
              </div>
            )}

            {/* Sealed Products with Timers */}
            {sealedWithTimers.length > 0 && (
              <div>
                <h4 className="text-2xl font-bold text-purple-300 mb-6 flex items-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
                  Sealed Products ({sealedWithTimers.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sealedWithTimers.map((product) =>
                    renderItemCard(product, 'sealed')
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </PokemonCard>
    </div>
  );
};

export default DbaItemsWithTimers;
