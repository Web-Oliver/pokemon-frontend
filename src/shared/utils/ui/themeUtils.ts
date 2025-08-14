/**
 * Theme-Aware Component Utilities
 * Phase 1.2.1: Component Architecture Foundation
 *
 * ROLE & RESPONSIBILITY:
 * Central theme configuration and integration system. Defines the "WHAT" of styling -
 * theme configurations, style presets, and component style definitions that work with
 * theme contexts and provide consistent design system integration.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Theme utility functions only
 * - Open/Closed: Extensible for new theme patterns
 * - DRY: Centralized theme logic for all components
 * - Dependency Inversion: Abstracts theme implementation details
 *
 * SEPARATION FROM classNameUtils.ts:
 * - themeUtils.ts: Defines theme configurations and integration (WHAT to style)
 * - classNameUtils.ts: Generates class strings (HOW to style)
 *
 * USE CASES:
 * - Component style configurations (buttonStyleConfig, inputStyleConfig)
 * - Theme context integration and configuration
 * - Style preset definitions and management
 * - Theme property merging and overrides
 * - Animation configuration objects
 * - Base cn() utility function (single source of truth)
 *
 * Integrates with:
 * - ThemeContext.tsx for theme configuration
 * - themeTypes.ts for standardized interfaces
 * - formThemes.ts for color schemes
 * - classNameUtils.ts for className generation utilities
 */

import {
  BaseThemeProps,
  ComponentAnimationConfig,
  ComponentSize,
  ComponentState,
  ComponentStyleConfig,
  ComponentVariant,
  ThemeOverride,
  VisualTheme,
} from '../../types/themeTypes';
// Removed broken theme import
import { cn } from './classNameUtils';

// ================================
// UTILITY FUNCTIONS
// ================================

// cn utility imported from classNameUtils.ts - single source of truth

/**
 * Generate theme-aware class names based on component configuration
 */
export function generateThemeClasses(
  config: ComponentStyleConfig,
  variant: ComponentVariant = 'primary',
  size: ComponentSize = 'md',
  state: ComponentState = 'default',
  
): string {
  const classes = [
    config.base,
    config.variants?.[variant],
    config.sizes?.[size],
    config.states?.[state],
  ];

  // Apply theme-specific overrides
  if (config.themeOverrides) {
    const override = config.themeOverrides;
    classes.push(themeOverrideToClasses(override));
  }

  return cn(...classes);
}

/**
 * Convert theme override object to CSS classes
 */
export function themeOverrideToClasses(override: ThemeOverride): string {
  const classes: string[] = [];

  if (override.primaryColor) {
    classes.push(`[--theme-primary:${override.primaryColor}]`);
  }
  if (override.backgroundColor) {
    classes.push(`[--theme-bg:${override.backgroundColor}]`);
  }
  if (override.borderColor) {
    classes.push(`[--theme-border:${override.borderColor}]`);
  }
  if (override.textColor) {
    classes.push(`[--theme-text:${override.textColor}]`);
  }
  if (override.boxShadow) {
    classes.push(`[--theme-shadow:${override.boxShadow}]`);
  }
  if (override.borderRadius) {
    classes.push(`[--theme-radius:${override.borderRadius}]`);
  }

  return cn(...classes);
}

// generateAnimationClasses consolidated into animationClasses in classNameUtils.ts

// ================================
// COMPONENT STYLE CONFIGURATIONS
// ================================

/**
 * Button component standardized style configuration
 */
