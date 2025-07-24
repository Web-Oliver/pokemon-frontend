/**
 * ProductInformationFields Component
 * Layer 3: Components (UI Building Blocks)
 *
 * Following CLAUDE.md composition over conditions:
 * - Single Responsibility: Handles only product-specific fields
 * - Open/Closed: Extensible through field configuration
 * - Interface Segregation: Focused interface for product fields only
 */

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import Input from '../../common/Input';
import Select from '../../common/Select';

interface ReadOnlyProductFields {
  category?: boolean;
  availability?: boolean;
}

interface ProductInformationFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  readOnlyFields: ReadOnlyProductFields;
  productCategories: Array<{ value: string; label: string }>;
  loadingOptions?: boolean;
  isDisabled?: boolean;
}

const ProductInformationFields: React.FC<ProductInformationFieldsProps> = ({
  register,
  errors,
  watch,
  readOnlyFields,
  productCategories,
  loadingOptions = false,
  isDisabled = false,
}) => {
  if (!readOnlyFields || Object.keys(readOnlyFields).length === 0) {
    return null;
  }

  return (
    <>
      {/* Category */}
      {readOnlyFields.category && (
        <div>
          <Select
            label="Category"
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
            label="Availability"
            type="number"
            min="0"
            {...register('availability', {
              required: 'Availability is required',
              min: { value: 0, message: 'Availability must be 0 or greater' },
              validate: (value) =>
                !isNaN(Number(value)) || 'Must be a valid number',
            })}
            error={errors.availability?.message}
            placeholder="0"
            disabled={isDisabled}
            value={watch('availability') || ''}
          />
        </div>
      )}
    </>
  );
};

export default ProductInformationFields;
