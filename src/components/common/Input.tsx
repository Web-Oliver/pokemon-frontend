/**
 * Theme-Aware Input Component
 * Phase 2.1.2: Migrated to unified theme system with enhanced functionality
 * 
 * Following CLAUDE.md + Context7 principles + Unified Theme System:
 * - Standardized prop interfaces from themeTypes.ts
 * - Theme-aware styling with CSS custom properties
 * - Consistent variant system across all components
 * - Premium visual effects through centralized utilities
 * - Full integration with ThemeContext for dynamic theming
 * - Backward compatibility with existing usage patterns
 */

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { ErrorMessage, HelperText, Label, FormWrapper } from './FormElements';
import { StandardInputProps } from '../../types/themeTypes';
import { cn, inputStyleConfig, generateThemeClasses, getFocusClasses } from '../../utils/themeUtils';
import { inputClasses } from '../../utils/classNameUtils';
import { useTheme } from '../../contexts/ThemeContext';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, Omit<StandardInputProps, 'onChange' | 'onFocus' | 'onBlur'> {
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      defaultValue,
      size = 'md',
      fullWidth = true,
      startIcon,
      endIcon,
      error,
      helperText,
      required = false,
      disabled = false,
      readOnly = false,
      theme,
      colorScheme,
      density,
      animationIntensity,
      className = '',
      testId,
      onChange,
      onFocus,
      onBlur,
      id,
      ...props
    },
    ref
  ) => {
    const themeContext = useTheme();
    
    // Merge context theme with component props
    const effectiveTheme = theme || themeContext?.config.visualTheme;
    const effectiveColorScheme = colorScheme || themeContext?.config.primaryColor;
    const effectiveDensity = density || themeContext?.config.density;
    const effectiveAnimationIntensity = animationIntensity || themeContext?.config.animationIntensity;

    // Generate unique input ID
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Generate theme-aware classes using the utility
    const themeAwareClasses = inputClasses({
      size,
      hasError: !!error,
      disabled,
      theme: effectiveTheme,
      fullWidth,
    });

    // Icon container positioning
    const hasStartIcon = !!startIcon;
    const hasEndIcon = !!endIcon;
    const inputWithIconClasses = hasStartIcon || hasEndIcon ? 'relative' : '';

    // Dynamic padding based on icons and density
    const getPadding = () => {
      const basePadding = effectiveDensity === 'compact' 
        ? 'py-density-xs'
        : effectiveDensity === 'spacious'
        ? 'py-density-lg'
        : 'py-density-sm';

      const horizontalPadding = hasStartIcon && hasEndIcon
        ? 'pl-12 pr-12'
        : hasStartIcon
        ? 'pl-12 pr-4'
        : hasEndIcon
        ? 'pl-4 pr-12'
        : 'px-4';

      return cn(basePadding, horizontalPadding);
    };

    // Animation classes based on intensity
    const animationClasses = effectiveAnimationIntensity === 'disabled' 
      ? '' 
      : effectiveAnimationIntensity === 'subtle'
      ? 'hover:shadow-sm focus:shadow-sm'
      : effectiveAnimationIntensity === 'enhanced'
      ? 'hover:shadow-theme-hover hover:scale-101 focus:shadow-theme-hover focus:scale-101'
      : 'hover:shadow-theme-hover focus:shadow-theme-hover';

    // Final className combination
    const finalInputClassName = cn(
      themeAwareClasses,
      getPadding(),
      animationClasses,
      'group-focus-within:border-theme-border-accent/60',
      className
    );

    // Icon animation classes
    const iconClasses = cn(
      'h-5 w-5 text-zinc-400 transition-all duration-theme-normal',
      'group-focus-within:text-theme-primary',
      effectiveAnimationIntensity === 'enhanced' && 'group-focus-within:scale-110 group-focus-within:drop-shadow-sm'
    );

    return (
      <FormWrapper fullWidth={fullWidth} error={!!error}>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}

        <div className={cn(inputWithIconClasses, fullWidth && 'w-full', 'relative group')}>
          {/* Start Icon */}
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <div className={iconClasses}>
                {startIcon}
              </div>
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            className={finalInputClassName}
            data-testid={testId}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            {...props}
          />

          {/* End Icon */}
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
              <div className={iconClasses}>
                {endIcon}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        <ErrorMessage error={error} />
        
        {/* Helper Text */}
        <HelperText helperText={helperText} />
      </FormWrapper>
    );
  }
);

Input.displayName = 'Input';

export default Input;