export const buttonStyleConfig: ComponentStyleConfig = {
  base: cn(
    'inline-flex items-center justify-center font-bold tracking-wide rounded-2xl',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-all duration-theme-normal disabled:opacity-50 disabled:cursor-not-allowed',
    'relative overflow-hidden group backdrop-blur-sm',
    'transform hover:scale-105 active:scale-95',
    'shadow-theme-primary hover:shadow-theme-hover focus:shadow-theme-hover'
  ),
  variants: {
    primary: cn(
      'bg-theme-primary hover:bg-theme-primary-hover text-white',
      'focus:ring-theme-primary/50 border border-theme-border-accent'
    ),
    secondary: cn(
      'bg-zinc-700 hover:bg-zinc-800 text-zinc-100',
      'focus:ring-zinc-500/50 border border-zinc-600/30'
    ),
    success: cn(
      'bg-emerald-600 hover:bg-emerald-700 text-white',
      'focus:ring-emerald-500/50 border border-emerald-500/20'
    ),
    warning: cn(
      'bg-amber-600 hover:bg-amber-700 text-white',
      'focus:ring-amber-500/50 border border-amber-500/20'
    ),
    danger: cn(
      'bg-red-600 hover:bg-red-700 text-white',
      'focus:ring-red-500/50 border border-red-500/20'
    ),
    info: cn(
      'bg-blue-600 hover:bg-blue-700 text-white',
      'focus:ring-blue-500/50 border border-blue-500/20'
    ),
    outline: cn(
      'border-2 border-theme-border-primary bg-transparent hover:bg-theme-bg-primary',
      'text-theme-primary hover:text-white focus:ring-theme-primary/50'
    ),
    ghost: cn(
      'bg-transparent hover:bg-theme-bg-primary text-theme-primary',
      'focus:ring-theme-primary/50'
    ),
    glass: cn(
      'bg-glass-primary backdrop-blur-theme border border-glass-border-light',
      'text-white hover:bg-glass-secondary focus:ring-theme-primary/50'
    ),
    minimal: cn(
      'bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200',
      'focus:ring-gray-500/50'
    ),
  },
  sizes: {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  },
  states: {
    default: '',
    hover: 'hover:scale-105 hover:shadow-theme-hover',
    active: 'active:scale-95',
    focus: 'focus:ring-2 focus:ring-theme-primary/50',
    disabled: 'opacity-50 cursor-not-allowed',
    error: 'border-red-500 focus:ring-red-500/50',
  },
};

/**
 * Input component standardized style configuration
 */
export const inputStyleConfig: ComponentStyleConfig = {
  base: cn(
    'block w-full bg-theme-bg-secondary backdrop-blur-sm',
    'border border-theme-border-primary rounded-2xl shadow-theme-primary',
    'placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-theme-primary/50',
    'focus:border-theme-border-accent text-zinc-100 font-medium',
    'transition-all duration-theme-normal hover:shadow-theme-hover focus:shadow-theme-hover'
  ),
  variants: {
    primary: 'focus:ring-theme-primary/50 focus:border-theme-border-accent',
    secondary: 'focus:ring-zinc-500/50 focus:border-zinc-400',
    success: 'focus:ring-emerald-500/50 focus:border-emerald-400',
    warning: 'focus:ring-amber-500/50 focus:border-amber-400',
    danger: 'focus:ring-red-500/50 focus:border-red-400',
    info: 'focus:ring-blue-500/50 focus:border-blue-400',
    outline: 'border-2 border-theme-border-primary bg-transparent',
    ghost: 'border-none bg-transparent focus:bg-theme-bg-primary/50',
    glass: 'bg-glass-primary backdrop-blur-theme border-glass-border-light',
    minimal:
      'bg-white border-gray-300 focus:ring-gray-500/50 focus:border-gray-400',
  },
  sizes: {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-4 text-lg',
    xl: 'px-5 py-5 text-xl',
  },
  states: {
    default: '',
    hover: 'hover:shadow-theme-hover hover:border-theme-border-accent/60',
    active: '',
    focus:
      'focus:ring-2 focus:ring-theme-primary/50 focus:border-theme-border-accent',
    disabled: 'opacity-50 cursor-not-allowed bg-gray-100',
    error:
      'border-red-400/60 focus:ring-red-500/50 focus:border-red-400 bg-red-900/20',
  },
};

/**
 * Card component standardized style configuration
 */
