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
import { Loader2 } from 'lucide-react';
import { useVisualTheme } from '../../hooks/theme/useVisualTheme';
import { useLayoutTheme } from '../../hooks/theme/useLayoutTheme';  
import { useAnimationTheme } from '../../hooks/theme/useAnimationTheme';
import { inputClasses } from '../../utils/classNameUtils';
import { FormWrapper } from '../common/FormElements/FormWrapper';
import { Label } from '../common/FormElements/Label';
import { HelperText } from '../common/FormElements/HelperText';
import type { VisualTheme, Density, AnimationIntensity } from '../../types/themeTypes';

export interface PokemonInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Original PokemonInput props
  label?: string;
  error?: string;
  helper?: string;
  variant?: 'default' | 'search' | 'filter' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  
  // Theme system compatibility props
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  theme?: VisualTheme;
  _colorScheme?: string;
  density?: Density;
  animationIntensity?: AnimationIntensity;
  testId?: string;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
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
      startIcon, // Theme system compatibility
      endIcon,   // Theme system compatibility
      fullWidth = false,
      loading = false,
      required = false,
      disabled = false,
      readOnly = false,
      theme,
      _colorScheme,
      density,
      animationIntensity,
      helperText, // Theme system compatibility
      testId,
      className = '',
      id,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    // Theme context integration
    const { visualTheme } = useVisualTheme();
    const { density: contextDensity } = useLayoutTheme();
    const { animationIntensity: contextAnimationIntensity } = useAnimationTheme();

    // Merge context theme with component props
    const effectiveTheme = theme || visualTheme;
    const effectiveDensity = density || contextDensity;
    const effectiveAnimationIntensity = animationIntensity || contextAnimationIntensity;

    // Icon compatibility - support both legacy and theme system patterns
    const resolvedStartIcon = startIcon || leftIcon;
    const resolvedEndIcon = endIcon || rightIcon;
    const resolvedHelper = helperText || helper;

    const inputId = id || `pokemon-input-${Math.random().toString(36).substr(2, 9)}`;

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
      'group-focus-within:border-theme-border-accent/60',
    ].join(' ');

    // Enhanced variant system with theme integration
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
      // Theme system variants
      theme: effectiveTheme ? inputClasses({
        size,
        hasError: !!error,
        disabled,
        theme: effectiveTheme,
        fullWidth,
      }) : '',
    };

    // Size system with density support
    const sizeClasses = {
      sm: effectiveDensity === 'compact' ? 'px-2 py-1 text-sm' : 'px-3 py-2 text-sm',
      md: effectiveDensity === 'compact' ? 'px-3 py-2 text-base' : 
          effectiveDensity === 'spacious' ? 'px-6 py-4 text-base' : 'px-4 py-3 text-base',
      lg: effectiveDensity === 'compact' ? 'px-4 py-3 text-lg' : 
          effectiveDensity === 'spacious' ? 'px-8 py-5 text-lg' : 'px-6 py-4 text-lg',
    };

    // Animation classes based on intensity
    const animationClasses = effectiveAnimationIntensity === 'disabled' ? '' :
      effectiveAnimationIntensity === 'subtle' ? 'hover:shadow-theme-hover focus:shadow-theme-hover' :
      effectiveAnimationIntensity === 'enhanced' ? 'hover:shadow-theme-hover hover:scale-101 focus:shadow-theme-hover focus:scale-101 group-focus-within:scale-110 group-focus-within:drop-shadow-sm' :
      'hover:shadow-theme-hover focus:shadow-theme-hover';

    // Error state styling
    const errorClasses = error
      ? [
          'border-red-400/60 focus:ring-red-500/50',
          'focus:border-red-400 bg-red-900/20',
        ].join(' ')
      : '';

    // Icon padding adjustments
    const hasStartIcon = !!(resolvedStartIcon);
    const hasEndIcon = !!(resolvedEndIcon);
    const iconPadding = hasStartIcon && hasEndIcon ? 'pl-12 pr-12' :
      hasStartIcon ? 'pl-12' :
      hasEndIcon ? 'pr-12' : '';

    // Choose variant classes based on theme usage
    const chosenVariantClasses = effectiveTheme && variant === 'default' ? 
      variantClasses.theme : variantClasses[variant];

    const finalClassName = cn(
      baseClasses,
      chosenVariantClasses,
      sizeClasses[size],
      errorClasses,
      iconPadding,
      animationClasses,
      fullWidth && 'w-full',
      className
    );

    // Icon classes with theme support
    const iconClasses = cn(
      'h-5 w-5 text-zinc-400 transition-all duration-theme-normal',
      'group-focus-within:text-theme-primary',
      effectiveAnimationIntensity === 'enhanced' &&
        'group-focus-within:scale-110 group-focus-within:drop-shadow-sm'
    );

    // Input with icon container classes
    const inputWithIconClasses = hasStartIcon || hasEndIcon ? 'group' : '';

    return (
      <FormWrapper fullWidth={fullWidth} error={!!error}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        <div className={cn('relative', inputWithIconClasses, fullWidth && 'w-full')}>
          {/* Start Icon */}
          {resolvedStartIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              {React.isValidElement(resolvedStartIcon) ? (
                React.cloneElement(resolvedStartIcon as React.ReactElement, {
                  className: iconClasses,
                })
              ) : (
                <div className={iconClasses}>{resolvedStartIcon}</div>
              )}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={finalClassName}
            disabled={disabled || loading}
            readOnly={readOnly}
            data-testid={testId}
            onFocus={onFocus}
            onBlur={onBlur}
            {...props}
          />

          {/* End Icon or Loading */}
          {(resolvedEndIcon || loading) && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
              {loading ? (
                <Loader2 className={cn(iconClasses, 'animate-spin')} />
              ) : React.isValidElement(resolvedEndIcon) ? (
                React.cloneElement(resolvedEndIcon as React.ReactElement, {
                  className: iconClasses,
                })
              ) : (
                <div className={iconClasses}>{resolvedEndIcon}</div>
              )}
            </div>
          )}
        </div>

        {/* Helper/Error Text */}
        {(resolvedHelper || error) && (
          <div className="mt-2 space-y-1">
            {error && <span className="text-red-400 text-sm font-medium">{error}</span>}
            {resolvedHelper && !error && <HelperText>{resolvedHelper}</HelperText>}
          </div>
        )}
      </FormWrapper>
    );
  }
);

PokemonInput.displayName = 'PokemonInput';
