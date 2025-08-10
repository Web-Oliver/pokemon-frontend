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
import { FormField } from './FormField';
import UnifiedGradeDisplay from '../../molecules/common/UnifiedGradeDisplay';
import { ProductCategory } from '../../../domain/models/product';

// Enhanced field types - supports both legacy and new central rendering
type FieldType = 'card' | 'product' | 'individual';

// Individual field configuration for central rendering
export interface FieldConfig {
  name: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'email'
    | 'url'
    | 'date'
    | 'textarea'
    | 'price'
    | 'grade';
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
    const gridColsClass = field.gridCols
      ? `col-span-${field.gridCols}`
      : 'col-span-1';

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
                <p className="text-sm text-red-600 dark:text-red-400">
                  {fieldError.message}
                </p>
              )}
              {field.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {field.description}
                </p>
              )}
            </div>
          );

        default:
          return (
            <PokemonInput
              {...register(field.name, field.validation)}
              type={
                field.type === 'price'
                  ? 'number'
                  : field.type === 'grade'
                    ? 'number'
                    : field.type
              }
              label={field.label}
              placeholder={field.placeholder}
              error={fieldError?.message}
              disabled={isFieldDisabled}
              required={field.required}
              step={
                field.type === 'price'
                  ? '0.01'
                  : field.type === 'grade'
                    ? '1'
                    : undefined
              }
              min={
                field.type === 'grade'
                  ? '1'
                  : field.type === 'price'
                    ? '0'
                    : undefined
              }
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
    const gridCols =
      layout === 'grid' ? `grid-cols-1 md:grid-cols-${columns}` : '';
    const containerClass =
      layout === 'grid' ? `grid ${gridCols} gap-4` : 'space-y-4';

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
        <div className="space-y-4">
          {/* Card Number */}
          {readOnlyFields.cardNumber && (
            <FormField
              name="cardNumber"
              label="Card Number"
              type="text"
              register={register}
              error={errors.cardNumber}
              disabled={true}
              readOnly={true}
              autoFilled={true}
              placeholder="Auto-filled from card selection"
            />
          )}

          {/* Variety */}
          {readOnlyFields.variety && (
            <FormField
              name="variety"
              label="Variety"
              type="text"
              register={register}
              error={errors.variety}
              disabled={true}
              readOnly={true}
              autoFilled={true}
              placeholder="Auto-filled from card selection"
            />
          )}

          {/* Grade Total - Summary display */}
          {readOnlyFields.gradeTotal && watch && (
            <FormField
              name="gradeTotal"
              label="Total PSA Graded"
              type="text"
              register={register}
              disabled={true}
              readOnly={true}
              autoFilled={true}
            />
          )}

          {/* Complete Grades Breakdown */}
          {readOnlyFields.grades && watch && watch('grades') && (
            <UnifiedGradeDisplay grades={watch('grades')} showTotal={true} />
          )}

          {/* Individual Grade Fields */}
          {readOnlyFields.grade_1 && (
            <FormField
              name="grade_1"
              label="PSA 1"
              type="number"
              register={register}
              error={errors.grade_1}
              min="0"
              disabled={isDisabled}
            />
          )}
          {readOnlyFields.grade_2 && (
            <FormField
              name="grade_2"
              label="PSA 2"
              type="number"
              register={register}
              error={errors.grade_2}
              min="0"
              disabled={isDisabled}
            />
          )}
          {readOnlyFields.grade_3 && (
            <FormField
              name="grade_3"
              label="PSA 3"
              type="number"
              register={register}
              error={errors.grade_3}
              min="0"
              disabled={isDisabled}
            />
          )}
          {readOnlyFields.grade_4 && (
            <FormField
              name="grade_4"
              label="PSA 4"
              type="number"
              register={register}
              error={errors.grade_4}
              min="0"
              disabled={isDisabled}
            />
          )}
          {readOnlyFields.grade_5 && (
            <FormField
              name="grade_5"
              label="PSA 5"
              type="number"
              register={register}
              error={errors.grade_5}
              min="0"
              disabled={isDisabled}
            />
          )}
          {readOnlyFields.grade_6 && (
            <FormField
              name="grade_6"
              label="PSA 6"
              type="number"
              register={register}
              error={errors.grade_6}
              min="0"
              disabled={isDisabled}
            />
          )}
          {readOnlyFields.grade_7 && (
            <FormField
              name="grade_7"
              label="PSA 7"
              type="number"
              register={register}
              error={errors.grade_7}
              min="0"
              disabled={isDisabled}
            />
          )}
          {readOnlyFields.grade_8 && (
            <FormField
              name="grade_8"
              label="PSA 8"
              type="number"
              register={register}
              error={errors.grade_8}
              min="0"
              disabled={isDisabled}
            />
          )}
          {readOnlyFields.grade_9 && (
            <FormField
              name="grade_9"
              label="PSA 9"
              type="number"
              register={register}
              error={errors.grade_9}
              min="0"
              disabled={isDisabled}
            />
          )}
          {readOnlyFields.grade_10 && (
            <FormField
              name="grade_10"
              label="PSA 10"
              type="number"
              register={register}
              error={errors.grade_10}
              min="0"
              disabled={isDisabled}
            />
          )}
        </div>
      );

    case 'product':
      // Generate category options from ProductCategory enum if not provided
      const categoryOptions =
        productCategories.length > 0
          ? productCategories
          : Object.values(ProductCategory).map((category) => ({
              value: category,
              label: String(category)
                .replace('-', ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase()),
            }));

      return (
        <>
          {/* SetProduct Name - Auto-filled field */}
          {readOnlyFields.setProductName && (
            <FormField
              name="setProductName"
              label="Set Product"
              type="text"
              register={register}
              error={errors.setProductName}
              placeholder="Auto-filled from SetProduct selection"
              autoFilled={true}
              disabled={isDisabled}
            />
          )}

          {/* Product Name - Auto-filled field */}
          {readOnlyFields.productName && (
            <FormField
              name="productName"
              label="Product Name"
              type="text"
              register={register}
              error={errors.productName}
              placeholder="Auto-filled from Product selection"
              autoFilled={true}
              disabled={isDisabled}
            />
          )}

          {/* Category */}
          {readOnlyFields.category && (
            <FormField
              name="category"
              label="Category"
              type="select"
              register={register}
              error={errors.category}
              options={categoryOptions}
              disabled={loadingOptions || isDisabled}
              required={true}
            />
          )}

          {/* Available - NEW field name matching Product model */}
          {readOnlyFields.available && (
            <FormField
              name="available"
              label="Available"
              type="available"
              register={register}
              error={errors.available}
              placeholder="0"
              disabled={isDisabled}
              required={true}
            />
          )}

          {/* Price - From Product model */}
          {readOnlyFields.price && (
            <FormField
              name="price"
              label="Price"
              type="price"
              register={register}
              error={errors.price}
              placeholder="0.00"
              disabled={isDisabled}
              required={true}
            />
          )}

          {/* URL - Product URL from Product model */}
          {readOnlyFields.url && (
            <div className="md:col-span-2">
              <FormField
                name="url"
                label="Product URL"
                type="url"
                register={register}
                error={errors.url}
                placeholder="https://example.com/product"
                disabled={isDisabled}
              />
            </div>
          )}
        </>
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
      validation: {
        required: 'Price is required',
        min: { value: 0, message: 'Price must be positive' },
      },
    }),

  grade: (name: string = 'grade', label: string = 'Grade') =>
    createFieldConfig(name, label, 'grade', {
      placeholder: '1-10',
      validation: {
        required: 'Grade is required',
        min: { value: 1, message: 'Grade must be between 1-10' },
        max: { value: 10, message: 'Grade must be between 1-10' },
      },
    }),

  email: (name: string = 'email', label: string = 'Email') =>
    createFieldConfig(name, label, 'email', {
      placeholder: 'Enter email address',
      validation: {
        required: 'Email is required',
        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email format' },
      },
    }),

  description: (name: string = 'description', label: string = 'Description') =>
    createFieldConfig(name, label, 'textarea', {
      placeholder: 'Enter description...',
      gridCols: 2, // Full width
    }),

  category: (
    name: string = 'category',
    label: string = 'Category',
    options: Array<{
      value: string;
      label: string;
    }> = []
  ) =>
    createFieldConfig(name, label, 'select', {
      options,
      placeholder: 'Select category',
      validation: { required: 'Category is required' },
    }),
};

export default InformationFieldRenderer;
