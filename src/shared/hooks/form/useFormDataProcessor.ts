/**
 * Form Data Processing Hook
 * Following CLAUDE.md SRP principle - handles ONLY data processing and validation
 * 
 * Extracted from useBaseForm to separate data processing concerns
 */

import { useCallback } from 'react';
import { FieldValues } from 'react-hook-form';
import { ValidationRules } from './useFormValidation';

export interface FormDataProcessorConfig<T extends FieldValues> {
  validationRules?: ValidationRules;
  validateField: (fieldName: string, value: any) => string | undefined;
  transformData: (data: T) => T;
}

export interface UseFormDataProcessorReturn<T extends FieldValues> {
  /** Process form data with validation and transformation */
  processFormData: (data: T) => {
    data: T;
    isValid: boolean;
    errors: Record<string, string>;
  };
}

/**
 * Focused hook for form data processing only
 * Single Responsibility: Process, validate and sanitize form data
 */
export const useFormDataProcessor = <T extends FieldValues>(
  config: FormDataProcessorConfig<T>
): UseFormDataProcessorReturn<T> => {
  const { validationRules, validateField, transformData } = config;

  // Process form data with validation
  const processFormData = useCallback(
    (data: T) => {
      const transformedData = transformData(data);

      if (!validationRules || Object.keys(validationRules).length === 0) {
        return { data: transformedData, isValid: true, errors: {} };
      }

      const errors: Record<string, string> = {};
      let isValid = true;

      // Validate each field
      Object.entries(validationRules).forEach(([fieldName, rule]) => {
        const fieldValue = transformedData[fieldName as keyof T];
        const error = validateField(fieldName, fieldValue);

        if (error) {
          errors[fieldName] = error;
          isValid = false;
        }
      });

      return { data: transformedData, isValid, errors };
    },
    [transformData, validationRules, validateField]
  );

  return {
    processFormData,
  };
};