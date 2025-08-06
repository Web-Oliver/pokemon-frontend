/**
 * DBA Empty State Component (Cosmic Theme)
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for displaying empty collection state with cosmic aesthetic
 * - OCP: Open for extension via props
 * - DIP: Self-contained with no external dependencies
 * - DRY: Uses PokemonCard with cosmic variant for consistency
 */

import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import { PokemonCard } from '../../../../shared/components/atoms/design-system/PokemonCard';

interface DbaEmptyStateCosmicProps {
  psaCardsLength: number;
  rawCardsLength: number;
  sealedProductsLength: number;
}

const DbaEmptyStateCosmic: React.FC<DbaEmptyStateCosmicProps> = ({
  psaCardsLength,
  rawCardsLength,
  sealedProductsLength,
}) => {
  // Only show if all collections are empty
  if (psaCardsLength > 0 || rawCardsLength > 0 || sealedProductsLength > 0) {
    return null;
  }

  return (
    <div className="relative group overflow-hidden">
      <PokemonCard
        variant="cosmic"
        size="xl"
        className="relative group overflow-hidden"
      >
        {/* Holographic background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/15 via-purple-500/15 to-pink-500/15 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700"></div>

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-400/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000 ease-out rounded-3xl"></div>

        <div className="relative z-10 text-center py-8">
          {/* Cosmic icon */}
          <div className="relative mb-12">
            <div className="w-32 h-32 bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-violet-400/30 backdrop-blur-sm">
              <div className="relative">
                <Sparkles className="w-16 h-16 text-violet-400" />
                {/* Floating particles around icon */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-gradient-to-r from-violet-400 to-pink-400 rounded-full animate-bounce opacity-60"
                    style={{
                      left: `${Math.random() * 100 - 50}px`,
                      top: `${Math.random() * 100 - 50}px`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                    }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/10 to-pink-500/10 blur-2xl animate-pulse"></div>
          </div>

          <h3 className="text-3xl font-bold text-white mb-4">No Items Found</h3>
          <p className="text-lg text-zinc-400 max-w-md mx-auto mb-6">
            Add items to your collection to start exporting to DBA.dk
          </p>

          <div className="inline-flex items-center px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-lg">
            <Star className="w-4 h-4 text-zinc-400 mr-2" />
            <span className="text-zinc-300 text-sm">
              Add items to get started
            </span>
          </div>
        </div>
      </PokemonCard>
    </div>
  );
};

export default DbaEmptyStateCosmic;
