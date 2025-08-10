/**
 * HIERARCHICAL CARD SEARCH - SIMPLIFIED
 * Following CLAUDE.md SOLID & DRY principles
 * 
 * BEFORE: 345 lines, complex configuration, debug spam  
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

interface HierarchicalCardSearchProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  clearErrors: UseFormClearErrors<any>;
  onSelectionChange?: (selectedData: any) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
}

const HierarchicalCardSearch: React.FC<HierarchicalCardSearchProps> = (
  props
) => {
  return (
    <HierarchicalSearch
      {...props}
      mode="set-card"
      primaryFieldName="setName"
      secondaryFieldName="cardName"
      primaryLabel="Set Name"
      secondaryLabel="Card Name"
      primaryPlaceholder="Search for a Pokemon set (min 2 characters)..."
      secondaryPlaceholder="Search for a Pokemon card (min 2 characters)..."
    />
  );
};

export default HierarchicalCardSearch;