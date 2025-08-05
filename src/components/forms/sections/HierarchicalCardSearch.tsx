/**
 * Hierarchical Card Search Component
 * Following CLAUDE.md principles with live autocomplete search
 *
 * Features:
 * - Set Name autocomplete (searches sets with live suggestions)
 * - Card Name autocomplete (searches cards with live suggestions) 
 * - Hierarchical filtering: Set selection filters Card results
 * - Autofill: Card selection autofills Set information
 * - Single field focus: Only one field shows suggestions at a time
 */

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch, UseFormClearErrors } from 'react-hook-form';
import { useHierarchicalSearch } from '../../../hooks/useHierarchicalSearch';
import { PokemonSearch } from '../../design-system/PokemonSearch';

interface HierarchicalCardSearchProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  clearErrors: UseFormClearErrors<any>;
  onSelectionChange?: (selectedData: any) => void;
  isSubmitting: boolean;
  isEditing?: boolean; // CRITICAL: Only show hierarchical search on ADD pages, not EDIT
}

const HierarchicalCardSearch: React.FC<HierarchicalCardSearchProps> = ({
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
          Card information cannot be changed when editing. The card details are locked after adding to preserve data integrity.
        </p>
      </div>
    );
  }

  // Use the existing hierarchical search hook with proper configuration
  const hierarchicalSearch = useHierarchicalSearch({
    config: {
      mode: 'card',
      primaryField: 'setName',
      secondaryField: 'cardName',
      debounceDelay: 300,
    },
    primaryValue: watch('setName') || '',
    secondaryValue: watch('cardName') || '',
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
          placeholder="Search for a Pokemon set (min 2 characters)..."
          value={watch('setName') || ''}
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
      
      {/* Card Name Search - Secondary Field */}
      <div className="relative">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Card Name <span className="text-red-400">*</span>
        </label>
        <PokemonSearch
          searchType="cards"
          placeholder="Search for a Pokemon card (min 2 characters)..."
          value={watch('cardName') || ''}
          onSelect={(result) => {
            handleSecondarySelection(result, setValue, clearErrors, onSelectionChange);
            setActiveField(null);
          }}
          onInputChange={(value) => {
            if (activeField !== 'cardName') {
              setActiveField('cardName');
            }
            setValue('cardName', value);
          }}
          disabled={isSubmitting}
          // Hierarchical filtering: if set is selected, filter cards by that set
          setFilter={watch('setName')}
          minLength={2}
        />
        {errors.cardName && (
          <p className="mt-1 text-sm text-red-400">{errors.cardName.message}</p>
        )}
        
        {/* Hidden input for form validation */}
        <input
          type="hidden"
          {...register('cardName', { required: 'Card name is required' })}
        />
      </div>
    </div>
  );
};

export default HierarchicalCardSearch;