/**
 * Form Types
 * Layer 1: Core/Foundation - Type Definitions
 *
 * Comprehensive type definitions for forms eliminating 'any' usage
 * Provides type safety for form field values, validation, and handlers
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Form-related type definitions only
 * - Interface Segregation: Specific interfaces for different form concerns
 * - Dependency Inversion: Abstract form contracts for type safety
 */

import {
  FieldErrors,
  UseFormSetValue,
  UseFormClearErrors,
  UseFormWatch,
} from 'react-hook-form';

/**
 * Generic Form Field Value Types
 * Union type covering all possible form field values
 */
export type FormFieldValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | number[]
  | File
  | File[];

/**
 * Form Data Record
 * Generic interface for form data objects
 */
export interface FormDataRecord {
  [key: string]: FormFieldValue;
}

/**
 * Type-safe Form Handlers
 * Eliminates 'any' usage in form handling functions
 */
export interface TypeSafeFormHandlers<
  T extends FormDataRecord = FormDataRecord,
> {
  setValue: UseFormSetValue<T>;
  clearErrors: UseFormClearErrors<T>;
  watch: UseFormWatch<T>;
  errors: FieldErrors<T>;
}

/**
 * Selection Change Handler
 * Type-safe callback for handling form value selections
 */
export type SelectionChangeHandler<T = unknown> = (selectedData: T) => void;

/**
 * Form Submission Handler
 * Type-safe callback for form submission
 */
export type FormSubmissionHandler<T extends FormDataRecord = FormDataRecord> = (
  data: T
) => Promise<void> | void;

/**
 * Form Validation Handler
 * Type-safe callback for form validation
 */
export type FormValidationHandler<T extends FormDataRecord = FormDataRecord> = (
  data: T
) => boolean | string | Promise<boolean | string>;

/**
 * Card Form Data Interface
 * Specific form data structure for card forms
 */
export interface CardFormData extends FormDataRecord {
  setName: string;
  cardName: string;
  grade?: number;
  condition?: string;
  myPrice: number;
  images?: File[];
  dateAdded?: string;
  sold?: boolean;
  saleDetails?: SaleDetailsFormData;
}

/**
 * Product Form Data Interface
 * Specific form data structure for product forms
 */
export interface ProductFormData extends FormDataRecord {
  setName: string;
  productName: string;
  category: string;
  myPrice: number;
  images?: File[];
  dateAdded?: string;
  sold?: boolean;
  saleDetails?: SaleDetailsFormData;
}

/**
 * Auction Form Data Interface
 * Specific form data structure for auction forms
 */
export interface AuctionFormData extends FormDataRecord {
  topText: string;
  bottomText: string;
  auctionDate: string;
  status: 'draft' | 'active' | 'sold' | 'expired';
  items: AuctionItemFormData[];
}

/**
 * Auction Item Form Data Interface
 * Specific form data structure for auction items
 */
export interface AuctionItemFormData extends FormDataRecord {
  itemCategory: 'psa' | 'raw' | 'sealed';
  itemId: string;
  startingPrice: number;
  reservePrice?: number;
}

/**
 * Sale Details Form Data Interface
 * Specific form data structure for sale details
 */
export interface SaleDetailsFormData extends FormDataRecord {
  price: number;
  buyer: string;
  date: string;
  platform: string;
  paymentMethod?: string;
  shippingMethod?: string;
  trackingNumber?: string;
}

/**
 * Search Form Data Interface
 * Specific form data structure for search forms
 */
export interface SearchFormData extends FormDataRecord {
  query: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: string;
  grade?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter Form Data Interface
 * Specific form data structure for filter forms
 */
export interface FilterFormData extends FormDataRecord {
  type?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

// ============================================================================
// TYPE GUARDS FOR RUNTIME VALIDATION
// ============================================================================

/**
 * Type guard to check if value is a valid form field value
 */
export function isFormFieldValue(value: unknown): value is FormFieldValue {
  if (value === null || value === undefined) return true;

  const type = typeof value;
  if (type === 'string' || type === 'number' || type === 'boolean') return true;

  if (Array.isArray(value)) {
    return value.every(
      (item) => typeof item === 'string' || typeof item === 'number'
    );
  }

  if (value instanceof File) return true;

  return false;
}

/**
 * Type guard to check if object is a valid form data record
 */
export function isFormDataRecord(value: unknown): value is FormDataRecord {
  if (!value || typeof value !== 'object') return false;

  const record = value as Record<string, unknown>;
  return Object.values(record).every(isFormFieldValue);
}

/**
 * Type guard to check if data is card form data
 */
export function isCardFormData(data: FormDataRecord): data is CardFormData {
  return (
    typeof data.setName === 'string' &&
    typeof data.cardName === 'string' &&
    typeof data.myPrice === 'number'
  );
}

/**
 * Type guard to check if data is product form data
 */
export function isProductFormData(
  data: FormDataRecord
): data is ProductFormData {
  return (
    typeof data.setName === 'string' &&
    typeof data.productName === 'string' &&
    typeof data.category === 'string' &&
    typeof data.myPrice === 'number'
  );
}

/**
 * Type guard to check if data is auction form data
 */
export function isAuctionFormData(
  data: FormDataRecord
): data is AuctionFormData {
  return (
    typeof data.topText === 'string' &&
    typeof data.bottomText === 'string' &&
    typeof data.auctionDate === 'string' &&
    Array.isArray(data.items)
  );
}

// ============================================================================
// FORM UTILITIES
// ============================================================================

/**
 * Extract form field names as typed keys
 */
export type FormFieldKeys<T extends FormDataRecord> = keyof T;

/**
 * Get form field type for a specific key
 */
export type FormFieldType<T extends FormDataRecord, K extends keyof T> = T[K];

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Form submission result
 */
export interface FormSubmissionResult {
  success: boolean;
  data?: FormDataRecord;
  error?: string;
}
