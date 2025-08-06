/**
 * Item Actions Hook
 *
 * Abstracts common item action logic used across AuctionDetail and CollectionItemDetail
 * Following CLAUDE.md principles: DRY, business logic extraction, reusable patterns
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServiceRegistry } from '../services/ServiceRegistry';
import { handleApiError } from '../utils/helpers/errorHandler';
import { navigationHelper } from '../utils/helpers/navigation';

export interface UseItemActionsOptions {
  itemType: 'psa' | 'raw' | 'sealed';
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface UseItemActionsReturn {
  // State
  deleting: boolean;
  marking: boolean;
  downloading: boolean;

  // Actions
  handleDelete: (itemId: string) => Promise<void>;
  handleMarkSold: (itemId: string, saleDetails: any) => Promise<void>;
  handleEdit: (itemId: string) => void;
  handleDownloadImages: (itemId: string) => Promise<void>;

  // Navigation
  navigateToCollection: () => void;
  navigateToEdit: (itemId: string) => void;
}

export const useItemActions = ({
  itemType,
  onSuccess,
  onError,
}: UseItemActionsOptions): UseItemActionsReturn => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [marking, setMarking] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Get appropriate API service based on item type
  const getApiService = useCallback(() => {
    const collectionService =
      ServiceRegistry.getInstance().getCollectionApiService();

    switch (itemType) {
      case 'psa':
        return {
          delete: collectionService.deletePsaGradedCard,
          markSold: collectionService.markPsaCardSold,
          getEditPath: (id: string) =>
            `/collection/psa-graded-cards/${id}/edit`,
        };
      case 'raw':
        return {
          delete: collectionService.deleteRawCard,
          markSold: collectionService.markRawCardSold,
          getEditPath: (id: string) => `/collection/raw-cards/${id}/edit`,
        };
      case 'sealed':
        return {
          delete: collectionService.deleteSealedProduct,
          markSold: collectionService.markSealedProductSold,
          getEditPath: (id: string) => `/collection/sealed-products/${id}/edit`,
        };
      default:
        throw new Error(`Unsupported item type: ${itemType}`);
    }
  }, [itemType]);

  // Delete item
  const handleDelete = useCallback(
    async (itemId: string) => {
      if (deleting) return;

      setDeleting(true);
      try {
        const apiService = getApiService();
        await apiService.delete(itemId);

        onSuccess?.();
        navigateToCollection();
      } catch (error) {
        console.error('Delete failed:', error);
        handleApiError(error);
        onError?.(error);
      } finally {
        setDeleting(false);
      }
    },
    [deleting, getApiService, onSuccess, onError]
  );

  // Mark item as sold
  const handleMarkSold = useCallback(
    async (itemId: string, saleDetails: any) => {
      if (marking) return;

      setMarking(true);
      try {
        const apiService = getApiService();
        await apiService.markSold(itemId, saleDetails);

        onSuccess?.();
      } catch (error) {
        console.error('Mark sold failed:', error);
        handleApiError(error);
        onError?.(error);
      } finally {
        setMarking(false);
      }
    },
    [marking, getApiService, onSuccess, onError]
  );

  // Navigate to edit
  const handleEdit = useCallback(
    (itemId: string) => {
      try {
        const apiService = getApiService();
        const editPath = apiService.getEditPath(itemId);
        navigationHelper.navigateTo(navigate, editPath);
      } catch (error) {
        console.error('Navigation to edit failed:', error);
        handleApiError(error);
      }
    },
    [navigate, getApiService]
  );

  // Navigate to edit (alias)
  const navigateToEdit = useCallback(
    (itemId: string) => {
      handleEdit(itemId);
    },
    [handleEdit]
  );

  // Download item images
  const handleDownloadImages = useCallback(
    async (itemId: string) => {
      if (downloading) return;

      setDownloading(true);
      try {
        const exportService =
          ServiceRegistry.getInstance().getExportApiService();

        let downloadMethod;
        switch (itemType) {
          case 'psa':
            downloadMethod = exportService.downloadPsaCardImagesZip;
            break;
          case 'raw':
            downloadMethod = exportService.downloadRawCardImagesZip;
            break;
          case 'sealed':
            downloadMethod = exportService.downloadSealedProductImagesZip;
            break;
          default:
            throw new Error(`Unsupported item type for download: ${itemType}`);
        }

        await downloadMethod(itemId);
      } catch (error) {
        console.error('Download images failed:', error);
        handleApiError(error);
        onError?.(error);
      } finally {
        setDownloading(false);
      }
    },
    [downloading, itemType, onError]
  );

  // Navigate to collection
  const navigateToCollection = useCallback(() => {
    navigationHelper.navigateTo(navigate, '/collection');
  }, [navigate]);

  return {
    // State
    deleting,
    marking,
    downloading,

    // Actions
    handleDelete,
    handleMarkSold,
    handleEdit,
    handleDownloadImages,

    // Navigation
    navigateToCollection,
    navigateToEdit,
  };
};

// Convenience hooks for specific item types
export const usePsaItemActions = (
  options?: Omit<UseItemActionsOptions, 'itemType'>
) => useItemActions({ ...options, itemType: 'psa' });

export const useRawItemActions = (
  options?: Omit<UseItemActionsOptions, 'itemType'>
) => useItemActions({ ...options, itemType: 'raw' });

export const useSealedItemActions = (
  options?: Omit<UseItemActionsOptions, 'itemType'>
) => useItemActions({ ...options, itemType: 'sealed' });
