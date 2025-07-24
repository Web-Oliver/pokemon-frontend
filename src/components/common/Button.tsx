/**
 * Context7 Award-Winning Button Component
 * Ultra-premium button with stunning visual hierarchy and micro-interactions
 * Features glass-morphism, premium gradients, and award-winning design patterns
 *
 * Following CLAUDE.md + Context7 principles + DRY optimization:
 * - Award-winning visual design with micro-interactions
 * - Premium gradients and shadow effects
 * - Context7 design system compliance
 * - Centralized premium effects through PremiumFormElements
 * - Eliminated duplicate styling code following SOLID principles
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { PremiumShimmer, PremiumGlow } from './PremiumFormElements';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold tracking-wide rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:shadow-2xl backdrop-blur-sm before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white focus:ring-cyan-500/50 border border-cyan-500/20 shadow-[0_4px_14px_0_rgb(6,182,212,0.3)] hover:shadow-[0_6px_20px_0_rgb(6,182,212,0.4)]',
    secondary:
      'bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-zinc-800 hover:to-zinc-900 text-zinc-100 focus:ring-zinc-500/50 border border-zinc-600/30 shadow-[0_4px_14px_0_rgb(39,39,42,0.3)] hover:shadow-[0_6px_20px_0_rgb(39,39,42,0.4)]',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white focus:ring-red-500/50 border border-red-500/20 shadow-[0_4px_14px_0_rgb(220,38,127,0.3)] hover:shadow-[0_6px_20px_0_rgb(220,38,127,0.4)]',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white focus:ring-emerald-500/50 border border-emerald-500/20 shadow-[0_4px_14px_0_rgb(5,150,105,0.3)] hover:shadow-[0_6px_20px_0_rgb(5,150,105,0.4)]',
    outline:
      'border-2 border-zinc-600/50 bg-zinc-900/80 backdrop-blur-sm hover:bg-zinc-800/90 hover:border-cyan-400/60 hover:shadow-lg text-zinc-200 hover:text-cyan-100 focus:ring-cyan-500/50 shadow-[0_2px_8px_0_rgb(0,0,0,0.3)] hover:shadow-[0_4px_14px_0_rgb(6,182,212,0.25)]',
  };

  const sizeClasses = {
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const finalClassName = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const glowVariant =
    variant === 'primary'
      ? 'primary'
      : variant === 'secondary'
        ? 'secondary'
        : variant === 'danger'
          ? 'danger'
          : variant === 'success'
            ? 'success'
            : 'default';

  return (
    <button className={finalClassName} disabled={disabled || loading} {...props}>
      {/* Context7 Premium Shimmer Effect */}
      <PremiumShimmer />

      {/* Premium Glow Effect */}
      <PremiumGlow variant={glowVariant} />

      {/* Premium Loading Spinner */}
      {loading && (
        <div className='relative z-10 mr-3'>
          <svg className='w-5 h-5 animate-spin' fill='none' viewBox='0 0 24 24'>
            <circle
              className='opacity-30'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='3'
            />
            <path
              className='opacity-90'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        </div>
      )}

      {/* Button Content */}
      <span className='relative z-10'>{children}</span>

      {/* Context7 Premium Gradient Overlay */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
    </button>
  );
};

export default Button;
