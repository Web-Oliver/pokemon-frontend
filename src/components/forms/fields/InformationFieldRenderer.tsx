/**
 * InformationFieldRenderer Component
 * Layer 3: Components (UI Building Blocks)
 *
 * Following CLAUDE.md composition over conditions:
 * - Strategy Pattern: Renders appropriate fields based on type
 * - Open/Closed: New field types can be added without modification
 * - Dependency Inversion: Depends on abstractions, not concrete implementations
 */

import React from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import CardInformationFields from './CardInformationFields';
import ProductInformationFields from './ProductInformationFields';

type FieldType = 'card' | 'product';

interface ReadOnlyFields {
  // Card fields
  cardNumber?: boolean; // UPDATED: pokemonNumber → cardNumber
  variety?: boolean;
  // REMOVED: baseName (deprecated field per user feedback)
  // Product fields
  category?: boolean;
  availability?: boolean;
}

interface InformationFieldRendererProps {
  fieldType: FieldType;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  readOnlyFields: ReadOnlyFields;
  productCategories?: Array<{ value: string; label: string }>;
  loadingOptions?: boolean;
  isDisabled?: boolean;
}

const InformationFieldRenderer: React.FC<InformationFieldRendererProps> = ({
  fieldType,
  register,
  errors,
  watch,
  readOnlyFields,
  productCategories = [],
  loadingOptions = false,
  isDisabled = false,
}) => {
  // Use composition to render appropriate fields based on type
  switch (fieldType) {
    case 'card':
      return (
        <CardInformationFields
          register={register}
          errors={errors}
          watch={watch}
          readOnlyFields={{
            cardNumber: readOnlyFields.cardNumber, // UPDATED: pokemonNumber → cardNumber
            variety: readOnlyFields.variety,
            // REMOVED: baseName (deprecated field per user feedback)
          }}
          isDisabled={isDisabled}
        />
      );

    case 'product':
      return (
        <ProductInformationFields
          register={register}
          errors={errors}
          watch={watch}
          readOnlyFields={{
            category: readOnlyFields.category,
            availability: readOnlyFields.availability,
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

export default InformationFieldRenderer;
