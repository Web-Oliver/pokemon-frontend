/**
 * Pokemon Badge Component - The Ultimate Status Indicator
 * Consolidates ALL badge patterns: status, activity, filters, tags, labels
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates 100+ lines of duplicate badge styling
 * - Solid: One definitive badge implementation
 * - Reusable: Works everywhere - Activity, Auctions, forms, lists
 */

import React from 'react';
import { cn } from '../../../utils/helpers/common';

// Timer icon component (inline to avoid external dependencies)
const TimerIcon: React.FC<{ className?: string }> = ({
  className = 'w-3 h-3',
}) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
      clipRule="evenodd"
    />
  </svg>
);

export interface PokemonBadgeProps {
  children: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | 'gradient'
    | 'timer'
    | 'cosmic';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  style?: 'solid' | 'outline' | 'glass' | 'minimal';
  shape?: 'rounded' | 'pill' | 'square';
  dot?: boolean;
  pulse?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  /** Timer-specific props */
  timeRemaining?: string;
  showTimerIcon?: boolean;
}

/**
 * THE definitive badge - replaces all badge, pill, tag, status patterns
 * Handles: Activity status, Auction states, Form validation, Filter tags, etc.
 */
export const PokemonBadge: React.FC<PokemonBadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  style = 'solid',
  shape = 'rounded',
  dot = false,
  pulse = false,
  removable = false,
  onRemove,
  className = '',
  timeRemaining,
  showTimerIcon = true,
}) => {
  // Base foundation - used by ALL badges
  const baseClasses = [
    'inline-flex items-center gap-1.5',
    'font-semibold transition-all duration-300',
    'border backdrop-blur-sm',
  ].join(' ');

  // Size system - covers all use cases
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  // Shape system
  const shapeClasses = {
    rounded: 'rounded-lg',
    pill: 'rounded-full',
    square: 'rounded-sm',
  };

  // Style variants - solid, outline, glass, minimal
  const getStyleClasses = (variant: string, style: string) => {
    const variants = {
      primary: {
        solid:
          'bg-cyan-500/90 text-white border-cyan-400/50 shadow-[0_2px_8px_0_rgb(6,182,212,0.3)]',
        outline:
          'bg-transparent text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10',
        glass:
          'bg-cyan-500/20 text-cyan-200 border-cyan-400/30 backdrop-blur-lg',
        minimal: 'bg-cyan-500/10 text-cyan-300 border-transparent',
      },
      secondary: {
        solid:
          'bg-slate-500/90 text-white border-slate-400/50 shadow-[0_2px_8px_0_rgb(71,85,105,0.3)]',
        outline:
          'bg-transparent text-slate-400 border-slate-400/50 hover:bg-slate-400/10',
        glass:
          'bg-slate-500/20 text-slate-200 border-slate-400/30 backdrop-blur-lg',
        minimal: 'bg-slate-500/10 text-slate-300 border-transparent',
      },
      success: {
        solid:
          'bg-emerald-500/90 text-white border-emerald-400/50 shadow-[0_2px_8px_0_rgb(16,185,129,0.3)]',
        outline:
          'bg-transparent text-emerald-400 border-emerald-400/50 hover:bg-emerald-400/10',
        glass:
          'bg-emerald-500/20 text-emerald-200 border-emerald-400/30 backdrop-blur-lg',
        minimal: 'bg-emerald-500/10 text-emerald-300 border-transparent',
      },
      warning: {
        solid:
          'bg-amber-500/90 text-white border-amber-400/50 shadow-[0_2px_8px_0_rgb(245,158,11,0.3)]',
        outline:
          'bg-transparent text-amber-400 border-amber-400/50 hover:bg-amber-400/10',
        glass:
          'bg-amber-500/20 text-amber-200 border-amber-400/30 backdrop-blur-lg',
        minimal: 'bg-amber-500/10 text-amber-300 border-transparent',
      },
      danger: {
        solid:
          'bg-red-500/90 text-white border-red-400/50 shadow-[0_2px_8px_0_rgb(239,68,68,0.3)]',
        outline:
          'bg-transparent text-red-400 border-red-400/50 hover:bg-red-400/10',
        glass: 'bg-red-500/20 text-red-200 border-red-400/30 backdrop-blur-lg',
        minimal: 'bg-red-500/10 text-red-300 border-transparent',
      },
      info: {
        solid:
          'bg-blue-500/90 text-white border-blue-400/50 shadow-[0_2px_8px_0_rgb(59,130,246,0.3)]',
        outline:
          'bg-transparent text-blue-400 border-blue-400/50 hover:bg-blue-400/10',
        glass:
          'bg-blue-500/20 text-blue-200 border-blue-400/30 backdrop-blur-lg',
        minimal: 'bg-blue-500/10 text-blue-300 border-transparent',
      },
      neutral: {
        solid:
          'bg-zinc-500/90 text-white border-zinc-400/50 shadow-[0_2px_8px_0_rgb(113,113,122,0.3)]',
        outline:
          'bg-transparent text-zinc-400 border-zinc-400/50 hover:bg-zinc-400/10',
        glass:
          'bg-zinc-500/20 text-zinc-200 border-zinc-400/30 backdrop-blur-lg',
        minimal: 'bg-zinc-500/10 text-zinc-300 border-transparent',
      },
      gradient: {
        solid:
          'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white border-transparent shadow-[0_2px_8px_0_rgb(168,85,247,0.3)]',
        outline:
          'bg-transparent text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 border-gradient-to-r border-cyan-400/50',
        glass:
          'bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white border-purple-400/30 backdrop-blur-lg',
        minimal:
          'bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 text-purple-300 border-transparent',
      },
      timer: {
        solid: 'cosmic-timer-badge text-white border-transparent',
        outline:
          'bg-transparent text-cyan-400 border-cyan-400/50 cosmic-glow-pulse hover:bg-cyan-400/10',
        glass:
          'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-200 border-cyan-400/30 backdrop-blur-lg cosmic-glow-pulse',
        minimal:
          'bg-cyan-500/10 text-cyan-300 border-transparent cosmic-glow-pulse',
      },
      cosmic: {
        solid: 'cosmic-card-bg text-white border-transparent cosmic-pulse',
        outline:
          'bg-transparent text-purple-400 border-purple-400/50 holographic-shimmer hover:bg-purple-400/10',
        glass:
          'cosmic-background text-purple-200 border-purple-400/30 backdrop-blur-lg cosmic-pulse',
        minimal:
          'cosmic-neural-bg text-purple-300 border-transparent cosmic-float',
      },
    };

    return (
      variants[variant as keyof typeof variants]?.[
        style as keyof typeof variants.primary
      ] || variants.primary.solid
    );
  };

  const finalClassName = cn(
    baseClasses,
    sizeClasses[size],
    shapeClasses[shape],
    getStyleClasses(variant, style),
    pulse && 'animate-pulse',
    className
  );

  return (
    <span className={finalClassName}>
      {/* Status Dot */}
      {dot && (
        <span
          className={cn(
            'w-2 h-2 rounded-full bg-current flex-shrink-0',
            pulse && 'animate-pulse'
          )}
        />
      )}

      {/* Timer Icon */}
      {variant === 'timer' && showTimerIcon && (
        <TimerIcon className="w-3 h-3 flex-shrink-0" />
      )}

      {/* Badge Content */}
      <span className="truncate">
        {variant === 'timer' && timeRemaining ? timeRemaining : children}
      </span>

      {/* Remove Button */}
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 hover:bg-white/20 rounded-full p-0.5 transition-colors duration-200"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
};

/**
 * Timer badge configuration for cosmic theme
 * Supports PokemonBadge timer variant integration
 * Moved from cosmicEffects.ts for better component-specific organization
 */
export const COSMIC_TIMER_CONFIG = {
  variant: 'gradient' as const,
  style: 'glass' as const,
  size: 'sm' as const,
  shape: 'pill' as const,
  pulse: true,
  className: 'cosmic-glow',
};

export default PokemonBadge;
