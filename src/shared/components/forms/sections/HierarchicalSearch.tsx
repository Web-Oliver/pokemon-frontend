/**
 * SIMPLE HIERARCHICAL SEARCH - ONE COMPONENT FOR ALL HIERARCHICAL SEARCHES
 * Following CLAUDE.md SOLID & DRY principles
 * 
 * BEFORE: Complex hierarchical components with debug spam
 * AFTER: Simple, clean hierarchical search using SimpleSearch components
 */

import React, { useState } from 'react';
import {
  FieldErrors,
  UseFormClearErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import SearchInput from '../../atoms/design-system/SearchInput';

interface HierarchicalSearchProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  clearErrors: UseFormClearErrors<any>;
  onSelectionChange?: (selectedData: any) => void;
  isSubmitting: boolean;
  isEditing?: boolean;
  mode: 'set-card' | 'setproduct-product';
  primaryFieldName: string;
  secondaryFieldName: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryPlaceholder: string;
  secondaryPlaceholder: string;
}

const HierarchicalSearch: React.FC<HierarchicalSearchProps> = ({
  register,
  errors,
  setValue,
  watch,
  clearErrors,
  onSelectionChange,
  isSubmitting,
  isEditing = false,
  mode,
  primaryFieldName,
  secondaryFieldName,
  primaryLabel,
  secondaryLabel,
  primaryPlaceholder,
  secondaryPlaceholder,
}) => {
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>();

  const primaryValue = watch(primaryFieldName) || '';
  const secondaryValue = watch(secondaryFieldName) || '';

  // Show editing message if in edit mode
  if (isEditing) {
    return (
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <p className="text-sm text-amber-400">
          Information cannot be changed when editing. Details are locked after adding to preserve data integrity.
        </p>
      </div>
    );
  }

  const handlePrimarySelection = (result: any) => {
    setValue(primaryFieldName, result.displayName);
    clearErrors(primaryFieldName);
    setSelectedParentId(result.id);
    
    // Clear secondary field when primary changes to ensure proper filtering
    if (secondaryValue) {
      setValue(secondaryFieldName, '');
      clearErrors(secondaryFieldName);
      
      // Clear autofilled fields when primary changes
      if (mode === 'set-card') {
        setValue('cardNumber', '');
        setValue('variety', '');
        clearErrors('cardNumber');
        clearErrors('variety');
      }
    }
    
    if (onSelectionChange) {
      onSelectionChange({ primary: result.data });
    }
  };

  const handleSecondarySelection = (result: any) => {
    setValue(secondaryFieldName, result.displayName);
    clearErrors(secondaryFieldName);
    
    // BIDIRECTIONAL: Auto-fill additional fields for card selection
    if (mode === 'set-card' && result.data) {
      // Auto-fill Card ID (required by backend)
      if (result.data._id || result.data.id) {
        setValue('cardId', result.data._id || result.data.id);
        clearErrors('cardId');
      }
      
      // Auto-fill Card Number - try different field names
      const cardNumber = result.data.cardNumber || result.data.pokemonNumber || result.data.cardNumb;
      if (cardNumber) {
        setValue('cardNumber', cardNumber);
        clearErrors('cardNumber');
      }
      
      // Auto-fill Variety 
      if (result.data.variety) {
        setValue('variety', result.data.variety);
        clearErrors('variety');
      }

      // BIDIRECTIONAL: Auto-fill Set Name when card is selected
      const setData = result.data.setName || result.data.set || result.data.setId || result.data.pokemon_set;
      const setName = typeof setData === 'object' && setData?.setName ? setData.setName : setData;
      
      if (setName && !primaryValue) {
        setValue(primaryFieldName, setName);
        clearErrors(primaryFieldName);
      }
    }

    // BIDIRECTIONAL: Auto-fill SetProduct when product is selected
    if (mode === 'setproduct-product' && result.data) {
      if (result.data.setProductName && !primaryValue) {
        setValue(primaryFieldName, result.data.setProductName);
        clearErrors(primaryFieldName);
      }
    }
    
    if (onSelectionChange) {
      onSelectionChange({ secondary: result.data });
    }
  };

  const primarySearchType = mode === 'set-card' ? 'sets' : 'setproducts';
  const secondarySearchType = mode === 'set-card' ? 'cards' : 'products';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Primary Field */}
      <div className="relative">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {primaryLabel} <span className="text-red-400">*</span>
        </label>
        <SearchInput
          searchType={primarySearchType}
          placeholder={primaryPlaceholder}
          value={primaryValue}
          onSelect={handlePrimarySelection}
          onInputChange={(value) => setValue(primaryFieldName, value)}
          disabled={isSubmitting}
        />
        {errors[primaryFieldName] && (
          <p className="mt-1 text-sm text-red-400">
            {errors[primaryFieldName].message}
          </p>
        )}
        
        <input
          type="hidden"
          {...register(primaryFieldName, {
            required: `${primaryLabel} is required`,
          })}
        />
      </div>

      {/* Secondary Field */}
      <div className="relative">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {secondaryLabel} <span className="text-red-400">*</span>
        </label>
        <SearchInput
          searchType={secondarySearchType}
          placeholder={secondaryPlaceholder}
          value={secondaryValue}
          onSelect={handleSecondarySelection}
          onInputChange={(value) => setValue(secondaryFieldName, value)}
          disabled={isSubmitting}
          parentId={selectedParentId}
        />
        {errors[secondaryFieldName] && (
          <p className="mt-1 text-sm text-red-400">
            {errors[secondaryFieldName].message}
          </p>
        )}
        
        <input
          type="hidden"
          {...register(secondaryFieldName, {
            required: `${secondaryLabel} is required`,
          })}
        />
      </div>
    </div>
  );
};

export default HierarchicalSearch;