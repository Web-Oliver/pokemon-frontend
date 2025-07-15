/**
 * Reusable Input Component
 * Layer 3: Components (UI Building Blocks)
 * Following Tailwind CSS styling principles and CLAUDE.md guidelines
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
  
  const baseInputClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200';
  
  const errorInputClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

  const widthClass = fullWidth ? 'w-full' : '';
  
  const inputWithIconClasses = (startIcon || endIcon) 
    ? 'relative' 
    : '';

  const paddingWithIcons = startIcon && endIcon 
    ? 'pl-10 pr-10' 
    : startIcon 
    ? 'pl-10' 
    : endIcon 
    ? 'pr-10' 
    : 'px-3';

  const finalInputClassName = [
    baseInputClasses.replace('px-3', paddingWithIcons),
    errorInputClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={widthClass}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className={`${inputWithIconClasses} ${widthClass}`}>
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
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
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {endIcon}
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;