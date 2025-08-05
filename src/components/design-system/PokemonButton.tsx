/**
 * Pokemon Button Component - THE Button to Rule Them All
 * Consolidates ALL button patterns across the entire codebase
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates 200+ lines of duplicate button styling
 * - Solid: One definitive button implementation
 * - Reusable: Works in forms, modals, pages, navigation, actions
 */

import React from 'react';
import { cn } from '../../utils/common';

export interface PokemonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'cosmic';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * THE definitive button - replaces Button, btn-premium, and all other button patterns
 * Handles: forms, navigation, actions, CTAs, filters, toggles, etc.
 */
export const PokemonButton: React.FC<PokemonButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  rounded = 'lg',
  className = '',
  disabled,
  ...props
}) => {
  // Base foundation - used by ALL buttons
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-semibold tracking-wide',
    'border transition-all duration-300',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'relative overflow-hidden group',
    'backdrop-blur-sm',
  ].join(' ');

  // Variant system - covers ALL use cases
  const variantClasses = {
    primary: [
      'bg-gradient-to-r from-cyan-600 to-blue-600',
      'hover:from-cyan-700 hover:to-blue-700',
      'text-white border-cyan-500/20',
      'shadow-[0_4px_14px_0_rgb(6,182,212,0.3)]',
      'hover:shadow-[0_6px_20px_0_rgb(6,182,212,0.4)]',
      'focus:ring-cyan-500/50',
    ].join(' '),
    secondary: [
      'bg-gradient-to-r from-slate-600 to-slate-700',
      'hover:from-slate-700 hover:to-slate-800',
      'text-white border-slate-500/20',
      'shadow-[0_4px_14px_0_rgb(71,85,105,0.3)]',
      'hover:shadow-[0_6px_20px_0_rgb(71,85,105,0.4)]',
      'focus:ring-slate-500/50',
    ].join(' '),
    success: [
      'bg-gradient-to-r from-emerald-600 to-teal-600',
      'hover:from-emerald-700 hover:to-teal-700',
      'text-white border-emerald-500/20',
      'shadow-[0_4px_14px_0_rgb(16,185,129,0.3)]',
      'hover:shadow-[0_6px_20px_0_rgb(16,185,129,0.4)]',
      'focus:ring-emerald-500/50',
    ].join(' '),
    danger: [
      'bg-gradient-to-r from-red-600 to-rose-600',
      'hover:from-red-700 hover:to-rose-700',
      'text-white border-red-500/20',
      'shadow-[0_4px_14px_0_rgb(220,38,127,0.3)]',
      'hover:shadow-[0_6px_20px_0_rgb(220,38,127,0.4)]',
      'focus:ring-red-500/50',
    ].join(' '),
    warning: [
      'bg-gradient-to-r from-amber-500 to-orange-500',
      'hover:from-amber-600 hover:to-orange-600',
      'text-white border-amber-500/20',
      'shadow-[0_4px_14px_0_rgb(245,158,11,0.3)]',
      'hover:shadow-[0_6px_20px_0_rgb(245,158,11,0.4)]',
      'focus:ring-amber-500/50',
    ].join(' '),
    outline: [
      'border-2 border-zinc-600/50 bg-zinc-900/80',
      'hover:bg-zinc-800/90 hover:border-cyan-400/60',
      'text-zinc-200 hover:text-cyan-100',
      'shadow-[0_2px_8px_0_rgb(0,0,0,0.3)]',
      'hover:shadow-[0_4px_14px_0_rgb(6,182,212,0.25)]',
      'focus:ring-cyan-500/50',
    ].join(' '),
    ghost: [
      'border-transparent bg-transparent',
      'hover:bg-white/5 hover:border-white/10',
      'text-zinc-300 hover:text-white',
      'focus:ring-cyan-500/50',
    ].join(' '),
    link: [
      'border-none bg-transparent shadow-none p-0',
      'text-cyan-400 hover:text-cyan-300 underline',
      'focus:ring-cyan-500/50',
    ].join(' '),
    cosmic: [
      'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600',
      'hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700',
      'text-white border-emerald-400/20',
      'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
      'hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]',
      'hover:scale-105',
      'focus:ring-emerald-500/50',
    ].join(' '),
  };

  // Size system - covers all use cases
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
    xl: 'px-8 py-4 text-xl min-h-[56px]',
  };

  // Rounded system
  const roundedClasses = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  };

  // Interactive effects
  const interactiveClasses = [
    'transform hover:scale-105 active:scale-95',
    'hover:shadow-xl focus:shadow-2xl',
  ].join(' ');

  const finalClassName = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    interactiveClasses,
    fullWidth && 'w-full',
    className
  );

  return (
    <button
      className={finalClassName}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shimmer effect - used on premium buttons */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content container */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {/* Loading spinner */}
        {loading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-30"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {/* Left icon */}
            {icon && iconPosition === 'left' && (
              <span className={cn('flex-shrink-0', children && 'mr-1')}>
                {icon}
              </span>
            )}

            {/* Button text */}
            {children && <span>{children}</span>}

            {/* Right icon */}
            {icon && iconPosition === 'right' && (
              <span className={cn('flex-shrink-0', children && 'ml-1')}>
                {icon}
              </span>
            )}
          </>
        )}
      </div>
    </button>
  );
};
