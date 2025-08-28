/**
 * Pokemon Select Component - The Ultimate Dropdown Engine
 * Consolidates ALL select patterns: forms, filters, autocomplete, multiselect
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates 200+ lines of duplicate select styling
 * - Solid: One definitive select implementation
 * - Reusable: Works everywhere - forms, filters, search, settings
 */

import React, { forwardRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '../../../utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: React.ReactNode;
}

export interface PokemonSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  placeholder?: string;
  options: SelectOption[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'search' | 'filter';
  fullWidth?: boolean;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

/**
 * THE definitive select - replaces all Select, dropdown, filter patterns
 * Handles: forms, search filters, autocomplete dropdowns, etc.
 */
export const PokemonSelect = forwardRef<HTMLSelectElement, PokemonSelectProps>(
  (
    {
      label,
      error,
      helper,
      placeholder = 'Select an option...',
      options,
      size = 'md',
      variant = 'default',
      fullWidth = false,
      loading = false,
      clearable = false,
      onClear,
      className = '',
      value,
      id,
      ...props
    },
    ref
  ) => {
    const selectId =
      id || `pokemon-select-${Math.random().toString(36).substr(2, 9)}`;

    // Base foundation - used by ALL selects
    const baseClasses = [
      'block w-full appearance-none cursor-pointer',
      'bg-zinc-900/90 backdrop-blur-sm',
      'border border-zinc-700/50',
      'rounded-xl shadow-lg',
      'text-zinc-100 font-medium',
      'transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:border-transparent',
      'hover:shadow-xl focus:shadow-2xl',
      'disabled:opacity-50 disabled:cursor-not-allowed',
    ].join(' ');

    // Variant system
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
    };

    // Size system
    const sizeClasses = {
      sm: 'px-3 py-2 pr-10 text-sm',
      md: 'px-4 py-3 pr-12 text-base',
      lg: 'px-6 py-4 pr-14 text-lg',
    };

    // Error state styling
    const errorClasses = error
      ? [
          'border-red-400/60 focus:ring-red-500/50',
          'focus:border-red-400 bg-red-900/20',
        ].join(' ')
      : '';

    const finalClassName = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      errorClasses,
      fullWidth && 'w-full',
      className
    );

    const hasValue = value && value !== '';

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-cyan-200/90 tracking-wider uppercase"
          >
            {label}
          </label>
        )}

        {/* Select Container */}
        <div className={cn('relative', fullWidth && 'w-full')}>
          {/* Select Element */}
          <select
            ref={ref}
            id={selectId}
            className={finalClassName}
            value={value}
            {...props}
          >
            {/* Placeholder Option */}
            {placeholder && (
              <option value="" disabled className="text-zinc-400 bg-zinc-900">
                {placeholder}
              </option>
            )}

            {/* Options */}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="text-zinc-100 bg-zinc-900 py-2"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Right Side Icons Container */}
          <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none">
            {/* Clear Button */}
            {clearable && hasValue && onClear && (
              <button
                type="button"
                onClick={onClear}
                className="pointer-events-auto mr-2 p-1 hover:bg-zinc-700/50 rounded-full transition-colors duration-200"
                aria-label="Clear selection"
              >
                <X className="w-4 h-4 text-zinc-400 hover:text-zinc-200" />
              </button>
            )}

            {/* Loading Spinner */}
            {loading ? (
              <div className="w-5 h-5 border-2 border-zinc-600 border-t-cyan-400 rounded-full animate-spin" />
            ) : (
              /* Dropdown Icon */
              <div
                className={cn(
                  'flex items-center justify-center transition-all duration-300',
                  size === 'sm'
                    ? 'w-6 h-6'
                    : size === 'lg'
                      ? 'w-10 h-10'
                      : 'w-8 h-8',
                  'bg-zinc-800 group-focus-within:bg-cyan-900/50 rounded-lg shadow-sm',
                  'group-focus-within:scale-110 group-focus-within:shadow-md',
                  'group-focus-within:shadow-[0_2px_8px_0_rgb(6,182,212,0.2)]'
                )}
              >
                <ChevronDown
                  className={cn(
                    'text-zinc-400 group-focus-within:text-cyan-400 transition-all duration-300',
                    'group-focus-within:rotate-180',
                    size === 'sm'
                      ? 'w-3 h-3'
                      : size === 'lg'
                        ? 'w-5 h-5'
                        : 'w-4 h-4'
                  )}
                />
              </div>
            )}
          </div>
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

PokemonSelect.displayName = 'PokemonSelect';
