/**
 * Form Validation Utilities
 * Layer 1: Core/Foundation (Utilities)
 *
 * Following CLAUDE.md principles:
 * - DRY: Centralized validation rules and error handling
 * - Single Responsibility: Pure validation logic only
 * - Open/Closed: Extensible validation rules and patterns
 * - Interface Segregation: Specific validation interfaces per form type
 */

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | undefined;
}

export interface FormValidationRules {
  [fieldName: string]: ValidationRule;
}

// Standard validation patterns
export const validationPatterns = {
  price: /^\d+$/,
  cardNumber: /^\d+$/,
  year: /^\d{4}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
} as const;

// Common validation messages
export const validationMessages = {
  required: (fieldName: string) => `${fieldName} is required`,
  min: (fieldName: string, min: number) => `${fieldName} must be at least ${min}`,
  max: (fieldName: string, max: number) => `${fieldName} must be at most ${max}`,
  pattern: (fieldName: string, expected: string) => `${fieldName} must be ${expected}`,
  price: 'Must be a positive whole number',
  cardNumber: 'Must be a valid card number',
  year: 'Must be a valid 4-digit year',
  email: 'Must be a valid email address',
  url: 'Must be a valid URL',
} as const;

// Common validation rules
export const commonValidationRules = {
  price: {
    required: true,
    pattern: validationPatterns.price,
    custom: (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) {
        return validationMessages.price;
      }
      return undefined;
    },
  },
  
  cardNumber: {
    required: true,
    pattern: validationPatterns.cardNumber,
    custom: (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        return validationMessages.cardNumber;
      }
      return undefined;
    },
  },
  
  year: {
    pattern: validationPatterns.year,
    custom: (value: string) => {
      if (!value) return undefined; // Optional field
      const year = parseInt(value, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1990 || year > currentYear + 5) {
        return 'Year must be between 1990 and ' + (currentYear + 5);
      }
      return undefined;
    },
  },
  
  availability: {
    required: true,
    min: 0,
    custom: (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 0) {
        return 'Availability must be a non-negative number';
      }
      return undefined;
    },
  },
  
  grade: {
    required: true,
    min: 1,
    max: 10,
    custom: (value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1 || num > 10) {
        return 'Grade must be between 1 and 10';
      }
      return undefined;
    },
  },
  
  condition: {
    required: true,
    custom: (value: string) => {
      const validConditions = ['NM', 'LP', 'MP', 'HP', 'DMG'];
      if (!validConditions.includes(value)) {
        return 'Must select a valid condition';
      }
      return undefined;
    },
  },
} as const;

// Form-specific validation rule sets
export const formValidationRules = {
  sealedProduct: {
    setName: { required: true },
    productName: { required: true },
    category: { required: true },
    availability: commonValidationRules.availability,
    cardMarketPrice: commonValidationRules.price,
    myPrice: commonValidationRules.price,
    dateAdded: { required: true },
  } as FormValidationRules,
  
  psaCard: {
    setName: { required: true },
    cardName: { required: true },
    cardNumber: commonValidationRules.cardNumber,
    grade: commonValidationRules.grade,
    myPrice: commonValidationRules.price,
    dateAdded: { required: true },
  } as FormValidationRules,
  
  rawCard: {
    setName: { required: true },
    cardName: { required: true },
    cardNumber: commonValidationRules.cardNumber,
    condition: commonValidationRules.condition,
    myPrice: commonValidationRules.price,
    dateAdded: { required: true },
  } as FormValidationRules,
  
  auction: {
    topText: { required: true },
    bottomText: { required: true },
    auctionDate: { required: true },
  } as FormValidationRules,
} as const;

/**
 * Validate a single field value against a validation rule
 */
export const validateField = (value: string, rule: ValidationRule, fieldName: string): string | undefined => {
  // Required validation
  if (rule.required && (!value || value.trim() === '')) {
    return validationMessages.required(fieldName);
  }
  
  // Skip other validations if field is empty and not required
  if (!value || value.trim() === '') {
    return undefined;
  }
  
  // Min validation
  if (rule.min !== undefined) {
    const num = parseFloat(value);
    if (isNaN(num) || num < rule.min) {
      return validationMessages.min(fieldName, rule.min);
    }
  }
  
  // Max validation
  if (rule.max !== undefined) {
    const num = parseFloat(value);
    if (isNaN(num) || num > rule.max) {
      return validationMessages.max(fieldName, rule.max);
    }
  }
  
  // Pattern validation
  if (rule.pattern && !rule.pattern.test(value)) {
    return validationMessages.pattern(fieldName, 'in the correct format');
  }
  
  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }
  
  return undefined;
};

/**
 * Validate all fields in a form data object
 */
export const validateForm = (formData: Record<string, string>, rules: FormValidationRules): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  Object.entries(rules).forEach(([fieldName, rule]) => {
    const value = formData[fieldName] || '';
    const error = validateField(value, rule, fieldName);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};

/**
 * React Hook Form compatible validation function generator
 */
export const createRHFValidation = (rule: ValidationRule, fieldName: string) => ({
  required: rule.required ? validationMessages.required(fieldName) : undefined,
  min: rule.min ? { value: rule.min, message: validationMessages.min(fieldName, rule.min) } : undefined,
  max: rule.max ? { value: rule.max, message: validationMessages.max(fieldName, rule.max) } : undefined,
  pattern: rule.pattern ? { value: rule.pattern, message: validationMessages.pattern(fieldName, 'in the correct format') } : undefined,
  validate: rule.custom ? rule.custom : undefined,
});

/**
 * Get standardized error display component props
 */
export const getErrorDisplayProps = (error?: string) => ({
  error,
  'aria-invalid': error ? 'true' : 'false',
  'aria-describedby': error ? `${Math.random().toString(36).substr(2, 9)}-error` : undefined,
});