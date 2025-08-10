/**
 * Collection Image Export Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles image export operations
 */

import { useCallback } from 'react';

import { showSuccessToast } from '../components/organisms/ui/toastNotifications';
import { log } from '../utils/performance/logger';
import { useAsyncOperation } from './useAsyncOperation';

export interface UseCollectionImageExportReturn {
  loading: boolean;
  error: string | null;
  downloadPsaCardImagesZip: (cardIds?: string[]) => Promise<void>;
  downloadRawCardImagesZip: (cardIds?: string[]) => Promise<void>;
  downloadSealedProductImagesZip: (productIds?: string[]) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for collection image export operations
 * Follows SRP - only handles image export functionality
 */
export const useCollectionImageExport = (): UseCollectionImageExportReturn => {
  const { loading, error, execute, clearError } = useAsyncOperation();
  // TODO: Implement export functionality when needed

  const downloadPsaCardImagesZip = useCallback(
    async (cardIds?: string[]): Promise<void> => {
      return await execute(async () => {
        log('Image export not implemented yet');
        showSuccessToast('Export functionality coming soon');
      });
    },
    [execute]
  );

  const downloadRawCardImagesZip = useCallback(
    async (cardIds?: string[]): Promise<void> => {
      return await execute(async () => {
        log('Image export not implemented yet');
        showSuccessToast('Export functionality coming soon');
      });
    },
    [execute]
  );

  const downloadSealedProductImagesZip = useCallback(
    async (productIds?: string[]): Promise<void> => {
      return await execute(async () => {
        log('Image export not implemented yet');
        showSuccessToast('Export functionality coming soon');
      });
    },
    [execute]
  );

  return {
    loading,
    error,
    downloadPsaCardImagesZip,
    downloadRawCardImagesZip,
    downloadSealedProductImagesZip,
    clearError,
  };
};
