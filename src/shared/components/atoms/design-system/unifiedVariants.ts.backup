/**
 * Unified Design System Variants
 * Uses EXISTING theme system from /theme/DesignSystem.ts
 * NO NEW THEME SYSTEMS - just variants that use the existing one
 */

import { cva } from 'class-variance-authority';

// === POKEMON BUTTON VARIANTS (clean, no shadcn conflicts) ===
export const pokemonButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group transition-all duration-300",
  {
    variants: {
      variant: {
        // Clean Pokemon variants with NO shadcn conflicts
        default: [
          'bg-gradient-to-r from-slate-600 to-slate-700',
          'hover:from-slate-700 hover:to-slate-800',
          'text-white border border-slate-500/20',
          'shadow-[0_4px_14px_0_rgba(0,0,0,0.3)]',
          'hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.4)]',
        ].join(' '),
        
        primary: [
          'bg-gradient-to-r from-cyan-600 to-blue-600',
          'hover:from-cyan-700 hover:to-blue-700',
          'text-white border border-cyan-500/20',
          'shadow-[0_4px_14px_0_rgb(6,182,212,0.3)]',
          'hover:shadow-[0_6px_20px_0_rgb(6,182,212,0.4)]',
        ].join(' '),
        
        secondary: [
          'bg-gradient-to-r from-white/10 to-white/20',
          'hover:from-white/20 hover:to-white/30',
          'text-white border border-white/30',
          'backdrop-blur-sm',
          'shadow-[0_4px_14px_0_rgba(255,255,255,0.1)]',
          'hover:shadow-[0_6px_20px_0_rgba(255,255,255,0.2)]',
        ].join(' '),
        
        outline: [
          'bg-transparent border-2 border-cyan-500/50',
          'hover:bg-cyan-500/10 hover:border-cyan-400',
          'text-cyan-300 hover:text-cyan-200',
          'shadow-[0_0_10px_0_rgb(6,182,212,0.2)]',
          'hover:shadow-[0_0_20px_0_rgb(6,182,212,0.4)]',
        ].join(' '),
        
        ghost: [
          'bg-transparent hover:bg-white/10',
          'text-white/70 hover:text-white',
          'border border-transparent hover:border-white/20',
        ].join(' '),
        
        destructive: [
          'bg-gradient-to-r from-red-600 to-rose-600',
          'hover:from-red-700 hover:to-rose-700',
          'text-white border border-red-500/20',
          'shadow-[0_4px_14px_0_rgb(220,38,38,0.3)]',
          'hover:shadow-[0_6px_20px_0_rgb(220,38,38,0.4)]',
        ].join(' '),
        
        link: [
          'text-cyan-400 hover:text-cyan-300',
          'underline-offset-4 hover:underline',
          'bg-transparent border-none shadow-none',
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
        // Clean size variants without shadcn conflicts
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8", 
        icon: "h-10 w-10",
        
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
  "transition-all duration-300 backdrop-blur-sm disabled:bg-zinc-800/90 disabled:border-zinc-600/30 disabled:text-zinc-200 disabled:placeholder:text-zinc-500 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: [
          'bg-zinc-900/90 border-zinc-700/50',
          'text-zinc-100 placeholder:text-zinc-400',
          'focus:border-cyan-500/60 focus:ring-cyan-500/50',
          'hover:border-cyan-500/40',
          'disabled:bg-zinc-800/90 disabled:border-zinc-600/30 disabled:text-zinc-200',
        ].join(' '),
        
        search: [
          'bg-zinc-800/95 border-zinc-600/50',
          'text-zinc-100 placeholder:text-zinc-400',
          'focus:border-blue-400/60 focus:ring-blue-400/50',
          'hover:border-blue-400/40',
          'disabled:bg-zinc-800/90 disabled:border-zinc-600/30 disabled:text-zinc-200',
        ].join(' '),
        
        filter: [
          'bg-slate-800/90 border-slate-600/50',
          'text-slate-100 placeholder:text-slate-400',
          'focus:border-purple-400/60 focus:ring-purple-400/50',
          'hover:border-purple-400/40',
          'disabled:bg-slate-800/90 disabled:border-slate-600/30 disabled:text-slate-200',
        ].join(' '),
        
        inline: [
          'bg-transparent border-zinc-600/30',
          'text-zinc-200 placeholder:text-zinc-500',
          'focus:border-cyan-400/50 focus:ring-cyan-400/30',
          'hover:border-cyan-400/30',
          'disabled:bg-zinc-800/60 disabled:border-zinc-600/20 disabled:text-zinc-300',
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

// === POKEMON SEARCH INPUT VARIANTS ===
export const pokemonSearchInputVariants = cva(
  [
    'w-full pl-10 pr-10 py-3 rounded-xl',
    'text-white placeholder-cyan-200/50',
    'focus:outline-none focus:ring-2 focus:ring-cyan-400/30',
    'hover:border-white/30 transition-all duration-300',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-white/10 backdrop-blur-sm border border-white/20',
          'focus:border-cyan-400/30',
        ].join(' '),
        
        glass: [
          'bg-zinc-900/80 backdrop-blur-xl border border-cyan-500/20',
          'focus:border-cyan-400/50',
        ].join(' '),
        
        solid: [
          'bg-zinc-800 border border-zinc-600',
          'focus:border-cyan-400',
        ].join(' '),
      },
      
      size: {
        sm: 'py-2 text-sm',
        md: 'py-3 text-base',
        lg: 'py-4 text-lg',
      },
    },
    
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// === POKEMON SELECT VARIANTS ===
export const pokemonSelectVariants = cva(
  [
    'block w-full appearance-none cursor-pointer rounded-lg',
    'transition-all duration-300 focus:outline-none focus:ring-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50',
          'text-white focus:border-cyan-500/60 focus:ring-cyan-500/30',
          'hover:border-cyan-500/40',
        ].join(' '),
        
        glass: [
          'bg-white/10 backdrop-blur-sm border border-white/20',
          'text-white focus:border-cyan-400/50 focus:ring-cyan-400/30',
          'hover:border-white/30',
        ].join(' '),
        
        solid: [
          'bg-zinc-800 border border-zinc-600',
          'text-white focus:border-cyan-400 focus:ring-cyan-400/50',
          'hover:border-zinc-500',
        ].join(' '),
      },
      
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// === POKEMON BADGE VARIANTS ===
export const pokemonBadgeVariants = cva(
  [
    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
    'transition-all duration-200',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-zinc-700/50 text-zinc-300 border border-zinc-600/50',
        primary: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30',
        secondary: 'bg-purple-500/20 text-purple-300 border border-purple-400/30',
        success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
        warning: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
        danger: 'bg-red-500/20 text-red-300 border border-red-400/30',
        outline: 'bg-transparent text-zinc-300 border border-zinc-500',
        solid: 'bg-zinc-700 text-white border-0',
      },
      
      size: {
        sm: 'px-1.5 py-0.5 text-xs',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// === POKEMON ICON VARIANTS ===
export const pokemonIconVariants = cva(
  [
    'inline-flex items-center justify-center transition-all duration-200',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'text-zinc-400',
        primary: 'text-cyan-400',
        secondary: 'text-purple-400',
        success: 'text-emerald-400',
        warning: 'text-amber-400',
        danger: 'text-red-400',
        glass: 'text-white/70',
        cosmic: 'text-cyan-300',
      },
      
      size: {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
        '2xl': 'w-10 h-10',
      },
      
      effect: {
        none: '',
        glow: 'filter drop-shadow-[0_0_8px_currentColor]',
        pulse: 'animate-pulse',
        spin: 'animate-spin',
        bounce: 'animate-bounce',
      },
    },
    
    defaultVariants: {
      variant: "default",
      size: "md",
      effect: "none",
    },
  }
);

// Export all variants
export const UNIFIED_VARIANTS = {
  button: pokemonButtonVariants,
  input: pokemonInputVariants,
  modal: pokemonModalVariants,
  card: pokemonCardVariants,
  searchInput: pokemonSearchInputVariants,
  select: pokemonSelectVariants,
  badge: pokemonBadgeVariants,
  icon: pokemonIconVariants,
} as const;