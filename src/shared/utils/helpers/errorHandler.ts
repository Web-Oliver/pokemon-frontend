import { error as logError } from '../performance/logger';
import { APIResponse } from './responseTransformer';
import {
  showErrorToast,
  showStatusErrorToast,
} from '../../components/organisms/ui/toastNotifications';

/**
 * Standard API Error class for new API format
 * Stores structured error information for better debugging and error handling
 */
export class APIError extends Error {
  public statusCode?: number;
  public details?: any;
  public apiResponse?: APIResponse<any>;
  public timestamp: string;

  constructor(
    message: string,
    statusCode?: number,
    details?: any,
    apiResponse?: APIResponse<any>
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
    this.apiResponse = apiResponse;
    this.timestamp = new Date().toISOString();

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, APIError.prototype);
  }

  /**
   * Get formatted error message for display
   */
  getDisplayMessage(): string {
    return this.message || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Get detailed error information for debugging
   */
  getDebugInfo(): Record<string, any> {
    return {
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      apiResponse: this.apiResponse,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Check if error is from API response (Axios error with response data)
 */
const isApiResponseError = (error: any): boolean => {
  return (
    error &&
    typeof error === 'object' &&
    error.response &&
    error.response.data &&
    typeof error.response.data === 'object'
  );
};

/**
 * Validate that error response follows new API format
 */
const isValidApiErrorResponse = (responseData: any): boolean => {
  return (
    responseData &&
    typeof responseData === 'object' &&
    'success' in responseData &&
    'status' in responseData &&
    'meta' in responseData
  );
};

/**
 * Standard global error handler for API errors - NEW FORMAT ONLY
 * Simplified to handle only the new standardized API format
 * @param error - The error object (typically from Axios or transformApiResponse)
 * @param userMessage - Optional user-friendly message to display
 */
export const handleApiError = (error: unknown, userMessage?: string): void => {
  let displayMessage =
    userMessage || 'An unexpected error occurred. Please try again.';
  let apiError: APIError | null = null;

  // Handle APIError instances (thrown by transformApiResponse)
  if (error instanceof APIError) {
    apiError = error;
    displayMessage = error.getDisplayMessage();
    logError('API Error:', error.getDebugInfo());
  }
  // Handle API response errors (from axios responses with new format)
  else if (isApiResponseError(error)) {
    const axiosError = error as any;
    const responseData = axiosError.response.data;

    // Validate response format
    if (isValidApiErrorResponse(responseData)) {
      apiError = new APIError(
        responseData.message || displayMessage,
        axiosError.response?.status,
        responseData.details,
        responseData
      );
      displayMessage = responseData.message || displayMessage;
      logError('API Response Error:', {
        message: responseData.message,
        status: responseData.status,
        details: responseData.details,
        meta: responseData.meta,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Invalid response format
      apiError = new APIError(
        'Invalid API response format received',
        axiosError.response?.status || 500,
        { invalidResponse: responseData },
        responseData
      );
      logError('Invalid API Response Format:', {
        statusCode: axiosError.response?.status,
        receivedData: responseData,
        timestamp: new Date().toISOString(),
      });
    }
  }
  // Handle legacy API format errors (backward compatibility)
  else if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    const response = err.response as Record<string, unknown> | undefined;
    const data = response?.data as Record<string, unknown> | undefined;

    if (data?.message && typeof data.message === 'string') {
      displayMessage = data.message;
    } else if (err.message && typeof err.message === 'string') {
      displayMessage = err.message;
    }

    // Create APIError for consistent error handling
    apiError = new APIError(
      displayMessage,
      response?.status as number,
      data,
      data as any
    );

    logError('Legacy API Error:', apiError.getDebugInfo());
  }
  // Handle other error types
  else {
    logError('General Error:', error);
    apiError = new APIError(displayMessage);
  }

  // Use toast notification for better user experience
  showErrorToast(displayMessage);

  // Store the last error for debugging purposes
  if (typeof window !== 'undefined') {
    (window as any).__lastApiError = apiError;
  }
};

/**
 * Get the last API error for debugging purposes
 * Useful for developers to inspect error details in browser console
 */
export const getLastApiError = (): APIError | null => {
  if (typeof window !== 'undefined') {
    return (window as any).__lastApiError || null;
  }
  return null;
};

/**
 * Standard error handler specifically for new API format errors
 * Can be used when you need more control over error processing
 */
export const handleEnhancedApiError = (
  error: APIError,
  customMessage?: string
): void => {
  const displayMessage = customMessage || error.getDisplayMessage();

  // Log detailed error information
  logError('Standard API Error Details:', error.getDebugInfo());

  // Show appropriate toast based on error status
  showStatusErrorToast(displayMessage, error.statusCode);

  // Store for debugging
  if (typeof window !== 'undefined') {
    (window as any).__lastApiError = error;
  }
};

// Toast notification functions moved to ../ui/toastNotifications.ts
// Import them from there: showSuccessToast, showInfoToast, showWarningToast, showErrorToast
