/**
 * Form State Management Hook
 * Following CLAUDE.md SRP principle - handles ONLY form state operations
 * 
 * Extracted from useBaseForm to separate form state concerns
 */

import { useCallback, useState } from 'react';
import {
  DefaultValues,
  FieldValues,
  useForm,
  UseFormReturn,
} from 'react-hook-form';

export interface FormStateConfig<T extends FieldValues> {
  defaultValues?: DefaultValues<T>;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
}

export interface UseFormStateReturn<T extends FieldValues> {
  // Core form state
  form: UseFormReturn<T>;
  values: T;
  isSubmitting: boolean;
  formError?: Error;
  
  // State management operations
  setValue: (name: keyof T, value: any) => void;
  setSubmitting: (submitting: boolean) => void;
  resetForm: () => void;
  setFormData: (data: Partial<T>) => void;
  setError: (name: string, error: Error) => void;
  clearError: () => void;
}

/**
 * Focused hook for form state management only
 * Single Responsibility: Manage form state and basic operations
 */
export const useFormState = <T extends FieldValues>(
  config: FormStateConfig<T>
): UseFormStateReturn<T> => {
  const { defaultValues, mode = 'onChange' } = config;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<Error | undefined>(undefined);

  // Initialize form with react-hook-form
  const form = useForm<T>({
    defaultValues,
    mode,
  });

  // Watch all form values for convenience accessor
  const values = form.watch();

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const resetForm = useCallback(() => {
    form.reset();
    setIsSubmitting(false);
    setFormError(undefined);
  }, [form]);

  const setFormData = useCallback(
    (data: Partial<T>) => {
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined) {
          form.setValue(key as any, data[key]);
        }
      });
    },
    [form]
  );

  const setValue = useCallback(
    (name: keyof T, value: any) => {
      form.setValue(name as any, value);
    },
    [form]
  );

  const setError = useCallback(
    (name: string, error: Error) => {
      if (name === 'submit') {
        setFormError(error);
      } else {
        form.setError(name as any, { message: error.message });
      }
    },
    [form]
  );

  const clearError = useCallback(() => {
    setFormError(undefined);
    form.clearErrors();
  }, [form]);

  return {
    form,
    values: values as T,
    isSubmitting,
    formError,
    setValue,
    setSubmitting,
    resetForm,
    setFormData,
    setError,
    clearError,
  };
};