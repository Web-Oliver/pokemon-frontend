/**
 * Context7 Award-Winning Input Component
 * Ultra-premium input field with stunning visual hierarchy and micro-interactions
 * Features glass-morphism, premium gradients, and award-winning design patterns
 * 
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and premium focus states
 * - Context7 design system compliance
 * - Stunning animations and hover effects
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  startIcon,
  endIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseInputClasses = 'block w-full py-3 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white text-slate-700 font-medium transition-all duration-300 hover:shadow-xl focus:shadow-2xl group-hover:border-indigo-200 focus:shadow-[0_0_0_3px_rgb(99,102,241,0.1)] hover:border-indigo-300/60';
  
  const errorInputClasses = error 
    ? 'border-red-300/60 focus:ring-red-500/50 focus:border-red-400 bg-red-50/50' 
    : 'border-slate-200/50 focus:ring-indigo-500/50 focus:border-indigo-300';

  const widthClass = fullWidth ? 'w-full' : '';
  
  const inputWithIconClasses = (startIcon || endIcon) 
    ? 'relative' 
    : '';

  const paddingWithIcons = startIcon && endIcon 
    ? 'pl-12 pr-12' 
    : startIcon 
    ? 'pl-12 pr-4' 
    : endIcon 
    ? 'pl-4 pr-12' 
    : 'px-4';

  const finalInputClassName = [
    baseInputClasses.replace('px-3', paddingWithIcons),
    errorInputClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${widthClass} group`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-slate-700 mb-2 tracking-wide group-focus-within:text-indigo-600 transition-colors duration-300">
          {label}
        </label>
      )}
      
      <div className={`${inputWithIconClasses} ${widthClass} relative`}>
        {/* Context7 Premium Background Gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        {/* Premium Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10 pointer-events-none"></div>
        
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <div className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-all duration-300 group-focus-within:scale-110 group-focus-within:drop-shadow-sm">
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
            <div className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-all duration-300 group-focus-within:scale-110 group-focus-within:drop-shadow-sm">
              {endIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center">
          <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mr-2 flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <p className="text-sm text-red-600 font-medium">
            {error}
          </p>
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-slate-500 font-medium pl-1">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;