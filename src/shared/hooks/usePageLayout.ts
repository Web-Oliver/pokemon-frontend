/**
 * Page Layout Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Consolidates common page patterns: loading states, error handling, navigation
 * Follows DRY principle - eliminates duplicate page structure patterns across 14+ files
 */

import { useCallback } from 'react';
import {
  useAsyncOperation,
  UseAsyncOperationReturn,
} from './common/useAsyncOperation';

export interface PageLayoutState<T = any> extends UseAsyncOperationReturn<T> {
  navigateTo: (path: string) => void;
  reload: () => void;
  handleAsyncAction: (action: () => Promise<T>) => Promise<T | undefined>;
}

/**
 * Centralized hook for common page patterns
 * Eliminates duplicate page structure, loading states, and navigation patterns
 */
export const usePageLayout = <T = any>(
  initialData: T | null = null
): PageLayoutState<T> => {
  const asyncOperation = useAsyncOperation<T>(initialData);

  const navigateTo = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, []);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  const handleAsyncAction = useCallback(
    async (action: () => Promise<T>): Promise<T | undefined> => {
      try {
        return await asyncOperation.execute(action);
      } catch {
        // Error is already handled by useAsyncOperation
        return undefined;
      }
    },
    [asyncOperation]
  );

  return {
    ...asyncOperation,
    navigateTo,
    reload,
    handleAsyncAction,
  };
};
