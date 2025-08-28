/**
 * Unified API Response Types
 * Layer 1: Core/Foundation - Type Definitions
 *
 * SOLID-compliant API response types to eliminate LSP violations
 * Replaces scattered 'any' types with type-safe response patterns
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: API response type definitions only
 * - Liskov Substitution: All response types are substitutable
 * - Interface Segregation: Specific interfaces for different response patterns
 * - Dependency Inversion: Abstract response contracts for type safety
 */

/**
 * Base API Response Structure
 * All API responses must conform to this interface (LSP compliance)
 */
export interface BaseApiResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

/**
 * Success Response with Data
 * Generic type-safe wrapper for successful API responses
 */
export interface ApiSuccessResponse<T = unknown> extends BaseApiResponse {
  success: true;
  data: T;
  meta?: ResponseMetadata;
}

/**
 * Error Response Structure
 * Standardized error response format
 */
export interface ApiErrorResponse extends BaseApiResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string; // Only in development
  };
}

/**
 * Unified API Response Type
 * LSP-compliant union type for all API responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Paginated Response Structure
 * For endpoints that return paginated data
 */
export interface PaginatedResponse<T> extends BaseApiResponse {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Collection Response Structure
 * For endpoints that return arrays of data
 */
export interface CollectionResponse<T> extends BaseApiResponse {
  success: true;
  data: T[];
  count: number;
  meta?: ResponseMetadata;
}

/**
 * Resource Response Structure
 * For single resource endpoints (CRUD operations)
 */
export interface ResourceResponse<T> extends BaseApiResponse {
  success: true;
  data: T;
  meta?: ResponseMetadata;
}

/**
 * Response Metadata
 * Optional metadata for API responses
 */
export interface ResponseMetadata {
  version?: string;
  cached?: boolean;
  cacheExpiry?: string;
  processingTime?: number;
  source?: string;
  warnings?: string[];
}

/**
 * File Upload Response
 * Specialized response for file upload operations
 */
export interface FileUploadResponse extends BaseApiResponse {
  success: true;
  data: {
    url: string;
    filename: string;
    size: number;
    contentType: string;
    uploadId?: string;
  };
}

/**
 * Bulk Operation Response
 * For operations affecting multiple resources
 */
export interface BulkOperationResponse<T = unknown> extends BaseApiResponse {
  success: true;
  data: {
    successful: T[];
    failed: Array<{
      item: T;
      error: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  };
}

/**
 * Health Check Response
 * For service health and status endpoints
 */
export interface HealthCheckResponse extends BaseApiResponse {
  success: true;
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<
      string,
      {
        status: 'up' | 'down' | 'degraded';
        responseTime?: number;
        error?: string;
      }
    >;
    uptime: number;
  };
}

// ============================================================================
// DOMAIN-SPECIFIC RESPONSE TYPES
// ============================================================================

/**
 * Activity API Response Types
 * Type-safe interfaces for activity-related endpoints
 */
export interface ActivityResponse {
  _id: string;
  type:
    | 'card_added'
    | 'card_updated'
    | 'card_sold'
    | 'product_added'
    | 'product_updated'
    | 'product_sold';
  itemType: 'psa' | 'raw' | 'sealed';
  itemId: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export type ActivityListResponse = PaginatedResponse<ActivityResponse>;

/**
 * Card API Response Types
 * Type-safe interfaces for card-related endpoints
 */
export interface CardResponse {
  _id: string;
  cardId: string;
  grade?: number; // For PSA cards
  condition?: string; // For raw cards
  images: string[];
  myPrice: number;
  priceHistory: Array<{
    price: number;
    dateUpdated: string;
  }>;
  dateAdded: string;
  sold: boolean;
  saleDetails?: {
    price: number;
    buyer: string;
    date: string;
    platform: string;
  };
}

export type CardListResponse = CollectionResponse<CardResponse>;

/**
 * Set API Response Types
 * Type-safe interfaces for set-related endpoints
 */
export interface SetResponse {
  _id: string;
  setName: string;
  year: number;
  totalCards: number;
  setUrl?: string;
}

export type SetListResponse = CollectionResponse<SetResponse>;

/**
 * Auction API Response Types
 * Type-safe interfaces for auction-related endpoints
 */
export interface AuctionResponse {
  _id: string;
  topText: string;
  bottomText: string;
  auctionDate: string;
  status: 'draft' | 'active' | 'sold' | 'expired';
  items: Array<{
    itemCategory: 'psa' | 'raw' | 'sealed';
    itemId: string;
    startingPrice: number;
    reservePrice?: number;
  }>;
  totalValue: number;
  soldValue?: number;
}

export type AuctionListResponse = CollectionResponse<AuctionResponse>;

// ============================================================================
// TYPE GUARDS FOR RUNTIME TYPE SAFETY
// ============================================================================

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true && 'data' in response;
}

/**
 * Type guard to check if response is an error
 */
export function isErrorResponse(
  response: ApiResponse<unknown>
): response is ApiErrorResponse {
  return response.success === false && 'error' in response;
}

/**
 * Type guard to check if response is paginated
 */
export function isPaginatedResponse<T>(
  response: ApiResponse<T[] | unknown>
): response is PaginatedResponse<T> {
  return (
    isSuccessResponse(response) &&
    'pagination' in response &&
    Array.isArray(response.data)
  );
}

/**
 * Type guard to check if response is a collection
 */
export function isCollectionResponse<T>(
  response: ApiResponse<T[] | unknown>
): response is CollectionResponse<T> {
  return (
    isSuccessResponse(response) &&
    'count' in response &&
    Array.isArray(response.data)
  );
}

// ============================================================================
// RESPONSE TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform raw API response to typed response
 * Ensures LSP compliance and type safety
 */
export function transformApiResponse<T>(
  rawResponse: unknown,
  _expectedType?: string
): ApiResponse<T> {
  // Handle axios response wrapper
  const data = rawResponse?.data ?? rawResponse;

  // Basic validation
  if (!data || typeof data !== 'object') {
    return {
      success: false,
      error: {
        code: 'INVALID_RESPONSE',
        message: 'Invalid response format received from server',
      },
    };
  }

  // If already in correct format, return as-is
  if (typeof data.success === 'boolean') {
    return data as ApiResponse<T>;
  }

  // Transform legacy response format to unified format
  return {
    success: true,
    data: data as T,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create error response from error object
 */
export function createErrorResponse(
  error: unknown,
  operation?: string
): ApiErrorResponse {
  return {
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      code:
        error?.code || error?.response?.status?.toString() || 'UNKNOWN_ERROR',
      message:
        error?.message ||
        error?.response?.data?.message ||
        'An unexpected error occurred',
      details: {
        operation,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
      },
    },
  };
}
