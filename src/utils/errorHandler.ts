import { error as logError } from './logger';

/**
 * Global error handler for API errors and other application errors
 * @param error - The error object (typically from Axios or other sources)
 * @param userMessage - Optional user-friendly message to display
 */
export const handleApiError = (error: any, userMessage?: string): void => {
  // Log the error for debugging
  logError('API Error:', error);

  // Extract meaningful error message
  let displayMessage = userMessage || 'An unexpected error occurred. Please try again.';
  
  if (error?.response?.data?.message) {
    displayMessage = error.response.data.message;
  } else if (error?.message) {
    displayMessage = error.message;
  }

  // For now, use alert() for user notification
  // TODO: Replace with toast notification system in Phase 12
  alert(`Error: ${displayMessage}`);
};