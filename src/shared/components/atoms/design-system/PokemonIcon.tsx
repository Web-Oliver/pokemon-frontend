/**
 * Pokemon Icon Component - The Neural Icon Engine
 * Consolidates ALL icon container patterns: neumorphic, neural, orbital, glowing
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates 150+ lines of duplicate icon styling
 * - Solid: One definitive icon container implementation
 * - Reusable: Works everywhere - Activity, Dashboard, Stats, Forms
 */

import React from 'react';
import { cn } from '../../../utils/common';

export interface PokemonIconProps {
  children: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  style?: 'neural' | 'flat' | 'outline' | 'glass';
  shape?: 'circle' | 'rounded' | 'square';
  effects?: {
    orbital?: boolean;
    pulsing?: boolean;
    glowing?: boolean;
    floating?: boolean;
  };
  interactive?: boolean;
  className?: string;
}

/**
 * THE definitive icon container - replaces all neural, neumorphic icon patterns
 * Handles: Activity icons, Dashboard stats, Status indicators, Form icons, etc.
 */
export const PokemonIcon: React.FC<PokemonIconProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  style = 'neural',
  shape = 'rounded',
  effects = {},
  interactive = false,
  className = '',
}) => {
  const {
    orbital = false,
    pulsing = false,
    glowing = false,
    floating = false,
  } = effects;

  // Base foundation - used by ALL icon containers
  const baseClasses = [
    'relative flex items-center justify-center',
    'transition-all duration-500 group',
    interactive &&
      'cursor-pointer hover:scale-110 hover:rotate-6 active:scale-95',
  ]
    .filter(Boolean)
    .join(' ');

  // Size system - covers all use cases
  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  };

  const iconSizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
  };

  // Shape system
  const shapeClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-xl',
    square: 'rounded-sm',
  };

  // Style variants with proper neumorphic effects
  const getStyleClasses = (variant: string, style: string) => {
    const variants = {
      primary: {
        neural: [
          'bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-pink-500/30',
          'backdrop-blur-sm border border-white/15',
          'shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)]',
          'hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]',
        ].join(' '),
        flat: 'bg-cyan-500/20 text-cyan-300',
        outline: 'border-2 border-cyan-400/50 text-cyan-400 bg-transparent',
        glass:
          'bg-cyan-500/10 backdrop-blur-lg border border-cyan-400/30 text-cyan-200',
      },
      secondary: {
        neural: [
          'bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-orange-500/30',
          'backdrop-blur-sm border border-white/15',
          'shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)]',
          'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
        ].join(' '),
        flat: 'bg-purple-500/20 text-purple-300',
        outline: 'border-2 border-purple-400/50 text-purple-400 bg-transparent',
        glass:
          'bg-purple-500/10 backdrop-blur-lg border border-purple-400/30 text-purple-200',
      },
      success: {
        neural: [
          'bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-blue-500/30',
          'backdrop-blur-sm border border-white/15',
          'shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)]',
          'hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]',
        ].join(' '),
        flat: 'bg-emerald-500/20 text-emerald-300',
        outline:
          'border-2 border-emerald-400/50 text-emerald-400 bg-transparent',
        glass:
          'bg-emerald-500/10 backdrop-blur-lg border border-emerald-400/30 text-emerald-200',
      },
      warning: {
        neural: [
          'bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-red-500/30',
          'backdrop-blur-sm border border-white/15',
          'shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)]',
          'hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]',
        ].join(' '),
        flat: 'bg-amber-500/20 text-amber-300',
        outline: 'border-2 border-amber-400/50 text-amber-400 bg-transparent',
        glass:
          'bg-amber-500/10 backdrop-blur-lg border border-amber-400/30 text-amber-200',
      },
      danger: {
        neural: [
          'bg-gradient-to-br from-red-500/30 via-rose-500/20 to-pink-500/30',
          'backdrop-blur-sm border border-white/15',
          'shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)]',
          'hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]',
        ].join(' '),
        flat: 'bg-red-500/20 text-red-300',
        outline: 'border-2 border-red-400/50 text-red-400 bg-transparent',
        glass:
          'bg-red-500/10 backdrop-blur-lg border border-red-400/30 text-red-200',
      },
      info: {
        neural: [
          'bg-gradient-to-br from-blue-500/30 via-indigo-500/20 to-purple-500/30',
          'backdrop-blur-sm border border-white/15',
          'shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)]',
          'hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]',
        ].join(' '),
        flat: 'bg-blue-500/20 text-blue-300',
        outline: 'border-2 border-blue-400/50 text-blue-400 bg-transparent',
        glass:
          'bg-blue-500/10 backdrop-blur-lg border border-blue-400/30 text-blue-200',
      },
      neutral: {
        neural: [
          'bg-gradient-to-br from-zinc-500/30 via-slate-500/20 to-gray-500/30',
          'backdrop-blur-sm border border-white/15',
          'shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)]',
          'hover:shadow-[0_0_30px_rgba(113,113,122,0.3)]',
        ].join(' '),
        flat: 'bg-zinc-500/20 text-zinc-300',
        outline: 'border-2 border-zinc-400/50 text-zinc-400 bg-transparent',
        glass:
          'bg-zinc-500/10 backdrop-blur-lg border border-zinc-400/30 text-zinc-200',
      },
      gradient: {
        neural: [
          'bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-pink-500/30',
          'backdrop-blur-sm border border-white/15',
          'shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)]',
          'hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]',
        ].join(' '),
        flat: 'bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-white',
        outline:
          'border-2 border-purple-400/50 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400',
        glass:
          'bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-lg border border-purple-400/30 text-white',
      },
    };

    return (
      variants[variant as keyof typeof variants]?.[
        style as keyof typeof variants.primary
      ] || variants.primary.neural
    );
  };

  const finalClassName = cn(
    baseClasses,
    sizeClasses[size],
    shapeClasses[shape],
    getStyleClasses(variant, style),
    pulsing && 'animate-pulse',
    floating && 'animate-bounce',
    glowing && 'shadow-[0_0_20px_currentColor]',
    className
  );

  return (
    <div className={finalClassName}>
      {/* Inner holographic glow effect */}
      {style === 'neural' && (
        <div className="absolute inset-2 bg-gradient-to-br from-white/10 to-transparent rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      )}

      {/* Icon content */}
      <div className={cn('relative z-10 text-current', iconSizeClasses[size])}>
        {children}
      </div>

      {/* Orbital animation elements */}
      {orbital && (
        <div
          className="absolute inset-0 animate-spin opacity-40 group-hover:opacity-70 transition-opacity duration-500"
          style={{ animationDuration: '15s' }}
        >
          <div className="w-1 h-1 bg-cyan-400 rounded-full absolute -top-0.5 left-1/2 transform -translate-x-1/2 blur-sm" />
          <div className="w-0.5 h-0.5 bg-purple-400 rounded-full absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 blur-sm" />
          <div className="w-0.5 h-0.5 bg-pink-400 rounded-full absolute -left-0.5 top-1/2 transform -translate-y-1/2 blur-sm" />
          <div className="w-0.5 h-0.5 bg-emerald-400 rounded-full absolute -right-0.5 top-1/2 transform -translate-y-1/2 blur-sm" />
        </div>
      )}

      {/* Neural pulse rings */}
      {style === 'neural' && pulsing && (
        <>
          <div className="absolute inset-0 rounded-inherit border border-white/20 animate-ping opacity-30" />
          <div
            className="absolute inset-2 rounded-inherit border border-cyan-400/20 animate-ping opacity-20"
            style={{ animationDelay: '0.5s' }}
          />
        </>
      )}
    </div>
  );
};
