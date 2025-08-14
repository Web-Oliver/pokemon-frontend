/**
 * FormActionButtons Component
 * Reusable form action buttons with consistent styling and loading states
 *
 * Following CLAUDE.md principles + DRY optimization:
 * - Single Responsibility: Handles only form action button presentation
 * - Open/Closed: Extensible through theme configuration
 * - DRY: Eliminates repetitive button code across forms + uses centralized themes
 * - Theme centralization: Uses formThemes system to eliminate duplication
 */

import React from 'react';
import { PokemonButton } from '../../atoms/design-system/PokemonButton';
import { buildThemeClasses, string } from '../../../../theme/formThemes';

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
  primaryButtonColorClass?: string;
  /** Whether cancel button should be disabled */
  cancelDisabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

// Theme configuration now centralized in formThemes system

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

  const buttonTheme = buildThemeClasses.buttonPrimary(primaryButtonColorClass);

  return (
    <div
      className={`flex justify-end space-x-6 pt-8 border-t border-slate-200/50 dark:border-zinc-700/50 dark:border-zinc-700/50 ${className}`}
    >
      {/* Cancel Button */}
      <PokemonButton
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isSubmitting || cancelDisabled}
        className="px-8 py-3"
      >
        Cancel
      </PokemonButton>

      {/* Submit Button */}
      <PokemonButton
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className={`min-w-[140px] px-8 py-3 ${buttonTheme}`}
        loading={isSubmitting}
        loadingText={finalLoadingText}
      >
        {finalSubmitText}
      </PokemonButton>
    </div>
  );
};

export default FormActionButtons;
