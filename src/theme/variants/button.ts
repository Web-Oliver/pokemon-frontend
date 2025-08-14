/**
 * BUTTON VARIANTS - Pokemon Collection Theme System
 * Phase 1.2 Implementation - Component variant authority patterns
 *
 * Following THEME_ARCHITECTURE_DESIGN.md specifications:
 * - shadcn/ui compatible variants
 * - Pokemon-specific variants
 * - Glass variants (theme-aware)
 * - Density and motion variants
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  [
    // Base styles
    'inline-flex items-center justify-center gap-2',
    'rounded-md text-sm font-medium',
    'transition-all duration-[--duration-fast]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
  ],
  {
    variants: {
      variant: {
        // shadcn/ui compatible variants
        default: [
          'bg-primary text-primary-foreground',
          'shadow-sm hover:bg-primary/90'
        ],
        destructive: [
          'bg-destructive text-destructive-foreground', 
          'shadow-sm hover:bg-destructive/90'
        ],
        outline: [
          'border border-input bg-background',
          'shadow-sm hover:bg-accent hover:text-accent-foreground'
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'shadow-sm hover:bg-secondary/80'  
        ],
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',

        // Pokemon-specific variants
        pokemon: [
          'bg-gradient-to-r from-[#0075BE] to-[#3B4CCA]',
          'text-white shadow-pokemon',
          'hover:shadow-lg hover:scale-[1.02]',
          'active:scale-[0.98]'
        ],
        pokemonOutline: [
          'border border-[#0075BE] bg-transparent text-[#0075BE]',
          'hover:bg-[#0075BE] hover:text-white',
          'hover:shadow-pokemon'
        ],
        success: [
          'bg-gradient-to-r from-[#00A350] to-emerald-600',
          'text-white shadow-success',
          'hover:shadow-lg hover:scale-[1.02]'
        ],
        warning: [
          'bg-gradient-to-r from-[#FFDE00] to-yellow-500',
          'text-gray-900 shadow-warning',
          'hover:shadow-lg hover:scale-[1.02]'
        ],
        danger: [
          'bg-gradient-to-r from-[#FF0000] to-red-600',
          'text-white shadow-danger',
          'hover:shadow-lg hover:scale-[1.02]'
        ],
        
        // Glass variants (theme-aware)
        glass: [
          'bg-[var(--glass-background)] backdrop-blur-[var(--glass-blur)]',
          'border border-[var(--glass-border)] text-foreground',
          'shadow-glass hover:bg-[var(--glass-background)]/80'
        ],
        glassShimmer: [
          'bg-[var(--glass-background)] backdrop-blur-[var(--glass-blur)]',
          'border border-[var(--glass-border)] text-foreground',
          'shadow-glass relative overflow-hidden',
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
          'before:translate-x-[-100%] before:animate-shimmer'
        ]
      },
      
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-9 w-9',
        iconSm: 'h-8 w-8',
        iconLg: 'h-10 w-10'
      },

      density: {
        compact: 'px-2 py-1 text-xs',
        comfortable: '', // Default spacing
        spacious: 'px-6 py-3 text-base'
      },

      motion: {
        reduced: 'transition-none',
        normal: '', // Default transitions
        enhanced: [
          'transition-all duration-[var(--duration-normal)]',
          'hover:transform hover:scale-[1.05]',
          'active:transform active:scale-[0.95]'
        ]
      }
    },
    
    defaultVariants: {
      variant: 'default',
      size: 'default',
      density: 'comfortable',
      motion: 'normal'
    }
  }
);

export type ButtonVariant = VariantProps<typeof buttonVariants>;