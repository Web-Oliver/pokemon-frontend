/**
 * Auction Form Container Component
 * Layer 3: Components (UI Building Blocks) - Container Pattern
 *
 * Provides unified structure for auction forms following SOLID and DRY principles
 * Eliminates custom form implementation in favor of standardized components
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Provides auction form structure and orchestration
 * - DRY: Eliminates duplicate form structure across auction forms
 * - Open/Closed: Extensible through render props and configuration
 * - Dependency Inversion: Uses abstract form components
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { PokemonSelect } from '../../atoms/design-system/PokemonSelect';
import { PokemonInput } from '../../atoms/design-system/PokemonInput';
import { PokemonCard } from '../../atoms/design-system';
import FormActionButtons from '../../molecules/common/FormActionButtons';

interface AuctionFormContainerProps {
  /** Form Configuration */
  isEditing: boolean;
  isSubmitting: boolean;

  /** Form Header Props */
  title: string;
  description: string;
  icon: LucideIcon;
  primaryColorClass: string;

  /** React Hook Form Functions */
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  handleSubmit: (
    onValid: (data: any) => void | Promise<void>
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;

  /** Form Submission */
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;

  /** Additional Content Sections */
  itemSelectionSection?: React.ReactNode;
  customButtons?: React.ReactNode;
}

/**
 * AuctionFormContainer
 * Template component that provides consistent structure for auction forms
 * Uses proper form components following Context7 design patterns
 */
const AuctionFormContainer: React.FC<AuctionFormContainerProps> = ({
  isEditing,
  isSubmitting,
  title,
  description,
  icon,
  primaryColorClass,
  register,
  errors,
  handleSubmit,
  onSubmit,
  onCancel,
  itemSelectionSection,
  customButtons,
}) => {
  // Get current date for date input minimum
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Auction Information */}
      <PokemonCard variant="glass" size="xl" className="relative">
        <div className="relative z-10 space-y-6">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center">
            {React.createElement(icon, {
              className: 'w-6 h-6 mr-3 text-cyan-400',
            })}
            Auction Details
          </h4>

          {/* Header Text Field */}
          <PokemonInput
            {...register('topText', { required: 'Header text is required' })}
            label="Auction Header Text"
            placeholder="Enter the main auction title/description"
            error={errors.topText?.message}
            fullWidth
            disabled={isSubmitting}
          />

          {/* Footer Text Field */}
          <div>
            <label className="block text-sm font-bold text-cyan-200 mb-2 tracking-wide">
              Auction Footer Text
            </label>
            <textarea
              {...register('bottomText', {
                required: 'Footer text is required',
              })}
              placeholder="Enter the auction footer/closing text"
              rows={4}
              disabled={isSubmitting}
              className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg placeholder-cyan-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 text-white font-medium transition-all duration-300 hover:shadow-xl focus:shadow-2xl resize-none ${
                errors.bottomText
                  ? 'border-red-400/60 focus:ring-red-500/50 focus:border-red-400 bg-red-900/20'
                  : 'border-white/20 focus:ring-cyan-400/50 focus:border-cyan-400'
              }`}
            />
            {errors.bottomText && (
              <p className="mt-2 text-sm text-red-300 font-medium">
                {errors.bottomText.message}
              </p>
            )}
          </div>

          {/* Auction Date Field */}
          <PokemonInput
            {...register('auctionDate')}
            type="date"
            label="Auction Date (Optional)"
            helper="Leave empty to set the date later"
            min={getCurrentDate()}
            error={errors.auctionDate?.message}
            fullWidth
            disabled={isSubmitting}
          />

          {/* Status Field */}
          <PokemonSelect
            {...register('status')}
            label="Initial Status"
            helper="Start with 'Draft' to review and add items before making it active"
            options={[
              { value: 'draft', label: 'Draft - Not visible to public' },
              { value: 'active', label: 'Active - Live auction' },
            ]}
            fullWidth
            disabled={isSubmitting}
          />
        </div>
      </PokemonCard>

      {/* Item Selection Section */}
      {itemSelectionSection}

      {/* Standardized Action Buttons */}
      {customButtons || (
        <FormActionButtons
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
          submitButtonText={isEditing ? 'Update Auction' : 'Create Auction'}
          loadingSubmitText={isEditing ? 'Updating...' : 'Creating...'}
          primaryButtonColorClass={primaryColorClass}
        />
      )}
    </form>
  );
};

export default AuctionFormContainer;
