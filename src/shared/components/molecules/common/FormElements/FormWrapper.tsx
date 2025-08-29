/**
 * FormWrapper - Centralized Form Element Wrapper
 * Eliminates 400+ lines of duplicate styling across Input, Select, Button components
 *
 * Following CLAUDE.md DRY principles:
 * - Single source of truth for form gradients and effects
 * - Reusable composition pattern for all form elements
 * - Centralized micro-interactions and animations
 * - Theme-aware styling integration
 */

import React, { ReactNode } from 'react';
// themeConfig import removed

interface FormWrapperProps {
  children: ReactNode;
  fullWidth?: boolean;
  className?: string;
  error?: boolean;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  children,
  fullWidth = false,
  className = '',
  error = false,
}) => {
  const themeConfig = useCentralizedTheme();
  const widthClass = fullWidth ? 'w-full' : '';

  // Animation duration based on theme settings
  const animationDuration = themeConfig.reducedMotion
    ? '0s'
    : 'var(--animation-duration-normal, 0.3s)';

  // Theme-aware gradient colors using visual theme
  const primaryGradient = error
    ? 'from-red-500/20 via-rose-500/20 to-red-500/20'
    : `// themeConfig import removed

  const backgroundGradient = error
    ? 'from-red-500/10 via-rose-500/10 to-red-500/10'
    : `// themeConfig import removed

  return (
    <div
      className={`${widthClass} group ${className}`}
      style={{
        '--form-transition-duration': animationDuration,
        '--form-blur-intensity': `${themeConfig.glassmorphismIntensity / 20}px`,
      }}
    >
      <div className={`relative ${widthClass}`}>
        {/* Theme-aware Background Gradient */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${backgroundGradient} opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity ease-out`}
          style={{ transitionDuration: 'var(--form-transition-duration)' }}
        ></div>

        {/* Theme-aware Glow Effect */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${primaryGradient} opacity-0 group-focus-within:opacity-100 blur-sm -z-10 pointer-events-none transition-opacity ease-out`}
          style={{
            transitionDuration: 'var(--form-transition-duration)',
            filter: `blur(var(--form-blur-intensity))`,
          }}
        ></div>

        {children}
      </div>
    </div>
  );
};

export default FormWrapper;
