/**
 * InformationFieldRenderer Component - Enhanced Central Field Renderer
 * Layer 3: Components (UI Building Blocks)
 *
 * ENHANCED: Now serves as THE central field renderer for all form fields
 * Following CLAUDE.md composition over conditions:
 * - Strategy Pattern: Renders appropriate fields based on type and configuration
 * - Open/Closed: New field types can be added without modification
 * - Dependency Inversion: Depends on abstractions, not concrete implementations
 * - Single Responsibility: Central orchestrator for all field rendering
 * - DRY: Eliminates field duplication across ProductInformationFields, CardInformationFields
 */

import React from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { PokemonInput } from '../../atoms/design-system/PokemonInput';
import { PokemonSelect } from '../../atoms/design-system/PokemonSelect';
import CardInformationFields from './CardInformationFields';
import ProductInformationFields from './ProductInformationFields';

// Enhanced field types - supports both legacy and new central rendering
type FieldType = 'card' | 'product' | 'individual';

// Individual field configuration for central rendering
export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'email' | 'url' | 'date' | 'textarea' | 'price' | 'grade';
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: Record<string, any>;
  description?: string;
  gridCols?: 1 | 2 | 3; // For responsive grid layout
}

interface ReadOnlyFields {
  // Card fields
  cardNumber?: boolean;
  variety?: boolean;

  // Grades structure fields
  grades?: boolean;
  gradeTotal?: boolean;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
  grade_10?: boolean;

  // Product hierarchical fields
  setProductName?: boolean;
  productName?: boolean;
  available?: boolean;
  price?: boolean;
  category?: boolean;
  url?: boolean;
}

// Enhanced props interface - supports both legacy and new central rendering
interface InformationFieldRendererProps {
  // Legacy support for existing card/product fields
  fieldType?: FieldType;
  register?: UseFormRegister<any>;
  errors?: FieldErrors<any>;
  watch?: UseFormWatch<any>;
  readOnlyFields?: ReadOnlyFields;
  productCategories?: Array<{ value: string; label: string }>;
  loadingOptions?: boolean;
  isDisabled?: boolean;

  // NEW: Central field rendering configuration
  fields?: FieldConfig[];
  sectionTitle?: string;
  layout?: 'grid' | 'stack';
  columns?: 1 | 2 | 3;
}

