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

  // NEW: Grades structure fields
  grades?: boolean; // Show complete grades breakdown
  gradeTotal?: boolean; // Show only total graded count
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

  // NEW: SetProduct → Product hierarchical fields
  setProductName?: boolean;
  productName?: boolean;
  available?: boolean;
  price?: boolean;
  category?: boolean;
  url?: boolean;
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
            cardNumber: readOnlyFields.cardNumber,
            variety: readOnlyFields.variety,
            // NEW: Grades structure fields
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
          watch={watch}
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

export default InformationFieldRenderer;
