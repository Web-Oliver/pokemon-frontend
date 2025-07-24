/**
 * CardProductInformationSection Component
 * Reusable section for card/product information with enhanced autocomplete
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles card/product information capture
 * - Open/Closed: Extensible for different item types
 * - DRY: Eliminates repetitive information section code
 * - Interface Segregation: Clean props interface for different form types
 */

import React from 'react';
import { LucideIcon, Package, Award, Search } from 'lucide-react';
import {
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
  UseFormClearErrors,
  Control,
} from 'react-hook-form';
import { EnhancedAutocomplete } from '../search/EnhancedAutocomplete';
import { AutocompleteField, AutocompleteConfig } from '../../hooks/useEnhancedAutocomplete';
import Input from '../common/Input';
import Select from '../common/Select';

interface CardProductInformationSectionProps {
  /** React Hook Form register function */
  register: UseFormRegister<any>;
  /** Form validation errors */
  errors: FieldErrors<any>;
  /** React Hook Form setValue function */
  setValue: UseFormSetValue<any>;
  /** React Hook Form watch function */
  watch: UseFormWatch<any>;
  /** React Hook Form clearErrors function */
  clearErrors: UseFormClearErrors<any>;
  /** React Hook Form control object */
  control: Control<any>;

  /** Autocomplete configuration */
  autocompleteConfig: AutocompleteConfig;
  /** Autocomplete fields configuration */
  autocompleteFields: AutocompleteField[];

  /** Callback when autocomplete selection changes */
  onSelectionChange: (selectedData: Record<string, unknown> | null) => void;
  /** Callback when autocomplete error occurs */
  onError: (error: Error) => void;

  /** Whether the section is disabled */
  isDisabled?: boolean;
  /** Section title */
  sectionTitle: string;
  /** Section icon */
  sectionIcon: LucideIcon;
  /** Whether this is for sealed product form */
  isSealedProductForm?: boolean;

  /** Additional read-only fields to display */
  readOnlyFields?: {
    pokemonNumber?: boolean;
    baseName?: boolean;
    variety?: boolean;
    category?: boolean;
    availability?: boolean;
  };

  /** Product categories for sealed products */
  productCategories?: Array<{ value: string; label: string }>;
  /** Loading state for options */
  loadingOptions?: boolean;

  /** Custom CSS classes */
  className?: string;
}

const CardProductInformationSection: React.FC<CardProductInformationSectionProps> = ({
  register,
  errors,
  setValue,
  watch,
  clearErrors,
  control,
  autocompleteConfig,
  autocompleteFields,
  onSelectionChange,
  onError,
  isDisabled = false,
  sectionTitle,
  sectionIcon: SectionIcon,
  isSealedProductForm = false,
  readOnlyFields = {},
  productCategories = [],
  loadingOptions = false,
  className = '',
}) => {
  const currentSetName = watch('setName');

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Section Header */}
      <h4 className='text-xl font-bold text-slate-900 mb-6 flex items-center justify-between'>
        <div className='flex items-center'>
          <SectionIcon className='w-6 h-6 mr-3 text-slate-600' />
          {sectionTitle}
        </div>
        {currentSetName && (
          <div className='flex items-center text-sm text-blue-600 bg-blue-50/80 px-3 py-1 rounded-full backdrop-blur-sm'>
            <Search className='w-4 h-4 mr-1' />
            Filtering by: {currentSetName}
          </div>
        )}
      </h4>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Enhanced Autocomplete for Hierarchical Search */}
        <div className='md:col-span-2'>
          <EnhancedAutocomplete
            config={autocompleteConfig}
            fields={autocompleteFields}
            onSelectionChange={onSelectionChange}
            onError={onError}
            variant='premium'
            showMetadata={true}
            allowClear={true}
            disabled={isDisabled}
            className='premium-search-integration'
          />
        </div>

        {/* Hidden form registrations for autocomplete fields */}
        <div className='hidden'>
          {autocompleteFields.map(field => (
            <input
              key={field.id}
              {...register(
                field.id,
                field.required
                  ? {
                      required: `${field.placeholder} is required`,
                      minLength: {
                        value: 2,
                        message: `${field.placeholder} must be at least 2 characters`,
                      },
                    }
                  : {}
              )}
              value={watch(field.id) || ''}
              readOnly
            />
          ))}
        </div>

        {/* Read-only display fields for cards */}
        {!isSealedProductForm && (
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
        )}

        {/* Additional fields for sealed products */}
        {isSealedProductForm && (
          <>
            {/* Category */}
            {readOnlyFields.category && (
              <div>
                <Select
                  label='Category'
                  {...register('category', { required: 'Category is required' })}
                  error={errors.category?.message}
                  options={productCategories}
                  disabled={loadingOptions || isDisabled}
                  value={watch('category') || ''}
                />
              </div>
            )}

            {/* Availability */}
            {readOnlyFields.availability && (
              <div>
                <Input
                  label='Availability'
                  type='number'
                  min='0'
                  {...register('availability', {
                    required: 'Availability is required',
                    min: { value: 0, message: 'Availability must be 0 or greater' },
                    validate: value => !isNaN(Number(value)) || 'Must be a valid number',
                  })}
                  error={errors.availability?.message}
                  placeholder='0'
                  disabled={isDisabled}
                  value={watch('availability') || ''}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CardProductInformationSection;
