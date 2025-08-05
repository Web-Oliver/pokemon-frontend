/**
 * Form Validation Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles form validation logic
 */

import { useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  pattern?: RegExp;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  custom?: (value: any) => string | undefined;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule;
}

export interface UseFormValidationReturn {
  validateField: (fieldName: string, value: any) => string | undefined;
  validateForm: (formData: Record<string, any>) => Record<string, string>;
  isFormValid: (formData: Record<string, any>) => boolean;
}

/**
 * Hook for form validation logic
 * Follows SRP - only handles validation rules and logic
 */
export const useFormValidation = (
  rules: ValidationRules
): UseFormValidationReturn => {
  const validateField = useCallback(
    (fieldName: string, value: any): string | undefined => {
      const rule = rules[fieldName];
      if (!rule) {
        return undefined;
      }

      // Required validation
      if (
        rule.required &&
        (!value || (typeof value === 'string' && value.trim() === ''))
      ) {
        return `${fieldName} is required`;
      }

      // Skip other validations if field is empty and not required
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return undefined;
      }

      // Pattern validation
      if (
        rule.pattern &&
        typeof value === 'string' &&
        !rule.pattern.test(value)
      ) {
        return `${fieldName} format is invalid`;
      }

      // Min/Max validation for numbers
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          return `${fieldName} must be at least ${rule.min}`;
        }
        if (rule.max !== undefined && value > rule.max) {
          return `${fieldName} must be at most ${rule.max}`;
        }
      }

      // MinLength/MaxLength validation for strings
      if (typeof value === 'string') {
        if (rule.minLength !== undefined && value.length < rule.minLength) {
          return `${fieldName} must be at least ${rule.minLength} characters`;
        }
        if (rule.maxLength !== undefined && value.length > rule.maxLength) {
          return `${fieldName} must be at most ${rule.maxLength} characters`;
        }
      }

      // Custom validation
      if (rule.custom) {
        return rule.custom(value);
      }

      return undefined;
    },
    [rules]
  );

  const validateForm = useCallback(
    (formData: Record<string, any>): Record<string, string> => {
      const errors: Record<string, string> = {};

      Object.keys(rules).forEach((fieldName) => {
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          errors[fieldName] = error;
        }
      });

      return errors;
    },
    [rules, validateField]
  );

  const isFormValid = useCallback(
    (formData: Record<string, any>): boolean => {
      const errors = validateForm(formData);
      return Object.keys(errors).length === 0;
    },
    [validateForm]
  );

  return {
    validateField,
    validateForm,
    isFormValid,
  };
};

// Common validation rules for reuse across forms
export const commonValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    pattern: /^(\d{8}|\+45\s?\d{8}|\d{2}\s\d{2}\s\d{2}\s\d{2})$/,
    custom: (value: string) => {
      // Remove all spaces and formatting
      const cleanValue = value.replace(/[\s\-\(\)]/g, '');
      
      // Check Danish formats: 8 digits (27102080) or +45 prefix
      if (cleanValue.match(/^\d{8}$/)) {
        return undefined; // Valid 8-digit Danish number
      }
      if (cleanValue.match(/^\+45\d{8}$/)) {
        return undefined; // Valid +45 prefixed Danish number
      }
      
      return 'Phone number must be 8 digits (e.g., 27102080) or include +45 prefix';
    },
  },
  price: {
    min: 0,
    custom: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return 'Must be a valid number';
      }
      return undefined;
    },
  },
  grade: {
    pattern: /^(1|2|3|4|5|6|7|8|9|10)$/,
    custom: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 10) {
        return 'Grade must be between 1 and 10';
      }
      return undefined;
    },
  },
  postalCode: {
    pattern: /^\d{4,5}$/,
  },
};
