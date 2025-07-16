/**
 * Grading/Pricing Section Component
 * Shared component for PSA grades and Raw card conditions with pricing
 * Following CLAUDE.md principles for component separation and reusability
 */

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { DollarSign, Star, Award } from 'lucide-react';
import Input from '../../common/Input';
import Select from '../../common/Select';
import { PriceHistoryDisplay } from '../../PriceHistoryDisplay';

interface GradingPricingSectionProps {
  register: UseFormRegister<Record<string, unknown>>;
  errors: FieldErrors<Record<string, unknown>>;
  // Card type - determines if we show PSA grades or conditions
  cardType: 'psa' | 'raw';
  // Current form values for display
  currentGradeOrCondition?: string;
  currentPrice?: string;
  // Price history for editing
  isEditing?: boolean;
  priceHistory?: Array<{ price: number; dateUpdated: string }>;
  currentPriceNumber?: number;
  onPriceUpdate?: (newPrice: number, date: string) => void;
  // Disable grade/condition editing when editing existing items
  disableGradeConditionEdit?: boolean;
  // Visibility control
  isVisible?: boolean;
}

const PSA_GRADES = [
  { value: '1', label: 'PSA 1 - Poor' },
  { value: '2', label: 'PSA 2 - Good' },
  { value: '3', label: 'PSA 3 - Very Good' },
  { value: '4', label: 'PSA 4 - Very Good-Excellent' },
  { value: '5', label: 'PSA 5 - Excellent' },
  { value: '6', label: 'PSA 6 - Excellent-Mint' },
  { value: '7', label: 'PSA 7 - Near Mint' },
  { value: '8', label: 'PSA 8 - Near Mint-Mint' },
  { value: '9', label: 'PSA 9 - Mint' },
  { value: '10', label: 'PSA 10 - Gem Mint' },
];

const CARD_CONDITIONS = [
  { value: 'Near Mint', label: 'Near Mint (NM)' },
  { value: 'Lightly Played', label: 'Lightly Played (LP)' },
  { value: 'Moderately Played', label: 'Moderately Played (MP)' },
  { value: 'Heavily Played', label: 'Heavily Played (HP)' },
  { value: 'Damaged', label: 'Damaged (DMG)' },
];

const GradingPricingSection: React.FC<GradingPricingSectionProps> = ({
  register,
  errors,
  cardType,
  currentGradeOrCondition,
  currentPrice,
  isEditing = false,
  priceHistory = [],
  currentPriceNumber = 0,
  onPriceUpdate,
  disableGradeConditionEdit = false,
  isVisible = true,
}) => {
  if (!isVisible) {
    return null;
  }
  const isPsaCard = cardType === 'psa';
  const fieldName = isPsaCard ? 'grade' : 'condition';
  const options = isPsaCard ? PSA_GRADES : CARD_CONDITIONS;
  const fieldLabel = isPsaCard ? 'PSA Grade' : 'Card Condition';
  const icon = isPsaCard ? Award : Star;
  const IconComponent = icon;

  // Color schemes for different card types
  const colorScheme = isPsaCard
    ? {
        bg: 'from-blue-50/80 to-indigo-50/80',
        border: 'border-blue-200/50',
        text: 'text-blue-800',
        accent: 'text-blue-600',
      }
    : {
        bg: 'from-emerald-50/80 to-teal-50/80',
        border: 'border-emerald-200/50',
        text: 'text-emerald-800',
        accent: 'text-emerald-600',
      };

  return (
    <div className='bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden'>
      <div
        className={`absolute inset-0 bg-gradient-to-br from-white/50 ${isPsaCard ? 'to-blue-50/50' : 'to-emerald-50/50'}`}
      ></div>

      <h4 className='text-xl font-bold text-slate-900 mb-6 flex items-center relative z-10'>
        <DollarSign className='w-6 h-6 mr-3 text-slate-600' />
        {isEditing ? 'Update Price' : isPsaCard ? 'Grading & Pricing' : 'Condition & Pricing'}
      </h4>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10'>
        {/* Grade/Condition Selection */}
        <div>
          <Select
            label={fieldLabel}
            {...register(fieldName, {
              required: `${fieldLabel} is required`,
            })}
            error={errors[fieldName]?.message}
            options={options}
            disabled={disableGradeConditionEdit}
          />
          {currentGradeOrCondition && (
            <div
              className={`mt-3 p-3 bg-gradient-to-r ${colorScheme.bg} ${colorScheme.border} border rounded-xl backdrop-blur-sm`}
            >
              <div className='flex items-center'>
                <IconComponent className={`w-4 h-4 ${colorScheme.accent} mr-2`} />
                <span className={`text-sm ${colorScheme.text} font-bold`}>
                  Selected:{' '}
                  {options.find(option => option.value === currentGradeOrCondition)?.label}
                </span>
              </div>
            </div>
          )}
          {disableGradeConditionEdit && (
            <p className='mt-1 text-xs text-gray-500'>
              {isPsaCard ? 'Grade' : 'Condition'} cannot be changed after adding
            </p>
          )}
        </div>

        {/* Price Input */}
        <div>
          <Input
            label='My Price (kr.)'
            type='number'
            step='0.01'
            min='0'
            {...register('myPrice', {
              required: 'Price is required',
              min: { value: 0, message: 'Price must be non-negative' },
              pattern: {
                value: /^\d+(\.\d{1,2})?$/,
                message: 'Invalid price format',
              },
            })}
            error={errors.myPrice?.message}
            placeholder='0.00'
            className={`text-center ${isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
            disabled={isEditing}
          />
          {currentPrice && (
            <div className={`mt-2 text-sm ${colorScheme.accent} font-semibold text-center`}>
              Current: {parseFloat(currentPrice || '0')} kr.
            </div>
          )}
          {isEditing && (
            <p className='mt-1 text-xs text-gray-500 text-center'>
              Use price history below to update price
            </p>
          )}
        </div>

        {/* Date Added */}
        <div>
          <Input
            label='Date Added'
            type='date'
            {...register('dateAdded', {
              required: isEditing ? false : 'Date added is required',
            })}
            error={errors.dateAdded?.message}
            disabled={isEditing}
            className={`text-center ${isEditing ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
          />
          {isEditing && (
            <p className='mt-1 text-xs text-gray-500 text-center'>
              Date cannot be changed after adding
            </p>
          )}
        </div>
      </div>

      {/* Price History Section (for editing existing cards) */}
      {isEditing && priceHistory.length > 0 && onPriceUpdate && (
        <div className='mt-8 pt-8 border-t border-slate-200/50'>
          <PriceHistoryDisplay
            priceHistory={priceHistory}
            currentPrice={currentPriceNumber}
            onPriceUpdate={onPriceUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default GradingPricingSection;
