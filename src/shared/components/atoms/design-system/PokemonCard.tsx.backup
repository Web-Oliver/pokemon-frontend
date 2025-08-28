/**
 * Pokemon Card Component - Unified Design System
 * Consolidates 52+ glassmorphism card patterns into one solid component
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles all card display patterns
 * - DRY: Eliminates 400+ lines of duplicate glassmorphism code
 * - Reusability: Works across ALL pages and components
 * - Consistent: One source of truth for card styling
 */

import React from 'react';
import { cn } from '../../../utils';
import { pokemonCardVariants } from './unifiedVariants';

export interface PokemonCardProps {
  children?: React.ReactNode;

  // Base card system (original)
  variant?: 'glass' | 'solid' | 'outline' | 'gradient' | 'cosmic';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?:
    | 'active'
    | 'draft'
    | 'sold'
    | 'completed'
    | 'success'
    | 'warning'
    | 'danger';
  interactive?: boolean;
  loading?: boolean;
  className?: string;
  onClick?: () => void;

  // Metric card variant (from MetricCard.tsx)
  cardType?: 'base' | 'metric' | 'collection' | 'dba' | 'sortable';
  title?: string;
  value?: string | number;
  icon?: React.ComponentType<any>;
  colorScheme?: 'primary' | 'success' | 'warning' | 'danger' | 'custom';
  customGradient?: {
    from: string;
    via?: string;
    to: string;
  };

  // DBA card variant (from DbaItemCard.tsx)
  item?: any; // DBA item data
  itemType?: 'psa' | 'raw' | 'sealed';
  isSelected?: boolean;
  dbaInfo?: any;
  displayName?: string;
  subtitle?: string;
  onToggle?: (item: any, type: 'psa' | 'raw' | 'sealed') => void;

  // Collection card variant (from CollectionItemCard.tsx)
  images?: string[];
  price?: number;
  grade?: number;
  condition?: string;
  category?: string;
  sold?: boolean;
  saleDate?: string;
  showBadge?: boolean;
  showPrice?: boolean;
  showActions?: boolean;
  onView?: () => void;
  onMarkSold?: () => void;

  // Sortable card variant (from SortableItemCard.tsx)
  draggable?: boolean;
  dragHandleProps?: any;
  isDragging?: boolean;

  // Compact variant (from DbaCompactCard.tsx)
  compact?: boolean;

  // Cosmic theming (from cosmic variants)
  cosmic?: boolean;
}

/**
 * THE definitive card component - replaces all duplicate glassmorphism patterns
 * Used by: Activity, Dashboard, Auctions, Forms, Modals, Lists, Stats, etc.
 */