export const cardStyleConfig: ComponentStyleConfig = {
  base: cn(
    'rounded-3xl backdrop-blur-theme transition-all duration-theme-normal',
    'overflow-hidden relative'
  ),
  variants: {
    primary:
      'bg-glass-primary border border-glass-border-light shadow-theme-primary',
    secondary: 'bg-zinc-800/80 border border-zinc-700/50 shadow-lg',
    success: 'bg-emerald-500/10 border border-emerald-500/20 shadow-lg',
    warning: 'bg-amber-500/10 border border-amber-500/20 shadow-lg',
    danger: 'bg-red-500/10 border border-red-500/20 shadow-lg',
    info: 'bg-blue-500/10 border border-blue-500/20 shadow-lg',
    outline: 'bg-transparent border-2 border-theme-border-primary',
    ghost: 'bg-transparent',
    glass:
      'bg-glass-primary backdrop-blur-theme border border-glass-border-light shadow-glass-main',
    minimal: 'bg-white border border-gray-200 shadow-minimal',
  },
  sizes: {
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },
  states: {
    default: '',
    hover: 'hover:shadow-theme-hover hover:scale-102',
    active: 'active:scale-98',
    focus: 'focus:ring-2 focus:ring-theme-primary/50',
    disabled: 'opacity-50',
    error: 'border-red-500 bg-red-500/5',
  },
};

/**
 * Badge component standardized style configuration
 */
export const badgeStyleConfig: ComponentStyleConfig = {
  base: cn(
    'inline-flex items-center justify-center font-semibold rounded-full',
    'transition-all duration-theme-fast'
  ),
  variants: {
    primary: 'bg-theme-primary text-white',
    secondary: 'bg-zinc-600 text-zinc-100',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-600 text-white',
    danger: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    outline:
      'border border-theme-border-primary text-theme-primary bg-transparent',
    ghost: 'text-theme-primary bg-theme-primary/10',
    glass:
      'bg-glass-primary backdrop-blur-theme text-white border border-glass-border-light',
    minimal: 'bg-gray-100 text-gray-800',
  },
  sizes: {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
    xl: 'px-4 py-2 text-lg',
  },
  states: {
    default: '',
    hover: 'hover:scale-105',
    active: 'active:scale-95',
    focus: '',
    disabled: 'opacity-50',
    error: '',
  },
};

// ================================
// ANIMATION CONFIGURATIONS
// ================================

/**
 * Default animation configuration for interactive components
 */
export const defaultAnimationConfig: ComponentAnimationConfig = {
  hover: 'hover:scale-105 hover:shadow-theme-hover',
  focus: 'focus:ring-2 focus:ring-theme-primary/50',
  active: 'active:scale-95',
  duration: 300,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  disabled: false,
};

/**
 * Subtle animation configuration for minimal themes
 */
export const subtleAnimationConfig: ComponentAnimationConfig = {
  hover: 'hover:scale-102',
  focus: 'focus:ring-1 focus:ring-theme-primary/30',
  active: 'active:scale-98',
  duration: 200,
  easing: 'ease-out',
  disabled: false,
};

/**
 * Enhanced animation configuration for premium themes
 */
export const enhancedAnimationConfig: ComponentAnimationConfig = {
  hover: 'hover:scale-108 hover:shadow-theme-hover hover:rotate-1',
  focus: 'focus:ring-4 focus:ring-theme-primary/50',
  active: 'active:scale-95',
  duration: 400,
  easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  disabled: false,
};

// ================================
// THEME INTEGRATION UTILITIES
// ================================

/**
 * Get theme configuration based on color scheme
 */
export function getThemeConfiguration(colorScheme: string = 'dark') {
  return getFormTheme(colorScheme);
}

/**
 * Merge base theme props with component-specific overrides
 */
export function mergeThemeProps(
  baseProps: BaseThemeProps,
  componentProps: Partial<BaseThemeProps>
): BaseThemeProps {
  return {
    ...baseProps,
    ...componentProps,
    className: cn(baseProps.className, componentProps.className),
  };
}

// getResponsiveClasses consolidated into unifiedUtilities.ts

// getFocusClasses consolidated into focusRing in classNameUtils.ts

// ================================
// EXPORTS
// ================================

export default {
  cn,
  generateThemeClasses,
  getThemeConfiguration,
  mergeThemeProps,
  buttonStyleConfig,
  inputStyleConfig,
  cardStyleConfig,
  badgeStyleConfig,
};
