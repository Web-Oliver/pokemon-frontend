/**
 * Base Form Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows DRY principle - provides common form functionality across all form types
 */

import { useCallback, useEffect, useState } from 'react';
import {
  DefaultValues,
  FieldValues,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
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
  /** Initial data to populate form fields (for editing) */
  initialData?: Partial<T>;
  /** Whether form is in editing mode */
  isEditing?: boolean;
  /** Custom field mapping for initialData */
  fieldMapping?: Record<string, string | ((value: any) => any)>;
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
  /** Update form with initial data (centralized initialData handling) */
  updateWithInitialData: (data: Partial<T>) => void;
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
    initialData,
    isEditing = false,
    fieldMapping = {},
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

  // Centralized initialData handling following CLAUDE.md SRP principle
  const updateWithInitialData = useCallback(
    (data: Partial<T>) => {
      if (!data) {
        return;
      }

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Check if there's a custom field mapping
          const mapping = fieldMapping[key];

          let processedValue = value;

          if (typeof mapping === 'function') {
            // Custom transformation function
            processedValue = mapping(value);
          } else if (typeof mapping === 'string') {
            // Field name mapping
            form.setValue(mapping as any, value);
            return;
          }

          // Handle common field transformations
          if ((key.includes('Date') || key.includes('date')) && typeof value === 'string') {
            // Date field transformation - convert ISO timestamps to YYYY-MM-DD
            if (value.includes('T')) {
              processedValue = value.split('T')[0];
            } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // Already in correct format
              processedValue = value;
            } else {
              // Try to parse and format the date
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                processedValue = date.toISOString().split('T')[0];
              }
            }
          } else if (key.includes('Price') && typeof value === 'number') {
            // Price field transformation to string
            processedValue = value.toString();
          }

          form.setValue(key as any, processedValue, { shouldValidate: false });
        }
      });
    },
    [fieldMapping]
  );

  // Handle initialData on mount and when it changes (for async loading)
  useEffect(() => {
    if (isEditing && initialData) {
      updateWithInitialData(initialData);

      // Update images if provided
      if (initialData.images && Array.isArray(initialData.images)) {
        imageUpload.setRemainingExistingImages(initialData.images as string[]);
      }

      // Update price history if provided
      if (initialData.priceHistory && Array.isArray(initialData.priceHistory)) {
        // This would need to be implemented in usePriceHistory if needed
      }
    }
  }, [isEditing, initialData]);

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
    updateWithInitialData,
  };
};
