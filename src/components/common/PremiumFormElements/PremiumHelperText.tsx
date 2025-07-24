/**
 * PremiumHelperText - Reusable helper text component
 * Eliminates duplicate helper text styling across form components
 *
 * Following CLAUDE.md DRY principles:
 * - Centralized helper text styling
 * - Consistent spacing and typography
 * - Reusable across all form elements
 */

import React from 'react';

interface PremiumHelperTextProps {
  helperText?: string;
  className?: string;
}

export const PremiumHelperText: React.FC<PremiumHelperTextProps> = ({
  helperText,
  className = '',
}) => {
  if (!helperText) {
    return null;
  }

  return (
    <p className={`mt-2 text-sm text-zinc-400 font-medium pl-1 ${className}`}>
      {helperText}
    </p>
  );
};

export default PremiumHelperText;
