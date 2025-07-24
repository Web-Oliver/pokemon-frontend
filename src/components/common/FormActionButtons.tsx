/**
 * FormActionButtons Component
 * Reusable form action buttons with consistent styling and loading states
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles only form action button presentation
 * - Open/Closed: Extensible through theme configuration
 * - DRY: Eliminates repetitive button code across forms
 */

import React from 'react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';

interface FormActionButtonsProps {
  /** Function to call when cancel button is clicked */
  onCancel: () => void;
  /** Whether form is currently submitting */
  isSubmitting: boolean;
  /** Whether form is in edit mode (affects button text) */
  isEditing?: boolean;
  /** Custom text for submit button (overrides default) */
  submitButtonText?: string;
  /** Custom text for loading submit button (overrides default) */
  loadingSubmitText?: string;
  /** Primary color theme for submit button */
  primaryButtonColorClass?: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
  /** Whether cancel button should be disabled */
  cancelDisabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

// Theme configurations for submit button colors
const buttonThemeConfig = {
  purple:
    'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700',
  blue: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
  emerald: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
  amber: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
  rose: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700',
} as const;

const FormActionButtons: React.FC<FormActionButtonsProps> = ({
  onCancel,
  isSubmitting,
  isEditing = false,
  submitButtonText,
  loadingSubmitText,
  primaryButtonColorClass = 'purple',
  cancelDisabled = false,
  className = '',
}) => {
  // Generate button text based on editing state
  const defaultSubmitText = isEditing ? 'Update' : 'Add';
  const defaultLoadingText = isEditing ? 'Updating...' : 'Adding...';

  const finalSubmitText = submitButtonText || `${defaultSubmitText} Item`;
  const finalLoadingText = loadingSubmitText || defaultLoadingText;

  const buttonTheme = buttonThemeConfig[primaryButtonColorClass];

  return (
    <div className={`flex justify-end space-x-6 pt-8 border-t border-slate-200/50 ${className}`}>
      {/* Cancel Button */}
      <Button
        type='button'
        variant='secondary'
        onClick={onCancel}
        disabled={isSubmitting || cancelDisabled}
        className='px-8 py-3'
      >
        Cancel
      </Button>

      {/* Submit Button */}
      <Button
        type='submit'
        variant='primary'
        disabled={isSubmitting}
        className={`min-w-[140px] px-8 py-3 ${buttonTheme}`}
      >
        {isSubmitting ? (
          <div className='flex items-center'>
            <LoadingSpinner size='sm' className='mr-2' />
            {finalLoadingText}
          </div>
        ) : (
          finalSubmitText
        )}
      </Button>
    </div>
  );
};

export default FormActionButtons;
