/**
 * Enhanced ClassName Utilities
 * Phase 1.2.2: Advanced className generation and theme integration
 *
 * ROLE & RESPONSIBILITY:
 * Primary utility for generating Tailwind CSS class strings based on component props,
 * states, and configurations. Focuses on the "HOW" of styling - the mechanics of
 * className generation, conditional logic, and responsive patterns.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: ClassName generation and management only
 * - Open/Closed: Extensible for new className patterns
 * - DRY: Centralized className logic across all components
 * - Interface Segregation: Specific utilities for different use cases
 *
 * SEPARATION FROM themeUtils.ts:
 * - classNameUtils.ts: Generates class strings (HOW to style)
 * - themeUtils.ts: Defines theme configurations and integration (WHAT to style)
 *
 * USE CASES:
 * - Component state classes (hover, focus, disabled, loading)
 * - Responsive breakpoint classes
 * - Size, variant, and animation utilities
 * - Conditional className application
 * - Accessibility and interaction patterns
 *
 * Integrates with:
 * - themeUtils.ts for base cn() utility and theme configs
 * - ThemeContext.tsx for theme-aware class generation
 * - CSS custom properties for dynamic styling
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  ComponentSize,
  ComponentVariant,
  ComponentState,
} from '../types/themeTypes';
import { VisualTheme, Density, AnimationIntensity } from '../types/themeTypes';

// ===============================
// CORE CLASSNAME UTILITY - SINGLE SOURCE OF TRUTH
// ===============================

/**
 * Enhanced className utility with theme-aware merging
 * SINGLE SOURCE OF TRUTH for all className utilities
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ================================
// ENHANCED CLASSNAME UTILITIES
// ================================

// cn function imported from themeUtils.ts - single source of truth

/**
 * Conditional className utility
 * Apply classes based on boolean conditions
 */
export function cva(
  condition: boolean,
  trueClasses: string,
  falseClasses: string = ''
): string {
  return condition ? trueClasses : falseClasses;
}

/**
 * Multi-conditional className utility
 * Apply different classes based on multiple conditions
 */
export function cvn(conditions: Record<string, boolean>): string {
  return cn(
    Object.entries(conditions)
      .filter(([, condition]) => condition)
      .map(([className]) => className)
  );
}

/**
 * Responsive className utility
 * Generate responsive classes for different breakpoints
 * @deprecated Use getResponsiveClasses from unifiedUtilities.ts instead
 */