export const PokemonCard: React.FC<PokemonCardProps> = ({
  children,
  variant = 'glass',
  size = 'md',
  status,
  interactive = false,
  loading = false,
  className = '',
  onClick,

  // Metric card props
  cardType = 'base',
  title,
  value,
  icon: Icon,
  colorScheme = 'primary',
  customGradient,

  // DBA card props
  item,
  itemType,
  isSelected = false,
  dbaInfo,
  displayName,
  subtitle,
  onToggle,

  // Collection card props
  images,
  price,
  grade,
  condition,
  category,
  sold = false,
  saleDate: _saleDate,
  showBadge = true,
  showPrice = true,
  showActions = false,
  onView,
  onMarkSold,

  // Sortable card props
  draggable = false,
  dragHandleProps,
  isDragging = false,

  // Compact and cosmic variants
  compact = false,
  cosmic = false,
}) => {
  // Determine final variant based on props
  const finalVariant = cosmic ? 'cosmic' : variant;

  // Use unified variants instead of hardcoded styles
  const baseVariantClasses = pokemonCardVariants({
    variant: finalVariant,
    size: compact ? 'sm' : size,
    interactive: interactive || Boolean(onClick || onView || onToggle)
  });

  // Additional state classes
  const stateClasses = [
    'relative overflow-hidden group',
    isDragging && 'opacity-50 rotate-2 scale-105',
    compact && 'min-h-0',
  ].filter(Boolean).join(' ');

  // Status overlays using design tokens
  const statusClasses = {
    active: 'border-emerald-400/30 bg-emerald-500/5',
    draft: 'border-amber-400/30 bg-amber-500/5', 
    sold: 'border-purple-400/30 bg-purple-500/5',
    completed: 'border-emerald-400/30 bg-emerald-500/5',
    success: 'border-emerald-400/30',
    warning: 'border-amber-400/30', 
    danger: 'border-red-400/30',
  };

  // Selection and loading states
  const selectionClasses = isSelected ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]' : '';
  const loadingClasses = loading ? 'animate-pulse pointer-events-none' : '';

  // Metric card color schemes
  const getMetricColors = () => {
    if (customGradient) {
      return `bg-gradient-to-br from-${customGradient.from} ${customGradient.via ? `via-${customGradient.via}` : ''} to-${customGradient.to}`;
    }

    const schemes = {
      primary: 'from-cyan-500/20 to-blue-500/20 border-cyan-400/30',
      success: 'from-emerald-500/20 to-teal-500/20 border-emerald-400/30',
      warning: 'from-amber-500/20 to-orange-500/20 border-amber-400/30',
      danger: 'from-red-500/20 to-rose-500/20 border-red-400/30',
      custom: '',
    };

    return `bg-gradient-to-br ${schemes[colorScheme]}`;
  };

  // Combine all classes using unified variants
  const finalClassName = cn(
    baseVariantClasses,
    stateClasses,
    status && statusClasses[status],
    selectionClasses,
    cardType === 'metric' && getMetricColors(),
    loadingClasses,
    className
  );

  // Handle different card type clicks
  const handleClick = () => {
    if (onToggle && item && itemType) {
      onToggle(item, itemType);
    } else if (onView) {
      onView();
    } else if (onClick) {
      onClick();
    }
  };

  // Render metric card content
  const renderMetricContent = () => {
    if (cardType !== 'metric') return null;

    return (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-zinc-400 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        {Icon && (
          <div className="ml-4">
            <Icon className="w-8 h-8 text-cyan-400" />
          </div>
        )}
      </div>
    );
  };

  // Render DBA card content
  const renderDbaContent = () => {
    if (cardType !== 'dba') return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white truncate">{displayName}</h3>
          {isSelected && (
            <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-zinc-400 truncate">{subtitle}</p>
        )}
        {dbaInfo && (
          <div className="text-xs text-cyan-400">
            DBA Value: ${dbaInfo.value || 'N/A'}
          </div>
        )}
      </div>
    );
  };

  // Render collection card content
  const renderCollectionContent = () => {
    if (cardType !== 'collection') return null;

    return (
      <div className="space-y-3">
        {images && images.length > 0 && (
          <div className="aspect-[5/7] rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
            <img
              src={images[0]}
              alt={title || displayName || 'Collection item'}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <div className="space-y-1">
          <h3 className="font-medium text-white truncate">
            {title || displayName}
          </h3>
          {subtitle && (
            <p className="text-sm text-zinc-400 truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {showPrice && price && (
            <span className="text-emerald-400 font-medium">${price}</span>
          )}

          {showBadge && (
            <div className="flex gap-2">
              {grade && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                  PSA {grade}
                </span>
              )}
              {condition && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                  {condition}
                </span>
              )}
              {category && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                  {category}
                </span>
              )}
              {sold && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                  SOLD
                </span>
              )}
            </div>
          )}
        </div>

        {showActions && !sold && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView?.();
              }}
              className="flex-1 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm rounded transition-colors"
            >
              View
            </button>
            {onMarkSold && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkSold();
                }}
                className="flex-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm rounded transition-colors"
              >
                Mark Sold
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={finalClassName}
      onClick={handleClick}
      {...(draggable ? dragHandleProps : {})}
    >
      {/* Holographic border effect */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Cosmic theme enhancements */}
      {cosmic && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent_70%)]" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl" />
        </>
      )}

      {/* Content based on card type */}
      <div className="relative z-10">
        {cardType === 'metric' && renderMetricContent()}
        {cardType === 'dba' && renderDbaContent()}
        {cardType === 'collection' && renderCollectionContent()}
        {cardType === 'base' && children}
        {cardType === 'sortable' && (
          <div className={cn('transition-transform', isDragging && 'scale-95')}>
            {children}
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Drag handle indicator for sortable cards */}
      {draggable && !isDragging && (
        <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-4 h-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l4-4 4 4m0 6l-4 4-4-4"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
