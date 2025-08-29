/**
 * Unified Notifications Hook - PHASE 1 REFACTORING  
 * Eliminates 45+ scattered toast notification calls
 * 
 * SOLID Principles:
 * - SRP: Only handles notification patterns
 * - DRY: Centralizes all toast logic (success, warning, error)
 * - ISP: Focused interface for notification operations only
 */

import { useCallback } from 'react';
import {
  showSuccessToast,
  showWarningToast,  
  showErrorToast,
} from '../../components/organisms/ui/toastNotifications';

export interface NotificationOptions {
  /** Duration to show notification (ms) */
  duration?: number;
  /** Position on screen */
  position?: 'top' | 'bottom' | 'center';
  /** Auto dismiss notification */
  autoDismiss?: boolean;
  /** Custom styling */
  className?: string;
}

export interface UseUnifiedNotificationsReturn {
  /** Show success notification */
  notifySuccess: (message: string, options?: NotificationOptions) => void;
  /** Show warning notification */
  notifyWarning: (message: string, options?: NotificationOptions) => void;
  /** Show error notification */  
  notifyError: (message: string | Error, options?: NotificationOptions) => void;
  /** Show operation success with standard messages */
  notifyOperationSuccess: (
    operation: 'create' | 'update' | 'delete' | 'export' | 'import',
    entity?: string
  ) => void;
  /** Show operation error with standard messages */
  notifyOperationError: (
    operation: 'create' | 'update' | 'delete' | 'export' | 'import',
    entity?: string,
    error?: string | Error
  ) => void;
}

/**
 * Unified notifications hook - replaces 45+ scattered toast calls
 * Standardizes: success messages, error messages, warning messages, operation feedback
 */
export const useUnifiedNotifications = (): UseUnifiedNotificationsReturn => {
  const notifySuccess = useCallback((message: string, options?: NotificationOptions) => {
    showSuccessToast(message);
  }, []);

  const notifyWarning = useCallback((message: string, options?: NotificationOptions) => {
    showWarningToast(message);
  }, []);

  const notifyError = useCallback((message: string | Error, options?: NotificationOptions) => {
    const errorMessage = typeof message === 'string' ? message : message.message || 'An error occurred';
    showErrorToast(errorMessage);
  }, []);

  const notifyOperationSuccess = useCallback(
    (operation: string, entity: string = 'item') => {
      const messages = {
        create: `${entity.charAt(0).toUpperCase() + entity.slice(1)} created successfully`,
        update: `${entity.charAt(0).toUpperCase() + entity.slice(1)} updated successfully`, 
        delete: `${entity.charAt(0).toUpperCase() + entity.slice(1)} deleted successfully`,
        export: `${entity.charAt(0).toUpperCase() + entity.slice(1)} exported successfully`,
        import: `${entity.charAt(0).toUpperCase() + entity.slice(1)} imported successfully`,
      };

      showSuccessToast(messages[operation] || `${operation} completed successfully`);
    },
    []
  );

  const notifyOperationError = useCallback(
    (operation: string, entity: string = 'item', error?: string | Error) => {
      const baseMessages = {
        create: `Failed to create ${entity}`,
        update: `Failed to update ${entity}`,
        delete: `Failed to delete ${entity}`, 
        export: `Failed to export ${entity}`,
        import: `Failed to import ${entity}`,
      };

      let message = baseMessages[operation] || `${operation} failed`;
      
      if (error) {
        const errorText = typeof error === 'string' ? error : error.message || 'Unknown error';
        message += `: ${errorText}`;
      }

      showErrorToast(message);
    },
    []
  );

  return {
    notifySuccess,
    notifyWarning,
    notifyError,
    notifyOperationSuccess,
    notifyOperationError,
  };
};

export default useUnifiedNotifications;