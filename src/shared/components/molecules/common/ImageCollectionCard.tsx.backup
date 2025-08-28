/**
 * ImageCollectionCard Component - For Item Display with Images
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Displays collection items with images
 * - DRY: Reusable card for items with images, titles, prices, actions
 * - Integration: Works with unified design system
 *
 * UNIFIED DESIGN SYSTEM:
 * - Glassmorphism: white/10 backgrounds with backdrop-blur-sm
 * - Images: w-full h-auto object-contain for natural aspect ratios
 * - Borders: white/20 base with cyan-400/30 hover states
 * - Actions: Proper button styling with unified colors
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../../utils';
import { PokemonButton } from '../../atoms/design-system/PokemonButton';
import { pokemonCardVariants, pokemonBadgeVariants } from '../../atoms/design-system/unifiedVariants';

export interface ImageCollectionCardAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
}

export interface ImageCollectionCardBadge {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

export interface ImageCollectionCardDetail {
  label: string;
  value: string;
}

export interface ImageCollectionCardProps {
  // Content
  title: string;
  subtitle?: string;
  imageUrl?: string;
  imageAlt?: string;
  price?: number;
  badge?: ImageCollectionCardBadge;
  
  // Actions
  actions?: ImageCollectionCardAction[];
  
  // Details
  extraDetails?: ImageCollectionCardDetail[];
  
  // States
  showSoldOverlay?: boolean;
  loading?: boolean;
  disabled?: boolean;
  
  // Styling
  variant?: 'glass' | 'solid' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  
  // Events
  onClick?: () => void;
  
  // Custom
  className?: string;
}

export const ImageCollectionCard: React.FC<ImageCollectionCardProps> = ({
  title,
  subtitle,
  imageUrl,
  imageAlt,
  price,
  badge,
  actions = [],
  extraDetails = [],
  showSoldOverlay = false,
  loading = false,
  disabled = false,
  variant = 'glass',
  size = 'md',
  interactive = false,
  onClick,
  className = '',
}) => {
  // Use unified card variants instead of custom glassmorphism
  const cardClasses = pokemonCardVariants({
    variant,
    size,
    interactive: interactive && !disabled
  });

  const stateClasses = [
    'w-full group',
    disabled && 'opacity-50 pointer-events-none',
    loading && 'animate-pulse',
  ].filter(Boolean).join(' ');

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const getBadgeClasses = (variant?: string) => {
    const badgeVariant = variant === 'info' ? 'primary' : (variant as any) || 'default';
    return pokemonBadgeVariants({ variant: badgeVariant });
  };

  return (
    <div
      className={cn(cardClasses, stateClasses, className)}
      onClick={onClick}
    >
      {/* Hover effects */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 animate-pulse" />
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="space-y-3">
          {/* Image */}
          {imageUrl ? (
            <div className="w-full bg-white/10 rounded-lg overflow-hidden border border-white/20">
              <img 
                src={imageUrl} 
                alt={imageAlt || title}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
              
              {/* Sold Overlay */}
              {showSoldOverlay && (
                <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SOLD</span>
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
              <div className="text-white/50 text-sm">No Image</div>
            </div>
          )}
          
          {/* Title & Subtitle */}
          <div className="space-y-1">
            <h3 className="font-medium text-white truncate">{title}</h3>
            {subtitle && (
              <p className="text-sm text-cyan-200/70 truncate">{subtitle}</p>
            )}
          </div>
          
          {/* Price & Badge */}
          <div className="flex items-center justify-between">
            {price !== undefined && (
              <span className="text-emerald-400 font-medium">
                {formatPrice(price)}
              </span>
            )}
            
            {badge && (
              <div className="flex gap-2">
                <span className={getBadgeClasses(badge.variant)}>
                  {badge.text}
                </span>
              </div>
            )}
          </div>
          
          {/* Extra Details */}
          {extraDetails.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-white/20">
              {extraDetails.map((detail, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-white/60">{detail.label}:</span>
                  <span className="text-white/80">{detail.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Actions */}
          {actions.length > 0 && (
            <div className="flex gap-2 pt-2">
              {actions.map((action, index) => (
                <PokemonButton
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.onClick}
                  disabled={disabled}
                  className="flex-1 text-sm"
                  startIcon={action.icon}
                >
                  {action.label}
                </PokemonButton>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCollectionCard;