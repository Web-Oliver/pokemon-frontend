/**
 * FormErrorMessage - Advanced error message component with multiple display variants
 * Consolidates form error patterns across the application
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles all form error display scenarios
 * - DRY: Eliminates duplicate error display patterns
 * - Reusability: Supports inline, toast, and summary variants
 * - Interface Segregation: Clean props interface for different use cases
 */

import React from 'react';
import { useCentralizedTheme } from '../../../../utils/ui/themeConfig';

export interface FormErrorMessageProps {
  /** Error message(s) to display */
  error?: string | string[];
  /** Display variant */
  variant?: 'inline' | 'toast' | 'summary';
  /** Field name for context (used in summary variant) */
  fieldName?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show icon with error message */
  showIcon?: boolean;
  /** Dismissible (for toast variant) */
  dismissible?: boolean;
  /** Callback when error is dismissed */
  onDismiss?: () => void;
  /** Custom icon component */
  icon?: React.ReactNode;
  /** Animation duration in ms */
  animationDuration?: number;
}

export const FormErrorMessage: React.FC<FormErrorMessageProps> = ({
  error,
  variant = 'inline',
  fieldName,
  className = '',
  showIcon = true,
  dismissible = false,
  onDismiss,
  icon,
  animationDuration = 200,
}) => {
  const themeConfig = useCentralizedTheme();

  if (!error || (Array.isArray(error) && error.length === 0)) {
    return null;
  }

  const errors = Array.isArray(error) ? error : [error];

  // Theme-aware spacing and sizing
  const spacingClass = {
    compact: 'mt-1',
    comfortable: 'mt-2',
    spacious: 'mt-3',
  }[themeConfig.density];

  const iconSize = {
    compact: 'w-3 h-3',
    comfortable: 'w-4 h-4',
    spacious: 'w-5 h-5',
  }[themeConfig.density];

  const textSize = {
    compact: 'text-xs',
    comfortable: 'text-sm',
    spacious: 'text-base',
  }[themeConfig.density];

  const paddingClass = {
    compact: 'p-2',
    comfortable: 'p-3',
    spacious: 'p-4',
  }[themeConfig.density];

  // Default error icon
  const defaultIcon = (
    <div
      className={`${iconSize} bg-gradient-to-r from-red-500 to-rose-500 rounded-full mr-2 flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-white text-xs font-bold">!</span>
    </div>
  );

  // Render inline variant
  const renderInlineError = () => (
    <div className={`${spacingClass} flex items-start ${className}`}>
      {showIcon && (icon || defaultIcon)}
      <div className="flex-1">
        {errors.map((errorMessage, index) => (
          <p
            key={index}
            className={`${textSize} text-red-400 font-medium ${index > 0 ? 'mt-1' : ''}`}
            role="alert"
          >
            {errorMessage}
          </p>
        ))}
      </div>
    </div>
  );

  // Render toast variant
  const renderToastError = () => (
    <div
      className={`
        ${paddingClass} ${className}
        bg-gradient-to-r from-red-900/20 to-rose-900/20
        border border-red-500/30
        rounded-lg
        backdrop-blur-sm
        flex items-start
        animate-slideInFromTop
        shadow-lg
        transition-all duration-${animationDuration}
      `}
      role="alert"
    >
      {showIcon && (icon || defaultIcon)}
      <div className="flex-1">
        {fieldName && (
          <p className={`${textSize} text-red-300 font-semibold mb-1`}>
            {fieldName}
          </p>
        )}
        {errors.map((errorMessage, index) => (
          <p
            key={index}
            className={`${textSize} text-red-400 ${index > 0 ? 'mt-1' : ''}`}
          >
            {errorMessage}
          </p>
        ))}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={`
            ${iconSize} ml-2 flex-shrink-0
            text-red-400 hover:text-red-300
            transition-colors duration-150
            rounded-full p-1
            hover:bg-red-500/20
          `}
          aria-label="Dismiss error"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );

  // Render summary variant
  const renderSummaryError = () => (
    <div
      className={`
        ${paddingClass} ${className}
        bg-gradient-to-r from-red-950/30 to-rose-950/30
        border border-red-500/40
        rounded-lg
        backdrop-blur-md
      `}
      role="alert"
    >
      <div className="flex items-start mb-3">
        {showIcon && (icon || defaultIcon)}
        <h3 className={`${textSize} font-semibold text-red-300 flex-1`}>
          {errors.length === 1 ? 'Form Error' : `${errors.length} Form Errors`}
        </h3>
      </div>
      <ul className="space-y-2">
        {errors.map((errorMessage, index) => (
          <li key={index} className="flex items-start">
            <span className="text-red-400 mr-2">•</span>
            <div>
              {fieldName && (
                <span className={`${textSize} text-red-300 font-medium mr-2`}>
                  {fieldName}:
                </span>
              )}
              <span className={`${textSize} text-red-400`}>{errorMessage}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'toast':
      return renderToastError();
    case 'summary':
      return renderSummaryError();
    case 'inline':
    default:
      return renderInlineError();
  }
};

export default FormErrorMessage;
