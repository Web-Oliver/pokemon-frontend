import { error as logError } from './logger';

/**
 * Global error handler for API errors and other application errors
 * @param error - The error object (typically from Axios or other sources)
 * @param userMessage - Optional user-friendly message to display
 */
export const handleApiError = (error: unknown, userMessage?: string): void => {
  // Log the error for debugging
  logError('API Error:', error);

  // Extract meaningful error message
  let displayMessage = userMessage || 'An unexpected error occurred. Please try again.';
  
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    const response = err.response as Record<string, unknown> | undefined;
    const data = response?.data as Record<string, unknown> | undefined;
    
    if (data?.message && typeof data.message === 'string') {
      displayMessage = data.message;
    } else if (err.message && typeof err.message === 'string') {
      displayMessage = err.message;
    }
  }

  // For now, use alert() for user notification
  // TODO: Replace with toast notification system in Phase 12
  alert(`Error: ${displayMessage}`);
};