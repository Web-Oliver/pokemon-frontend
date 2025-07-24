/**
 * CardInformationFields Component
 * Layer 3: Components (UI Building Blocks)
 * 
 * Following CLAUDE.md composition over conditions:
 * - Single Responsibility: Handles only card-specific fields
 * - Open/Closed: Extensible through field configuration
 * - Interface Segregation: Focused interface for card fields only
 */

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import Input from '../../common/Input';

interface ReadOnlyCardFields {
  pokemonNumber?: boolean;
  baseName?: boolean;
  variety?: boolean;
}

interface CardInformationFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  readOnlyFields: ReadOnlyCardFields;
  isDisabled?: boolean;
}

const CardInformationFields: React.FC<CardInformationFieldsProps> = ({
  register,
  errors,
  watch,
  readOnlyFields,
  isDisabled = false,
}) => {
  if (!readOnlyFields || Object.keys(readOnlyFields).length === 0) {
    return null;
  }

  return (
    <>
      {/* Pokemon Number */}
      {readOnlyFields.pokemonNumber && (
        <div>
          <Input
            label='Pokemon Number'
            {...register('pokemonNumber')}
            error={errors.pokemonNumber?.message}
            placeholder='e.g., 006, 025, 150'
            disabled={true}
            value={watch('pokemonNumber') || ''}
            className='text-center bg-gray-50 text-gray-500 cursor-not-allowed'
          />
        </div>
      )}

      {/* Base Name */}
      {readOnlyFields.baseName && (
        <div>
          <Input
            label='Base Name'
            {...register('baseName')}
            error={errors.baseName?.message}
            placeholder='e.g., Charizard, Pikachu, Mew'
            disabled={true}
            value={watch('baseName') || ''}
            className='text-center bg-gray-50 text-gray-500 cursor-not-allowed'
          />
        </div>
      )}

      {/* Variety */}
      {readOnlyFields.variety && (
        <div className='md:col-span-2'>
          <Input
            label='Variety'
            {...register('variety')}
            error={errors.variety?.message}
            placeholder='e.g., Holo, Shadowless, 1st Edition'
            disabled={true}
            value={watch('variety') || ''}
            className='text-center bg-gray-50 text-gray-500 cursor-not-allowed'
          />
        </div>
      )}
    </>
  );
};

export default CardInformationFields;