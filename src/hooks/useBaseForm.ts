/**
 * Base Form Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows DRY principle - provides common form functionality across all form types
 */

import { useState, useCallback, useEffect } from 'react';
import { useForm, UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';
import { useFormValidation, ValidationRules } from './useFormValidation';
import { useImageUpload } from './useImageUpload';
import { usePriceHistory } from './usePriceHistory';

export interface BaseFormConfig<T extends FieldValues> {
  defaultValues?: DefaultValues<T>;
  validationRules?: ValidationRules;
  mode?: 'onChange' | 'onBlur' | 'onSubmit';
  initialImages?: string[];
  initialPriceHistory?: any[];
  initialPrice?: number;
}

export interface UseBaseFormReturn<T extends FieldValues> {
  // Form state
  form: UseFormReturn<T>;
  isSubmitting: boolean;
  
  // Image upload
  imageUpload: ReturnType<typeof useImageUpload>;
  
  // Price history
  priceHistory: ReturnType<typeof usePriceHistory>;
  
  // Validation
  validateField: (fieldName: string, value: any) => string | undefined;
  isFormValid: (formData: Record<string, any>) => boolean;
  
  // Form operations
  setSubmitting: (submitting: boolean) => void;
  resetForm: () => void;
  setFormData: (data: Partial<T>) => void;
}

/**
 * Base form hook that provides common functionality for all forms
 * Follows DRY principle - eliminates duplicate form logic
 */
export const useBaseForm = <T extends FieldValues>(
  config: BaseFormConfig<T>
): UseBaseFormReturn<T> => {
  const {
    defaultValues,
    validationRules = {},
    mode = 'onChange',
    initialImages = [],
    initialPriceHistory = [],
    initialPrice = 0,
  } = config;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<T>({
    defaultValues,
    mode,
  });

  // Initialize validation
  const { validateField, isFormValid } = useFormValidation(validationRules);

  // Initialize image upload
  const imageUpload = useImageUpload(initialImages);

  // Initialize price history
  const priceHistory = usePriceHistory(initialPriceHistory, initialPrice);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const resetForm = useCallback(() => {
    form.reset();
    imageUpload.clearImages();
    priceHistory.clearPriceHistory();
    setIsSubmitting(false);
  }, [form, imageUpload, priceHistory]);

  const setFormData = useCallback((data: Partial<T>) => {
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        form.setValue(key as any, data[key]);
      }
    });
  }, [form]);

  return {
    form,
    isSubmitting,
    imageUpload,
    priceHistory,
    validateField,
    isFormValid,
    setSubmitting,
    resetForm,
    setFormData,
  };
};