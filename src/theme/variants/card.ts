/**
 * CARD VARIANTS - Pokemon Collection Theme System
 * Phase 1.2 Implementation - Card component variants
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const cardVariants = cva(
  [
    'rounded-lg border bg-card text-card-foreground',
    'transition-all duration-[var(--duration-fast)]'
  ],
  {
    variants: {
      variant: {
        default: 'shadow-sm',
        elevated: 'shadow-md hover:shadow-lg',
        pokemon: [
          'border-[#0075BE]/20 bg-gradient-to-br from-card to-card/50',
          'shadow-pokemon/10 hover:shadow-pokemon/20'
        ],
        glass: [
          'bg-[var(--glass-background)] backdrop-blur-[var(--glass-blur)]',
          'border-[var(--glass-border)] shadow-glass'
        ],
        cosmic: [
          'bg-gradient-to-br from-purple-500/5 to-pink-500/5',
          'border-purple-500/20 shadow-cosmic'
        ]
      },
      size: {
        sm: 'p-3',
        default: 'p-6',
        lg: 'p-8'
      },
      density: {
        compact: 'p-2',
        comfortable: '', // Default
        spacious: 'p-8'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      density: 'comfortable'
    }
  }
);

export type CardVariant = VariantProps<typeof cardVariants>;