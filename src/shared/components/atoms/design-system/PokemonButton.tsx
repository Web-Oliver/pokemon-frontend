import React, { forwardRef } from 'react';
import { Button, buttonVariants } from '../../../../components/ui/button';
import { cn } from '../../../../lib/utils';
import { type VariantProps } from 'class-variance-authority';
import { pokemonButtonVariants } from './unifiedVariants';

export interface PokemonButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pokemonButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const PokemonButton = forwardRef<HTMLButtonElement, PokemonButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      fullWidth = false,
      startIcon,
      endIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const loadingSpinner = (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <Button
        className={cn(
          pokemonButtonVariants({ variant, size }),
          fullWidth && "w-full",
          "transition-all duration-300 transform hover:scale-105 active:scale-95",
          className
        )}
        ref={ref}
        asChild={asChild}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              {loadingSpinner}
              {loadingText && <span>{loadingText}</span>}
            </>
          ) : (
            <>
              {startIcon && <span className="flex-shrink-0">{startIcon}</span>}
              {children && <span>{children}</span>}
              {endIcon && <span className="flex-shrink-0">{endIcon}</span>}
            </>
          )}
        </div>
      </Button>
    );
  }
);

PokemonButton.displayName = "PokemonButton";