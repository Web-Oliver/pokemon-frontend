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
// RE-EXPORTS FROM EXISTING VALIDATION FILES
// ============================================================================

// Form validation utilities
export * from './formValidation';

// Runtime validation utilities (will be moved here in subsequent tasks)
export {
  ValidationError,
  validateCardFormData,
  validateAuctionFormData,
  validateApiResponse,
  validateCollectionItem,
  validateSearchParams,
  safeString,
  safeNumber,
  safeBoolean,
  safeArray,
  safeProperty,
  sanitizeUserInput,
  validateFileUpload,
  createStrictValidator,
  validateBulkData,
  type ValidationResult,
} from '../helpers/validation/RuntimeValidator';

// Type guards (will be moved here in subsequent tasks)  
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
} from '../helpers/typeGuards/TypeGuards';

// ============================================================================
// CONSOLIDATED VALIDATION INTERFACE (Future)
// ============================================================================

/**
 * Central validation registry interface
 * Will be implemented in subsequent consolidation tasks
 */
export interface ValidationRegistry {
  // Form validators
  validateCardForm: typeof validateCardFormData;
  validateAuctionForm: typeof validateAuctionFormData;
  
  // Data validators  
  validateApiResponse: typeof validateApiResponse;
  validateCollectionItem: typeof validateCollectionItem;
  validateSearchParams: typeof validateSearchParams;
  
  // Type validators
  validateFile: typeof validateFileUpload;
  validateBulk: typeof validateBulkData;
  
  // Safe extractors
  safeString: typeof safeString;
  safeNumber: typeof safeNumber;
  safeBoolean: typeof safeBoolean;
  safeArray: typeof safeArray;
}

// ============================================================================
// EXPORT ORGANIZATION
// ============================================================================

// Default export providing validation registry (future implementation)
// export const validation: ValidationRegistry = {
//   // Will be implemented when consolidation is complete
// };