import { error as logError } from './logger';
import toast from 'react-hot-toast';

/**
 * Global error handler for API errors and other application errors
 * @param error - The error object (typically from Axios or other sources)
 * @param userMessage - Optional user-friendly message to display
 */
export const handleApiError = (error: unknown, userMessage?: string): void => {
  // Log the error for debugging
  logError('API Error:', error);

  // Extract meaningful error message
  let displayMessage =
    userMessage || 'An unexpected error occurred. Please try again.';

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

  // Use toast notification for better user experience
  toast.error(displayMessage, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      color: '#DC2626',
    },
    icon: '⚠️',
  });
};

/**
 * Show success toast notification
 * @param message - Success message to display
 * @param options - Optional toast configuration
 */
export const showSuccessToast = (
  message: string,
  options?: Record<string, unknown>
): void => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#F0FDF4',
      border: '1px solid #BBF7D0',
      color: '#16A34A',
    },
    icon: '✅',
    ...options,
  });
};

/**
 * Show info toast notification
 * @param message - Info message to display
 * @param options - Optional toast configuration
 */
export const showInfoToast = (
  message: string,
  options?: Record<string, unknown>
): void => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#EFF6FF',
      border: '1px solid #BFDBFE',
      color: '#2563EB',
    },
    icon: 'ℹ️',
    ...options,
  });
};

/**
 * Show warning toast notification
 * @param message - Warning message to display
 * @param options - Optional toast configuration
 */
export const showWarningToast = (
  message: string,
  options?: Record<string, unknown>
): void => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      color: '#D97706',
    },
    icon: '⚠️',
    ...options,
  });
};
