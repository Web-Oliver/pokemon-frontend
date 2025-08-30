/**
 * API Types - Enhanced to match backend response format exactly
 * Mirrors pokemon-collection-backend standardized response structure
 */

import type { ApiError } from './ErrorTypes';

// Pagination metadata matching backend exactly
export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Response metadata matching backend format
export interface ResponseMetadata {
  operation: string;
  entityType: string;
  timestamp: string;
  processingTime?: number;
  metrics?: {
    databaseQueryTime?: number;
    searchTime?: number;
    cacheHits?: number;
    cacheMisses?: number;
    totalRecords?: number;
    filteredRecords?: number;
  };
}

// Standard API response format matching backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: ResponseMetadata;
  pagination?: PaginationInfo;
}

// Error response format matching backend RFC 7807
export interface ApiErrorResponse extends ApiError {
  meta?: ResponseMetadata;
}

// Search response format
export interface SearchResponse<T> {
  data: T[];
  count: number;
  success: boolean;
  query: string;
  meta?: ResponseMetadata;
  pagination?: PaginationInfo;
  searchMetrics?: {
    searchTime: number;
    totalResults: number;
    engines: string[];
    relevanceScores?: number[];
  };
}

// Unified search parameters matching backend
export interface UnifiedSearchParams {
  query: string;
  types?: ('cards' | 'products' | 'sets')[];
  limit?: number;
  page?: number;
  filters?: Record<string, any>;
}

// Unified search results matching backend multi-engine search
export interface UnifiedSearchResults {
  results: {
    cards?: SearchResponse<any>;
    products?: SearchResponse<any>;
    sets?: SearchResponse<any>;
  };
  meta: ResponseMetadata & {
    totalResults: number;
    searchTime: number;
    engines: string[];
  };
}

// Collection operation metadata
export interface CollectionOperationMeta extends ResponseMetadata {
  itemCount?: number;
  totalValue?: number;
  soldCount?: number;
  soldValue?: number;
}

// OCR/ICR operation metadata
export interface OcrOperationMeta extends ResponseMetadata {
  imagesProcessed?: number;
  extractionTime?: number;
  matchingTime?: number;
  successRate?: number;
  confidenceScore?: number;
}

// Marketplace operation metadata
export interface MarketplaceOperationMeta extends ResponseMetadata {
  itemsExported?: number;
  platform?: string;
  exportFormat?: string;
  postUrl?: string;
}

// API Client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableMetrics?: boolean;
  enableCaching?: boolean;
}

// Request metadata for context
export interface RequestMetadata {
  operation: string;
  entityType: string;
  domain: string;
  startTime: number;
  requestId?: string;
  userId?: string;
}

// Performance metrics
export interface PerformanceMetrics {
  requestTime: number;
  responseTime: number;
  totalTime: number;
  cacheStatus: 'hit' | 'miss' | 'stale';
  retryAttempts: number;
  errorCount: number;
}

// Batch operation response
export interface BatchOperationResponse<T> {
  success: boolean;
  results: T[];
  errors: ApiError[];
  meta: ResponseMetadata & {
    totalItems: number;
    successCount: number;
    errorCount: number;
    partialSuccess: boolean;
  };
}