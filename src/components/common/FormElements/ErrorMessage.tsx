/**
 * ErrorMessage - Reusable error message component
 * Eliminates duplicate error styling across form components
 *
 * Following CLAUDE.md DRY principles:
 * - Centralized error message styling
 * - Consistent error icon and layout
 * - Reusable across all form elements
 * - Theme-aware error styling and spacing
 */

import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ErrorMessageProps {
  error?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  className = '',
}) => {
  const { config } = useTheme();
  
  if (!error) {
    return null;
  }

  // Theme-aware spacing based on density
  const spacingClass = {
    compact: 'mt-1',
    comfortable: 'mt-2', 
    spacious: 'mt-3',
  }[config.density];

  // Theme-aware sizing based on density
  const iconSize = {
    compact: 'w-3 h-3',
    comfortable: 'w-4 h-4',
    spacious: 'w-5 h-5',
  }[config.density];

  const textSize = {
    compact: 'text-xs',
    comfortable: 'text-sm',
    spacious: 'text-base',
  }[config.density];

  const marginClass = {
    compact: 'mr-1',
    comfortable: 'mr-2',
    spacious: 'mr-3',
  }[config.density];

  return (
    <div className={`${spacingClass} flex items-center ${className}`}>
      <div className={`${iconSize} bg-gradient-to-r from-red-500 to-rose-500 rounded-full ${marginClass} flex items-center justify-center`}>
        <span className="text-white text-xs font-bold">!</span>
      </div>
      <p className={`${textSize} text-red-400 font-medium`} role="alert">
        {error}
      </p>
    </div>
  );
};

export default ErrorMessage;
