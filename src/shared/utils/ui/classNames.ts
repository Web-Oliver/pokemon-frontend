/**
 * ClassName Utilities - Layer 3 UI
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Handles only className generation and merging
 * DRY: Single source for className utilities
 * Depends on external libraries (clsx, tailwind-merge)
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Core className utility - merges and deduplicates Tailwind classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Conditional className utility
 */
export function conditional(
  condition: boolean,
  trueClasses: string,
  falseClasses: string = ''
): string {
  return condition ? trueClasses : falseClasses;
}

/**
 * Multi-conditional className utility
 */
export function multiConditional(conditions: Record<string, boolean>): string {
  return cn(
    Object.entries(conditions)
      .filter(([, condition]) => condition)
      .map(([className]) => className)
  );
}

/**
 * Generate responsive classes
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

  if (config.base) classes.push(config.base);
  if (config.sm) classes.push(`sm:${config.sm}`);
  if (config.md) classes.push(`md:${config.md}`);
  if (config.lg) classes.push(`lg:${config.lg}`);
  if (config.xl) classes.push(`xl:${config.xl}`);
  if (config['2xl']) classes.push(`2xl:${config['2xl']}`);

  return cn(...classes);
}

/**
 * Size-based classes
 */
export function sizeClasses(
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  type: 'padding' | 'text' | 'spacing' = 'padding'
): string {
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
  };

  return sizeMap[type][size] || '';
}

/**
 * Focus ring utility
 */
export function focusRing(variant: string = 'primary'): string {
  const rings = {
    primary: 'focus-visible:ring-2 focus-visible:ring-theme-primary',
    secondary: 'focus-visible:ring-2 focus-visible:ring-zinc-500',
    danger: 'focus-visible:ring-2 focus-visible:ring-red-500',
  };

  return cn(
    'focus-visible:outline-none focus-visible:ring-offset-2',
    rings[variant as keyof typeof rings] || rings.primary
  );
}

/**
 * Loading state classes
 */
export function loadingState(isLoading: boolean): string {
  return isLoading ? 'opacity-50 pointer-events-none animate-pulse' : '';
}

/**
 * Disabled state classes
 */
export function disabledState(isDisabled: boolean): string {
  return isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
}

/**
 * Error state classes
 */
export function errorState(hasError: boolean): string {
  return hasError ? 'border-red-500 bg-red-500/5 text-red-500' : '';
}