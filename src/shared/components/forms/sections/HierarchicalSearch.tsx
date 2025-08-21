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

  // Handle primary field input changes - reset parent selection when user types
  const handlePrimaryInputChange = (value: string) => {
    setValue(primaryFieldName, value);
    
    // If user is typing something different from selected item, clear parent selection
    // This allows reselection after bidirectional auto-fill
    if (selectedParentId && value.trim() !== primaryValue.trim()) {
      console.log('[HIERARCHICAL] Clearing parent selection due to input change:', { 
        newValue: value.trim(), 
        currentValue: primaryValue.trim(),
        selectedParentId 
      });
      setSelectedParentId(undefined);
      
      // Also clear secondary field since parent context changed
      if (secondaryValue) {
        setValue(secondaryFieldName, '');
        clearErrors(secondaryFieldName);
        
        // Clear autofilled fields when context changes
        if (mode === 'set-card') {
          setValue('cardId', '');
          setValue('cardNumber', '');
          setValue('variety', '');
          clearErrors('cardId');
          clearErrors('cardNumber');
          clearErrors('variety');
        }
      }
    }
  };

  // Handle secondary field input changes  
  const handleSecondaryInputChange = (value: string) => {
    setValue(secondaryFieldName, value);
  };

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
    // Use MongoDB ObjectId from result data
    const parentId = result.data._id || result.data.id || result.id;
    console.log('[HIERARCHICAL] Setting parent ID:', parentId, 'for mode:', mode);
    setSelectedParentId(parentId);
    
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
      const cardNumber = result.data.cardNumber || result.data.cardNumb;
      if (cardNumber) {
        setValue('cardNumber', cardNumber);
        clearErrors('cardNumber');
      }
      
      // Auto-fill Variety 
      if (result.data.variety) {
        setValue('variety', result.data.variety);
        clearErrors('variety');
      }

      // BIDIRECTIONAL: Auto-fill Set Name when card is selected - Safe circular reference handling
      let setName = '';
      try {
        // Check for set name in all possible backend response formats
        if (result.data.setDisplayName && typeof result.data.setDisplayName === 'string') {
          setName = result.data.setDisplayName;
        } else if (result.data.setId && typeof result.data.setId === 'object' && result.data.setId.setName) {
          setName = String(result.data.setId.setName);
        } else if (result.data.setName && typeof result.data.setName === 'string') {
          setName = result.data.setName;
        } else if (result.data.set && typeof result.data.set === 'string') {
          setName = result.data.set;
        } else if (result.data.pokemon_set && typeof result.data.pokemon_set === 'string') {
          setName = result.data.pokemon_set;
        }
      } catch (error) {
        console.warn('[HIERARCHICAL] Error accessing set name for auto-fill:', error);
        setName = '';
      }
      
      if (setName) {
        console.log('[HIERARCHICAL] Auto-filling set name from card selection:', setName);
        setValue(primaryFieldName, setName);
        clearErrors(primaryFieldName);
        
        // CRITICAL FIX: Update selectedParentId to match the auto-filled set
        if (result.data.setId && typeof result.data.setId === 'object' && result.data.setId._id) {
          console.log('[HIERARCHICAL] Auto-updating parent ID from card selection:', result.data.setId._id);
          setSelectedParentId(result.data.setId._id);
        } else if (result.data.setId && typeof result.data.setId === 'string') {
          console.log('[HIERARCHICAL] Auto-updating parent ID from card selection:', result.data.setId);
          setSelectedParentId(result.data.setId);
        }
      }
    }

    // BIDIRECTIONAL: Auto-fill SetProduct when product is selected - Safe circular reference handling
    if (mode === 'setproduct-product' && result.data) {
      let setProductName = '';
      try {
        if (result.data.setProductName && typeof result.data.setProductName === 'string') {
          setProductName = result.data.setProductName;
        } else if (result.data.setProductId && typeof result.data.setProductId === 'object' && result.data.setProductId.setProductName) {
          setProductName = String(result.data.setProductId.setProductName);
        }
      } catch (error) {
        console.warn('[HIERARCHICAL] Error accessing set product name for auto-fill:', error);
        setProductName = '';
      }
      
      if (setProductName) {
        console.log('[HIERARCHICAL] Auto-filling set product name from product selection:', setProductName);
        setValue(primaryFieldName, setProductName);
        clearErrors(primaryFieldName);
        
        // CRITICAL FIX: Update selectedParentId to match the auto-filled setProduct
        if (result.data.setProductId && typeof result.data.setProductId === 'object' && result.data.setProductId._id) {
          console.log('[HIERARCHICAL] Auto-updating parent ID from product selection:', result.data.setProductId._id);
          setSelectedParentId(result.data.setProductId._id);
        } else if (result.data.setProductId && typeof result.data.setProductId === 'string') {
          console.log('[HIERARCHICAL] Auto-updating parent ID from product selection:', result.data.setProductId);
          setSelectedParentId(result.data.setProductId);
        }
      }
    }
    
    if (onSelectionChange) {
      onSelectionChange({ secondary: result.data });
    }
  };

  const primarySearchType = mode === 'set-card' ? 'sets' : 'setproducts';
  const secondarySearchType = mode === 'set-card' ? 'cards' : 'products';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6 w-full">
      {/* Primary Field */}
      <div className="relative w-full">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {primaryLabel} <span className="text-red-400">*</span>
        </label>
        <SearchInput
          searchType={primarySearchType}
          placeholder={primaryPlaceholder}
          value={primaryValue}
          onSelect={handlePrimarySelection}
          onInputChange={handlePrimaryInputChange}
          disabled={isSubmitting}
          className="w-full"
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
      <div className="relative w-full">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {secondaryLabel} <span className="text-red-400">*</span>
        </label>
        <SearchInput
          searchType={secondarySearchType}
          placeholder={secondaryPlaceholder}
          value={secondaryValue}
          onSelect={handleSecondarySelection}
          onInputChange={handleSecondaryInputChange}
          disabled={isSubmitting}
          parentId={selectedParentId}
          className="w-full"
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