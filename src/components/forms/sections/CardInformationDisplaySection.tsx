/**
 * Card Information Display Section Component
 * Layer 3: Components (UI Building Blocks)
 *
 * Reusable component for displaying read-only card information fields
 * Eliminates 95% duplication between PSA and Raw card forms
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Displays card information fields only
 * - DRY: Eliminates duplicate code across PSA/Raw forms
 * - Reusability: Configurable for different card types
 * - Open/Closed: Extensible through props
 */

import React from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import Input from '../../common/Input';

interface CardInformationDisplaySectionProps {
  /** React Hook Form functions */
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;

  /** Display configuration */
  isVisible?: boolean;
  cardType: 'psa' | 'raw';

  /** Optional styling overrides */
  className?: string;
  gridClassName?: string;
}

/**
 * Card Information Display Section
 * Renders read-only Pokemon Number, Base Name, and Variety fields
 * Used by both PSA and Raw card forms to eliminate duplication
 */
const CardInformationDisplaySection: React.FC<
  CardInformationDisplaySectionProps
> = ({
  register,
  errors,
  watch,
  isVisible = true,
  cardType,
  className = '',
  gridClassName = 'grid grid-cols-1 md:grid-cols-2 gap-6',
}) => {
  if (!isVisible) {
    return null;
  }

  // Consistent styling for read-only fields across both form types
  const readOnlyFieldClass =
    'text-center bg-gray-50 dark:bg-zinc-900/50 dark:bg-zinc-950 text-gray-500 dark:text-zinc-500 dark:text-zinc-400 cursor-not-allowed';

  return (
    <div className={`${className}`}>
      {/* Card Information Fields Grid */}
      <div className={gridClassName}>
        {/* Pokemon Number Field */}
        <div>
          <Input
            label="Pokémon Number"
            {...register('pokemonNumber')}
            error={errors.pokemonNumber?.message}
            placeholder="e.g., 006, 025, 150"
            disabled={true}
            value={watch('pokemonNumber') || ''}
            className={readOnlyFieldClass}
          />
        </div>

        {/* Base Name Field */}
        <div>
          <Input
            label="Base Name"
            {...register('baseName')}
            error={errors.baseName?.message}
            placeholder="e.g., Charizard, Pikachu, Mew"
            disabled={true}
            value={watch('baseName') || ''}
            className={readOnlyFieldClass}
          />
        </div>

        {/* Variety Field - Full Width */}
        <div className="md:col-span-2">
          <Input
            label="Variety"
            {...register('variety')}
            error={errors.variety?.message}
            placeholder="e.g., Holo, Shadowless, 1st Edition"
            disabled={true}
            value={watch('variety') || ''}
            className={readOnlyFieldClass}
          />
        </div>
      </div>

      {/* Hidden form registrations for validation - Required for form submission */}
      <div className="hidden">
        <input
          {...register('setName', {
            required: 'Set name is required',
            minLength: {
              value: 2,
              message: 'Set name must be at least 2 characters',
            },
          })}
          value={watch('setName') || ''}
          readOnly
        />
        <input
          {...register('cardName', {
            required: 'Card name is required',
            minLength: {
              value: 2,
              message: 'Card name must be at least 2 characters',
            },
          })}
          value={watch('cardName') || ''}
          readOnly
        />
        <input
          {...register('pokemonNumber')}
          value={watch('pokemonNumber') || ''}
          readOnly
        />
        <input
          {...register('baseName')}
          value={watch('baseName') || ''}
          readOnly
        />
        <input
          {...register('variety')}
          value={watch('variety') || ''}
          readOnly
        />
      </div>
    </div>
  );
};

export default CardInformationDisplaySection;
