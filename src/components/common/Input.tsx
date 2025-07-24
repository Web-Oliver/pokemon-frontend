/**
 * Context7 Award-Winning Input Component
 * Ultra-premium input field with stunning visual hierarchy and micro-interactions
 * Features glass-morphism, premium gradients, and award-winning design patterns
 *
 * Following CLAUDE.md + Context7 principles + DRY optimization:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and premium focus states
 * - Context7 design system compliance
 * - Centralized premium styling through PremiumFormElements
 * - Eliminated duplicate styling code following SOLID principles
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';
import {
  PremiumWrapper,
  PremiumLabel,
  PremiumErrorMessage,
  PremiumHelperText,
} from './PremiumFormElements';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      startIcon,
      endIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseInputClasses =
      'block w-full py-3 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-lg placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 focus:bg-zinc-800/95 text-zinc-100 font-medium transition-all duration-300 hover:shadow-xl focus:shadow-2xl group-hover:border-cyan-600/30 focus:shadow-[0_0_0_3px_rgb(6,182,212,0.1)] hover:border-cyan-500/40';

    const errorInputClasses = error
      ? 'border-red-400/60 focus:ring-red-500/50 focus:border-red-400 bg-red-900/20'
      : 'border-zinc-700/50 focus:ring-cyan-500/50 focus:border-cyan-400';

    const widthClass = fullWidth ? 'w-full' : '';

    const inputWithIconClasses = startIcon || endIcon ? 'relative' : '';

    const paddingWithIcons =
      startIcon && endIcon
        ? 'pl-20 pr-20'
        : startIcon
          ? 'pl-20 pr-4'
          : endIcon
            ? 'pl-4 pr-20'
            : 'px-4';

    const finalInputClassName = [
      baseInputClasses.replace('px-3', paddingWithIcons),
      errorInputClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <PremiumWrapper fullWidth={fullWidth} error={!!error}>
        {label && <PremiumLabel htmlFor={inputId}>{label}</PremiumLabel>}

        <div
          className={`${inputWithIconClasses} ${fullWidth ? 'w-full' : ''} relative`}
        >
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <div className="h-5 w-5 text-zinc-400 group-focus-within:text-cyan-400 transition-all duration-300 group-focus-within:scale-110 group-focus-within:drop-shadow-sm">
                {startIcon}
              </div>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={finalInputClassName}
            {...props}
          />

          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10">
              <div className="h-5 w-5 text-zinc-400 group-focus-within:text-cyan-400 transition-all duration-300 group-focus-within:scale-110 group-focus-within:drop-shadow-sm">
                {endIcon}
              </div>
            </div>
          )}
        </div>

        <PremiumErrorMessage error={error} />
        <PremiumHelperText helperText={helperText} />
      </PremiumWrapper>
    );
  }
);

Input.displayName = 'Input';

export default Input;
