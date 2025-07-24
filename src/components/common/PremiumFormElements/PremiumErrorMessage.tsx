/**
 * PremiumErrorMessage - Reusable error message component
 * Eliminates duplicate error styling across form components
 *
 * Following CLAUDE.md DRY principles:
 * - Centralized error message styling
 * - Consistent error icon and layout
 * - Reusable across all form elements
 */

import React from 'react';

interface PremiumErrorMessageProps {
  error?: string;
  className?: string;
}

export const PremiumErrorMessage: React.FC<PremiumErrorMessageProps> = ({
  error,
  className = '',
}) => {
  if (!error) {
    return null;
  }

  return (
    <div className={`mt-2 flex items-center ${className}`}>
      <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mr-2 flex items-center justify-center">
        <span className="text-white text-xs font-bold">!</span>
      </div>
      <p className="text-sm text-red-400 font-medium">{error}</p>
    </div>
  );
};

export default PremiumErrorMessage;
