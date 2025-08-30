/**
 * useFormState Hook - CONSOLIDATED
 * Following CLAUDE.md SRP principle - handles ALL form state operations
 * 
 * CONSOLIDATED: Merges useFormState + useGenericFormState + useGenericFormStateAdapter
 * Eliminates duplication while providing both React Hook Form and generic interfaces
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles all form state concerns
 * - DRY: Eliminates repeated state management patterns
 * - Open/Closed: Extensible through configuration
 * - Interface Segregation: Provides both RHF and generic interfaces
 */

import { useCallback, useEffect, useState } from 'react';
import {
  DefaultValues,
  FieldValues,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import { log } from '../../utils/performance/logger';

// Base interfaces for backward compatibility
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

// Extended interfaces for generic form state
export interface GenericFormStateOptions<T extends Record<string, any>> {
  initialData: T;
  validateField?: (fieldName: keyof T, value: any) => string | null;
  validateForm?: (data: T) => Record<string, string>;
  onFieldChange?: (fieldName: keyof T, value: any, formData: T) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  enableDeepComparison?: boolean;
  
  // React Hook Form compatibility mode
  useReactHookForm?: boolean;
  reactHookFormConfig?: FormStateConfig<T>;
}

export interface GenericFormStateReturn<T extends Record<string, any>> {
  // Form data
  data: T;

  // Form state
  loading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
  isValid: boolean;

  // Form actions
  updateField: (fieldName: keyof T, value: any) => void;
  updateFields: (updates: Partial<T>) => void;
  setLoading: (loading: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  setFieldError: (fieldName: string, error: string | null) => void;
  clearFieldError: (fieldName: string) => void;
  clearAllErrors: () => void;
  reset: () => void;
  resetToData: (newData: T) => void;

  // Validation
  validateField: (fieldName: keyof T) => boolean;
  validateForm: () => boolean;

  // Utility functions
  getFieldError: (fieldName: string) => string | null;
  hasErrors: () => boolean;
  getDirtyFields: () => (keyof T)[];

  // React Hook Form adapter (when enabled)
  register?: (fieldName: keyof T) => {
    name: keyof T;
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: () => void;
    value: any;
  };
  watch?: (fieldName?: keyof T) => any;
  handleSubmit?: (onValid: (data: T) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  formState?: {
    errors: Record<string, { message?: string }>;
    isValid: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
  };
}

/**
 * Deep comparison for nested objects to detect changes
 * CONSOLIDATED: From useGenericFormState
 */
const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
};

/**
 * CONSOLIDATED Form State Hook - React Hook Form Mode
 * Original useFormState functionality for React Hook Form integration
 */
export const useFormState = <T extends FieldValues>(
  config: FormStateConfig<T>
): UseFormStateReturn<T> => {
  const { defaultValues, mode = 'onChange' } = config;
  
  const form = useForm<T>({
    defaultValues,
    mode,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<Error | undefined>();

  const values = form.watch();

  const setValue = useCallback((name: keyof T, value: any) => {
    form.setValue(name as any, value);
  }, [form]);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const resetForm = useCallback(() => {
    form.reset();
    setFormError(undefined);
    setIsSubmitting(false);
  }, [form]);

  const setFormData = useCallback((data: Partial<T>) => {
    Object.entries(data).forEach(([key, value]) => {
      form.setValue(key as any, value);
    });
  }, [form]);

  const setError = useCallback((name: string, error: Error) => {
    form.setError(name as any, { message: error.message });
    setFormError(error);
  }, [form]);

  const clearError = useCallback(() => {
    form.clearErrors();
    setFormError(undefined);
  }, [form]);

  return {
    form,
    values,
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

/**
 * CONSOLIDATED Generic Form State Hook
 * Advanced form state management with validation, dirty tracking, and React Hook Form adapter
 */
export const useGenericFormState = <T extends Record<string, any>>(
  options: GenericFormStateOptions<T>
): GenericFormStateReturn<T> => {
  const {
    initialData,
    validateField: validateFieldFn,
    validateForm: validateFormFn,
    onFieldChange,
    onDirtyChange,
    enableDeepComparison = false,
    useReactHookForm = false,
    reactHookFormConfig = {},
  } = options;

  // Core form state - consolidates repetitive useState patterns
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [originalData, setOriginalData] = useState<T>(initialData);

  // React Hook Form integration (optional)
  const rhfForm = useReactHookForm 
    ? useForm({
        defaultValues: initialData as any,
        ...reactHookFormConfig,
      })
    : null;

  // Update original data when initialData changes (with deep comparison to prevent infinite loops)
  useEffect(() => {
    const hasChanged = enableDeepComparison
      ? !deepEqual(originalData, initialData)
      : JSON.stringify(originalData) !== JSON.stringify(initialData);
    
    if (hasChanged) {
      setOriginalData(initialData);
      setData(initialData);
      setIsDirty(false);
      setErrors({});
      
      // Update React Hook Form if enabled
      if (rhfForm) {
        Object.entries(initialData).forEach(([key, value]) => {
          rhfForm.setValue(key as any, value);
        });
      }
    }
  }, [initialData, enableDeepComparison, rhfForm]);

  // Check if form is dirty whenever data changes
  useEffect(() => {
    const newIsDirty = enableDeepComparison
      ? !deepEqual(data, originalData)
      : JSON.stringify(data) !== JSON.stringify(originalData);

    if (newIsDirty !== isDirty) {
      setIsDirty(newIsDirty);
      if (onDirtyChange) {
        onDirtyChange(newIsDirty);
      }
    }
  }, [data, originalData, onDirtyChange, enableDeepComparison]);

  // Field update function - replaces repetitive field update patterns
  const updateField = useCallback(
    (fieldName: keyof T, value: any) => {
      let newDataForCallback: T;
      
      setData((prevData) => {
        const newData = { ...prevData, [fieldName]: value };
        newDataForCallback = newData;
        
        log('[Generic Form State] Field updated', {
          field: fieldName as string,
          value,
          isDirty: true,
        });

        return newData;
      });

      // Update React Hook Form if enabled
      if (rhfForm) {
        rhfForm.setValue(fieldName as any, value);
      }

      // Clear field error when field is updated
      setErrors((prevErrors) => {
        if (prevErrors[fieldName as string]) {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldName as string];
          return newErrors;
        }
        return prevErrors;
      });

      // Field-level validation
      if (validateFieldFn) {
        const fieldError = validateFieldFn(fieldName, value);
        if (fieldError) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            [fieldName as string]: fieldError,
          }));
        }
      }

      // Execute callback after all state updates are complete
      if (onFieldChange && newDataForCallback) {
        setTimeout(() => {
          onFieldChange(fieldName, value, newDataForCallback);
        }, 0);
      }
    },
    [validateFieldFn, onFieldChange, rhfForm]
  );

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<T>) => {
    setData((prevData) => {
      const newData = { ...prevData, ...updates };

      // Update React Hook Form if enabled
      if (rhfForm) {
        Object.entries(updates).forEach(([key, value]) => {
          rhfForm.setValue(key as any, value);
        });
      }

      // Clear errors for updated fields
      const updatedFields = Object.keys(updates);
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        updatedFields.forEach((field) => {
          delete newErrors[field];
        });
        return newErrors;
      });

      log('[Generic Form State] Multiple fields updated', {
        fields: updatedFields,
        updates,
      });

      return newData;
    });
  }, [rhfForm]);

  // Error management functions
  const setFieldError = useCallback(
    (fieldName: string, error: string | null) => {
      setErrors((prevErrors) => {
        if (error) {
          return { ...prevErrors, [fieldName]: error };
        } else {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldName];
          return newErrors;
        }
      });

      // Update React Hook Form errors if enabled
      if (rhfForm) {
        if (error) {
          rhfForm.setError(fieldName as any, { message: error });
        } else {
          rhfForm.clearErrors(fieldName as any);
        }
      }
    },
    [rhfForm]
  );

  const clearFieldError = useCallback(
    (fieldName: string) => {
      setFieldError(fieldName, null);
    },
    [setFieldError]
  );

  const clearAllErrors = useCallback(() => {
    setErrors({});
    if (rhfForm) {
      rhfForm.clearErrors();
    }
  }, [rhfForm]);

  // Validation functions
  const validateField = useCallback(
    (fieldName: keyof T): boolean => {
      if (!validateFieldFn) return true;

      const error = validateFieldFn(fieldName, data[fieldName]);
      setFieldError(fieldName as string, error);
      return !error;
    },
    [data, validateFieldFn, setFieldError]
  );

  const validateForm = useCallback((): boolean => {
    if (!validateFormFn) return true;

    const formErrors = validateFormFn(data);
    setErrors(formErrors);

    // Update React Hook Form errors if enabled
    if (rhfForm) {
      Object.entries(formErrors).forEach(([field, error]) => {
        rhfForm.setError(field as any, { message: error });
      });
    }

    const isValid = Object.keys(formErrors).length === 0;

    log('[Generic Form State] Form validation', {
      isValid,
      errors: formErrors,
    });

    return isValid;
  }, [data, validateFormFn, rhfForm]);

  // Reset functions
  const reset = useCallback(() => {
    setData(originalData);
    setErrors({});
    setIsDirty(false);
    setLoading(false);

    if (rhfForm) {
      rhfForm.reset(originalData as any);
    }

    log('[Generic Form State] Form reset to original data');
  }, [originalData, rhfForm]);

  const resetToData = useCallback((newData: T) => {
    setOriginalData(newData);
    setData(newData);
    setErrors({});
    setIsDirty(false);
    setLoading(false);

    if (rhfForm) {
      rhfForm.reset(newData as any);
    }

    log('[Generic Form State] Form reset to new data');
  }, [rhfForm]);

  // Utility functions
  const getFieldError = useCallback(
    (fieldName: string): string | null => {
      return errors[fieldName] || null;
    },
    [errors]
  );

  const hasErrors = useCallback((): boolean => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  const getDirtyFields = useCallback((): (keyof T)[] => {
    const dirtyFields: (keyof T)[] = [];

    for (const key of Object.keys(data) as (keyof T)[]) {
      const currentValue = data[key];
      const originalValue = originalData[key];

      const isFieldDirty = enableDeepComparison
        ? !deepEqual(currentValue, originalValue)
        : JSON.stringify(currentValue) !== JSON.stringify(originalValue);

      if (isFieldDirty) {
        dirtyFields.push(key);
      }
    }

    return dirtyFields;
  }, [data, originalData, enableDeepComparison]);

  // Computed values
  const isValid = !hasErrors();

  // React Hook Form adapter functions (from useGenericFormStateAdapter)
  const register = useCallback(
    (fieldName: keyof T) => ({
      name: fieldName,
      onChange: (e: React.ChangeEvent<any>) => {
        const value = e.target?.value !== undefined ? e.target.value : e;
        updateField(fieldName, value);
      },
      onBlur: () => {
        validateField(fieldName);
      },
      value: data[fieldName],
    }),
    [updateField, validateField, data]
  );

  const watch = useCallback(
    (fieldName?: keyof T) => {
      if (fieldName) {
        return data[fieldName];
      }
      return data;
    },
    [data]
  );

  const handleSubmit = useCallback(
    (onValid: (data: T) => void | Promise<void>) => {
      return async (e?: React.BaseSyntheticEvent) => {
        if (e) {
          e.preventDefault();
        }

        const isFormValid = validateForm();

        if (isFormValid) {
          setLoading(true);
          try {
            await onValid(data);
          } catch (error) {
            throw error;
          } finally {
            setLoading(false);
          }
        }
      };
    },
    [validateForm, setLoading, data]
  );

  const reactHookFormState = {
    errors: Object.entries(errors).reduce(
      (acc, [key, message]) => {
        acc[key] = { message };
        return acc;
      },
      {} as Record<string, { message?: string }>
    ),
    isValid,
    isDirty,
    isSubmitting: loading,
  };

  const result: GenericFormStateReturn<T> = {
    // Form data
    data,

    // Form state
    loading,
    errors,
    isDirty,
    isValid,

    // Form actions
    updateField,
    updateFields,
    setLoading,
    setErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    reset,
    resetToData,

    // Validation
    validateField,
    validateForm,

    // Utility functions
    getFieldError,
    hasErrors,
    getDirtyFields,
  };

  // Add React Hook Form adapter methods if requested
  if (useReactHookForm) {
    result.register = register;
    result.watch = watch;
    result.handleSubmit = handleSubmit;
    result.formState = reactHookFormState;
  }

  return result;
};

/**
 * BACKWARD COMPATIBILITY: Specialized hooks
 */

// Simple form state (without complex validation)
export const useSimpleFormState = <T extends Record<string, any>>(
  initialData: T
) => {
  return useGenericFormState({
    initialData,
    enableDeepComparison: false,
  });
};

// Form state with built-in validation rules
export const useValidatedFormState = <T extends Record<string, any>>(
  initialData: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) => {
  const validateField = useCallback(
    (fieldName: keyof T, value: any): string | null => {
      const rule = validationRules[fieldName];
      return rule ? rule(value) : null;
    },
    [validationRules]
  );

  return useGenericFormState({
    initialData,
    validateField,
  });
};

// React Hook Form compatible adapter
export const useGenericFormStateAdapter = <T extends Record<string, any>>(
  options: GenericFormStateOptions<T>
) => {
  return useGenericFormState({
    ...options,
    useReactHookForm: true,
  });
};

// Specialized adapter for auction forms
export const useAuctionFormAdapter = <T extends Record<string, any>>(
  initialData: T
) => {
  return useGenericFormStateAdapter({
    initialData,
    enableDeepComparison: true,
  });
};

export default useFormState;