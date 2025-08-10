/**
 * useFormValidation Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Standardized form validation hook with advanced validation features
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles form validation logic
 * - DRY: Eliminates repetitive validation patterns
 * - Dependency Inversion: Depends on centralized validation utilities
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '../useDebounce';
import {
  type EnhancedValidationRule,
  sanitizers,
  validateCrossField,
  validateEnhancedField,
  validateField,
  validateFieldAsync,
  type ValidationContext,
  type ValidationRule,
} from '../../utils/validation';
import {
  type ErrorContext,
  handleError,
} from '../../utils/helpers/errorHandler';

export interface UseFormValidationOptions<T = Record<string, string>> {
  /** Validation rules for form fields */
  rules: Record<keyof T, ValidationRule | EnhancedValidationRule>;
  /** Initial form data */
  initialData?: T;
  /** Whether to validate on change */
  validateOnChange?: boolean;
  /** Whether to validate on blur */
  validateOnBlur?: boolean;
  /** Debounce delay for validation (ms) */
  debounceMs?: number;
  /** Enable async validation */
  enableAsyncValidation?: boolean;
  /** Enable cross-field validation */
  enableCrossFieldValidation?: boolean;
  /** Custom sanitizers for fields */
  sanitizers?: Partial<Record<keyof T, (value: string) => string>>;
  /** Error context for enhanced error handling */
  errorContext?: ErrorContext;
  /** Callback when validation state changes */
  onValidationChange?: (
    isValid: boolean,
    errors: Record<string, string>
  ) => void;
}

export interface UseFormValidationReturn<T = Record<string, string>> {
  /** Current form data */
  formData: T;
  /** Validation errors */
  errors: Record<string, string>;
  /** Fields currently being validated asynchronously */
  validatingFields: Set<string>;
  /** Whether the entire form is valid */
  isValid: boolean;
  /** Whether any field has been touched */
  isDirty: boolean;
  /** Which fields have been touched */
  touchedFields: Set<string>;

  /** Update a field value with validation */
  updateField: (fieldName: keyof T, value: string) => void;
  /** Update multiple fields at once */
  updateFields: (updates: Partial<T>) => void;
  /** Validate a specific field */
  validateField: (fieldName: keyof T) => Promise<string | undefined>;
  /** Validate all fields */
  validateForm: () => Promise<boolean>;
  /** Clear validation error for a field */
  clearFieldError: (fieldName: keyof T) => void;
  /** Clear all validation errors */
  clearAllErrors: () => void;
  /** Mark field as touched */
  touchField: (fieldName: keyof T) => void;
  /** Reset form to initial state */
  resetForm: () => void;
  /** Get sanitized field value */
  getSanitizedValue: (fieldName: keyof T, value: string) => string;
  /** Set form data directly */
  setFormData: (data: T) => void;
}

/**
 * Advanced form validation hook with async validation, cross-field validation,
 * and automatic sanitization support
 *
 * @example
 * ```typescript
 * const validation = useFormValidation({
 *   rules: {
 *     cardName: { required: true, min: 2, max: 100 },
 *     myPrice: {
 *       required: true,
 *       dependsOn: ['cardMarketPrice'],
 *       complexValidator: (value, context) => {
 *         // Custom validation logic
 *         return undefined; // or error message
 *       }
 *     }
 *   },
 *   validateOnChange: true,
 *   enableAsyncValidation: true
 * });
 *
 * // Usage in component:
 * <input
 *   value={validation.formData.cardName}
 *   onChange={(e) => validation.updateField('cardName', e.target.value)}
 *   onBlur={() => validation.touchField('cardName')}
 * />
 * {validation.errors.cardName && <span>{validation.errors.cardName}</span>}
 * ```
 */
