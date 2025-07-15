/**
 * Context7 Award-Winning Button Component
 * Ultra-premium button with stunning visual hierarchy and micro-interactions
 * Features glass-morphism, premium gradients, and award-winning design patterns
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Premium gradients and shadow effects
 * - Context7 design system compliance
 * - Stunning hover and focus states
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

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
      'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 text-white focus:ring-indigo-500/50 border border-indigo-500/20 shadow-[0_4px_14px_0_rgb(99,102,241,0.3)] hover:shadow-[0_6px_20px_0_rgb(99,102,241,0.4)]',
    secondary:
      'bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700 text-white focus:ring-slate-500/50 border border-slate-500/20 shadow-[0_4px_14px_0_rgb(71,85,105,0.3)] hover:shadow-[0_6px_20px_0_rgb(71,85,105,0.4)]',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white focus:ring-red-500/50 border border-red-500/20 shadow-[0_4px_14px_0_rgb(220,38,127,0.3)] hover:shadow-[0_6px_20px_0_rgb(220,38,127,0.4)]',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white focus:ring-emerald-500/50 border border-emerald-500/20 shadow-[0_4px_14px_0_rgb(5,150,105,0.3)] hover:shadow-[0_6px_20px_0_rgb(5,150,105,0.4)]',
    outline:
      'border-2 border-slate-300/50 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-indigo-400 hover:shadow-lg text-slate-700 hover:text-slate-900 focus:ring-indigo-500/50 shadow-[0_2px_8px_0_rgb(0,0,0,0.08)] hover:shadow-[0_4px_14px_0_rgb(99,102,241,0.15)]',
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

  return (
    <button className={finalClassName} disabled={disabled || loading} {...props}>
      {/* Context7 Premium Shimmer Effect */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>

      {/* Premium Glow Effect */}
      <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10'></div>

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
