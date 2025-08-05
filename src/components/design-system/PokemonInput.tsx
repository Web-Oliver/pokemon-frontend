/**
 * Pokemon Input Component - THE Input to Rule All Forms
 * Consolidates ALL input patterns: forms, search, filters, autocomplete
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates 300+ lines of duplicate input styling
 * - Solid: One definitive input implementation
 * - Reusable: Works everywhere - forms, search, filters, modals
 */

import React, { forwardRef } from 'react';
import { cn } from '../../utils/common';

export interface PokemonInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'search' | 'filter' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

/**
 * THE definitive input - replaces Input, search-input, filter inputs, etc.
 * Handles: forms, search, autocomplete, filters, inline editing
 */
export const PokemonInput = forwardRef<HTMLInputElement, PokemonInputProps>(
  (
    {
      label,
      error,
      helper,
      variant = 'default',
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = false,
      loading = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId =
      id || `pokemon-input-${Math.random().toString(36).substr(2, 9)}`;

    // Base foundation - used by ALL inputs
    const baseClasses = [
      'block w-full',
      'bg-zinc-900/90 backdrop-blur-sm',
      'border border-zinc-700/50',
      'rounded-xl shadow-lg',
      'text-zinc-100 font-medium',
      'placeholder-zinc-400',
      'transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:border-transparent',
      'hover:shadow-xl focus:shadow-2xl',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ');

    // Variant system - covers ALL use cases
    const variantClasses = {
      default: [
        'focus:ring-cyan-500/50 focus:bg-zinc-800/95',
        'hover:border-cyan-500/40',
        'focus:shadow-[0_0_0_3px_rgb(6,182,212,0.1)]',
      ].join(' '),
      search: [
        'focus:ring-blue-500/50 focus:bg-slate-800/95',
        'hover:border-blue-500/40',
        'bg-slate-900/90',
        'rounded-2xl',
      ].join(' '),
      filter: [
        'focus:ring-purple-500/50 focus:bg-purple-900/20',
        'hover:border-purple-500/40',
        'bg-purple-900/10 border-purple-700/30',
        'rounded-full',
      ].join(' '),
      inline: [
        'focus:ring-emerald-500/50',
        'bg-transparent border-transparent border-b-zinc-700/50',
        'rounded-none shadow-none',
        'focus:border-b-emerald-400 hover:border-b-zinc-500',
      ].join(' '),
    };

    // Size system
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg',
    };

    // Error state styling
    const errorClasses = error
      ? [
          'border-red-400/60 focus:ring-red-500/50',
          'focus:border-red-400 bg-red-900/20',
        ].join(' ')
      : '';

    // Icon padding adjustments
    const iconPadding =
      leftIcon && rightIcon
        ? 'pl-12 pr-12'
        : leftIcon
          ? 'pl-12'
          : rightIcon
            ? 'pr-12'
            : '';

    const finalClassName = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      errorClasses,
      iconPadding,
      fullWidth && 'w-full',
      className
    );

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-cyan-200/90 tracking-wider uppercase"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className={cn('relative', fullWidth && 'w-full')}>
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
              <div className="w-5 h-5 text-zinc-400 group-focus-within:text-cyan-400 transition-all duration-300">
                {leftIcon}
              </div>
            </div>
          )}

          {/* Input Field */}
          <input ref={ref} id={inputId} className={finalClassName} {...props} />

          {/* Right Icon */}
          {rightIcon && !loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
              <div className="w-5 h-5 text-zinc-400 group-focus-within:text-cyan-400 transition-all duration-300">
                {rightIcon}
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10">
              <div className="w-5 h-5 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helper && !error && (
          <p className="text-xs text-cyan-200/60 font-medium">{helper}</p>
        )}

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-400 font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

PokemonInput.displayName = 'PokemonInput';
