/**
 * DBA Compact Card Component - Custom card without slideshow
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Only handles DBA card display and selection
 * - OCP: Open for extension via props and composition
 * - DIP: Depends on OptimizedImageView abstraction
 *
 * Performance Optimizations:
 * - React.memo for render optimization
 * - useMemo for computed values
 * - OptimizedImageView for lazy loading and caching
 */

import React, { memo, useMemo } from 'react';
import { CheckCircle, Timer, Package } from 'lucide-react';
import { OptimizedImageView } from '../common/OptimizedImageView';

interface DbaCompactCardProps {
  item: any;
  type: 'psa' | 'raw' | 'sealed';
  isSelected: boolean;
  dbaInfo?: any;
  displayName: string;
  subtitle?: string;
  onToggle: (item: any, type: 'psa' | 'raw' | 'sealed') => void;
}

const DbaCompactCardComponent: React.FC<DbaCompactCardProps> = ({
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

  return (
    <div
      key={itemId}
      className={`relative border-2 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden ${
        isSelected
          ? 'border-cyan-500 bg-cyan-900/30'
          : 'border-zinc-600 bg-zinc-800 hover:border-cyan-400 hover:bg-cyan-900/20'
      }`}
      onClick={() => onToggle(item, type)}
    >
      {/* Optimized Image Background with Lazy Loading */}
      <div className="relative h-48 bg-zinc-900 overflow-hidden">
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

      {/* DBA Timer Badge */}
      {dbaInfo && (
        <div className="absolute top-2 left-2 z-10">
          <div
            className={`px-2 py-1 rounded-lg text-xs font-medium border ${getCountdownColor(dbaInfo.daysRemaining)}`}
          >
            <Timer className="w-3 h-3 inline mr-1" />
            {dbaInfo.daysRemaining}d
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize with optimized comparison to prevent unnecessary re-renders
export const DbaCompactCard = memo(DbaCompactCardComponent, (prev, next) => {
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

export default DbaCompactCard;
