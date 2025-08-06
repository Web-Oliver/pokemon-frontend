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
import { cn } from '../../utils/common';

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

  // Enhanced card type system - NOW INCLUDES ALL TYPES
  cardType?: 'base' | 'metric' | 'collection' | 'dba' | 'sortable' | 'auction' | 'product' | 'sale';
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
  item?: any; // Item data
  itemType?: 'psa' | 'raw' | 'sealed';
  isSelected?: boolean;
  dbaInfo?: any;
  displayName?: string;
  subtitle?: string;
  onToggle?: (item: any, type: 'psa' | 'raw' | 'sealed') => void;

  // Collection card variant (from CollectionItemCard.tsx)
  images?: string[];
  price?: number | string;
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

  // NEW: Auction card props
  onRemoveItem?: () => void;
  disabled?: boolean;
  isItemSold?: (item: any) => boolean;

  // NEW: Product card props
  product?: any;
  convertToDKK?: (price: number) => string;
  availability?: string;

  // NEW: Sale card props
  sale?: any;
  index?: number;
  actualSoldPrice?: number;
  myPrice?: number;
  source?: string;
  dateSold?: string;
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
  
  // Base glassmorphism foundation - used everywhere
  const baseClasses = [
    'relative overflow-hidden',
    'backdrop-blur-xl',
    'border border-white/[0.15]',
    'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
    'transition-all duration-500',
    'group',
    isDragging && 'opacity-50 rotate-2 scale-105',
    compact && 'min-h-0', // Override default min-height for compact variant
  ].filter(Boolean).join(' ');

  // Enhanced variant styles - consolidates all background patterns
  const variantClasses = {
    glass: [
      'bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.08] to-purple-500/[0.12]',
      'hover:shadow-[0_12px_40px_0_rgba(6,182,212,0.3)]',
    ].join(' '),
    solid: ['bg-zinc-900/90 backdrop-blur-sm', 'hover:bg-zinc-800/95'].join(' '),
    outline: [
      'bg-transparent border-zinc-700/50',
      'hover:bg-white/[0.05] hover:border-cyan-400/30',
    ].join(' '),
    gradient: [
      'bg-gradient-to-br from-cyan-500/20 via-purple-500/15 to-pink-500/20',
      'hover:from-cyan-500/30 hover:via-purple-500/25 hover:to-pink-500/30',
    ].join(' '),
    cosmic: [
      'bg-gradient-to-br from-zinc-800/80 via-cyan-900/30 to-purple-900/30',
      'border-cyan-600/50',
      'hover:border-cyan-500 hover:bg-cyan-900/30',
      'hover:shadow-[0_12px_40px_0_rgba(34,211,238,0.4)]',
    ].join(' '),
  };

  // Enhanced size system - includes compact variants
  const sizeClasses = {
    xs: compact ? 'p-2 rounded-lg' : 'p-3 rounded-xl',
    sm: compact ? 'p-3 rounded-xl' : 'p-4 rounded-xl', 
    md: compact ? 'p-4 rounded-xl' : 'p-6 rounded-[1.5rem]',
    lg: compact ? 'p-5 rounded-[1.5rem]' : 'p-8 rounded-[2rem]',
    xl: compact ? 'p-6 rounded-[2rem]' : 'p-12 rounded-[2.5rem]',
  };

  // Status colors with DBA selection state
  const statusClasses = {
    active: 'border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10',
    draft: 'border-amber-400/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10',
    sold: 'border-purple-400/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    completed: 'border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10',
    success: 'border-emerald-400/30',
    warning: 'border-amber-400/30',
    danger: 'border-red-400/30',
  };

  // DBA selection state
  const selectionClasses = isSelected 
    ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]'
    : '';

  // Interactive states - enhanced for different card types
  const interactiveClasses = (interactive || onClick || onView || onToggle)
    ? [
        'cursor-pointer',
        'hover:scale-[1.02] hover:-translate-y-1',
        'active:scale-[0.98] active:translate-y-0',
        'focus-within:ring-2 focus-within:ring-cyan-500/50',
      ].join(' ')
    : '';

  // Loading state
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

  // Combine all classes
  const finalClassName = cn(
    baseClasses,
    variantClasses[finalVariant],
    sizeClasses[size],
    status && statusClasses[status],
    selectionClasses,
    cardType === 'metric' && getMetricColors(),
    interactiveClasses,
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
          <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden">
            <img 
              src={images[0]} 
              alt={title || displayName || 'Collection item'}
  // Render auction card content
  const renderAuctionContent = () => {
    if (cardType !== 'auction') return null;
    
    return (
      <div className="flex gap-4">
        {/* Item Image */}
        <div className="flex-shrink-0">
          <div className="relative w-20 h-28 rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700">
            {images && images.length > 0 ? (
              <img
                src={images[0]}
                alt={title || displayName || 'Auction item'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Item Details */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-medium text-white truncate">{title || displayName}</h3>
            {subtitle && (
              <p className="text-sm text-zinc-400 truncate">{subtitle}</p>
            )}
            {category && (
              <span className="inline-block mt-1 px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
                {category}
              </span>
            )}
          </div>

          {/* Price and Status */}
          <div className="flex items-center justify-between">
            {price && (
              <span className="text-emerald-400 font-medium">
                {typeof price === 'string' ? price : `$${price}`}
              </span>
            )}
            {sold && (
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                SOLD
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {!disabled && (
            <div className="flex gap-2">
              {!sold && onMarkSold && isItemSold && !isItemSold(item) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkSold();
                  }}
                  className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm rounded transition-colors"
                >
                  Mark Sold
                </button>
              )}
              {onRemoveItem && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem();
                  }}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render product search card content
  const renderProductContent = () => {
    if (cardType !== 'product') return null;
    
    const productData = product || {};
    
    return (
      <div className="space-y-4">
        {/* Product Header */}
        <div>
          <h3 className="font-bold text-white truncate">{productData.name || title}</h3>
          {(productData.setName || subtitle) && (
            <p className="text-sm text-zinc-400 truncate">{productData.setName || subtitle}</p>
          )}
        </div>

        {/* Category Badge */}
        {(productData.category || category) && (
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 text-sm rounded-full border border-cyan-500/30">
            {productData.category || category}
          </span>
        )}

        {/* Price Information */}
        {(productData.price || price) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-bold text-lg">
                €{productData.price || price}
              </span>
              {convertToDKK && (
                <span className="text-zinc-400 text-sm">
                  {convertToDKK(Number(productData.price || price))}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Availability Status */}
        {(productData.available !== undefined || availability) && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${productData.available || availability === 'available' ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span className={`text-sm ${productData.available || availability === 'available' ? 'text-emerald-400' : 'text-red-400'}`}>
              {productData.available || availability === 'available' ? 'Available' : 'Out of Stock'}
            </span>
          </div>
        )}

        {/* Additional Product Info */}
        {productData.url && (
          <div className="pt-2 border-t border-zinc-700/50">
            <span className="text-xs text-zinc-500">CardMarket Product</span>
          </div>
        )}
      </div>
    );
  };

  // Render sale history card content
  const renderSaleContent = () => {
    if (cardType !== 'sale') return null;
    
    const saleData = sale || {};
    const actualPrice = Number(saleData.actualSoldPrice || actualSoldPrice) || 0;
    const myPriceValue = Number(saleData.myPrice || myPrice) || 0;
    const profit = actualPrice - myPriceValue;
    const profitPercentage = myPriceValue > 0 ? ((profit / myPriceValue) * 100) : 0;

    const getCategoryIcon = (category?: string) => {
      if (!category) return 'card';
      if (category.includes('PSA')) return 'trophy';
      if (category.includes('Sealed')) return 'package';
      return 'card';
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Unknown';
      return new Date(dateString).toLocaleDateString('da-DK', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    return (
      <div className="space-y-3">
        {/* Sale Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-white truncate">{saleData.itemName || title}</h3>
            <p className="text-sm text-zinc-400">
              {formatDate(saleData.dateSold || dateSold)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-emerald-400 font-bold">${actualPrice.toFixed(2)}</div>
            <div className="text-xs text-zinc-400">Sold</div>
          </div>
        </div>

        {/* Category and Source Badges */}
        <div className="flex flex-wrap gap-2">
          {(saleData.itemCategory || category) && (
            <span className={`px-2 py-1 text-xs rounded ${
              (saleData.itemCategory || category)?.includes('PSA') 
                ? 'bg-yellow-500/20 text-yellow-400' 
                : (saleData.itemCategory || category)?.includes('Sealed')
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-zinc-500/20 text-zinc-400'
            }`}>
              {saleData.itemCategory || category}
            </span>
          )}
          {(saleData.source || source) && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">
              {saleData.source || source}
            </span>
          )}
        </div>

        {/* Profit/Loss Analysis */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-700/50">
          <div className="text-sm">
            <span className="text-zinc-400">My Price: </span>
            <span className="text-white">${myPriceValue.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
            </div>
            <div className={`text-xs ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ({profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>
    );
  };
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="space-y-1">
          <h3 className="font-medium text-white truncate">{title || displayName}</h3>
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
        {cardType === 'auction' && renderAuctionContent()}
        {cardType === 'product' && renderProductContent()}
        {cardType === 'sale' && renderSaleContent()}
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
          <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      )}
    </div>
  );
};
