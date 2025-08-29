/**
 * Form Data Transformation Hook
 * Following CLAUDE.md SRP principle - handles ONLY data transformation
 * 
 * Extracted from useBaseForm to separate transformation concerns
 */

import { useCallback } from 'react';
import { FieldValues } from 'react-hook-form';
// DELETED: useFormSubmission - implement transformation directly if needed

export interface FormTransformationConfig<T extends FieldValues> {
  /** Enable automatic data transformation (trim, convert types, etc.) */
  enableDataTransformation?: boolean;
  /** Form submission pattern (create, edit, delete, bulk) */
  submissionPattern?: 'create' | 'edit' | 'delete' | 'bulk';
  /** Custom data transformation function */
  customTransform?: (data: T) => Partial<T>;
  /** Whether form is in editing mode */
  isEditing?: boolean;
}

export interface UseFormTransformationReturn<T extends FieldValues> {
  /** Transform form data using configured patterns */
  transformData: (data: T) => T;
}

/**
 * Focused hook for form data transformation only
 * Single Responsibility: Transform and sanitize form data
 */
export const useFormTransformation = <T extends FieldValues>(
  config: FormTransformationConfig<T>
): UseFormTransformationReturn<T> => {
  const {
    enableDataTransformation = true,
    submissionPattern,
    customTransform,
    isEditing = false,
  } = config;

  // Get submission pattern configuration
  const submissionPatternConfig = enableDataTransformation && submissionPattern
    ? createFormSubmissionPattern<T>(submissionPattern)
    : { sanitizeData: false, validateOnSubmit: false };

  // Enhanced data transformation
  const transformData = useCallback(
    (data: T): T => {
      if (!enableDataTransformation) {
        return data;
      }

      // Apply pattern-based transformation
      if (submissionPatternConfig.transformData) {
        const transformed = submissionPatternConfig.transformData(data);
        return { ...data, ...transformed };
      }

      // Apply custom transformation
      if (customTransform) {
        const transformed = customTransform(data);
        return { ...data, ...transformed };
      }

      // Default transformation
      return transformFormData(data, {
        trimStrings: true,
        convertNumbers: false, // Keep as strings for form handling
        convertDates: false, // Keep as strings for form handling
        removeEmpty: false,
      });
    },
    [enableDataTransformation, submissionPatternConfig, customTransform]
  );

  return {
    transformData,
  };
};