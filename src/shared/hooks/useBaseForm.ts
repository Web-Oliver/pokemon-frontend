/**
 * Base Form Hook - REFACTORED FOR SOLID COMPLIANCE
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * SOLID Principles Applied:
 * - SRP: Now composed of focused hooks, each with single responsibility
 * - OCP: Extensible through configuration and composition
 * - DIP: Depends on abstractions (focused hooks) not implementations
 * 
 * Decomposed from 404 lines into focused, composable hooks:
 * - useFormState: Form state management only
 * - useFormValidation: Validation logic only  
 * - useFormTransformation: Data transformation only
 * - useFormDataProcessor: Data processing only
 * - useFormInitializer: Form initialization only
 * - useFormSubmissionHandler: Submission handling only
 */

import { FieldValues, useForm, DefaultValues, UseFormReturn } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { useFormState } from './form/useFormState';
import { useFormValidation, ValidationRules } from './form/useFormValidation';
import { useFormTransformation } from './form/useFormTransformation';
import { useFormDataProcessor } from './form/useFormDataProcessor';
import { useFormInitializer } from './form/useFormInitialization';
import { useFormSubmissionHandler } from './form/useFormSubmissionHandler';
import { useImageUpload } from './useImageUpload';
import { usePriceHistory } from './usePriceHistory';
// DELETED: useFormSubmission monster hook - use focused hooks instead

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

  // Enhanced form handling options
  /** Enable automatic data transformation (trim, convert types, etc.) */
  enableDataTransformation?: boolean;
  /** Form submission pattern (create, edit, delete, bulk) */
  submissionPattern?: 'create' | 'edit' | 'delete' | 'bulk';
  /** Custom data transformation function */
  customTransform?: (data: T) => Partial<T>;
  /** Enable form submission integration */
  enableSubmissionIntegration?: boolean;
  /** DELETED: submissionConfig - use focused hooks instead */
}

export interface UseBaseFormReturn<T extends FieldValues> {
  // Form state
  form: UseFormReturn<T>;
  isSubmitting: boolean;

  // Convenience accessors for backward compatibility
  values: T;
  setValue: (name: keyof T, value: any) => void;
  errors: Record<string, any>;
  error?: Error;
  setError: (name: string, error: Error) => void;

  // Image upload
  imageUpload: ReturnType<typeof useImageUpload>;

  // Price history
  priceHistory: ReturnType<typeof usePriceHistory>;

  // Validation
  validateField: (fieldName: string, value: any) => string | undefined;
  isFormValid: (formData: Record<string, any>) => boolean;

  // Enhanced form operations
  setSubmitting: (submitting: boolean) => void;
  resetForm: () => void;
  setFormData: (data: Partial<T>) => void;
  updateWithInitialData: (data: Partial<T>) => void;

  // New enhanced features
  /** Transform form data using configured patterns */
  transformData: (data: T) => T;
  /** Handle form submission with integrated patterns */
  handleUnifiedSubmit: (
    onSubmit: (data: T) => Promise<void>,
    options?: { validate?: boolean; transform?: boolean }
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  /** Sanitize and validate form data */
  processFormData: (data: T) => {
    data: T;
    isValid: boolean;
    errors: Record<string, string>;
  };

  // DELETED: formSubmission - use focused hooks instead
}

/**
 * Enhanced base form hook with integrated submission, validation, and transformation
 * Follows DRY principle - eliminates duplicate form logic across all form components
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
    enableDataTransformation = true,
    submissionPattern = isEditing ? 'edit' : 'create',
    customTransform,
    enableSubmissionIntegration = false,
  } = config;

  // Initialize form with react-hook-form
  const form = useForm<T>({
    defaultValues,
    mode,
  });

  // Initialize focused hooks using composition
  const formState = useFormState<T>({
    form,
  });

  const formValidation = useFormValidation(validationRules);

  const formTransformation = useFormTransformation<T>({
    enableDataTransformation,
    submissionPattern,
    customTransform,
    isEditing,
  });

  const formDataProcessor = useFormDataProcessor<T>({
    validationRules,
    validateField: formValidation.validateField,
    transformData: formTransformation.transformData,
  });

  // Initialize image upload and price history first
  const imageUpload = useImageUpload(initialImages);
  const priceHistory = usePriceHistory(initialPriceHistory, initialPrice);

  const formInitializer = useFormInitializer<T>({
    initialData,
    isEditing,
    fieldMapping,
    form,
    imageUpload,
  });

  const formSubmissionHandler = useFormSubmissionHandler<T>({
    form,
    setSubmitting: formState.setSubmitting,
    setError: formState.setError,
    processFormData: formDataProcessor.processFormData,
  });

  // Watch all form values for convenience accessor
  const values = form.watch();

  const resetForm = useCallback(() => {
    form.reset();
    imageUpload.clearImages();
    priceHistory.clearPriceHistory();
    formState.setSubmitting(false);
  }, [form, imageUpload, priceHistory, formState.setSubmitting]);

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

  // Convenience methods for backward compatibility
  const setValue = useCallback(
    (name: keyof T, value: any) => {
      form.setValue(name as any, value);
    },
    [form]
  );

  // DELETED: formSubmission integration - use focused hooks instead

  return {
    form,
    isSubmitting: formState.isSubmitting,

    // Convenience accessors
    values: values as T,
    setValue,
    errors: form.formState.errors,
    error: formState.error,
    setError: formState.setError,

    imageUpload,
    priceHistory,
    validateField: formValidation.validateField,
    isFormValid: formValidation.isFormValid,
    setSubmitting: formState.setSubmitting,
    resetForm,
    setFormData,
    updateWithInitialData: formInitializer.updateWithInitialData,

    // Enhanced features
    transformData: formTransformation.transformData,
    handleUnifiedSubmit: formSubmissionHandler.handleUnifiedSubmit,
    processFormData: formDataProcessor.processFormData,
  };
};
