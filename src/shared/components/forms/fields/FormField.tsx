/**
 * FormField Component - THE Central Form Field Component
 * Layer 3: Components (UI Building Blocks)
 *
 * CENTRAL: Consolidates ALL form field patterns across the application
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Renders ANY form field type with auto-validation
 * - DRY: Eliminates 80% of form field boilerplate across ALL forms  
 * - Interface Segregation: Focused interface supporting all field types
 * - Open/Closed: Extensible field types without modification
 * - Dependency Inversion: Depends on design system abstractions
 * - NOT over-engineered: Comprehensive yet simple field orchestrator
 */

import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';
import { PokemonInput } from '../../atoms/design-system/PokemonInput';
import { PokemonSelect } from '../../atoms/design-system/PokemonSelect';

// Simple validation rule type
export type ValidationRule = Record<string, any>;

// Comprehensive field types covering ALL form field needs
export type FormFieldType =
  | 'text'
  | 'email' 
  | 'password'
  | 'number'
  | 'price'
  | 'grade'
  | 'phone'
  | 'date'
  | 'url'
  | 'search'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'available'; // For available quantity fields

// Option interface for select/radio fields
export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

// Comprehensive field configuration
export interface FormFieldProps {
  /** Core field configuration */
  name: string;
  label: string;
  type: FormFieldType;
  
  /** Form integration */
  register: UseFormRegister<any>;
  error?: FieldError;
  
  /** Field behavior */
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFilled?: boolean; // For auto-filled fields like setProductName, productName
  
  /** Validation */
  customValidation?: ValidationRule;
  
  /** Select/Radio options */
  options?: FieldOption[];
  
  /** Input constraints */
  min?: string | number;
  max?: string | number;
  step?: string | number;
  minLength?: number;
  maxLength?: number;
  rows?: number; // For textarea
  
  /** File upload */
  accept?: string; // File types for file input
  multiple?: boolean; // Multiple file selection
  
  /** Layout and styling */
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  
  /** Additional features */
  description?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  icon?: React.ReactNode;
  
