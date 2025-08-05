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
import Input from '../../common/Input';
import { IGrades } from '../../../domain/models/card';

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
          <Input
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
          <Input
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
          <Input
            label="Total PSA Graded"
            value={grades.grade_total?.toLocaleString() || '0'}
            disabled={true}
            className="text-center bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 cursor-not-allowed font-semibold"
          />
        </div>
      )}

      {/* Complete Grades Breakdown - Premium display for detailed grades */}
      {readOnlyFields.grades && grades && (
        <div className="md:col-span-2">
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-zinc-800/50 dark:to-zinc-900/50 rounded-xl p-4 border border-blue-200/50 dark:border-zinc-700/50">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              PSA Population Breakdown
            </h4>

            <div className="grid grid-cols-5 gap-2 text-xs">
              {/* PSA 1-5 */}
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA 1
                </div>
                <div className="font-semibold text-red-600 dark:text-red-400">
                  {grades.grade_1?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA 2
                </div>
                <div className="font-semibold text-red-500 dark:text-red-400">
                  {grades.grade_2?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA 3
                </div>
                <div className="font-semibold text-orange-600 dark:text-orange-400">
                  {grades.grade_3?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA 4
                </div>
                <div className="font-semibold text-orange-500 dark:text-orange-400">
                  {grades.grade_4?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA 5
                </div>
                <div className="font-semibold text-yellow-600 dark:text-yellow-400">
                  {grades.grade_5?.toLocaleString() || '0'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 text-xs mt-2">
              {/* PSA 6-10 */}
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA 6
                </div>
                <div className="font-semibold text-yellow-500 dark:text-yellow-400">
                  {grades.grade_6?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA 7
                </div>
                <div className="font-semibold text-lime-600 dark:text-lime-400">
                  {grades.grade_7?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA 8
                </div>
                <div className="font-semibold text-green-600 dark:text-green-400">
                  {grades.grade_8?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA 9
                </div>
                <div className="font-semibold text-blue-600 dark:text-blue-400">
                  {grades.grade_9?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium">
                  PSA 10
                </div>
                <div className="font-semibold text-purple-600 dark:text-purple-400">
                  {grades.grade_10?.toLocaleString() || '0'}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-zinc-700/50">
              <div className="text-center">
                <div className="text-gray-600 dark:text-zinc-400 font-medium text-sm">
                  Total Graded
                </div>
                <div className="font-bold text-lg text-blue-800 dark:text-blue-300">
                  {grades.grade_total?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Grade Fields (for specific form needs) */}
      {Object.entries(readOnlyFields).map(([key, enabled]) => {
        if (enabled && key.startsWith('grade_') && key !== 'grade_total') {
          const gradeNumber = key.replace('grade_', '');
          return (
            <div key={key}>
              <Input
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
