/**
 * Context7 Award-Winning Select Component
 * Ultra-premium select field with stunning visual hierarchy and micro-interactions
 * Features glass-morphism, premium gradients, and award-winning design patterns
 *
 * Following CLAUDE.md + Context7 principles + DRY optimization:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and premium focus states
 * - Context7 design system compliance
 * - Centralized premium styling through PremiumFormElements
 * - Eliminated duplicate styling code following SOLID principles
 */

import { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { ErrorMessage, HelperText, Label, FormWrapper } from './FormElements';

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

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      options,
      placeholder = 'Select an option...',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const baseSelectClasses =
      'block w-full px-4 py-3 pr-12 bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 focus:bg-zinc-800/95 text-zinc-100 font-medium transition-all duration-300 hover:shadow-xl focus:shadow-2xl appearance-none cursor-pointer focus:shadow-[0_0_0_3px_rgb(6,182,212,0.1)] hover:border-cyan-500/40';

    const errorSelectClasses = error
      ? 'border-red-400/60 focus:ring-red-500/50 focus:border-red-400 bg-red-900/20'
      : 'border-zinc-700/50 focus:ring-cyan-500/50 focus:border-cyan-400';

    const widthClass = fullWidth ? 'w-full' : '';

    const finalSelectClassName = [
      baseSelectClasses,
      errorSelectClasses,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <FormWrapper fullWidth={fullWidth} error={!!error}>
        {label && <Label htmlFor={selectId}>{label}</Label>}

        <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
          <select
            ref={ref}
            id={selectId}
            className={finalSelectClassName}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-zinc-400 bg-zinc-900">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="text-zinc-100 bg-zinc-900 py-2"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Context7 Premium Dropdown Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none z-10">
            <div className="w-8 h-8 bg-zinc-800 group-focus-within:bg-cyan-900/50 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm group-focus-within:shadow-md group-focus-within:scale-110 group-focus-within:shadow-[0_2px_8px_0_rgb(6,182,212,0.2)]">
              <ChevronDown className="h-4 w-4 text-zinc-400 group-focus-within:text-cyan-400 transition-all duration-300 group-focus-within:rotate-180" />
            </div>
          </div>
        </div>

        <ErrorMessage error={error} />
        <HelperText helperText={helperText} />
      </FormWrapper>
    );
  }
);

Select.displayName = 'Select';

export default Select;