export const useFormValidation = <T extends Record<string, string>>(
  options: UseFormValidationOptions<T>
): UseFormValidationReturn<T> => {
  const {
    rules,
    initialData = {} as T,
    validateOnChange = false,
    validateOnBlur = true,
    debounceMs = 300,
    enableAsyncValidation = false,
    enableCrossFieldValidation = false,
    sanitizers: customSanitizers = {},
    errorContext = {},
    onValidationChange,
  } = options;

  // State management
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validatingFields, setValidatingFields] = useState<Set<string>>(
    new Set()
  );
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);

  // Debounced form data for validation
  const debouncedFormData = useDebounce(formData, debounceMs);

  // Refs for tracking
  const validationInProgressRef = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Get sanitized field value
  const getSanitizedValue = useCallback(
    (fieldName: keyof T, value: string): string => {
      const customSanitizer = customSanitizers[fieldName];
      if (customSanitizer) {
        return customSanitizer(value);
      }

      // Apply default sanitizers based on field patterns
      const fieldRule = rules[fieldName];
      if (fieldRule?.pattern?.toString() === '/^\\d+$/') {
        return sanitizers.numericOnly(value);
      }

      // Default: normalize whitespace
      return sanitizers.normalizeText(value);
    },
    [customSanitizers, rules]
  );

  // Validate a specific field
  const validateSingleField = useCallback(
    async (
      fieldName: keyof T,
      value: string,
      allFormData: T = formData
    ): Promise<string | undefined> => {
      const fieldRule = rules[fieldName];
      if (!fieldRule) return undefined;

      const stringFieldName = String(fieldName);

      try {
        // Prevent concurrent validation of the same field
        if (validationInProgressRef.current.has(stringFieldName)) {
          return undefined;
        }

        validationInProgressRef.current.add(stringFieldName);

        // Update validating fields state
        if (enableAsyncValidation) {
          setValidatingFields((prev) => new Set([...prev, stringFieldName]));
        }

        // Create validation context
        const context: ValidationContext = {
          formData: allFormData,
          dependencies: (fieldRule as EnhancedValidationRule).dependsOn,
        };

        let error: string | undefined;

        // Run enhanced validation if it's an enhanced rule
        if ('complexValidator' in fieldRule || 'asyncValidator' in fieldRule) {
          const enhancedRule = fieldRule as EnhancedValidationRule;

          if (enableAsyncValidation && enhancedRule.asyncValidator) {
            error = await validateFieldAsync(
              value,
              enhancedRule,
              stringFieldName,
              context
            );
          } else {
            error = validateEnhancedField(
              value,
              enhancedRule,
              stringFieldName,
              context
            );
          }
        } else {
          // Run basic validation
          error = validateField(value, fieldRule, stringFieldName);
        }

        // Cross-field validation
        if (
          !error &&
          enableCrossFieldValidation &&
          (fieldRule as EnhancedValidationRule).dependsOn
        ) {
          error = validateCrossField(
            allFormData as Record<string, string>,
            stringFieldName,
            fieldRule as EnhancedValidationRule,
            rules as Record<string, EnhancedValidationRule>
          );
        }

        return error;
      } catch (err) {
        const processedError = handleError(err, {
          ...errorContext,
          component: 'useFormValidation',
          action: 'validateSingleField',
          fieldName: stringFieldName,
        });

        return `Validation error: ${processedError.message}`;
      } finally {
        validationInProgressRef.current.delete(stringFieldName);

        if (enableAsyncValidation && mountedRef.current) {
          setValidatingFields((prev) => {
            const newSet = new Set(prev);
            newSet.delete(stringFieldName);
            return newSet;
          });
        }
      }
    },
    [
      formData,
      rules,
      enableAsyncValidation,
      enableCrossFieldValidation,
      errorContext,
    ]
  );

  // Update field value with validation
  const updateField = useCallback(
    (fieldName: keyof T, value: string) => {
      const sanitizedValue = getSanitizedValue(fieldName, value);

      setFormData((prev) => ({
        ...prev,
        [fieldName]: sanitizedValue,
      }));

      setIsDirty(true);

      if (validateOnChange) {
        // Validate immediately for sync validation, or after debounce for async
        const validateImmediately = !enableAsyncValidation;

        if (validateImmediately) {
          validateSingleField(fieldName, sanitizedValue).then((error) => {
            if (mountedRef.current) {
              setErrors((prev) => ({
                ...prev,
                [fieldName]: error || '',
              }));
            }
          });
        }
      }
    },
    [
      getSanitizedValue,
      validateOnChange,
      enableAsyncValidation,
      validateSingleField,
    ]
  );

  // Update multiple fields at once
  const updateFields = useCallback(
    (updates: Partial<T>) => {
      const sanitizedUpdates = Object.entries(updates).reduce(
        (acc, [key, value]) => {
          if (typeof value === 'string') {
            acc[key as keyof T] = getSanitizedValue(
              key as keyof T,
              value
            ) as T[keyof T];
          }
          return acc;
        },
        {} as Partial<T>
      );

      setFormData((prev) => ({ ...prev, ...sanitizedUpdates }));
      setIsDirty(true);

      if (validateOnChange) {
        // Validate all updated fields
        Object.keys(sanitizedUpdates).forEach((fieldName) => {
          const value = sanitizedUpdates[fieldName as keyof T] as string;
          validateSingleField(fieldName as keyof T, value);
        });
      }
    },
    [getSanitizedValue, validateOnChange, validateSingleField]
  );

  // Validate debounced form data (for async validation)
  useEffect(() => {
    if (enableAsyncValidation && validateOnChange && isDirty) {
      Object.entries(debouncedFormData).forEach(([fieldName, value]) => {
        if (typeof value === 'string' && touchedFields.has(fieldName)) {
          validateSingleField(
            fieldName as keyof T,
            value,
            debouncedFormData
          ).then((error) => {
            if (mountedRef.current) {
              setErrors((prev) => ({
                ...prev,
                [fieldName]: error || '',
              }));
            }
          });
        }
      });
    }
  }, [
    debouncedFormData,
    enableAsyncValidation,
    validateOnChange,
    isDirty,
    touchedFields,
    validateSingleField,
  ]);

  // Validate specific field (public method)
  const validateFieldPublic = useCallback(
    async (fieldName: keyof T): Promise<string | undefined> => {
      const value = formData[fieldName];
      if (typeof value !== 'string') return undefined;

      const error = await validateSingleField(fieldName, value);

      setErrors((prev) => ({
        ...prev,
        [fieldName]: error || '',
      }));

      return error;
    },
    [formData, validateSingleField]
  );

  // Validate entire form
  const validateForm = useCallback(async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    const fieldNames = Object.keys(rules) as (keyof T)[];

    // Validate all fields in parallel
    const validationPromises = fieldNames.map(async (fieldName) => {
      const value = formData[fieldName];
      if (typeof value !== 'string') return { fieldName, error: undefined };

      const error = await validateSingleField(fieldName, value);
      return { fieldName, error };
    });

    const validationResults = await Promise.all(validationPromises);

    validationResults.forEach(({ fieldName, error }) => {
      if (error) {
        newErrors[String(fieldName)] = error;
      }
    });

    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0;

    // Mark all fields as touched
    setTouchedFields(new Set(fieldNames.map(String)));

    return isValid;
  }, [formData, rules, validateSingleField]);

  // Clear field error
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[String(fieldName)];
      return newErrors;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Mark field as touched
  const touchField = useCallback(
    (fieldName: keyof T) => {
      setTouchedFields((prev) => new Set([...prev, String(fieldName)]));

      if (validateOnBlur) {
        validateFieldPublic(fieldName);
      }
    },
    [validateOnBlur, validateFieldPublic]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setValidatingFields(new Set());
    setTouchedFields(new Set());
    setIsDirty(false);
    validationInProgressRef.current.clear();
  }, [initialData]);

  // Set form data directly
  const setFormDataDirectly = useCallback((data: T) => {
    setFormData(data);
    setIsDirty(true);
  }, []);

  // Computed values
  const isValid = useMemo(() => {
    const hasErrors = Object.values(errors).some(
      (error) => error && error.trim() !== ''
    );
    const hasValidatingFields = validatingFields.size > 0;
    return !hasErrors && !hasValidatingFields;
  }, [errors, validatingFields]);

  // Notify validation state changes
  useEffect(() => {
    onValidationChange?.(isValid, errors);
  }, [isValid, errors, onValidationChange]);

  return {
    formData,
    errors,
    validatingFields,
    isValid,
    isDirty,
    touchedFields,
    updateField,
    updateFields,
    validateField: validateFieldPublic,
    validateForm,
    clearFieldError,
    clearAllErrors,
    touchField,
    resetForm,
    getSanitizedValue,
    setFormData: setFormDataDirectly,
  };
};

export default useFormValidation;
