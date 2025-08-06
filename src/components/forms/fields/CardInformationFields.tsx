/**
 * CardInformationFields Component
 * Layer 3: Components (UI Building Blocks)
 *
 * UPDATED: Now supports new grades structure from Card model
 * Following CLAUDE.md composition over conditions:
 * - Single Responsibility: Handles card-specific fields including grades
 * - Open/Closed: Extensible through field configuration
 * - Interface Segregation: Focused interface for card fields only
 */

import React from 'react';
import { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { PokemonInput } from '../../design-system/PokemonInput';
import { IGrades } from '../../../domain/models/card';
import UnifiedGradeDisplay from '../../common/UnifiedGradeDisplay';

interface ReadOnlyCardFields {
  cardNumber?: boolean;
  variety?: boolean;
  // NEW: Grades structure fields
  grades?: boolean; // Show complete grades breakdown
  gradeTotal?: boolean; // Show only total graded count
  // Individual grade fields (if needed for specific forms)
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
}

interface CardInformationFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  readOnlyFields: ReadOnlyCardFields;
  isDisabled?: boolean;
}

const CardInformationFields: React.FC<CardInformationFieldsProps> = ({
  register,
  errors,
  watch,
  readOnlyFields,
  isDisabled = false,
}) => {
  if (!readOnlyFields || Object.keys(readOnlyFields).length === 0) {
    return null;
  }

  // Get grades data from form for display purposes
  const grades = watch('grades') as IGrades | undefined;

  return (
    <>
      {/* Card Number */}
      {readOnlyFields.cardNumber && (
        <div>
          <PokemonInput
            label="Card Number"
            {...register('cardNumber')}
            error={errors.cardNumber?.message}
            placeholder="e.g., 006, 025, 150"
            disabled={true}
            value={watch('cardNumber') || ''}
            className="text-center bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 cursor-not-allowed"
          />
        </div>
      )}

      {/* Variety */}
      {readOnlyFields.variety && (
        <div>
          <PokemonInput
            label="Variety"
            {...register('variety')}
            error={errors.variety?.message}
            placeholder="e.g., Holo, Shadowless, 1st Edition"
            disabled={true}
            value={watch('variety') || ''}
            className="text-center bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 cursor-not-allowed"
          />
        </div>
      )}

      {/* Grade Total - Summary display */}
      {readOnlyFields.gradeTotal && grades && (
        <div>
          <PokemonInput
            label="Total PSA Graded"
            value={grades.grade_total?.toLocaleString() || '0'}
            disabled={true}
            className="text-center bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 cursor-not-allowed font-semibold"
          />
        </div>
      )}

      {/* Complete Grades Breakdown - Now using UnifiedGradeDisplay */}
      {readOnlyFields.grades && grades && (
        <div className="md:col-span-2">
          <UnifiedGradeDisplay
            grades={grades}
            mode="full"
            theme="default"
            showLabels={true}
            showTotal={true}
            title="PSA Population Breakdown"
          />
        </div>
      )}

      {/* Individual Grade Fields (for specific form needs) */}
      {Object.entries(readOnlyFields).map(([key, enabled]) => {
        if (enabled && key.startsWith('grade_') && key !== 'grade_total') {
          const gradeNumber = key.replace('grade_', '');
          return (
            <div key={key}>
              <PokemonInput
                label={`PSA ${gradeNumber}`}
                {...register(key)}
                error={errors[key]?.message}
                type="number"
                min="0"
                disabled={isDisabled}
                value={watch(key) || ''}
                className="text-center"
              />
            </div>
          );
        }
        return null;
      })}
    </>
  );
};

export default CardInformationFields;
