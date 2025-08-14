/**
 * INPUT VARIANTS - Pokemon Collection Theme System
 * Phase 1.2 Implementation - Form input variants
 */

import { cva, type VariantProps } from 'class-variance-authority';

export const inputVariants = cva(
  [
    'flex w-full rounded-md border border-input bg-background',
    'px-3 py-2 text-sm ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'transition-all duration-[var(--duration-fast)]'
  ],
  {
    variants: {
      variant: {
        default: 'border-input',
        pokemon: [
          'border-[#0075BE]/30 focus-visible:ring-[#0075BE]',
          'focus:border-[#0075BE] focus:shadow-pokemon/20'
        ],
        glass: [
          'bg-[var(--glass-background)] backdrop-blur-[var(--glass-blur)]',
          'border-[var(--glass-border)]'
        ],
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-[#00A350] focus-visible:ring-[#00A350]'
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-9 px-3 py-2',
        lg: 'h-11 px-4 py-3 text-base'
      },
      density: {
        compact: 'h-8 px-2 py-1',
        comfortable: '', // Default
        spacious: 'h-12 px-4 py-3'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      density: 'comfortable'
    }
  }
);

export type InputVariant = VariantProps<typeof inputVariants>;