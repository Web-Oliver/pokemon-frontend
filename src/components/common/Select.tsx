/**
 * Theme-Aware Select Component
 * Phase 2.1.3: Migrated to unified theme system with enhanced functionality
 *
 * Following CLAUDE.md + Context7 principles + Unified Theme System:
 * - Standardized prop interfaces from themeTypes.ts
 * - Theme-aware styling with CSS custom properties
 * - Consistent variant system across all components
 * - Premium visual effects through centralized utilities
 * - Full integration with ThemeContext for dynamic theming
 * - Backward compatibility with existing usage patterns
 */

import React, { forwardRef, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { ErrorMessage, HelperText, Label, FormWrapper } from './FormElements';
import { StandardSelectProps } from '../../types/themeTypes';
import {
  cn,
  inputStyleConfig,
  generateThemeClasses,
} from '../../utils/themeUtils';
import { inputClasses } from '../../utils/classNameUtils';
import { useTheme } from '../../contexts/ThemeContext';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    Omit<StandardSelectProps, 'options' | 'onChange'> {
  options: SelectOption[];
  onChange?: (value: string | string[]) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      placeholder = 'Select an option...',
      value,
      defaultValue,
      size = 'md',
      fullWidth = true,
      multiple = false,
      searchable = false,
      error,
      helperText,
      required = false,
      disabled = false,
      theme,
      colorScheme,
      density,
      animationIntensity,
      className = '',
      testId,
      options,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const themeContext = useTheme();

    // Merge context theme with component props
    const effectiveTheme = theme || themeContext?.config.visualTheme;
    const effectiveDensity = density || themeContext?.config.density;
    const effectiveAnimationIntensity =
      animationIntensity || themeContext?.config.animationIntensity;

    // Generate unique select ID
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    // Generate theme-aware classes using the input utility (select styling is similar)
    const themeAwareClasses = inputClasses({
      size,
      hasError: !!error,
      disabled,
      theme: effectiveTheme,
      fullWidth,
    });

    // Select-specific classes
    const selectSpecificClasses = cn(
      'appearance-none cursor-pointer',
      'pr-12', // Make room for chevron icon
      effectiveDensity === 'compact'
        ? 'py-density-xs'
        : effectiveDensity === 'spacious'
          ? 'py-density-lg'
          : 'py-density-sm'
    );

    // Animation classes based on intensity
    const animationClasses =
      effectiveAnimationIntensity === 'disabled'
        ? ''
        : effectiveAnimationIntensity === 'subtle'
          ? 'hover:shadow-sm focus:shadow-sm'
          : effectiveAnimationIntensity === 'enhanced'
            ? 'hover:shadow-theme-hover hover:scale-101 focus:shadow-theme-hover focus:scale-101'
            : 'hover:shadow-theme-hover focus:shadow-theme-hover';

    // Final className combination
    const finalSelectClassName = cn(
      themeAwareClasses,
      selectSpecificClasses,
      animationClasses,
      'group-focus-within:border-theme-border-accent/60',
      className
    );

    // Icon animation classes
    const iconContainerClasses = cn(
      'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-theme-normal shadow-sm',
      'bg-theme-bg-accent',
      'group-focus-within:bg-theme-primary/20 group-focus-within:shadow-theme-primary',
      effectiveAnimationIntensity === 'enhanced' &&
        'group-focus-within:scale-110'
    );

    const chevronClasses = cn(
      'h-4 w-4 transition-all duration-theme-normal',
      'text-zinc-400 group-focus-within:text-theme-primary',
      effectiveAnimationIntensity !== 'disabled' &&
        'group-focus-within:rotate-180'
    );

    // Option classes with theme support
    const optionClasses = cn(
      'py-2',
      themeContext?.resolvedTheme === 'dark'
        ? 'text-zinc-100 bg-zinc-900'
        : 'text-zinc-900 bg-white'
    );

    const placeholderOptionClasses = cn(optionClasses, 'text-zinc-400');

    // Handle change event conversion
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        const value = event.target.value;
        onChange(multiple ? [value] : value);
      }
    };

    return (
      <FormWrapper fullWidth={fullWidth} error={!!error}>
        {label && (
          <Label htmlFor={selectId} required={required}>
            {label}
          </Label>
        )}

        <div className={cn('relative group', fullWidth && 'w-full')}>
          {/* Select Element */}
          <select
            ref={ref}
            id={selectId}
            value={value}
            defaultValue={defaultValue}
            multiple={multiple}
            required={required}
            disabled={disabled}
            className={finalSelectClassName}
            data-testid={testId}
            onChange={handleChange}
            {...props}
          >
            {placeholder && !multiple && (
              <option value="" disabled className={placeholderOptionClasses}>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={optionClasses}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Theme-Aware Dropdown Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none z-10">
            <div className={iconContainerClasses}>
              <ChevronDown className={chevronClasses} />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <ErrorMessage error={error} />

        {/* Helper Text */}
        <HelperText helperText={helperText} />
      </FormWrapper>
    );
  }
);

Select.displayName = 'Select';

export default Select;
