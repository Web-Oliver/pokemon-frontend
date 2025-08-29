/**
 * Form Submission Handler Hook
 * Following CLAUDE.md SRP principle - handles ONLY form submission logic
 * 
 * Extracted from useBaseForm to separate submission concerns
 */

import { useCallback } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

export interface FormSubmissionHandlerConfig<T extends FieldValues> {
  form: UseFormReturn<T>;
  setSubmitting: (submitting: boolean) => void;
  setError: (name: string, error: Error) => void;
  processFormData: (data: T) => {
    data: T;
    isValid: boolean;
    errors: Record<string, string>;
  };
}

export interface UseFormSubmissionHandlerReturn<T extends FieldValues> {
  /** Handle form submission with integrated patterns */
  handleUnifiedSubmit: (
    onSubmit: (data: T) => Promise<void>,
    options?: { validate?: boolean; transform?: boolean }
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}

/**
 * Focused hook for form submission handling only
 * Single Responsibility: Handle form submission flow with validation and error handling
 */
export const useFormSubmissionHandler = <T extends FieldValues>(
  config: FormSubmissionHandlerConfig<T>
): UseFormSubmissionHandlerReturn<T> => {
  const { form, setSubmitting, setError, processFormData } = config;

  // Unified form submission handler
  const handleUnifiedSubmit = useCallback(
    (
      onSubmit: (data: T) => Promise<void>,
      options: { validate?: boolean; transform?: boolean } = {}
    ) => {
      const { validate = true, transform = true } = options;

      return form.handleSubmit(async (data: T) => {
        setSubmitting(true);

        try {
          // Process data if requested
          const processedData = transform
            ? processFormData(data)
            : { data, isValid: true, errors: {} };

          // Validate if requested
          if (validate && !processedData.isValid) {
            // Set form errors
            Object.entries(processedData.errors).forEach(([field, error]) => {
              form.setError(field as any, { message: error });
            });

            throw new Error('Form validation failed');
          }

          // Execute submission
          await onSubmit(processedData.data);
        } catch (error) {
          const formError =
            error instanceof Error
              ? error
              : new Error('Form submission failed');
          setError('submit', formError);
          throw formError;
        } finally {
          setSubmitting(false);
        }
      });
    },
    [form, processFormData, setSubmitting, setError]
  );

  return {
    handleUnifiedSubmit,
  };
};