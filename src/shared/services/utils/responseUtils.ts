/**
 * Response Utilities - Centralized response handling
 * Eliminates 50+ occurrences of "response.data || response" pattern
 */

import { SearchResponse } from '../../types/search';

/**
 * Extract data from API response - handles both direct data and wrapped responses
 */
export function extractResponseData<T>(response: any): T {
  return response?.data || response;
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