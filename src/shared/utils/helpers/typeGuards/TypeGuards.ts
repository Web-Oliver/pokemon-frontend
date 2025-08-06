/**
 * Type Guards and Runtime Validation Utilities
 * Layer 1: Core/Foundation - Utility Functions
 *
 * Comprehensive type guards to eliminate unsafe type operations
 * Provides runtime type checking for critical type boundaries
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Type validation and runtime checks only
 * - DRY: Centralized type checking logic
 * - Pure Functions: No side effects, predictable validation
 */

// ============================================================================
// PRIMITIVE TYPE GUARDS
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

// ============================================================================
// FORM AND INPUT TYPE GUARDS
// ============================================================================

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

// ============================================================================
// API AND RESPONSE TYPE GUARDS
// ============================================================================

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

// ============================================================================
// COLLECTION AND ITEM TYPE GUARDS
// ============================================================================

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

// ============================================================================
// COMPLEX OBJECT TYPE GUARDS
// ============================================================================

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

// ============================================================================
// SEARCH AND FILTER TYPE GUARDS
// ============================================================================

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

// ============================================================================
// ERROR HANDLING TYPE GUARDS
// ============================================================================

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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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
