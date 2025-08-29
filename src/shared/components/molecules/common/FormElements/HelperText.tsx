/**
 * HelperText - Reusable helper text component
 * Eliminates duplicate helper text styling across form components
 *
 * Following CLAUDE.md DRY principles:
 * - Centralized helper text styling
 * - Consistent spacing and typography
 * - Reusable across all form elements
 * - Theme-aware spacing and text sizing
 */

import React from 'react';
// themeConfig import removed

interface HelperTextProps {
  helperText?: string;
  className?: string;
}

export const HelperText: React.FC<HelperTextProps> = ({
  helperText,
  className = '',
}) => {
  const themeConfig = useCentralizedTheme();

  if (!helperText) {
    return null;
  }

  // Theme-aware spacing based on density
  const spacingClass = {
    compact: 'mt-1',
    comfortable: 'mt-2',
    spacious: 'mt-3',
  }[themeConfig.density];

  // Theme-aware text sizing based on density
  const textSize = {
    compact: 'text-xs',
    comfortable: 'text-sm',
    spacious: 'text-base',
  }[themeConfig.density];

  // Theme-aware padding based on density
  const paddingClass = {
    compact: 'pl-0.5',
    comfortable: 'pl-1',
    spacious: 'pl-1.5',
  }[themeConfig.density];

  return (
    <p
      className={`${spacingClass} ${textSize} text-zinc-400 font-medium ${paddingClass} ${className}`}
    >
      {helperText}
    </p>
  );
};

export default HelperText;
