/**
 * Theme-Aware Button Component
 * Phase 1.2.1: Standardized component variant system with theme integration
 * 
 * Following CLAUDE.md + Context7 principles + Unified Theme System:
 * - Standardized prop interfaces from themeTypes.ts
 * - Theme-aware styling with CSS custom properties
 * - Consistent variant system across all components
 * - Premium visual effects through centralized utilities
 * - Full integration with ThemeContext for dynamic theming
 * - Backward compatibility with existing usage patterns
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { Glow, Shimmer } from './FormElements';
import { StandardButtonProps } from '../../types/themeTypes';
import { cn, buttonStyleConfig, generateThemeClasses, getFocusClasses } from '../../utils/themeUtils';
import { useTheme } from '../../contexts/ThemeContext';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, Omit<StandardButtonProps, 'onClick'> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  loadingIndicator,
  fullWidth = false,
  startIcon,
  endIcon,
  theme,
  colorScheme,
  density,
  animationIntensity,
  className = '',
  testId,
  disabled,
  ...props
}, ref) => {
  const themeContext = useTheme();
  
  // Merge context theme with component props
  const effectiveTheme = theme || themeContext?.config.visualTheme;
  const effectiveColorScheme = colorScheme || themeContext?.config.primaryColor;
  const effectiveDensity = density || themeContext?.config.density;
  const effectiveAnimationIntensity = animationIntensity || themeContext?.config.animationIntensity;

  // Generate theme-aware classes
  const themeClasses = generateThemeClasses(
    buttonStyleConfig,
    variant,
    size,
    disabled || loading ? 'disabled' : 'default',
    effectiveTheme
  );

  // Focus classes for accessibility
  const focusClasses = getFocusClasses(variant);

  // Width classes
  const widthClass = fullWidth ? 'w-full' : '';

  // Animation classes based on intensity
  const animationClasses = effectiveAnimationIntensity === 'disabled' 
    ? '' 
    : effectiveAnimationIntensity === 'subtle'
    ? 'hover:scale-102 active:scale-98'
    : effectiveAnimationIntensity === 'enhanced'
    ? 'hover:scale-108 hover:rotate-1 active:scale-95'
    : 'hover:scale-105 active:scale-95';

  // Density-based padding override
  const densityPadding = effectiveDensity === 'compact' 
    ? 'px-density-sm py-density-xs'
    : effectiveDensity === 'spacious'
    ? 'px-density-xl py-density-lg'
    : '';

  // Final className combination
  const finalClassName = cn(
    themeClasses,
    focusClasses,
    animationClasses,
    widthClass,
    densityPadding,
    className
  );

  // Determine glow variant for backward compatibility
  const glowVariant = variant === 'primary' ? 'primary'
    : variant === 'secondary' ? 'secondary'
    : variant === 'danger' ? 'danger'
    : variant === 'success' ? 'success'
    : 'default';

  return (
    <button
      ref={ref}
      className={finalClassName}
      disabled={disabled || loading}
      data-testid={testId}
      {...props}
    >
      {/* Context7 Premium Shimmer Effect */}
      <Shimmer />

      {/* Premium Glow Effect */}
      <Glow variant={glowVariant} />

      {/* Start Icon */}
      {startIcon && !loading && (
        <span className="relative z-10 mr-2 flex items-center">
          {startIcon}
        </span>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="relative z-10 mr-3 flex items-center">
          {loadingIndicator || (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-30"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </div>
      )}

      {/* Button Content */}
      <span className="relative z-10">
        {loading && loadingText ? loadingText : children}
      </span>

      {/* End Icon */}
      {endIcon && !loading && (
        <span className="relative z-10 ml-2 flex items-center">
          {endIcon}
        </span>
      )}

      {/* Context7 Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-theme-normal"></div>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
