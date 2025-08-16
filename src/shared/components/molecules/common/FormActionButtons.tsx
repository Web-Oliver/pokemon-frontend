/**
 * FormActionButtons Component
 * Reusable form action buttons with unified design system styling
 *
 * Following CLAUDE.md principles + unified design system:
 * - Single Responsibility: Handles only form action button presentation
 * - Open/Closed: Extensible through variant configuration
 * - DRY: Uses unified button variants instead of custom themes
 * - Unified Design: Uses cyan gradients and glass effects from design system
 */

import React from 'react';
import { PokemonButton } from '../../atoms/design-system/PokemonButton';

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
  /** Whether cancel button should be disabled */
  cancelDisabled?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
}

const FormActionButtons: React.FC<FormActionButtonsProps> = ({
  onCancel,
  isSubmitting,
  isEditing = false,
  submitButtonText,
  loadingSubmitText,
  cancelDisabled = false,
  className = '',
}) => {
  // Generate button text based on editing state
  const defaultSubmitText = isEditing ? 'Update' : 'Add';
  const defaultLoadingText = isEditing ? 'Updating...' : 'Adding...';

  const finalSubmitText = submitButtonText || `${defaultSubmitText} Item`;
  const finalLoadingText = loadingSubmitText || defaultLoadingText;

  return (
    <div
      className={`flex justify-end space-x-6 pt-8 border-t border-slate-200/50 dark:border-zinc-700/50 ${className}`}
    >
      {/* Cancel Button - Glass effect styling */}
      <PokemonButton
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting || cancelDisabled}
        className="px-8 py-3 bg-zinc-900/60 backdrop-blur-xl border-cyan-500/20 text-zinc-100 hover:bg-zinc-800/70 hover:border-cyan-400/30 transition-all duration-300"
      >
        Cancel
      </PokemonButton>

      {/* Submit Button - Unified cyan gradient */}
      <PokemonButton
        type="submit"
        variant="primary"
        disabled={isSubmitting}
        className="min-w-[140px] px-8 py-3"
        loading={isSubmitting}
        loadingText={finalLoadingText}
      >
        {finalSubmitText}
      </PokemonButton>
    </div>
  );
};

export default FormActionButtons;
