/**
 * DBA Compact Card Cosmic - Migrated to Unified Design System
 * Layer 3: Components (CLAUDE.md Architecture)
 * Phase 2.3.1: Core DBA Component Migration
 *
 * SOLID Principles:
 * - SRP: Only handles DBA card display and selection with cosmic theme
 * - OCP: Open for extension via PokemonCard variants and composition
 * - DIP: Depends on PokemonCard abstraction and OptimizedImageView
 *
 * Migration Benefits:
 * - Uses unified PokemonCard with cosmic variant
 * - Preserves cosmic aesthetic with theme system integration
 * - Reduces code duplication by leveraging shared card patterns
 * - Maintains all original functionality while using unified system
 */

import React, { memo, useMemo } from 'react';
import { CheckCircle, Package } from 'lucide-react';
import { PokemonCard } from '../design-system/PokemonCard';
import { PokemonBadge } from '../design-system/PokemonBadge';
import { OptimizedImageView } from '../common/OptimizedImageView';

interface DbaCompactCardCosmicProps {
  item: any;
  type: 'psa' | 'raw' | 'sealed';
  isSelected: boolean;
  dbaInfo?: any;
  displayName: string;
  subtitle?: string;
  onToggle: (item: any, type: 'psa' | 'raw' | 'sealed') => void;
}

const DbaCompactCardCosmicComponent: React.FC<DbaCompactCardCosmicProps> = ({
  item,
  type,
  isSelected,
  dbaInfo,
  displayName,
  subtitle,
  onToggle,
}) => {
  // Memoize computed values for performance
  const itemId = useMemo(() => item.id || item._id, [item.id, item._id]);
  const price = useMemo(
    () => parseFloat(item.myPrice?.toString() || '0'),
    [item.myPrice]
  );
  const primaryImage = useMemo(() => item.images?.[0], [item.images]);

  const getCountdownColor = useMemo(
    () => (daysRemaining: number) => {
      if (daysRemaining > 30) {
        return 'text-green-300 bg-green-900/30 border-green-600';
      }
      if (daysRemaining > 10) {
        return 'text-yellow-300 bg-yellow-900/30 border-yellow-600';
      }
      return 'text-red-300 bg-red-900/30 border-red-600';
    },
    []
  );

  const getGradeBadgeColor = useMemo(
    () => (grade: number) => {
      if (grade >= 9) {
        return 'bg-emerald-500 text-white';
      }
      if (grade >= 7) {
        return 'bg-blue-500 text-white';
      }
      if (grade >= 5) {
        return 'bg-yellow-500 text-black';
      }
      return 'bg-gray-500 text-white';
    },
    []
  );

  return (
    <PokemonCard 
      key={itemId}
      variant="cosmic"
      size="md"
      interactive={true}
      onClick={() => onToggle(item, type)}
      className={`cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-cyan-400 ring-2 ring-cyan-500/50'
          : 'hover:border-cyan-400'
      }`}
    >
      {/* Optimized Image Background with Lazy Loading */}
      <div className="relative h-48 bg-zinc-900 overflow-hidden -m-6 mb-0">
        {primaryImage ? (
          <>
            <OptimizedImageView
              src={primaryImage}
              alt={displayName}
              className="w-full h-full object-contain"
              fallbackIcon={<Package className="w-8 h-8 text-zinc-600" />}
            />
            {/* Enhanced gradient overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none"></div>

            {/* Bottom info overlay INSIDE the image container */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 z-30">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm leading-tight truncate">
                    {displayName}
                  </h3>
                  <p className="text-white/70 text-xs truncate mt-0.5">
                    {type === 'psa'
                      ? item.cardId?.setId?.setName ||
                        item.setName ||
                        'Unknown Set'
                      : subtitle || ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  {type === 'psa' && item.grade && (
                    <div className="bg-blue-600 px-2 py-1 rounded text-xs font-bold text-white">
                      Grade {item.grade}
                    </div>
                  )}
                  {price > 0 && (
                    <div className="bg-green-600 px-2 py-1 rounded text-xs font-bold text-white">
                      {price.toLocaleString()} kr
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <div className="flex flex-col items-center space-y-2 text-zinc-500">
              <Package className="w-8 h-8" />
              <span className="text-sm">No Image</span>
            </div>
          </div>
        )}
      </div>

      {/* Selection Indicator */}
      <div className="absolute top-2 right-2 z-10">
        {isSelected ? (
          <CheckCircle className="w-5 h-5 text-cyan-400 bg-zinc-900/80 rounded-full" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-zinc-400 bg-zinc-900/80"></div>
        )}
      </div>

      {/* DBA Timer Badge - Updated to use PokemonBadge timer variant */}
      {dbaInfo && (
        <div className="absolute top-2 left-2 z-10">
          <PokemonBadge
            variant="timer"
            size="sm"
            style="glass"
            shape="pill"
            pulse={true}
            timeRemaining={`${dbaInfo.daysRemaining}d`}
            className="cosmic-timer-badge"
          >
            {dbaInfo.daysRemaining}d
          </PokemonBadge>
        </div>
      )}
    </PokemonCard>
  );
};

// Memoize with optimized comparison to prevent unnecessary re-renders
export const DbaCompactCardCosmic = memo(DbaCompactCardCosmicComponent, (prev, next) => {
  return (
    prev.item === next.item &&
    prev.type === next.type &&
    prev.isSelected === next.isSelected &&
    prev.dbaInfo === next.dbaInfo &&
    prev.displayName === next.displayName &&
    prev.subtitle === next.subtitle &&
    prev.onToggle === next.onToggle
  );
});

export default DbaCompactCardCosmic;