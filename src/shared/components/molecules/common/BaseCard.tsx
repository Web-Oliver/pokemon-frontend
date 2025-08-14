/**
 * BaseCard Component - Generic Card Foundation
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Generic card component for reusable card patterns
 * - DRY: Base card implementation to avoid duplication across card variants
 * - Reusability: Configurable card component for different use cases
 * - Integration: Works with existing theme system and design patterns
 */

import React from 'react';
import { cn } from '../../../utils';
import { themeUtils, useCentralizedTheme } from '../../../utils/ui/themeConfig';

export interface BaseCardProps {
  children?: React.ReactNode;

  // Core card properties
  variant?: 'glass' | 'solid' | 'outline' | 'gradient' | 'cosmic';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // Interactive states
  interactive?: boolean;
  loading?: boolean;
  disabled?: boolean;

  // Status and styling
  status?: 'default' | 'active' | 'success' | 'warning' | 'danger';
  elevated?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  // Event handlers
  onClick?: () => void;
  onHover?: () => void;

  // Accessibility
  'aria-label'?: string;
  role?: string;

  // Custom styling
  className?: string;

  // Theme overrides
  disableAnimations?: boolean;
  disableEffects?: boolean;
}

/**
 * Generic BaseCard component for consistent card patterns
 * Complements PokemonCard by providing a simpler, more focused card implementation
 */
export const BaseCard: React.FC<BaseCardProps> = ({
  children,
  variant = 'glass',
  size = 'md',
  interactive = false,
  loading = false,
  disabled = false,
  status = 'default',
  elevated = false,
  rounded = 'lg',
  onClick,
  onHover,
  'aria-label': ariaLabel,
  role,
  className = '',
  disableAnimations = false,
  disableEffects = false,
}) => {
  const themeConfig = useCentralizedTheme();
  const shouldDisableAnimations =
    disableAnimations || themeUtils.shouldDisableAnimations(themeConfig);
  const shouldShowEffects =
    !disableEffects && themeUtils.shouldShowParticles(themeConfig);
  const isHighContrast = themeUtils.isHighContrast(themeConfig);

  // Base card styling - consistent foundation
  const baseClasses = [
    'relative',
    'overflow-hidden',
    'transition-all duration-300 ease-out',
    'group',
    disabled && 'opacity-50 pointer-events-none',
    !shouldDisableAnimations && 'transform-gpu',
  ]
    .filter(Boolean)
    .join(' ');

  // Variant-specific styling
  const variantClasses = {
    glass: [
      'backdrop-blur-xl',
      'bg-gradient-to-br from-white/[0.10] via-white/[0.05] to-white/[0.10]',
      'border border-white/[0.12]',
      'shadow-[0_8px_32px_0_rgba(31,38,135,0.25)]',
      isHighContrast && 'border-white/30 bg-white/20',
    ]
      .filter(Boolean)
      .join(' '),

    solid: [
      'bg-zinc-900/95',
      'border border-zinc-700/50',
      'shadow-lg',
      isHighContrast && 'bg-black border-white/50',
    ]
      .filter(Boolean)
      .join(' '),

    outline: [
      'bg-transparent',
      'border border-zinc-600/40',
      'shadow-sm',
      isHighContrast && 'border-white/60',
    ]
      .filter(Boolean)
      .join(' '),

    gradient: [
      'bg-gradient-to-br from-cyan-500/15 via-purple-500/10 to-pink-500/15',
      'border border-white/[0.08]',
      'shadow-[0_8px_32px_0_rgba(31,38,135,0.20)]',
      isHighContrast && 'from-cyan-300/30 to-purple-300/30 border-white/20',
    ]
      .filter(Boolean)
      .join(' '),

    cosmic: [
      'bg-gradient-to-br from-zinc-800/90 via-cyan-900/20 to-purple-900/20',
      'border border-cyan-600/30',
      'shadow-[0_8px_32px_0_rgba(34,211,238,0.25)]',
      isHighContrast && 'border-cyan-300/50',
    ]
      .filter(Boolean)
      .join(' '),
  };

  // Size-based spacing and radius
  const sizeClasses = {
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[2rem]',
  };

  // Status-based styling
  const statusClasses = {
    default: '',
    active: 'ring-2 ring-cyan-500/30 border-cyan-400/30',
    success: 'ring-2 ring-emerald-500/30 border-emerald-400/30',
    warning: 'ring-2 ring-amber-500/30 border-amber-400/30',
    danger: 'ring-2 ring-red-500/30 border-red-400/30',
  };

  // Interactive states
  const interactiveClasses =
    (interactive || onClick) && !disabled
      ? [
          'cursor-pointer',
          !shouldDisableAnimations &&
            [
              'hover:scale-[1.02]',
              'hover:-translate-y-0.5',
              'active:scale-[0.98]',
              'active:translate-y-0',
            ]
              .filter(Boolean)
              .join(' '),
          'hover:shadow-xl',
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-cyan-500/50',
          'focus-visible:ring-offset-2',
          'focus-visible:ring-offset-zinc-900',
        ]
          .filter(Boolean)
          .join(' ')
      : '';

  // Elevation shadow enhancement
  const elevatedClasses = elevated ? 'shadow-2xl hover:shadow-3xl' : '';

  // Loading state
  const loadingClasses = loading ? 'animate-pulse pointer-events-none' : '';

  // Combine all classes
  const finalClassName = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    statusClasses[status],
    interactiveClasses,
    elevatedClasses,
    loadingClasses,
    className
  );

  // Event handlers
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = () => {
    if (!disabled && onHover) {
      onHover();
    }
  };

  return (
    <div
      className={finalClassName}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      aria-label={ariaLabel}
      role={role || (onClick ? 'button' : undefined)}
      tabIndex={interactive && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick && !disabled) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Subtle border glow effect - only if effects enabled */}
      {shouldShowEffects && !isHighContrast && (
        <div className="absolute inset-0 rounded-inherit bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}

      {/* Content area */}
      <div className="relative z-10">{children}</div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center rounded-inherit">
          <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Cosmic variant enhancements */}
      {variant === 'cosmic' && shouldShowEffects && !isHighContrast && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.06),transparent_50%)]" />
        </>
      )}
    </div>
  );
};

export default BaseCard;