export function responsive(config: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string {
  const classes: string[] = [];

  if (config.base) {
    classes.push(config.base);
  }
  if (config.sm) {
    classes.push(`sm:${config.sm}`);
  }
  if (config.md) {
    classes.push(`md:${config.md}`);
  }
  if (config.lg) {
    classes.push(`lg:${config.lg}`);
  }
  if (config.xl) {
    classes.push(`xl:${config.xl}`);
  }
  if (config['2xl']) {
    classes.push(`2xl:${config['2xl']}`);
  }

  return cn(...classes);
}

/**
 * State-based className utility
 * Generate classes based on component state
 */
export function stateClasses(
  state: ComponentState,
  variants: Partial<Record<ComponentState, string>>
): string {
  return variants[state] || '';
}

/**
 * Size-based className utility with scaling
 * Generate size classes with consistent scaling ratios
 */
export function sizeClasses(
  size: ComponentSize,
  type: 'padding' | 'text' | 'spacing' | 'border' | 'custom' = 'padding',
  customSizes?: Partial<Record<ComponentSize, string>>
): string {
  if (type === 'custom' && customSizes) {
    return customSizes[size] || '';
  }

  const sizeMap = {
    padding: {
      xs: 'px-2 py-1',
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2',
      lg: 'px-6 py-3',
      xl: 'px-8 py-4',
    },
    text: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
    spacing: {
      xs: 'space-y-1',
      sm: 'space-y-2',
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8',
    },
    border: {
      xs: 'rounded-sm',
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
    },
  };

  return sizeMap[type][size] || '';
}

/**
 * Variant-based className utility
 * Generate classes based on component variant with fallback
 */
export function variantClasses(
  variant: ComponentVariant,
  variants: Partial<Record<ComponentVariant, string>>,
  fallback: string = ''
): string {
  return variants[variant] || fallback;
}

// ================================
// THEME-AWARE UTILITIES
// ================================

/**
 * Theme-aware className generator
 * Generate classes that respect theme context
 */
export function themeAware(config: {
  base?: string;
  theme?: Partial<Record<VisualTheme, string>>;
  density?: Partial<Record<Density, string>>;
  animation?: Partial<Record<AnimationIntensity, string>>;
  currentTheme?: VisualTheme;
  currentDensity?: Density;
  currentAnimation?: AnimationIntensity;
}): string {
  const classes: string[] = [];

  if (config.base) {
    classes.push(config.base);
  }

  if (config.currentTheme && config.theme?.[config.currentTheme]) {
    classes.push(config.theme[config.currentTheme]);
  }

  if (config.currentDensity && config.density?.[config.currentDensity]) {
    classes.push(config.density[config.currentDensity]);
  }

  if (config.currentAnimation && config.animation?.[config.currentAnimation]) {
    classes.push(config.animation[config.currentAnimation]);
  }

  return cn(...classes);
}

/**
 * Glassmorphism className utility
 * Generate glassmorphism effects with intensity control
 */
export function glassmorphism(
  intensity: number = 80,
  variant: 'primary' | 'secondary' | 'accent' = 'primary'
): string {
  const baseClasses = 'backdrop-blur-theme border';

  const variantClasses = {
    primary: 'bg-glass-primary border-glass-border-light',
    secondary: 'bg-glass-secondary border-glass-border-medium',
    accent: 'bg-glass-accent border-glass-border-subtle',
  };

  // Intensity-based modifications
  const intensityModifier =
    intensity > 50 ? 'shadow-theme-primary' : 'shadow-sm';

  return cn(baseClasses, variantClasses[variant], intensityModifier);
}

/**
 * Animation className utility
 * Generate animation classes based on intensity and type
 */
export function animationClasses(
  intensity: AnimationIntensity,
  type: 'hover' | 'focus' | 'active' | 'entrance' = 'hover'
): string {
  if (intensity === 'disabled') {
    return '';
  }

  const animationMap = {
    subtle: {
      hover: 'hover:scale-102 hover:shadow-sm',
      focus: 'focus:ring-1 focus:ring-theme-primary/30',
      active: 'active:scale-98',
      entrance: 'animate-fade-in',
    },
    normal: {
      hover: 'hover:scale-105 hover:shadow-theme-hover',
      focus: 'focus:ring-2 focus:ring-theme-primary/50',
      active: 'active:scale-95',
      entrance: 'animate-slide-up',
    },
    enhanced: {
      hover: 'hover:scale-108 hover:shadow-theme-hover hover:rotate-1',
      focus: 'focus:ring-4 focus:ring-theme-primary/50',
      active: 'active:scale-95',
      entrance: 'animate-scale-in animate-bounce-gentle',
    },
  };

  return animationMap[intensity][type] || '';
}

/**
 * Color scheme className utility
 * Generate classes that adapt to light/dark themes
 */
export function colorSchemeClasses(
  lightClasses: string,
  darkClasses: string,
  resolved?: 'light' | 'dark'
): string {
  if (resolved) {
    return resolved === 'light' ? lightClasses : darkClasses;
  }

  return cn(`light:${lightClasses}`, `dark:${darkClasses}`);
}

// ================================
// SPECIALIZED UTILITIES
// ================================

/**
 * Focus ring utility with accessibility
 * Generate accessible focus rings that respect theme
 */
export function focusRing(
  variant: ComponentVariant = 'primary',
  intensity: 'light' | 'normal' | 'heavy' = 'normal'
): string {
  const baseClasses = 'focus-visible:outline-none focus-visible:ring-offset-2';

  const intensityClasses = {
    light: 'focus-visible:ring-1',
    normal: 'focus-visible:ring-2',
    heavy: 'focus-visible:ring-4',
  };

  const variantClasses = {
    primary: 'focus-visible:ring-theme-primary',
    secondary: 'focus-visible:ring-zinc-500',
    success: 'focus-visible:ring-emerald-500',
    warning: 'focus-visible:ring-amber-500',
    danger: 'focus-visible:ring-red-500',
    info: 'focus-visible:ring-blue-500',
    outline: 'focus-visible:ring-theme-primary',
    ghost: 'focus-visible:ring-theme-primary',
    glass: 'focus-visible:ring-theme-primary',
    minimal: 'focus-visible:ring-gray-500',
  };

  return cn(baseClasses, intensityClasses[intensity], variantClasses[variant]);
}

/**
 * Hover effect utility
 * Generate consistent hover effects across components
 */
export function hoverEffect(
  type: 'lift' | 'scale' | 'glow' | 'rotate' | 'slide' = 'scale',
  intensity: AnimationIntensity = 'normal'
): string {
  if (intensity === 'disabled') {
    return '';
  }

  const effectMap = {
    subtle: {
      lift: 'hover:translate-y-0.5',
      scale: 'hover:scale-102',
      glow: 'hover:shadow-sm',
      rotate: 'hover:rotate-0.5',
      slide: 'hover:translate-x-0.5',
    },
    normal: {
      lift: 'hover:-translate-y-1',
      scale: 'hover:scale-105',
      glow: 'hover:shadow-theme-hover',
      rotate: 'hover:rotate-1',
      slide: 'hover:translate-x-1',
    },
    enhanced: {
      lift: 'hover:-translate-y-2',
      scale: 'hover:scale-108',
      glow: 'hover:shadow-theme-hover hover:shadow-lg',
      rotate: 'hover:rotate-2',
      slide: 'hover:translate-x-2',
    },
  };

  const baseTransition = 'transition-all duration-theme-normal';

  return cn(baseTransition, effectMap[intensity][type]);
}

/**
 * Loading state utility
 * Generate loading state classes with animations
 */
export function loadingClasses(
  isLoading: boolean,
  type: 'spinner' | 'pulse' | 'shimmer' = 'pulse'
): string {
  if (!isLoading) {
    return '';
  }

  const loadingMap = {
    spinner: 'animate-spin',
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
  };

  return cn('pointer-events-none', loadingMap[type]);
}

/**
 * Disabled state utility
 * Generate consistent disabled styling
 */
export function disabledClasses(isDisabled: boolean): string {
  if (!isDisabled) {
    return '';
  }

  return cn(
    'opacity-50',
    'cursor-not-allowed',
    'pointer-events-none',
    'select-none'
  );
}

/**
 * Error state utility
 * Generate error styling that respects theme
 */
export function errorClasses(hasError: boolean): string {
  if (!hasError) {
    return '';
  }

  return cn(
    'border-red-500',
    'bg-red-500/5',
    'text-red-500',
    'focus:ring-red-500/50'
  );
}

// ================================
// COMPONENT-SPECIFIC UTILITIES
// ================================

/**
 * Button className utility
 * Complete button styling with all variants and states
 */
export function buttonClasses(config: {
  variant?: ComponentVariant;
  size?: ComponentSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  theme?: VisualTheme;
  animationIntensity?: AnimationIntensity;
}): string {
  const {
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled = false,
    animationIntensity = 'normal',
  } = config;

  return cn(
    // Base button classes
    'inline-flex items-center justify-center font-semibold rounded-2xl',
    'transition-all duration-theme-normal',
    'relative overflow-hidden',

    // Size classes
    sizeClasses(size, 'padding'),
    sizeClasses(size, 'text'),

    // Variant classes
    variantClasses(variant, {
      primary:
        'bg-theme-primary hover:bg-theme-primary-hover text-white shadow-theme-primary',
      secondary: 'bg-zinc-700 hover:bg-zinc-800 text-zinc-100',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      warning: 'bg-amber-600 hover:bg-amber-700 text-white',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      outline:
        'border-2 border-theme-border-primary text-theme-primary hover:bg-theme-primary hover:text-white',
      ghost: 'text-theme-primary hover:bg-theme-primary/10',
      glass: glassmorphism(80, 'primary'),
    }),

    // Focus ring
    focusRing(variant),

    // Animation effects
    animationClasses(animationIntensity, 'hover'),
    animationClasses(animationIntensity, 'active'),

    // State classes
    cva(fullWidth, 'w-full'),
    loadingClasses(loading),
    disabledClasses(disabled || loading)
  );
}

/**
 * Input className utility
 * Complete input styling with all variants and states
 */
export function inputClasses(config: {
  variant?: ComponentVariant;
  size?: ComponentSize;
  hasError?: boolean;
  disabled?: boolean;
  theme?: VisualTheme;
  fullWidth?: boolean;
}): string {
  const {
    variant = 'primary',
    size = 'md',
    hasError = false,
    disabled = false,
    fullWidth = true,
  } = config;

  return cn(
    // Base input classes
    'block bg-theme-bg-secondary backdrop-blur-sm',
    'border border-theme-border-primary rounded-2xl',
    'placeholder-zinc-400 text-zinc-100 font-medium',
    'transition-all duration-theme-normal',
    'shadow-theme-primary hover:shadow-theme-hover focus:shadow-theme-hover',

    // Size classes
    sizeClasses(size, 'padding'),
    sizeClasses(size, 'text'),

    // Focus ring
    focusRing(variant),

    // State classes
    cva(fullWidth, 'w-full'),
    errorClasses(hasError),
    disabledClasses(disabled)
  );
}

/**
 * Card className utility
 * Complete card styling with theme integration
 */
export function cardClasses(config: {
  variant?: ComponentVariant;
  size?: ComponentSize;
  interactive?: boolean;
  theme?: VisualTheme;
  animationIntensity?: AnimationIntensity;
}): string {
  const {
    variant = 'primary',
    size = 'md',
    interactive = false,
    animationIntensity = 'normal',
  } = config;

  return cn(
    // Base card classes
    'rounded-3xl backdrop-blur-theme transition-all duration-theme-normal',
    'overflow-hidden relative',

    // Size classes
    sizeClasses(size, 'padding'),

    // Variant classes
    variantClasses(variant, {
      primary: glassmorphism(80, 'primary'),
      secondary: 'bg-zinc-800/80 border border-zinc-700/50 shadow-lg',
      glass: glassmorphism(90, 'primary'),
      minimal: 'bg-white border border-gray-200 shadow-minimal',
    }),

    // Interactive effects
    cva(
      interactive,
      cn(
        'cursor-pointer',
        hoverEffect('scale', animationIntensity),
        focusRing(variant)
      )
    )
  );
}

export default {
  cva,
  cvn,
  responsive,
  stateClasses,
  sizeClasses,
  variantClasses,
  themeAware,
  glassmorphism,
  animationClasses,
  colorSchemeClasses,
  focusRing,
  hoverEffect,
  loadingClasses,
  disabledClasses,
  errorClasses,
  buttonClasses,
  inputClasses,
  cardClasses,
};

// cn is now defined in this file as the single source of truth
