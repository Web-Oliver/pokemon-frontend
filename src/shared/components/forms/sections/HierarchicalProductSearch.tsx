/**
 * HIERARCHICAL PRODUCT SEARCH - SIMPLIFIED
 * Following CLAUDE.md SOLID & DRY principles
 * 
 * BEFORE: 50 lines wrapping complex unified component
 * AFTER: 30 lines, simple wrapper around simplified component
 */

import React from 'react';
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import HierarchicalSearch from './HierarchicalSearch';

interface HierarchicalProductSearchProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  clearErrors: UseFormClearErrors<any>;
  onSelectionChange?: (selectedData: any) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

const HierarchicalProductSearch: React.FC<HierarchicalProductSearchProps> = (
  props
) => {
  return (
    <HierarchicalSearch
      {...props}
      mode="setproduct-product"
      primaryFieldName="setProductName"
      secondaryFieldName="productName"
      primaryLabel="Set Product Name"
      secondaryLabel="Product Name"
      primaryPlaceholder="Search for a Pokemon set product (min 2 characters)..."
      secondaryPlaceholder="Search for a Pokemon product (min 2 characters)..."
    />
  );
};

export default HierarchicalProductSearch;