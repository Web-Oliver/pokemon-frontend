/**
 * ProductInformationFields Component
 * Layer 3: Components (UI Building Blocks)
 *
 * NEW: Works with SetProduct → Product hierarchical relationship
 * Following CLAUDE.md composition over conditions:
 * - Single Responsibility: Handles product-specific fields from new backend
 * - Open/Closed: Extensible through field configuration
 * - Interface Segregation: Focused interface for SetProduct → Product structure
 */

import React from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import Input from '../../common/Input';
import Select from '../../common/Select';
import { ProductCategory } from '../../../domain/models/product';

interface ReadOnlyProductFields {
  setProductName?: boolean;
  productName?: boolean;
  available?: boolean;
  price?: boolean;
  category?: boolean;
  url?: boolean;
}

interface ProductInformationFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  readOnlyFields: ReadOnlyProductFields;
  productCategories?: Array<{ value: string; label: string }>;
  loadingOptions?: boolean;
  isDisabled?: boolean;
}

const ProductInformationFields: React.FC<ProductInformationFieldsProps> = ({
  register,
  errors,
  watch,
  readOnlyFields,
  productCategories = [],
  loadingOptions = false,
  isDisabled = false,
}) => {
  if (!readOnlyFields || Object.keys(readOnlyFields).length === 0) {
    return null;
  }

  // Generate category options from ProductCategory enum if not provided
  const categoryOptions = productCategories.length > 0 ? productCategories : Object.values(ProductCategory).map(category => ({
    value: category,
    label: category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  console.log('[CATEGORY DEBUG] Available category options:', categoryOptions);
  console.log('[CATEGORY DEBUG] Current category value from form:', watch('category'));
  console.log('[CATEGORY DEBUG] ProductCategories prop:', productCategories);

  return (
    <>
      {/* SetProduct Name - Read-only field auto-filled from SetProduct selection */}
      {readOnlyFields.setProductName && (
        <div>
          <Input
            label="Set Product"
            {...register('setProductName')}
            error={errors.setProductName?.message}
            placeholder="Auto-filled from SetProduct selection"
            disabled={true}
            value={watch('setProductName') || ''}
            className="text-center bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 cursor-not-allowed"
          />
        </div>
      )}

      {/* Product Name - Read-only field auto-filled from Product selection */}
      {readOnlyFields.productName && (
        <div>
          <Input
            label="Product Name"
            {...register('productName')}
            error={errors.productName?.message}
            placeholder="Auto-filled from Product selection"
            disabled={true}
            value={watch('productName') || ''}
            className="text-center bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 cursor-not-allowed"
          />
        </div>
      )}

      {/* Category */}
      {readOnlyFields.category && (
        <div>
          <Select
            label="Category"
            {...register('category', { required: 'Category is required' })}
            error={errors.category?.message}
            options={categoryOptions}
            disabled={loadingOptions || isDisabled}
            value={watch('category') || ''}
          />
        </div>
      )}

      {/* Available - NEW field name matching Product model */}
      {readOnlyFields.available && (
        <div>
          <Input
            label="Available"
            type="number"
            min="0"
            {...register('available', {
              required: 'Available quantity is required',
              min: { value: 0, message: 'Available quantity must be 0 or greater' },
              validate: (value) =>
                !isNaN(Number(value)) || 'Must be a valid number',
            })}
            error={errors.available?.message}
            placeholder="0"
            disabled={isDisabled}
            value={watch('available') || ''}
          />
        </div>
      )}

      {/* Price - From Product model */}
      {readOnlyFields.price && (
        <div>
          <Input
            label="Price"
            type="text"
            {...register('price', {
              required: 'Price is required',
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: 'Price must be a valid number with up to 2 decimal places',
              },
            })}
            error={errors.price?.message}
            placeholder="0.00"
            disabled={isDisabled}
            value={watch('price') || ''}
          />
        </div>
      )}

      {/* URL - Product URL from Product model */}
      {readOnlyFields.url && (
        <div className="md:col-span-2">
          <Input
            label="Product URL"
            type="url"
            {...register('url', {
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'URL must be a valid HTTP/HTTPS URL',
              },
            })}
            error={errors.url?.message}
            placeholder="https://example.com/product"
            disabled={isDisabled}
            value={watch('url') || ''}
          />
        </div>
      )}
    </>
  );
};

export default ProductInformationFields;
