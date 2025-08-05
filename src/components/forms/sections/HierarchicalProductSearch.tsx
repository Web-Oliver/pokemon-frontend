/**
 * Hierarchical Product Search Component
 * Following CLAUDE.md principles with live autocomplete search for products
 *
 * Features:
 * - Set Name autocomplete (searches sets with live suggestions)
 * - Product Name autocomplete (searches products with live suggestions) 
 * - Hierarchical filtering: Set selection filters Product results
 * - Autofill: Product selection autofills Set information
 * - Single field focus: Only one field shows suggestions at a time
 * - ONLY for ADD pages, not EDIT pages
 */

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch, UseFormClearErrors } from 'react-hook-form';
import { useHierarchicalSearch } from '../../../hooks/useHierarchicalSearch';
import { PokemonSearch } from '../../design-system/PokemonSearch';

interface HierarchicalProductSearchProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  clearErrors: UseFormClearErrors<any>;
  onSelectionChange?: (selectedData: any) => void;
  isSubmitting: boolean;
  isEditing?: boolean; // CRITICAL: Only show hierarchical search on ADD pages, not EDIT
}

const HierarchicalProductSearch: React.FC<HierarchicalProductSearchProps> = ({
  register,
  errors,
  setValue,
  watch,
  clearErrors,
  onSelectionChange,
  isSubmitting,
  isEditing = false,
}) => {
  // CRITICAL: Only show hierarchical search on ADD pages, not EDIT pages
  if (isEditing) {
    return (
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <p className="text-sm text-amber-400">
          Product information cannot be changed when editing. The product details are locked after adding to preserve data integrity.
        </p>
      </div>
    );
  }

  // Use the existing hierarchical search hook with proper configuration for products
  const hierarchicalSearch = useHierarchicalSearch({
    config: {
      mode: 'product',
      primaryField: 'setName',
      secondaryField: 'productName',
      debounceDelay: 300,
    },
    primaryValue: watch('setName') || '',
    secondaryValue: watch('productName') || '',
  });

  const {
    activeField,
    suggestions,
    isLoading,
    setActiveField,
    handlePrimarySelection,
    handleSecondarySelection,
    clearSuggestions,
  } = hierarchicalSearch;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Set Name Search - Primary Field */}
      <div className="relative">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Set Name <span className="text-red-400">*</span>
        </label>
        <PokemonSearch
          searchType="sets"
          placeholder="Search for a Pokemon set..."
          onSelect={(result) => {
            handlePrimarySelection(result, setValue, clearErrors, onSelectionChange);
            setActiveField(null);
          }}
          onInputChange={(value) => {
            if (activeField !== 'setName') {
              setActiveField('setName');
            }
            setValue('setName', value);
          }}
          disabled={isSubmitting}
          minLength={2}
        />
        {errors.setName && (
          <p className="mt-1 text-sm text-red-400">{errors.setName.message}</p>
        )}
        
        {/* Hidden input for form validation */}
        <input
          type="hidden"
          {...register('setName', { required: 'Set name is required' })}
        />
      </div>
      
      {/* Product Name Search - Secondary Field */}
      <div className="relative">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Product Name <span className="text-red-400">*</span>
        </label>
        <PokemonSearch
          searchType="products"
          placeholder="Search for a Pokemon product..."
          onSelect={(result) => {
            handleSecondarySelection(result, setValue, clearErrors, onSelectionChange);
            setActiveField(null);
          }}
          onInputChange={(value) => {
            if (activeField !== 'productName') {
              setActiveField('productName');
            }
            setValue('productName', value);
          }}
          disabled={isSubmitting}
          // Hierarchical filtering: if set is selected, filter products by that set
          setFilter={watch('setName')}
          minLength={2}
        />
        {errors.productName && (
          <p className="mt-1 text-sm text-red-400">{errors.productName.message}</p>
        )}
        
        {/* Hidden input for form validation */}
        <input
          type="hidden"
          {...register('productName', { required: 'Product name is required' })}
        />
      </div>
    </div>
  );
};

export default HierarchicalProductSearch;