/**
 * Pokemon Button Component - THE Button to Rule Them All
 * Enhanced with advanced theme integration from common/Button
 *
 * Consolidates ALL button patterns across the entire codebase:
 * - PokemonButton (heavily used design system)
 * - common/Button (advanced theme integration)
 * - FormActionButtons (form action patterns)
 *
 * Following CLAUDE.md principles:
 * - DRY: Eliminates ALL duplicate button implementations
 * - SRP: Single definitive button component
 * - Reusable: Works everywhere - forms, modals, pages, navigation
 * - Theme Integration: Full ThemeContext support with CSS custom properties
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Glow, Shimmer } from '../../molecules/common/FormElements';
import { StandardButtonProps } from '../../types/themeTypes';
import { cn } from '../../../utils/ui/classNameUtils';
import { generateThemeClasses } from '../../../utils/ui/themeUtils';
import { focusRing } from '../../../utils/ui/classNameUtils';
import { useTheme } from '../../../hooks/theme/useTheme';

export interface PokemonButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<StandardButtonProps, 'onClick'> {
  children?: React.ReactNode;
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
  loadingText?: string;
  loadingIndicator?: React.ReactNode;
  fullWidth?: boolean;
  icon?: React.ReactNode; // Legacy support
  iconPosition?: 'left' | 'right'; // Legacy support
  startIcon?: React.ReactNode; // Theme system support
  endIcon?: React.ReactNode; // Theme system support
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  // Enhanced theme integration
  theme?: string;
  _colorScheme?: string;
  density?: 'compact' | 'normal' | 'spacious';
  animationIntensity?: 'none' | 'reduced' | 'normal' | 'enhanced';
  testId?: string;

  // Form action patterns (from FormActionButtons)
  actionType?: 'submit' | 'cancel' | 'save' | 'delete' | 'create' | 'update';

  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * THE definitive button - consolidates ALL button patterns
 * Handles: forms, navigation, actions, CTAs, filters, toggles, modals, etc.
 */
export const PokemonButton = forwardRef<HTMLButtonElement, PokemonButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText,
      loadingIndicator,
      fullWidth = false,
      icon, // Legacy support
      iconPosition = 'left', // Legacy support
      startIcon, // Theme system support
      endIcon, // Theme system support
      rounded = 'lg',
      theme,
      _colorScheme,
      density,
      animationIntensity,
      actionType,
      className = '',
      testId,
      disabled,
      ...props
    },
    ref
  ) => {
    // Theme context integration via centralized useTheme hook
    const { config } = useTheme();

    // Determine icons (legacy vs theme system)
    const resolvedStartIcon =
      startIcon || (icon && iconPosition === 'left' ? icon : null);
    const resolvedEndIcon =
      endIcon || (icon && iconPosition === 'right' ? icon : null);

    // Action type variant mapping (from FormActionButtons)
    const actionVariantMap = {
      submit: 'primary',
      save: 'success',
      create: 'primary',
      update: 'secondary',
      cancel: 'outline',
      delete: 'danger',
    };

    const finalVariant = actionType
      ? actionVariantMap[actionType] || variant
      : variant;

    // Base foundation classes
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-semibold tracking-wide',
      'border transition-all duration-300',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden group',
      'backdrop-blur-sm',
    ].join(' ');

    // Enhanced variant system with theme integration
    const variantClasses = {
      primary: [
        'bg-gradient-to-r from-[var(--theme-accent-primary,#0891b2)] to-[var(--theme-accent-secondary,#2563eb)]',
        'hover:from-[var(--theme-accent-primary-hover,#0e7490)] hover:to-[var(--theme-accent-secondary-hover,#1d4ed8)]',
        'text-white border-[var(--theme-accent-primary,#0891b2)]/20',
        'shadow-[0_4px_14px_0_var(--theme-accent-primary,rgb(6,182,212))/30%]',
        'hover:shadow-[0_6px_20px_0_var(--theme-accent-primary,rgb(6,182,212))/40%]',
        'focus:ring-[var(--theme-accent-primary,#0891b2)]/50',
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
        'hover:bg-zinc-800/90 hover:border-[var(--theme-accent-primary,#0891b2)]/60',
        'text-zinc-200 hover:text-[var(--theme-accent-primary-text,#67e8f9)]',
        'shadow-[0_2px_8px_0_rgb(0,0,0,0.3)]',
        'hover:shadow-[0_4px_14px_0_var(--theme-accent-primary,rgb(6,182,212))/25%]',
        'focus:ring-[var(--theme-accent-primary,#0891b2)]/50',
      ].join(' '),
      ghost: [
        'border-transparent bg-transparent',
        'hover:bg-white/5 hover:border-white/10',
        'text-zinc-300 hover:text-white',
        'focus:ring-[var(--theme-accent-primary,#0891b2)]/50',
      ].join(' '),
      link: [
        'border-none bg-transparent shadow-none p-0',
        'text-[var(--theme-accent-primary,#0891b2)] hover:text-[var(--theme-accent-primary-hover,#0e7490)] underline',
        'focus:ring-[var(--theme-accent-primary,#0891b2)]/50',
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

    // Size system - fixed for Tailwind compatibility
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

    // Animation intensity aware effects
    const getAnimationClasses = () => {
      const intensity =
        animationIntensity || config?.animationIntensity || 'normal';
      switch (intensity) {
        case 'none':
          return '';
        case 'reduced':
          return 'hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200';
        case 'enhanced':
          return 'transform hover:scale-110 active:scale-90 hover:shadow-2xl focus:shadow-2xl transition-all duration-300';
        default:
          return 'transform hover:scale-105 active:scale-95 hover:shadow-xl focus:shadow-2xl transition-all duration-300';
      }
    };

    // Generate theme classes if theme system is being used
    const themeClasses =
      theme || _colorScheme
        ? generateThemeClasses('button', { theme, colorScheme: _colorScheme })
        : '';

    // Focus classes from theme system
    const focusClasses = focusRing(variant);

    const finalClassName = cn(
      baseClasses,
      variantClasses[finalVariant],
      sizeClasses[size],
      roundedClasses[rounded],
      getAnimationClasses(),
      themeClasses,
      focusClasses,
      fullWidth && 'w-full',
      className
    );

    // Loading content
    const loadingContent = loading
      ? loadingIndicator || (
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
        )
      : null;

    return (
      <button
        ref={ref}
        data-testid={testId}
        className={finalClassName}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer effect (from common/Button theme integration) */}
        <Shimmer enabled={!loading && !disabled} />

        {/* Glow effect (from common/Button theme integration) */}
        <Glow enabled={!loading && !disabled} />

        {/* Premium shimmer effect (original Pokemon styling) */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content container */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              {loadingContent}
              {loadingText && <span>{loadingText}</span>}
            </>
          ) : (
            <>
              {/* Start/Left icon */}
              {resolvedStartIcon && (
                <span className={cn('flex-shrink-0', children && 'mr-1')}>
                  {resolvedStartIcon}
                </span>
              )}

              {/* Button text */}
              {children && <span>{children}</span>}

              {/* End/Right icon */}
              {resolvedEndIcon && (
                <span className={cn('flex-shrink-0', children && 'ml-1')}>
                  {resolvedEndIcon}
                </span>
              )}
            </>
          )}
        </div>
      </button>
    );
  }
);

PokemonButton.displayName = 'PokemonButton';
