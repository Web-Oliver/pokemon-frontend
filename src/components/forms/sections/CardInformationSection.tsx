/**
 * Card Information Section Component
 * Handles card details like set name, card name, Pokemon number, etc.
 * Following CLAUDE.md principles for component separation
 */

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormClearErrors } from 'react-hook-form';
import { Calendar, Search } from 'lucide-react';
import Input from '../../common/Input';
import SearchDropdown from '../../search/SearchDropdown';

interface CardInformationSectionProps {
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
  clearErrors: UseFormClearErrors<Record<string, unknown>>;
  // Search-related props
  setName: string;
  suggestions: Record<string, unknown>[];
  showSuggestions: boolean;
  activeField: string | null;
  onSetNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCardNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputFocus: (fieldType: 'set' | 'cardProduct') => void;
  onInputBlur: () => void;
  onSuggestionClick: (
    suggestion: Record<string, unknown>,
    fieldType: 'set' | 'cardProduct'
  ) => void;
  // Visibility control
  isVisible?: boolean;
  // Disable fields when editing
  disabled?: boolean;
}

const CardInformationSection: React.FC<CardInformationSectionProps> = ({
  register,
  errors,
  setValue: _setValue,
  clearErrors: _clearErrors,
  setName,
  suggestions,
  showSuggestions,
  activeField,
  onSetNameChange,
  onCardNameChange,
  onInputFocus,
  onInputBlur,
  onSuggestionClick,
  isVisible = true,
  disabled = false,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-6'>
      <h4 className='text-lg font-medium text-gray-900 mb-4 flex items-center justify-between'>
        <div className='flex items-center'>
          <Calendar className='w-5 h-5 mr-2 text-gray-600' />
          Card Information
        </div>
        {setName && (
          <div className='flex items-center text-sm text-blue-600'>
            <Search className='w-4 h-4 mr-1' />
            Filtering by: {setName}
          </div>
        )}
      </h4>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Set Name with Smart Search */}
        <div className='relative'>
          <label htmlFor='setName' className='block text-sm font-medium text-gray-700 mb-1'>
            Set Name
            <span className='text-red-500 ml-1'>*</span>
          </label>
          <div className='relative'>
            <input
              id='setName'
              type='text'
              {...register('setName', {
                required: 'Set name is required',
                minLength: { value: 2, message: 'Set name must be at least 2 characters' },
              })}
              onChange={onSetNameChange}
              onFocus={() => onInputFocus('set')}
              onBlur={onInputBlur}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              placeholder='e.g., Base Set, Jungle, Fossil'
            />
            <Search className='absolute right-3 top-2.5 w-4 h-4 text-gray-400' />
          </div>
          {errors.setName && <p className='mt-1 text-sm text-red-600'>{errors.setName.message}</p>}

          {/* Context7 Award-Winning Set Suggestions Dropdown */}
          <SearchDropdown
            suggestions={suggestions}
            isVisible={showSuggestions && activeField === 'set'}
            activeField={activeField}
            onSuggestionSelect={(suggestion, fieldType) => onSuggestionClick(suggestion, fieldType)}
            searchTerm={setName}
          />
        </div>

        {/* Card Name with Smart Search */}
        <div className='relative'>
          <label htmlFor='cardName' className='block text-sm font-medium text-gray-700 mb-1'>
            Card Name
            <span className='text-red-500 ml-1'>*</span>
          </label>
          <div className='relative'>
            <input
              id='cardName'
              type='text'
              {...register('cardName', {
                required: 'Card name is required',
                minLength: { value: 2, message: 'Card name must be at least 2 characters' },
              })}
              onChange={onCardNameChange}
              onFocus={() => onInputFocus('cardProduct')}
              onBlur={onInputBlur}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
              placeholder='e.g., Charizard, Pikachu, Blastoise'
            />
            <Search className='absolute right-3 top-2.5 w-4 h-4 text-gray-400' />
          </div>
          {errors.cardName && (
            <p className='mt-1 text-sm text-red-600'>{errors.cardName.message}</p>
          )}

          {/* Context7 Award-Winning Card Suggestions Dropdown */}
          <SearchDropdown
            suggestions={suggestions}
            isVisible={showSuggestions && activeField === 'cardProduct'}
            activeField={activeField}
            onSuggestionSelect={(suggestion, fieldType) => onSuggestionClick(suggestion, fieldType)}
            searchTerm={setName}
          />
        </div>

        {/* Pokemon Number */}
        <div>
          <Input
            label='Pokémon Number'
            {...register('pokemonNumber')}
            error={errors.pokemonNumber?.message}
            placeholder='e.g., 006, 025, 150'
            disabled={disabled}
            className={`text-center ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Base Name */}
        <div>
          <Input
            label='Base Name'
            {...register('baseName', {
              required: 'Base name is required',
              minLength: { value: 2, message: 'Base name must be at least 2 characters' },
            })}
            error={errors.baseName?.message}
            placeholder='e.g., Charizard, Pikachu, Mew'
            disabled={disabled}
            className={`text-center ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
          />
        </div>

        {/* Variety */}
        <div className='md:col-span-2'>
          <Input
            label='Variety'
            {...register('variety')}
            error={errors.variety?.message}
            placeholder='e.g., Holo, Shadowless, 1st Edition'
            disabled={disabled}
            className={`text-center ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export default CardInformationSection;
