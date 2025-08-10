/**
 * Validation Utilities - Consolidated Entry Point
 * Following CLAUDE.md SOLID and DRY principles
 *
 * Single Responsibility: Central validation functions for the entire application
 * Open/Closed: Extensible without modification
 * Dependency Inversion: Uses abstractions for validation logic
 * Don't Repeat Yourself: Single source of truth for all validation
 */

// ============================================================================
// FORM VALIDATION UTILITIES (Consolidated from formValidation.ts)
// ============================================================================

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
  min: (fieldName: string, min: number) =>
    `${fieldName} must be at least ${min}`,
  max: (fieldName: string, max: number) =>
    `${fieldName} must be at most ${max}`,
  pattern: (fieldName: string, expected: string) =>
    `${fieldName} must be ${expected}`,
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
      if (!value) {
        return undefined;
      } // Optional field
      const year = parseInt(value, 10);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1990 || year > currentYear + 5) {
        return `Year must be between 1990 and ${currentYear + 5}`;
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
export const validateField = (
  value: string,
  rule: ValidationRule,
  fieldName: string
): string | undefined => {
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
export const validateForm = (
  formData: Record<string, string>,
  rules: FormValidationRules
): Record<string, string> => {
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
export const createRHFValidation = (
  rule: ValidationRule,
  fieldName: string
) => ({
  required: rule.required ? validationMessages.required(fieldName) : undefined,
  min: rule.min
    ? { value: rule.min, message: validationMessages.min(fieldName, rule.min) }
    : undefined,
  max: rule.max
    ? { value: rule.max, message: validationMessages.max(fieldName, rule.max) }
    : undefined,
  pattern: rule.pattern
    ? {
        value: rule.pattern,
        message: validationMessages.pattern(fieldName, 'in the correct format'),
      }
    : undefined,
  validate: rule.custom ? rule.custom : undefined,
});

/**
 * Get standardized error display component props
 */
export const getErrorDisplayProps = (error?: string) => ({
  error,
  'aria-invalid': error ? 'true' : 'false',
  'aria-describedby': error
    ? `${Math.random().toString(36).substr(2, 9)}-error`
    : undefined,
});

// ============================================================================
// TYPE GUARDS (Consolidated from TypeGuards.ts)
// ============================================================================

/**
 * Type guard to check if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Type guard to check if value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isNumber(value) && value > 0;
}

/**
 * Type guard to check if value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard to check if value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if value is a non-empty array
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard to check if value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Type guard to check if value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard to check if value is a File
 */
export function isFile(value: unknown): value is File {
  return value instanceof File;
}

/**
 * Type guard to check if value is an array of Files
 */
export function isFileArray(value: unknown): value is File[] {
  return Array.isArray(value) && value.every((item) => item instanceof File);
}

/**
 * Type guard to check if value is a valid email
 */
export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Type guard to check if value is a valid URL
 */
export function isValidUrl(value: unknown): value is string {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Type guard to check if value is a valid date string
 */
export function isValidDateString(value: unknown): value is string {
  if (!isString(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Type guard to check if response has success property
 */
export function hasSuccessProperty(
  value: unknown
): value is { success: boolean } {
  return isObject(value) && typeof value.success === 'boolean';
}

/**
 * Type guard to check if response has data property
 */
export function hasDataProperty<T = unknown>(
  value: unknown
): value is { data: T } {
  return isObject(value) && 'data' in value;
}

/**
 * Type guard to check if response has error property
 */
export function hasErrorProperty(value: unknown): value is { error: unknown } {
  return isObject(value) && 'error' in value;
}

/**
 * Type guard to check if value is a valid API response structure
 */
export function isApiResponse(
  value: unknown
): value is { success: boolean; data?: unknown; error?: unknown } {
  return (
    hasSuccessProperty(value) &&
    (hasDataProperty(value) || hasErrorProperty(value))
  );
}

/**
 * Type guard to check if value is a valid ID (string or number)
 */
export function isValidId(value: unknown): value is string | number {
  if (isString(value)) return value.trim().length > 0;
  if (isNumber(value)) return value > 0;
  return false;
}

/**
 * Type guard to check if value is a valid card type
 */
export function isCardType(value: unknown): value is 'psa' | 'raw' {
  return value === 'psa' || value === 'raw';
}

/**
 * Type guard to check if value is a valid item category
 */
export function isItemCategory(
  value: unknown
): value is 'psa' | 'raw' | 'sealed' {
  return value === 'psa' || value === 'raw' || value === 'sealed';
}

/**
 * Type guard to check if value is a valid auction status
 */
export function isAuctionStatus(
  value: unknown
): value is 'draft' | 'active' | 'sold' | 'expired' {
  return (
    value === 'draft' ||
    value === 'active' ||
    value === 'sold' ||
    value === 'expired'
  );
}

/**
 * Type guard to check if value is a price history entry
 */
export function isPriceHistoryEntry(
  value: unknown
): value is { price: number; dateUpdated: string } {
  return (
    isObject(value) &&
    isPositiveNumber(value.price) &&
    isValidDateString(value.dateUpdated)
  );
}

/**
 * Type guard to check if value is a sale details object
 */
export function isSaleDetails(value: unknown): value is {
  price: number;
  buyer: string;
  date: string;
  platform: string;
} {
  return (
    isObject(value) &&
    isPositiveNumber(value.price) &&
    isNonEmptyString(value.buyer) &&
    isValidDateString(value.date) &&
    isNonEmptyString(value.platform)
  );
}

/**
 * Type guard to check if value is a card object
 */
export function isCard(value: unknown): value is {
  _id: string;
  cardId: string;
  grade?: number;
  condition?: string;
  myPrice: number;
  sold: boolean;
} {
  return (
    isObject(value) &&
    isNonEmptyString(value._id) &&
    isNonEmptyString(value.cardId) &&
    isPositiveNumber(value.myPrice) &&
    isBoolean(value.sold)
  );
}

/**
 * Type guard to check if value is an auction object
 */
export function isAuction(value: unknown): value is {
  _id: string;
  topText: string;
  bottomText: string;
  status: string;
  items: unknown[];
} {
  return (
    isObject(value) &&
    isNonEmptyString(value._id) &&
    isNonEmptyString(value.topText) &&
    isNonEmptyString(value.bottomText) &&
    isNonEmptyString(value.status) &&
    isArray(value.items)
  );
}

/**
 * Type guard to check if value is a search result
 */
export function isSearchResult(value: unknown): value is {
  id: string;
  name: string;
  category?: string;
} {
  return (
    isObject(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name)
  );
}

/**
 * Type guard to check if value is a valid filter object
 */
export function isFilter(value: unknown): value is Record<string, unknown> {
  return isObject(value) && Object.keys(value).length > 0;
}

/**
 * Type guard to check if error is an Error instance
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Type guard to check if error has a message property
 */
export function hasErrorMessage(value: unknown): value is { message: string } {
  return isObject(value) && isString(value.message);
}

/**
 * Type guard to check if error has a code property
 */
export function hasErrorCode(
  value: unknown
): value is { code: string | number } {
  return isObject(value) && (isString(value.code) || isNumber(value.code));
}

/**
 * Assert that a value matches a type guard, throwing if not
 */
export function assertType<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
  errorMessage = 'Type assertion failed'
): asserts value is T {
  if (!guard(value)) {
    throw new Error(errorMessage);
  }
}

/**
 * Safe cast with type guard validation
 */
export function safeCast<T>(
  value: unknown,
  guard: (value: unknown) => value is T
): T | null {
  return guard(value) ? value : null;
}

/**
 * Create a type guard for arrays of a specific type
 */
export function createArrayGuard<T>(
  itemGuard: (value: unknown) => value is T
): (value: unknown) => value is T[] {
  return (value): value is T[] => {
    return Array.isArray(value) && value.every(itemGuard);
  };
}

/**
 * Create a type guard for objects with specific properties
 */
export function createObjectGuard<
  T extends Record<string, unknown>,
>(propertyGuards: { [K in keyof T]: (value: unknown) => value is T[K] }): (
  value: unknown
) => value is T {
  return (value): value is T => {
    if (!isObject(value)) return false;

    for (const [key, guard] of Object.entries(propertyGuards)) {
      if (!guard(value[key])) return false;
    }

    return true;
  };
}

// ============================================================================
// RUNTIME VALIDATION UTILITIES (Consolidated from RuntimeValidator.ts)
// ============================================================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

// ============================================================================
// FORM DATA VALIDATORS
// ============================================================================

/**
 * Validate card form data
 */
export function validateCardFormData(data: unknown): ValidationResult<{
  setName: string;
  cardName: string;
  myPrice: number;
  grade?: number;
  condition?: string;
}> {
  const errors: string[] = [];

  if (!isObject(data)) {
    return { success: false, errors: ['Data must be an object'] };
  }

  // Required fields validation
  if (!isNonEmptyString(data.setName)) {
    errors.push('Set name is required and must be a non-empty string');
  }

  if (!isNonEmptyString(data.cardName)) {
    errors.push('Card name is required and must be a non-empty string');
  }

  if (!isPositiveNumber(data.myPrice)) {
    errors.push('Price is required and must be a positive number');
  }

  // Optional fields validation
  if (
    data.grade !== undefined &&
    (!isNumber(data.grade) || data.grade < 1 || data.grade > 10)
  ) {
    errors.push('Grade must be a number between 1 and 10');
  }

  if (data.condition !== undefined && !isString(data.condition)) {
    errors.push('Condition must be a string');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      setName: data.setName as string,
      cardName: data.cardName as string,
      myPrice: data.myPrice as number,
      grade: data.grade as number | undefined,
      condition: data.condition as string | undefined,
    },
  };
}

/**
 * Validate auction form data
 */
export function validateAuctionFormData(data: unknown): ValidationResult<{
  topText: string;
  bottomText: string;
  auctionDate: string;
  status: 'draft' | 'active' | 'sold' | 'expired';
  items: unknown[];
}> {
  const errors: string[] = [];

  if (!isObject(data)) {
    return { success: false, errors: ['Data must be an object'] };
  }

  // Required fields validation
  if (!isNonEmptyString(data.topText)) {
    errors.push('Top text is required');
  }

  if (!isNonEmptyString(data.bottomText)) {
    errors.push('Bottom text is required');
  }

  if (!isNonEmptyString(data.auctionDate)) {
    errors.push('Auction date is required');
  }

  if (!isAuctionStatus(data.status)) {
    errors.push('Status must be one of: draft, active, sold, expired');
  }

  if (!isArray(data.items)) {
    errors.push('Items must be an array');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      topText: data.topText as string,
      bottomText: data.bottomText as string,
      auctionDate: data.auctionDate as string,
      status: data.status as 'draft' | 'active' | 'sold' | 'expired',
      items: data.items as unknown[],
    },
  };
}

// ============================================================================
// API RESPONSE VALIDATORS
// ============================================================================

/**
 * Validate API response structure
 */
export function validateApiResponse<T>(
  data: unknown,
  dataValidator?: (data: unknown) => ValidationResult<T>
): ValidationResult<{ success: boolean; data?: T; error?: string }> {
  const errors: string[] = [];

  if (!isObject(data)) {
    return { success: false, errors: ['Response must be an object'] };
  }

  if (!isBoolean(data.success)) {
    errors.push('Response must have a boolean success property');
  }

  // If success is true, validate data
  if (data.success === true) {
    if (!('data' in data)) {
      errors.push('Successful response must have a data property');
    } else if (dataValidator) {
      const dataValidation = dataValidator(data.data);
      if (!dataValidation.success) {
        errors.push(...dataValidation.errors);
      }
    }
  }

  // If success is false, check for error
  if (data.success === false && !('error' in data)) {
    errors.push('Failed response should have an error property');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: data as { success: boolean; data?: T; error?: string },
  };
}

/**
 * Validate collection item structure
 */
export function validateCollectionItem(data: unknown): ValidationResult<{
  _id: string;
  itemType: 'psa' | 'raw' | 'sealed';
  myPrice: number;
  sold: boolean;
}> {
  const errors: string[] = [];

  if (!isObject(data)) {
    return { success: false, errors: ['Item must be an object'] };
  }

  // Required fields validation
  if (!isValidId(data._id)) {
    errors.push('Item must have a valid _id');
  }

  if (!isItemCategory(data.itemType)) {
    errors.push('Item must have a valid itemType (psa, raw, or sealed)');
  }

  if (!isPositiveNumber(data.myPrice)) {
    errors.push('Item must have a positive price');
  }

  if (!isBoolean(data.sold)) {
    errors.push('Item must have a boolean sold property');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      _id: data._id as string,
      itemType: data.itemType as 'psa' | 'raw' | 'sealed',
      myPrice: data.myPrice as number,
      sold: data.sold as boolean,
    },
  };
}

// ============================================================================
// SEARCH AND FILTER VALIDATORS
// ============================================================================

/**
 * Validate search query parameters
 */
export function validateSearchParams(data: unknown): ValidationResult<{
  query?: string;
  category?: string;
  limit?: number;
  offset?: number;
}> {
  const errors: string[] = [];

  if (!isObject(data)) {
    return { success: false, errors: ['Search params must be an object'] };
  }

  // Optional field validation
  if (data.query !== undefined && !isString(data.query)) {
    errors.push('Query must be a string');
  }

  if (data.category !== undefined && !isString(data.category)) {
    errors.push('Category must be a string');
  }

  if (data.limit !== undefined && (!isNumber(data.limit) || data.limit < 1)) {
    errors.push('Limit must be a positive number');
  }

  if (
    data.offset !== undefined &&
    (!isNumber(data.offset) || data.offset < 0)
  ) {
    errors.push('Offset must be a non-negative number');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      query: data.query as string | undefined,
      category: data.category as string | undefined,
      limit: data.limit as number | undefined,
      offset: data.offset as number | undefined,
    },
  };
}

// ============================================================================
// SAFE DATA TRANSFORMERS
// ============================================================================

/**
 * Safely extract string from unknown value
 */
export function safeString(value: unknown, fallback = ''): string {
  return safeCast(value, isString) ?? fallback;
}

/**
 * Safely extract number from unknown value
 */
export function safeNumber(value: unknown, fallback = 0): number {
  return safeCast(value, isNumber) ?? fallback;
}

/**
 * Safely extract boolean from unknown value
 */
export function safeBoolean(value: unknown, fallback = false): boolean {
  return safeCast(value, isBoolean) ?? fallback;
}

/**
 * Safely extract array from unknown value
 */
export function safeArray<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T,
  fallback: T[] = []
): T[] {
  if (!isArray(value)) return fallback;

  const validItems = value.filter(itemValidator);
  return validItems.length === value.length ? validItems : fallback;
}

/**
 * Safely extract object property
 */
export function safeProperty<T>(
  obj: unknown,
  key: string,
  validator: (value: unknown) => value is T,
  fallback?: T
): T | undefined {
  if (!isObject(obj) || !(key in obj)) {
    return fallback;
  }

  return safeCast(obj[key], validator) ?? fallback;
}

// ============================================================================
// PRODUCTION SAFETY VALIDATORS
// ============================================================================

/**
 * Validate and sanitize user input for safe processing
 */
export function sanitizeUserInput(input: unknown): string {
  if (!isString(input)) {
    return '';
  }

  // Remove potentially dangerous characters and limit length
  return input
    .replace(/[<>'"&]/g, '') // Remove basic HTML/script injection characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .slice(0, 1000); // Reasonable length limit
}

/**
 * Validate file upload data
 */
export function validateFileUpload(file: unknown): ValidationResult<{
  name: string;
  size: number;
  type: string;
}> {
  const errors: string[] = [];

  if (!(file instanceof File)) {
    return { success: false, errors: ['Must be a File object'] };
  }

  if (!file.name || file.name.length === 0) {
    errors.push('File must have a name');
  }

  if (file.size <= 0) {
    errors.push('File must have a positive size');
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB limit
    errors.push('File size must be less than 10MB');
  }

  if (!file.type || !file.type.startsWith('image/')) {
    errors.push('File must be an image');
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      name: file.name,
      size: file.size,
      type: file.type,
    },
  };
}

/**
 * Create a validator that throws on failure
 */
export function createStrictValidator<T>(
  validator: (data: unknown) => ValidationResult<T>
): (data: unknown) => T {
  return (data: unknown): T => {
    const result = validator(data);
    if (!result.success) {
      throw new ValidationError(
        `Validation failed: ${result.errors.join(', ')}`,
        undefined,
        data
      );
    }
    return result.data!;
  };
}

// ============================================================================
// ENHANCED VALIDATION UTILITIES (Complex Validation Support)
// ============================================================================

/**
 * Enhanced validation context for complex validation scenarios
 */
export interface ValidationContext {
  formData?: Record<string, unknown>;
  dependencies?: string[];
  async?: boolean;

  [key: string]: unknown;
}

/**
 * Enhanced validation rule with context support
 */
export interface EnhancedValidationRule extends ValidationRule {
  /** Cross-field validation */
  dependsOn?: string[];
  /** Async validation function */
  asyncValidator?: (
    value: string,
    context: ValidationContext
  ) => Promise<string | undefined>;
  /** Complex validation with context */
  complexValidator?: (
    value: string,
    context: ValidationContext
  ) => string | undefined;
  /** Debounce delay for async validation */
  debounceMs?: number;
}

/**
 * Complex validation patterns for business logic
 */
export const complexValidationPatterns = {
  // Card specific validations
  cardGradeRange: (grade: string, cardType: string): string | undefined => {
    const gradeNum = parseInt(grade, 10);
    if (cardType === 'psa' && (gradeNum < 1 || gradeNum > 10)) {
      return 'PSA grade must be between 1 and 10';
    }
    if (cardType === 'bgs' && (gradeNum < 1 || gradeNum > 10)) {
      return 'BGS grade must be between 1 and 10';
    }
    return undefined;
  },

  // Price validation with market context
  priceReasonability: (
    price: string,
    marketPrice?: string
  ): string | undefined => {
    const priceNum = parseFloat(price);
    const marketPriceNum = marketPrice ? parseFloat(marketPrice) : null;

    if (marketPriceNum && priceNum > marketPriceNum * 10) {
      return 'Price seems unusually high compared to market price';
    }
    if (priceNum > 100000) {
      return 'Price exceeds reasonable limits';
    }
    return undefined;
  },

  // Date validation with business rules
  dateWithinRange: (
    date: string,
    minDate?: string,
    maxDate?: string
  ): string | undefined => {
    const dateObj = new Date(date);
    const now = new Date();

    if (dateObj > now) {
      return 'Date cannot be in the future';
    }

    if (minDate && dateObj < new Date(minDate)) {
      return `Date must be after ${minDate}`;
    }

    if (maxDate && dateObj > new Date(maxDate)) {
      return `Date must be before ${maxDate}`;
    }

    return undefined;
  },

  // Uniqueness validation
  uniquenessCheck: (
    value: string,
    existingValues: string[]
  ): string | undefined => {
    if (existingValues.includes(value.trim())) {
      return 'This value already exists';
    }
    return undefined;
  },
} as const;

/**
 * Complex validation rules for specific business scenarios
 */
export const complexValidationRules = {
  psaCardWithGrade: {
    setName: { required: true },
    cardName: { required: true },
    cardNumber: commonValidationRules.cardNumber,
    grade: {
      ...commonValidationRules.grade,
      complexValidator: (value: string, context: ValidationContext) => {
        const cardType = context.formData?.cardType as string;
        return complexValidationPatterns.cardGradeRange(
          value,
          cardType || 'psa'
        );
      },
    },
    myPrice: {
      ...commonValidationRules.price,
      dependsOn: ['cardMarketPrice'],
      complexValidator: (value: string, context: ValidationContext) => {
        const marketPrice = context.formData?.cardMarketPrice as string;
        return complexValidationPatterns.priceReasonability(value, marketPrice);
      },
    },
    dateAdded: {
      required: true,
      complexValidator: (value: string) => {
        return complexValidationPatterns.dateWithinRange(value, '2000-01-01');
      },
    },
  } as Record<string, EnhancedValidationRule>,

  auctionWithItems: {
    topText: { required: true, min: 10, max: 500 },
    bottomText: { required: true, min: 10, max: 500 },
    auctionDate: {
      required: true,
      complexValidator: (value: string) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return complexValidationPatterns.dateWithinRange(
          value,
          tomorrow.toISOString().split('T')[0]
        );
      },
    },
    items: {
      required: true,
      custom: (value: string) => {
        try {
          const items = JSON.parse(value);
          if (!Array.isArray(items) || items.length === 0) {
            return 'At least one item must be added to the auction';
          }
          if (items.length > 50) {
            return 'Maximum 50 items allowed per auction';
          }
        } catch {
          return 'Invalid items data';
        }
        return undefined;
      },
    },
  } as Record<string, EnhancedValidationRule>,
} as const;

/**
 * Validate field with enhanced rules including context
 */
export const validateEnhancedField = (
  value: string,
  rule: EnhancedValidationRule,
  fieldName: string,
  context: ValidationContext = {}
): string | undefined => {
  // Run basic validation first
  const basicError = validateField(value, rule, fieldName);
  if (basicError) return basicError;

  // Run complex validation with context
  if (rule.complexValidator) {
    const complexError = rule.complexValidator(value, context);
    if (complexError) return complexError;
  }

  return undefined;
};

/**
 * Async field validation
 */
export const validateFieldAsync = async (
  value: string,
  rule: EnhancedValidationRule,
  fieldName: string,
  context: ValidationContext = {}
): Promise<string | undefined> => {
  // Run synchronous validation first
  const syncError = validateEnhancedField(value, rule, fieldName, context);
  if (syncError) return syncError;

  // Run async validation if present
  if (rule.asyncValidator) {
    try {
      return await rule.asyncValidator(value, context);
    } catch (error) {
      return `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  return undefined;
};

/**
 * Cross-field validation for dependent fields
 */
export const validateCrossField = (
  formData: Record<string, string>,
  fieldName: string,
  rule: EnhancedValidationRule,
  allRules: Record<string, EnhancedValidationRule>
): string | undefined => {
  if (!rule.dependsOn || rule.dependsOn.length === 0) {
    return undefined;
  }

  const context: ValidationContext = {
    formData,
    dependencies: rule.dependsOn,
  };

  const fieldValue = formData[fieldName] || '';
  return validateEnhancedField(fieldValue, rule, fieldName, context);
};

/**
 * Input sanitization functions
 */
export const sanitizers = {
  /** Remove extra whitespace and normalize */
  normalizeText: (input: string): string => {
    return input.replace(/\s+/g, ' ').trim();
  },

  /** Remove non-numeric characters but keep decimal point */
  numericOnly: (input: string): string => {
    return input.replace(/[^\d.]/g, '');
  },

  /** Remove non-alphanumeric characters */
  alphanumericOnly: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9]/g, '');
  },

  /** Convert to title case */
  toTitleCase: (input: string): string => {
    return input.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  /** Format price input */
  formatPrice: (input: string): string => {
    const numericValue = sanitizers.numericOnly(input);
    return numericValue ? parseFloat(numericValue).toString() : '';
  },

  /** Format date input */
  formatDate: (input: string): string => {
    // Basic date formatting - could be enhanced based on needs
    return input.replace(/[^0-9-]/g, '');
  },
} as const;

/**
 * Enhanced validation messages with context
 */
export const enhancedValidationMessages = {
  ...validationMessages,

  crossFieldError: (fieldName: string, dependentField: string) =>
    `${fieldName} is invalid based on ${dependentField}`,

  asyncValidationError: (fieldName: string) =>
    `${fieldName} validation is in progress`,

  businessRuleViolation: (rule: string) => `Business rule violation: ${rule}`,

  complexValidationFailed: (fieldName: string, reason: string) =>
    `${fieldName} validation failed: ${reason}`,
} as const;

// ============================================================================
// BULK VALIDATION UTILITIES
// ============================================================================

/**
 * Validate multiple items with detailed error reporting
 */
export function validateBulkData<T>(
  items: unknown[],
  validator: (item: unknown) => ValidationResult<T>
): {
  validItems: T[];
  invalidItems: Array<{ index: number; errors: string[] }>;
  overallSuccess: boolean;
} {
  const validItems: T[] = [];
  const invalidItems: Array<{ index: number; errors: string[] }> = [];

  items.forEach((item, index) => {
    const result = validator(item);
    if (result.success) {
      validItems.push(result.data!);
    } else {
      invalidItems.push({ index, errors: result.errors });
    }
  });

  return {
    validItems,
    invalidItems,
    overallSuccess: invalidItems.length === 0,
  };
}
