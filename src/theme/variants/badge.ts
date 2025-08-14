/**
 * BADGE VARIANTS - Pokemon Collection Theme System
 * Phase 1.2 Implementation - Badge/status variants
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  [
    'inline-flex items-center rounded-full border px-2.5 py-0.5',
    'text-xs font-semibold transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  ],
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        
        // Pokemon-specific variants
        pokemon: 'border-transparent bg-[#0075BE] text-white hover:bg-[#0075BE]/80',
        pokemonGold: 'border-transparent bg-[#B3A125] text-white hover:bg-[#B3A125]/80',
        success: 'border-transparent bg-[#00A350] text-white hover:bg-[#00A350]/80',
        warning: 'border-transparent bg-[#FFDE00] text-gray-900 hover:bg-[#FFDE00]/80',
        danger: 'border-transparent bg-[#FF0000] text-white hover:bg-[#FF0000]/80',
        
        // Status variants
        online: 'border-transparent bg-green-500 text-white',
        offline: 'border-transparent bg-gray-500 text-white',
        away: 'border-transparent bg-yellow-500 text-gray-900',
        busy: 'border-transparent bg-red-500 text-white'
      },
      size: {
        sm: 'px-1.5 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm'
      },
      density: {
        compact: 'px-1 py-0.5',
        comfortable: '', // Default
        spacious: 'px-4 py-1'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      density: 'comfortable'
    }
  }
);

export type BadgeVariant = VariantProps<typeof badgeVariants>;