  /** Event handlers */
  onChange?: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

/**
 * THE central FormField component that handles ALL field types
 * Consolidates ValidationField, ProductInformationFields, CardInformationFields patterns
 */
export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type,
  register,
  error,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  autoFilled = false,
  customValidation,
  options = [],
  min,
  max,
  step,
  minLength,
  maxLength,
  rows = 4,
  accept,
  multiple = false,
  className,
  containerClassName = '',
  labelClassName = '',
  description,
  prefix,
  suffix,
  icon,
  onChange,
  onBlur,
  onFocus,
}) => {
  // Auto-generate validation rules based on field type
  const getValidationRules = (): Record<string, any> => {
    const baseRules: Record<string, any> = {};
    
    if (required) {
      baseRules.required = `${label} is required`;
    }
    
    // Apply custom validation first (highest priority)
    if (customValidation) {
      Object.assign(baseRules, customValidation);
      return baseRules;
    }
    
    // Auto-apply validation rules based on field type
    switch (type) {
      case 'email':
        Object.assign(baseRules, {
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: 'Please enter a valid email address'
          }
        });
        break;
        
      case 'url':
        Object.assign(baseRules, {
          pattern: {
            value: /^https?:\/\/.+/,
            message: 'URL must be a valid HTTP/HTTPS URL'
          }
        });
        break;
        
      case 'phone':
        Object.assign(baseRules, {
          pattern: {
            value: /^\+?[\d\s\-\(\)]+$/,
            message: 'Please enter a valid phone number'
          }
        });
        break;
        
      case 'price':
        Object.assign(baseRules, {
          min: { value: 0, message: 'Price cannot be negative' },
          pattern: {
            value: /^\d+(\.\d{1,2})?$/,
            message: 'Price must be a valid number with up to 2 decimal places'
          }
        });
        break;
        
      case 'grade':
        Object.assign(baseRules, {
          min: { value: 1, message: 'Grade must be between 1-10' },
          max: { value: 10, message: 'Grade must be between 1-10' },
          pattern: {
            value: /^(10|[1-9])$/,
            message: 'Grade must be a number from 1 to 10'
          }
        });
        break;
        
      case 'available':
        Object.assign(baseRules, {
          min: { value: 0, message: 'Available quantity must be 0 or greater' },
          validate: (value: any) => !isNaN(Number(value)) || 'Must be a valid number'
        });
        break;
        
      case 'number':
        if (min !== undefined) {
          baseRules.min = { value: min, message: `Must be at least ${min}` };
        }
        if (max !== undefined) {
          baseRules.max = { value: max, message: `Must be at most ${max}` };
        }
        break;
        
      case 'text':
      case 'textarea':
        if (minLength) {
          baseRules.minLength = { value: minLength, message: `Must be at least ${minLength} characters` };
        }
        if (maxLength) {
          baseRules.maxLength = { value: maxLength, message: `Must be at most ${maxLength} characters` };
        }
        break;
    }
    
    return baseRules;
  };

  // Get input props based on field type
  const getInputProps = () => {
    // Special styling for auto-filled fields
    const autoFilledClasses = autoFilled 
      ? 'text-center bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-zinc-400 cursor-not-allowed' 
      : '';
    
    const baseProps = {
      placeholder: placeholder || (autoFilled ? `Auto-filled from ${label} selection` : `Enter ${label.toLowerCase()}`),
      disabled: disabled || readOnly || autoFilled,
      className: autoFilledClasses || className,
      onChange,
      onBlur,
      onFocus,
    };

    switch (type) {
      case 'price':
        return {
          ...baseProps,
          type: 'number',
          step: step || '0.01',
          min: min || '0',
          inputMode: 'decimal' as const,
        };
        
      case 'grade':
        return {
          ...baseProps,
          type: 'number',
          min: '1',
          max: '10',
          step: '1',
          inputMode: 'numeric' as const,
        };
        
      case 'available':
        return {
          ...baseProps,
          type: 'number',
          min: '0',
          step: '1',
          inputMode: 'numeric' as const,
        };
        
      case 'number':
        return {
          ...baseProps,
          type: 'number',
          step: step || '1',
          min: min?.toString(),
          max: max?.toString(),
          inputMode: 'numeric' as const,
        };
        
      case 'email':
        return {
          ...baseProps,
          type: 'email',
          inputMode: 'email' as const,
        };
        
      case 'phone':
        return {
          ...baseProps,
          type: 'tel',
          inputMode: 'tel' as const,
        };
        
      case 'url':
        return {
          ...baseProps,
          type: 'url',
          inputMode: 'url' as const,
        };
        
      case 'password':
        return {
          ...baseProps,
          type: 'password',
        };
        
      case 'date':
        return {
          ...baseProps,
          type: 'date',
        };
        
      case 'search':
        return {
          ...baseProps,
          type: 'search',
        };
        
      case 'file':
        return {
          ...baseProps,
          type: 'file',
          accept,
          multiple,
        };
        
      default:
        return {
          ...baseProps,
          type: 'text',
        };
    }
  };

  const validationRules = getValidationRules();
  const inputProps = getInputProps();

  // Field container with optional description
  const FieldContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={`space-y-1 ${containerClassName}`}>
      {children}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
      )}
    </div>
  );

  // Render different field types
  switch (type) {
    case 'select':
      return (
        <FieldContainer>
          <PokemonSelect
            label={label}
            {...register(name, validationRules)}
            error={error?.message}
            disabled={disabled}
            className={className}
            required={required}
            options={options}
          />
        </FieldContainer>
      );

    case 'textarea':
      return (
        <FieldContainer>
          <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            {...register(name, validationRules)}
            {...inputProps}
            rows={rows}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical"
          />
        </FieldContainer>
      );

    case 'checkbox':
      return (
        <FieldContainer>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              {...register(name, validationRules)}
              disabled={disabled}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
            />
            <span className={`ml-2 text-sm text-gray-700 dark:text-gray-300 ${labelClassName}`}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
          </label>
        </FieldContainer>
      );

    case 'radio':
      return (
        <FieldContainer>
          <fieldset>
            <legend className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </legend>
            <div className="mt-2 space-y-2">
              {options.map((option) => (
                <label key={option.value} className="inline-flex items-center">
                  <input
                    type="radio"
                    {...register(name, validationRules)}
                    value={option.value}
                    disabled={disabled || option.disabled}
                    className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </FieldContainer>
      );

    case 'file':
      return (
        <FieldContainer>
          <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${labelClassName}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            {...register(name, validationRules)}
            {...inputProps}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </FieldContainer>
      );

    // Default: All input types (text, email, number, etc.)
    default:
      return (
        <FieldContainer>
          <PokemonInput
            label={label}
            {...inputProps}
            {...register(name, validationRules)}
            error={error?.message}
            required={required}
            icon={icon}
            prefix={prefix}
            suffix={suffix}
            className={className}
          />
        </FieldContainer>
      );
  }
};

export default FormField;