/**
 * Validation Utilities - Consolidated Entry Point
 * Following CLAUDE.md SOLID and DRY principles
 * 
 * Single Responsibility: Central validation functions for the entire application
 * Open/Closed: Extensible without modification
 * Dependency Inversion: Uses abstractions for validation logic
 * Don't Repeat Yourself: Single source of truth for all validation
 */

// Import type guards from external location (will be consolidated later)
import {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isNonEmptyString,
  isPositiveNumber,
  isValidId,
  isItemCategory,
  isAuctionStatus,
  safeCast,
  createArrayGuard,
  createObjectGuard,
} from '../helpers/typeGuards/TypeGuards';

// ============================================================================
// RE-EXPORTS FROM EXISTING FILES
// ============================================================================

// Form validation utilities
export * from './formValidation';

// Re-export type guards (will be moved here in subsequent tasks)  
export {
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isNonEmptyString,
  isPositiveNumber,
  isValidId,
  isItemCategory,
  isAuctionStatus,
  safeCast,
  createArrayGuard,
  createObjectGuard,
};

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