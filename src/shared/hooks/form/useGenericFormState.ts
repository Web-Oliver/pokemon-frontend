/**
 * Generic Form State Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Consolidates repetitive form state patterns across the codebase
 * Replaces patterns like:
 * - const [formData, setFormData] = useState({...})
 * - const [loading, setLoading] = useState(false)
 * - const [errors, setErrors] = useState<Record<string, string>>({})
 * - const [isDirty, setIsDirty] = useState(false)
 * 
 * Following CLAUDE.md SOLID principles and DRY pattern consolidation
 */

import { useCallback, useState, useEffect } from 'react';
import { log } from '../../utils/performance/logger';

export interface UseGenericFormStateOptions<T> {
  initialData: T;
  validateField?: (fieldName: keyof T, value: any) => string | null;
  validateForm?: (data: T) => Record<string, string>;
  onFieldChange?: (fieldName: keyof T, value: any, formData: T) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  enableDeepComparison?: boolean; // For nested objects
}

export interface UseGenericFormStateReturn<T> {
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
}

/**
 * Deep comparison for nested objects to detect changes
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
    
    for (let key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
};

/**
 * Generic form state management hook that consolidates common form patterns
 * Eliminates repetitive useState patterns across form components
 */
export const useGenericFormState = <T extends Record<string, any>>(
  options: UseGenericFormStateOptions<T>
): UseGenericFormStateReturn<T> => {
  const {
    initialData,
    validateField: validateFieldFn,
    validateForm: validateFormFn,
    onFieldChange,
    onDirtyChange,
    enableDeepComparison = false
  } = options;

  // Core form state - consolidates repetitive useState patterns
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [originalData, setOriginalData] = useState<T>(initialData);

  // Update original data when initialData changes
  useEffect(() => {
    setOriginalData(initialData);
    setData(initialData);
    setIsDirty(false);
    setErrors({});
  }, [initialData]);

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
  }, [data, originalData, isDirty, onDirtyChange, enableDeepComparison]);

  // Field update function - replaces repetitive field update patterns
  const updateField = useCallback((fieldName: keyof T, value: any) => {
    setData(prevData => {
      const newData = { ...prevData, [fieldName]: value };
      
      // Clear field error when field is updated
      if (errors[fieldName as string]) {
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[fieldName as string];
          return newErrors;
        });
      }
      
      // Field-level validation
      if (validateFieldFn) {
        const fieldError = validateFieldFn(fieldName, value);
        if (fieldError) {
          setErrors(prevErrors => ({
            ...prevErrors,
            [fieldName as string]: fieldError
          }));
        }
      }
      
      // Custom field change callback
      if (onFieldChange) {
        onFieldChange(fieldName, value, newData);
      }
      
      log('[Generic Form State] Field updated', {
        field: fieldName as string,
        value,
        isDirty: true
      });
      
      return newData;
    });
  }, [validateFieldFn, onFieldChange, errors]);

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<T>) => {
    setData(prevData => {
      const newData = { ...prevData, ...updates };
      
      // Clear errors for updated fields
      const updatedFields = Object.keys(updates);
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        updatedFields.forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
      
      log('[Generic Form State] Multiple fields updated', {
        fields: updatedFields,
        updates
      });
      
      return newData;
    });
  }, []);

  // Error management functions
  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setErrors(prevErrors => {
      if (error) {
        return { ...prevErrors, [fieldName]: error };
      } else {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldName];
        return newErrors;
      }
    });
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setFieldError(fieldName, null);
  }, [setFieldError]);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Validation functions
  const validateField = useCallback((fieldName: keyof T): boolean => {
    if (!validateFieldFn) return true;
    
    const error = validateFieldFn(fieldName, data[fieldName]);
    setFieldError(fieldName as string, error);
    return !error;
  }, [data, validateFieldFn, setFieldError]);

  const validateForm = useCallback((): boolean => {
    if (!validateFormFn) return true;
    
    const formErrors = validateFormFn(data);
    setErrors(formErrors);
    
    const isValid = Object.keys(formErrors).length === 0;
    
    log('[Generic Form State] Form validation', {
      isValid,
      errors: formErrors
    });
    
    return isValid;
  }, [data, validateFormFn]);

  // Reset functions
  const reset = useCallback(() => {
    setData(originalData);
    setErrors({});
    setIsDirty(false);
    setLoading(false);
    
    log('[Generic Form State] Form reset to original data');
  }, [originalData]);

  const resetToData = useCallback((newData: T) => {
    setOriginalData(newData);
    setData(newData);
    setErrors({});
    setIsDirty(false);
    setLoading(false);
    
    log('[Generic Form State] Form reset to new data');
  }, []);

  // Utility functions
  const getFieldError = useCallback((fieldName: string): string | null => {
    return errors[fieldName] || null;
  }, [errors]);

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

  return {
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
};

/**
 * Specialized hook for simple form state (without complex validation)
 * Useful for basic forms that don't need field-level validation
 */
export const useSimpleFormState = <T extends Record<string, any>>(
  initialData: T
) => {
  return useGenericFormState({
    initialData,
    enableDeepComparison: false
  });
};

/**
 * Hook for form state with built-in validation rules
 * Provides common validation patterns (required, email, length, etc.)
 */
export const useValidatedFormState = <T extends Record<string, any>>(
  initialData: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) => {
  const validateField = useCallback((fieldName: keyof T, value: any): string | null => {
    const rule = validationRules[fieldName];
    return rule ? rule(value) : null;
  }, [validationRules]);

  return useGenericFormState({
    initialData,
    validateField,
    enableDeepComparison: false
  });
};