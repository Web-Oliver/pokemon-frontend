/**
 * Unified Design System Variants
 * Uses EXISTING theme system from /theme/DesignSystem.ts
 * NO NEW THEME SYSTEMS - just variants that use the existing one
 */

import { cva } from 'class-variance-authority';
import { buttonVariants } from '../../../ui/primitives/Button';

// === POKEMON BUTTON VARIANTS (using existing theme) ===
export const pokemonButtonVariants = cva(
  "relative overflow-hidden group transition-all duration-300",
  {
    variants: {
      variant: {
        // Standard shadcn variants
        default: buttonVariants({ variant: "default" }),
        destructive: buttonVariants({ variant: "destructive" }),
        outline: buttonVariants({ variant: "outline" }),
        secondary: buttonVariants({ variant: "secondary" }),
        ghost: buttonVariants({ variant: "ghost" }),
        link: buttonVariants({ variant: "link" }),
        
        // Pokemon variants using CSS custom properties from DesignSystem.ts
        primary: [
          'bg-gradient-to-r from-cyan-600 to-blue-600',
          'hover:from-cyan-700 hover:to-blue-700',
          'text-white border-cyan-500/20',
          'shadow-[0_4px_14px_0_rgb(6,182,212,0.3)]',
          'hover:shadow-[0_6px_20px_0_rgb(6,182,212,0.4)]',
        ].join(' '),
        
        success: [
          'bg-gradient-to-r from-emerald-600 to-teal-600',
          'hover:from-emerald-700 hover:to-teal-700',
          'text-white border-emerald-500/20',
          'shadow-[0_4px_14px_0_rgb(16,185,129,0.3)]',
          'hover:shadow-[0_6px_20px_0_rgb(16,185,129,0.4)]',
        ].join(' '),
        
        danger: [
          'bg-gradient-to-r from-red-600 to-rose-600',
          'hover:from-red-700 hover:to-rose-700',
          'text-white border-red-500/20',
          'shadow-[0_4px_14px_0_rgb(220,38,127,0.3)]',
          'hover:shadow-[0_6px_20px_0_rgb(220,38,127,0.4)]',
        ].join(' '),
        
        warning: [
          'bg-gradient-to-r from-amber-500 to-orange-500',
          'hover:from-amber-600 hover:to-orange-600',
          'text-white border-amber-500/20',
          'shadow-[0_4px_14px_0_rgb(245,158,11,0.3)]',
          'hover:shadow-[0_6px_20px_0_rgb(245,158,11,0.4)]',
        ].join(' '),
        
        cosmic: [
          'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600',
          'hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700',
          'text-white border-emerald-400/20',
          'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
          'hover:shadow-[0_0_60px_rgba(16,185,129,0.5)]',
          'hover:scale-105',
        ].join(' '),
      },
      
      size: {
        // Standard shadcn sizes
        default: buttonVariants({ size: "default" }),
        sm: buttonVariants({ size: "sm" }),
        lg: buttonVariants({ size: "lg" }),
        icon: buttonVariants({ size: "icon" }),
        
        // Pokemon custom sizes
        xs: 'h-6 px-2 text-xs',
        xl: 'h-12 px-8 text-xl',
      },
    },
    
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// === POKEMON INPUT VARIANTS (using existing theme) ===
export const pokemonInputVariants = cva(
  "transition-all duration-300 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: [
          'bg-zinc-900/90 border-zinc-700/50',
          'text-zinc-100 placeholder:text-zinc-400',
          'focus:border-cyan-500/60 focus:ring-cyan-500/50',
          'hover:border-cyan-500/40',
        ].join(' '),
        
        search: [
          'bg-zinc-800/95 border-zinc-600/50',
          'text-zinc-100 placeholder:text-zinc-400',
          'focus:border-blue-400/60 focus:ring-blue-400/50',
          'hover:border-blue-400/40',
        ].join(' '),
        
        filter: [
          'bg-slate-800/90 border-slate-600/50',
          'text-slate-100 placeholder:text-slate-400',
          'focus:border-purple-400/60 focus:ring-purple-400/50',
          'hover:border-purple-400/40',
        ].join(' '),
        
        inline: [
          'bg-transparent border-zinc-600/30',
          'text-zinc-200 placeholder:text-zinc-500',
          'focus:border-cyan-400/50 focus:ring-cyan-400/30',
          'hover:border-cyan-400/30',
        ].join(' '),
      },
      
      inputSize: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

// === POKEMON MODAL VARIANTS (using existing theme) ===
export const pokemonModalVariants = cva(
  "bg-gradient-to-br from-zinc-900/95 to-slate-900/95 backdrop-blur-xl border border-cyan-500/20 shadow-2xl shadow-cyan-500/10 text-zinc-100",
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-[95vw]',
      },
    },
    
    defaultVariants: {
      size: "md",
    },
  }
);

// === POKEMON CARD VARIANTS (using existing theme) ===
export const pokemonCardVariants = cva(
  "transition-all duration-300 rounded-xl",
  {
    variants: {
      variant: {
        glass: [
          'bg-gradient-to-br from-zinc-900/95 to-slate-900/95',
          'backdrop-blur-xl border border-cyan-500/20',
          'shadow-2xl shadow-cyan-500/10',
          'text-zinc-100',
        ].join(' '),
        
        solid: [
          'bg-zinc-900',
          'border border-zinc-700/50',
          'shadow-lg shadow-zinc-900/50',
          'text-zinc-100',
        ].join(' '),
        
        outline: [
          'bg-transparent',
          'border-2 border-zinc-700/50',
          'text-zinc-100',
        ].join(' '),
        
        cosmic: [
          'bg-gradient-to-br from-zinc-900/95 to-slate-900/95',
          'backdrop-blur-xl border border-cyan-500/20',
          'shadow-[0_0_40px_rgba(16,185,129,0.3)]',
          'text-zinc-100',
          'hover:scale-105',
        ].join(' '),
      },
      
      size: {
        xs: 'p-2',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-12',
      },
      
      interactive: {
        true: 'cursor-pointer hover:scale-102 hover:shadow-[0_6px_20px_0_rgb(6,182,212,0.4)]',
        false: '',
      },
    },
    
    defaultVariants: {
      variant: "glass",
      size: "md",
      interactive: false,
    },
  }
);

// Export all variants
export const UNIFIED_VARIANTS = {
  button: pokemonButtonVariants,
  input: pokemonInputVariants,
  modal: pokemonModalVariants,
  card: pokemonCardVariants,
} as const;