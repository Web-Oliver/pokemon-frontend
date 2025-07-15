/**
 * Context7 Award-Winning Select Component
 * Ultra-premium select field with stunning visual hierarchy and micro-interactions
 * Features glass-morphism, premium gradients, and award-winning design patterns
 * 
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and premium focus states
 * - Context7 design system compliance
 * - Stunning animations and hover effects
 */

import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  fullWidth = false,
  options,
  placeholder = 'Select an option...',
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseSelectClasses = 'block w-full px-4 py-3 pr-12 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-300 focus:bg-white text-slate-700 font-medium transition-all duration-300 hover:shadow-xl focus:shadow-2xl appearance-none cursor-pointer focus:shadow-[0_0_0_3px_rgb(99,102,241,0.1)] hover:border-indigo-300/60';
  
  const errorSelectClasses = error 
    ? 'border-red-300/60 focus:ring-red-500/50 focus:border-red-400 bg-red-50/50' 
    : 'border-slate-200/50 focus:ring-indigo-500/50 focus:border-indigo-300';

  const widthClass = fullWidth ? 'w-full' : '';

  const finalSelectClassName = [
    baseSelectClasses,
    errorSelectClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`${widthClass} group`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-bold text-slate-700 mb-2 tracking-wide group-focus-within:text-indigo-600 transition-colors duration-300">
          {label}
        </label>
      )}
      
      <div className={`relative ${widthClass}`}>
        {/* Context7 Premium Background Gradient */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        {/* Premium Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm -z-10 pointer-events-none"></div>
        
        <select
          ref={ref}
          id={selectId}
          className={finalSelectClassName}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-slate-400">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
              className="text-slate-700 bg-white py-2"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Context7 Premium Dropdown Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-10">
          <div className="w-8 h-8 bg-slate-100 group-focus-within:bg-indigo-100 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm group-focus-within:shadow-md group-focus-within:scale-110 group-focus-within:shadow-[0_2px_8px_0_rgb(99,102,241,0.2)]">
            <ChevronDown className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-600 transition-all duration-300 group-focus-within:rotate-180" />
          </div>
        </div>
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

Select.displayName = 'Select';

export default Select;