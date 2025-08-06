/**
 * Toast Notifications Utility
 * Extracted from errorHandler.ts to separate UI concerns from error handling logic
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles toast notifications
 * - Separation of Concerns: UI logic separate from error handling
 * - DRY: Centralized toast notification styling and behavior
 */

import toast from 'react-hot-toast';

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

/**
 * Show error toast notification
 * @param message - Error message to display
 * @param options - Optional toast configuration
 */
export const showErrorToast = (
  message: string,
  options?: Record<string, unknown>
): void => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      color: '#DC2626',
    },
    icon: '⚠️',
    ...options,
  });
};

/**
 * Show specialized error toast based on status code
 * @param message - Error message to display
 * @param statusCode - HTTP status code for appropriate styling
 * @param options - Optional toast configuration
 */
export const showStatusErrorToast = (
  message: string,
  statusCode?: number,
  options?: Record<string, unknown>
): void => {
  const baseConfig = {
    duration: 5000,
    position: 'top-right' as const,
    style: {
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      color: '#DC2626',
    },
    ...options,
  };

  if (statusCode && statusCode >= 500) {
    // Server errors
    toast.error(message, {
      ...baseConfig,
      icon: '🚫',
    });
  } else if (statusCode === 401 || statusCode === 403) {
    // Authentication/authorization errors
    toast.error(message, {
      ...baseConfig,
      icon: '🔒',
    });
  } else {
    // General client errors
    toast.error(message, {
      ...baseConfig,
      icon: '⚠️',
    });
  }
};

/**
 * Show storage error toast (specific for storage failures)
 * @param message - Storage error message
 * @param options - Optional toast configuration
 */
export const showStorageErrorToast = (
  message: string = 'Failed to save data locally',
  options?: Record<string, unknown>
): void => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#FEF2F2',
      border: '1px solid #FECACA',
      color: '#DC2626',
    },
    icon: '💾',
    ...options,
  });
};

export default {
  showSuccessToast,
  showInfoToast,
  showWarningToast,
  showErrorToast,
  showStatusErrorToast,
  showStorageErrorToast,
};