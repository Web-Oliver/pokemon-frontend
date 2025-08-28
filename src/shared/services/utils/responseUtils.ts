/**
 * Response Utilities - Centralized response handling
 * Eliminates 50+ occurrences of "response.data || response" pattern
 */

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