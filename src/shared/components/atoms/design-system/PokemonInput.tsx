import React, { forwardRef } from 'react';
import { Input } from '../../../ui/primitives/Input';
import { Label } from '../../../ui/primitives/Label';
import { cn } from "@/lib/utils"
import { type VariantProps } from 'class-variance-authority';
import { pokemonInputVariants } from './unifiedVariants';

export interface PokemonInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof pokemonInputVariants> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  required?: boolean;
  loading?: boolean;
}

export const PokemonInput = forwardRef<HTMLInputElement, PokemonInputProps>(
  (
    {
      className,
      variant,
      inputSize,
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      fullWidth = true,
      required = false,
      loading = false,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `pokemon-input-${Math.random().toString(36).substr(2, 9)}`;
    
    const loadingSpinner = (
      <svg className="w-4 h-4 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    );

    return (
      <div className={cn("space-y-2", fullWidth && "w-full")}>
        {label && (
          <Label 
            htmlFor={inputId}
            className={cn(
              "text-zinc-200 font-medium",
              error && "text-red-400"
            )}
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
              {leftIcon}
            </div>
          )}
          
          <Input
            id={inputId}
            ref={ref}
            className={cn(
              pokemonInputVariants({ variant, inputSize }),
              leftIcon && "pl-10",
              (rightIcon || loading) && "pr-10",
              error && "border-red-500/60 focus:border-red-500 focus:ring-red-500/50",
              "shadow-lg rounded-xl",
              className
            )}
            disabled={loading}
            {...props}
          />
          
          {(rightIcon || loading) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400">
              {loading ? loadingSpinner : rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-400 font-medium">
            {error}
          </p>
        )}
        
        {helper && !error && (
          <p className="text-sm text-zinc-400">
            {helper}
          </p>
        )}
      </div>
    );
  }
);

PokemonInput.displayName = "PokemonInput";