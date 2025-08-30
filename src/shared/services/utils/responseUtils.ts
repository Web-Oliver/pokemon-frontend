/**
 * Response Utilities - Enhanced to fully utilize backend metadata
 * Eliminates 50+ occurrences of "response.data || response" pattern
 * Now extracts all metadata fields for performance tracking and debugging
 */

import { SearchResponse } from '@/shared/types/search';
import { 
  ApiResponse, 
  ResponseMetadata, 
  PaginationInfo,
  PerformanceMetrics
} from '@/domains/system/types/ApiTypes';
import { ErrorFactory } from '@/domains/system/services/ErrorFactory';

/**
 * Extract data from enhanced API response - now captures all metadata
 */
export function extractResponseData<T>(response: any): T {
  const data = response?.data || response;
  
  // Capture metadata for debugging and monitoring
  if (response?.meta) {
    captureResponseMetadata(response.meta);
  }
  
  return data;
}

/**
 * Extract full API response with all metadata
 */
export function extractFullApiResponse<T>(response: any): ApiResponse<T> {
  if (!response?.success && !response?.data && !response?.meta) {
    // Handle legacy response format
    return {
      success: true,
      data: response,
      meta: {
        operation: 'unknown',
        entityType: 'unknown',
        timestamp: new Date().toISOString()
      }
    };
  }

  return {
    success: response.success ?? true,
    data: response.data,
    meta: response.meta || {
      operation: 'unknown',
      entityType: 'unknown',
      timestamp: new Date().toISOString()
    },
    pagination: response.pagination
  };
}

/**
 * Capture response metadata for monitoring and debugging
 */
function captureResponseMetadata(meta: ResponseMetadata): void {
  // Log processing time for performance monitoring
  if (meta.processingTime && meta.processingTime > 1000) {
    console.warn(`Slow API response: ${meta.operation} took ${meta.processingTime}ms`);
  }
  
  // Log metrics if available
  if (meta.metrics) {
    const metrics = meta.metrics;
    console.debug('API Metrics:', {
      operation: meta.operation,
      entity: meta.entityType,
      dbTime: metrics.databaseQueryTime,
      searchTime: metrics.searchTime,
      cacheHits: metrics.cacheHits,
      totalRecords: metrics.totalRecords
    });
  }
}

/**
 * Validate response data exists
 */
export function validateResponseData<T>(response: any, operation: string): T {
  const data = extractResponseData<T>(response);
  if (!data) {
    throw new Error(`${operation}: No data received from server`);
  }
  return data;
}

/**
 * Handle array responses with validation
 */
export function extractArrayResponseData<T>(response: any): T[] {
  const data = extractResponseData<T[]>(response);
  return Array.isArray(data) ? data : [];
}

/**
 * Extract and validate search response with standardized format
 * Eliminates duplicate search response handling patterns
 */
export function extractSearchResponse<T>(response: any, query?: string): SearchResponse<T> {
  const responseData = extractResponseData(response);
  
  // Handle nested search response structures
  const data = responseData?.sets || responseData?.data || responseData || [];
  const count = responseData?.count || responseData?.total || (Array.isArray(data) ? data.length : 0);
  const success = responseData?.success !== false;
  
  return {
    data: Array.isArray(data) ? data : [],
    count,
    success,
    query: query || ''
  };
}

/**
 * Handle MongoDB ObjectId filtering for hierarchical searches
 * Eliminates duplicate parameter building patterns
 */
export function buildHierarchicalParams(params: any): any {
  const cleanParams: any = {};
  
  // Copy all parameters, filtering out empty/null/undefined values
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });
  
  return cleanParams;
}

/**
 * Add cache busting for collection endpoints
 * Eliminates duplicate cache busting patterns
 */
export function addCacheBusting(config: any = {}): any {
  return {
    ...config,
    params: {
      ...config.params,
      _t: Date.now(),
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...config.headers,
    },
  };
}