const InformationFieldRenderer: React.FC<InformationFieldRendererProps> = ({
  // Legacy props
  fieldType,
  register,
  errors,
  watch,
  readOnlyFields,
  productCategories = [],
  loadingOptions = false,
  isDisabled = false,
  
  // New central rendering props
  fields = [],
  sectionTitle,
  layout = 'grid',
  columns = 2,
}) => {
  // Helper function to render individual field based on configuration
  const renderIndividualField = (field: FieldConfig) => {
    if (!register || !errors) return null;

    const fieldError = errors[field.name];
    const isFieldDisabled = field.disabled || field.readOnly || isDisabled;

    // Grid column span based on field configuration
    const gridColsClass = field.gridCols ? `col-span-${field.gridCols}` : 'col-span-1';

    const fieldElement = (() => {
      switch (field.type) {
        case 'select':
          return (
            <PokemonSelect
              {...register(field.name, field.validation)}
              options={field.options || []}
              label={field.label}
              placeholder={field.placeholder}
              error={fieldError?.message}
              disabled={isFieldDisabled}
              required={field.required}
            />
          );

        case 'textarea':
          return (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <textarea
                {...register(field.name, field.validation)}
                placeholder={field.placeholder}
                disabled={isFieldDisabled}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
              />
              {fieldError && (
                <p className="text-sm text-red-600 dark:text-red-400">{fieldError.message}</p>
              )}
              {field.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{field.description}</p>
              )}
            </div>
          );

        default:
          return (
            <PokemonInput
              {...register(field.name, field.validation)}
              type={field.type === 'price' ? 'number' : field.type === 'grade' ? 'number' : field.type}
              label={field.label}
              placeholder={field.placeholder}
              error={fieldError?.message}
              disabled={isFieldDisabled}
              required={field.required}
              step={field.type === 'price' ? '0.01' : field.type === 'grade' ? '1' : undefined}
              min={field.type === 'grade' ? '1' : field.type === 'price' ? '0' : undefined}
              max={field.type === 'grade' ? '10' : undefined}
            />
          );
      }
    })();

    return (
      <div key={field.name} className={layout === 'grid' ? gridColsClass : ''}>
        {fieldElement}
      </div>
    );
  };

  // NEW: Central field rendering mode
  if (fields.length > 0) {
    const gridCols = layout === 'grid' ? `grid-cols-1 md:grid-cols-${columns}` : '';
    const containerClass = layout === 'grid' ? `grid ${gridCols} gap-4` : 'space-y-4';

    return (
      <div className="space-y-6">
        {sectionTitle && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
            {sectionTitle}
          </h3>
        )}
        <div className={containerClass}>
          {fields.map(renderIndividualField)}
        </div>
      </div>
    );
  }

  // LEGACY: Existing composition-based rendering (backward compatibility)
  if (!fieldType || !register || !errors || !readOnlyFields) {
    return null;
  }

  switch (fieldType) {
    case 'card':
      return (
        <CardInformationFields
          register={register}
          errors={errors}
          watch={watch!}
          readOnlyFields={{
            cardNumber: readOnlyFields.cardNumber,
            variety: readOnlyFields.variety,
            grades: readOnlyFields.grades,
            gradeTotal: readOnlyFields.gradeTotal,
            grade_1: readOnlyFields.grade_1,
            grade_2: readOnlyFields.grade_2,
            grade_3: readOnlyFields.grade_3,
            grade_4: readOnlyFields.grade_4,
            grade_5: readOnlyFields.grade_5,
            grade_6: readOnlyFields.grade_6,
            grade_7: readOnlyFields.grade_7,
            grade_8: readOnlyFields.grade_8,
            grade_9: readOnlyFields.grade_9,
            grade_10: readOnlyFields.grade_10,
          }}
          isDisabled={isDisabled}
        />
      );

    case 'product':
      return (
        <ProductInformationFields
          register={register}
          errors={errors}
          watch={watch!}
          readOnlyFields={{
            setProductName: readOnlyFields.setProductName,
            productName: readOnlyFields.productName,
            available: readOnlyFields.available,
            price: readOnlyFields.price,
            category: readOnlyFields.category,
            url: readOnlyFields.url,
          }}
          productCategories={productCategories}
          loadingOptions={loadingOptions}
          isDisabled={isDisabled}
        />
      );

    default:
      return null;
  }
};

// Convenience functions for creating field configurations
export const createFieldConfig = (
  name: string,
  label: string,
  type: FieldConfig['type'],
  options?: Partial<Omit<FieldConfig, 'name' | 'label' | 'type'>>
): FieldConfig => ({
  name,
  label,
  type,
  ...options,
});

// Common field configurations
export const commonFields = {
  price: (name: string = 'price', label: string = 'Price') =>
    createFieldConfig(name, label, 'price', {
      placeholder: '0.00',
      validation: { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } },
    }),

  grade: (name: string = 'grade', label: string = 'Grade') =>
    createFieldConfig(name, label, 'grade', {
      placeholder: '1-10',
      validation: { 
        required: 'Grade is required', 
        min: { value: 1, message: 'Grade must be between 1-10' },
        max: { value: 10, message: 'Grade must be between 1-10' }
      },
    }),

  email: (name: string = 'email', label: string = 'Email') =>
    createFieldConfig(name, label, 'email', {
      placeholder: 'Enter email address',
      validation: { 
        required: 'Email is required',
        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' }
      },
    }),

  description: (name: string = 'description', label: string = 'Description') =>
    createFieldConfig(name, label, 'textarea', {
      placeholder: 'Enter description...',
      gridCols: 2, // Full width
    }),

  category: (name: string = 'category', label: string = 'Category', options: Array<{ value: string; label: string }> = []) =>
    createFieldConfig(name, label, 'select', {
      options,
      placeholder: 'Select category',
      validation: { required: 'Category is required' },
    }),
};

export default InformationFieldRenderer;
