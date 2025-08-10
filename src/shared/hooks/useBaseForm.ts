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
import { useFormValidation, ValidationRules } from './form/useFormValidation';
import { useImageUpload } from './useImageUpload';
import { usePriceHistory } from './usePriceHistory';
import {
  createFormSubmissionPattern,
  type FormSubmissionConfig,
  transformFormData,
  useFormSubmission,
} from './useFormSubmission';

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
  /** Submission configuration for integrated form handling */
  submissionConfig?: Partial<FormSubmissionConfig<T>>;
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

  // Integrated form submission (if enabled)
  formSubmission?: ReturnType<typeof useFormSubmission>;
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
    submissionConfig,
  } = config;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<Error | undefined>(undefined);

  // Get submission pattern configuration
  const submissionPatternConfig = enableDataTransformation
    ? createFormSubmissionPattern<T>(submissionPattern)
    : { sanitizeData: false, validateOnSubmit: false };

  // Initialize form with react-hook-form
  const form = useForm<T>({
    defaultValues,
    mode,
  });

  // Watch all form values for convenience accessor
  const values = form.watch();

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
          if (
            (key.includes('Date') || key.includes('date')) &&
            typeof value === 'string'
          ) {
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
    [fieldMapping] // FIXED: Removed 'form' from dependencies to prevent infinite loops
    // form.setValue is stable and doesn't need to be in the dependency array
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
    // FIXED: Removed updateWithInitialData and imageUpload from dependencies to prevent infinite loops
    // These functions are stable or their changes shouldn't retrigger the initialization
  }, [isEditing, initialData]);

  // Convenience methods for backward compatibility
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

  // Unified form submission handler
  const handleUnifiedSubmit = useCallback(
    (
      onSubmit: (data: T) => Promise<void>,
      options: { validate?: boolean; transform?: boolean } = {}
    ) => {
      const { validate = true, transform = true } = options;

      return form.handleSubmit(async (data: T) => {
        setIsSubmitting(true);
        setFormError(undefined);

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
          setFormError(formError);
          throw formError;
        } finally {
          setIsSubmitting(false);
        }
      });
    },
    [form, processFormData, setIsSubmitting]
  );

  // Initialize integrated form submission if enabled
  const formSubmission =
    enableSubmissionIntegration && submissionConfig
      ? useFormSubmission({
          ...submissionConfig,
          isEditing,
          initialData,
          imageUpload,
          priceHistory,
          validationRules,
          ...submissionPatternConfig,
        } as FormSubmissionConfig<T>)
      : undefined;

  return {
    form,
    isSubmitting,

    // Convenience accessors
    values: values as T,
    setValue,
    errors: form.formState.errors,
    error: formError,
    setError,

    imageUpload,
    priceHistory,
    validateField,
    isFormValid,
    setSubmitting,
    resetForm,
    setFormData,
    updateWithInitialData,

    // Enhanced features
    transformData,
    handleUnifiedSubmit,
    processFormData,
    formSubmission,
  };
};
