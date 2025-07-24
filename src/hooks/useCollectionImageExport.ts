/**
 * Collection Image Export Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles image export operations
 */

import { useCallback } from 'react';
import { getExportApiService } from '../services/ServiceRegistry';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';
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
  const exportApi = getExportApiService();

  const downloadPsaCardImagesZip = useCallback(
    async (cardIds?: string[]): Promise<void> => {
      return await execute(async () => {
        log('Downloading PSA card images zip...');
        const zipBlob = await exportApi.zipPsaCardImages(cardIds);

        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename =
          cardIds && cardIds.length > 0
            ? `psa-cards-selected-${timestamp}.zip`
            : `psa-cards-all-${timestamp}.zip`;

        exportApi.downloadBlob(zipBlob, filename);
        showSuccessToast('PSA card images downloaded successfully');
        log('PSA card images zip downloaded successfully');
      });
    },
    [execute, exportApi]
  );

  const downloadRawCardImagesZip = useCallback(
    async (cardIds?: string[]): Promise<void> => {
      return await execute(async () => {
        log('Downloading raw card images zip...');
        const zipBlob = await exportApi.zipRawCardImages(cardIds);

        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename =
          cardIds && cardIds.length > 0
            ? `raw-cards-selected-${timestamp}.zip`
            : `raw-cards-all-${timestamp}.zip`;

        exportApi.downloadBlob(zipBlob, filename);
        showSuccessToast('Raw card images downloaded successfully');
        log('Raw card images zip downloaded successfully');
      });
    },
    [execute, exportApi]
  );

  const downloadSealedProductImagesZip = useCallback(
    async (productIds?: string[]): Promise<void> => {
      return await execute(async () => {
        log('Downloading sealed product images zip...');
        const zipBlob = await exportApi.zipSealedProductImages(productIds);

        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename =
          productIds && productIds.length > 0
            ? `sealed-products-selected-${timestamp}.zip`
            : `sealed-products-all-${timestamp}.zip`;

        exportApi.downloadBlob(zipBlob, filename);
        showSuccessToast('Sealed product images downloaded successfully');
        log('Sealed product images zip downloaded successfully');
      });
    },
    [execute, exportApi]
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
