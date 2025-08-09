/**
 * React Hook Form Adapter for useGenericFormState
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Provides compatibility between our consolidated useGenericFormState hook
 * and components that expect react-hook-form interface
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Adapts form state interfaces
 * - Open/Closed: Extends useGenericFormState without modification
 * - Dependency Inversion: Abstracts form state implementation details
 */

import { useCallback } from 'react';
import { useGenericFormState, UseGenericFormStateOptions, UseGenericFormStateReturn } from './useGenericFormState';

interface ReactHookFormAdapterReturn<T extends Record<string, any>> extends UseGenericFormStateReturn<T> {
  // React Hook Form compatible interface
  register: (fieldName: keyof T) => {
    name: keyof T;
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: () => void;
    value: any;
  };
  setValue: (fieldName: keyof T, value: any) => void;
  watch: (fieldName?: keyof T) => T | T[keyof T];
  handleSubmit: (onValid: (data: T) => void | Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  formState: {
    errors: Record<string, { message?: string }>;
    isValid: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
  };
}

/**
 * Adapter hook that provides react-hook-form compatible interface
 * while using our consolidated useGenericFormState internally
 */
export const useGenericFormStateAdapter = <T extends Record<string, any>>(
  options: UseGenericFormStateOptions<T>
): ReactHookFormAdapterReturn<T> => {
  const formState = useGenericFormState(options);

  // React Hook Form compatible register function
  const register = useCallback((fieldName: keyof T) => ({
    name: fieldName,
    onChange: (e: React.ChangeEvent<any>) => {
      const value = e.target?.value !== undefined ? e.target.value : e;
      formState.updateField(fieldName, value);
    },
    onBlur: () => {
      // Validate field on blur
      formState.validateField(fieldName);
    },
    value: formState.data[fieldName],
  }), [formState]);

  // React Hook Form compatible setValue function
  const setValue = useCallback((fieldName: keyof T, value: any) => {
    formState.updateField(fieldName, value);
  }, [formState]);

  // React Hook Form compatible watch function
  const watch = useCallback((fieldName?: keyof T) => {
    if (fieldName) {
      return formState.data[fieldName];
    }
    return formState.data;
  }, [formState.data]);

  // React Hook Form compatible handleSubmit function
  const handleSubmit = useCallback((onValid: (data: T) => void | Promise<void>) => {
    return async (e?: React.BaseSyntheticEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Validate entire form
      const isValid = formState.validateForm();
      
      if (isValid) {
        formState.setLoading(true);
        try {
          await onValid(formState.data);
        } catch (error) {
          // Error handling is delegated to the onValid function
          throw error;
        } finally {
          formState.setLoading(false);
        }
      }
    };
  }, [formState]);

  // React Hook Form compatible formState object
  const reactHookFormState = {
    errors: Object.entries(formState.errors).reduce((acc, [key, message]) => {
      acc[key] = { message };
      return acc;
    }, {} as Record<string, { message?: string }>),
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    isSubmitting: formState.loading,
  };

  return {
    ...formState,
    register,
    setValue,
    watch,
    handleSubmit,
    formState: reactHookFormState,
  };
};

/**
 * Specialized adapter for auction forms with built-in validation
 */
export const useAuctionFormAdapter = <T extends Record<string, any>>(initialData: T) => {
  return useGenericFormStateAdapter({
    initialData,
    validateField: (fieldName, value) => {
      if (fieldName === 'topText' && !value?.trim()) {
        return 'Header text is required';
      }
      if (fieldName === 'bottomText' && !value?.trim()) {
        return 'Footer text is required';
      }
      if (fieldName === 'auctionDate' && value && new Date(value) < new Date()) {
        return 'Auction date cannot be in the past';
      }
      return null;
    },
  });
};