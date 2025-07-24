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
import { LucideIcon, Search } from 'lucide-react';
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  UseFormClearErrors,
  Control,
} from 'react-hook-form';
import { EnhancedAutocomplete } from '../search/EnhancedAutocomplete';
import {
  AutocompleteField,
  AutocompleteConfig,
} from '../../hooks/useEnhancedAutocomplete';
import { InformationFieldRenderer } from './fields';

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
  /** Form type - determines which fields to render */
  formType: 'card' | 'product';

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

const CardProductInformationSection: React.FC<
  CardProductInformationSectionProps
> = ({
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
  formType,
  readOnlyFields = {},
  productCategories = [],
  loadingOptions = false,
  className = '',
}) => {
  const currentSetName = watch('setName');

  return (
    <div
      className={`bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Backdrop gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50"></div>

      {/* Section Header */}
      <h4 className="text-xl font-bold text-zinc-100 mb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <SectionIcon className="w-6 h-6 mr-3 text-zinc-300" />
          {sectionTitle}
        </div>
        {currentSetName && (
          <div className="flex items-center text-sm text-blue-300 bg-blue-900/50 px-3 py-1 rounded-full backdrop-blur-sm border border-blue-600/30">
            <Search className="w-4 h-4 mr-1" />
            Filtering by: {currentSetName}
          </div>
        )}
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Enhanced Autocomplete for Hierarchical Search */}
        <div className="md:col-span-2">
          <EnhancedAutocomplete
            config={autocompleteConfig}
            fields={autocompleteFields}
            onSelectionChange={onSelectionChange}
            onError={onError}
            variant="premium"
            showMetadata={true}
            allowClear={true}
            disabled={isDisabled}
            className="premium-search-integration"
          />
        </div>

        {/* Hidden form registrations for autocomplete fields */}
        <div className="hidden">
          {autocompleteFields.map((field) => (
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

        {/* Dynamic field rendering using composition */}
        <InformationFieldRenderer
          fieldType={formType}
          register={register}
          errors={errors}
          watch={watch}
          readOnlyFields={readOnlyFields}
          productCategories={productCategories}
          loadingOptions={loadingOptions}
          isDisabled={isDisabled}
        />
      </div>
    </div>
  );
};

export default CardProductInformationSection;
