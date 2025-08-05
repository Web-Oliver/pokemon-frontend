/**
 * useMarkSold Hook
 * Encapsulates mark as sold functionality and API interactions
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles only mark as sold operations
 * - Dependency Inversion: Uses abstract API services
 * - DRY: Centralizes sale logic
 */

import { useCallback, useState, useEffect } from 'react';
import { ISaleDetails } from '../domain/models/common';
import { useCollectionOperations } from './useCollectionOperations';
import { navigationHelper } from '../utils/navigation';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { handleApiError } from '../utils/errorHandler';
import { showSuccessToast } from '../utils/common';

interface UseMarkSoldOptions {
  /** Item type being sold */
  itemType: 'psa' | 'raw' | 'sealed';
  /** Item ID to mark as sold */
  itemId: string;
  /** Callback when sale is successful */
  onSuccess?: () => void;
  /** Callback when sale fails */
  onError?: (error: Error) => void;
}

interface UseMarkSoldReturn {
  /** Whether the sale is being processed */
  isProcessing: boolean;
  /** Any error that occurred during sale */
  error: Error | null;
  /** Function to execute the mark as sold operation */
  markAsSold: (saleDetails: ISaleDetails) => Promise<void>;
  /** Function to clear any existing errors */
  clearError: () => void;
}

export const useMarkSold = ({
  itemType,
  itemId,
  onSuccess,
  onError,
}: UseMarkSoldOptions): UseMarkSoldReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { updatePsaCard, updateRawCard, updateSealedProduct } =
    useCollectionOperations();

  const markAsSold = useCallback(
    async (saleDetails: ISaleDetails): Promise<void> => {
      setIsProcessing(true);
      setError(null);

      try {
        // Prepare the update data with sale details
        const updateData = {
          sold: true,
          saleDetails,
        };

        // Call the appropriate update function based on item type
        switch (itemType) {
          case 'psa':
            await updatePsaCard(itemId, updateData);
            break;
          case 'raw':
            await updateRawCard(itemId, updateData);
            break;
          case 'sealed':
            await updateSealedProduct(itemId, updateData);
            break;
          default:
            throw new Error(`Unsupported item type: ${itemType}`);
        }

        // Call success callback if provided
        onSuccess?.();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to mark item as sold');
        setError(error);
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      itemType,
      itemId,
      updatePsaCard,
      updateRawCard,
      updateSealedProduct,
      onSuccess,
      onError,
    ]
  );

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    markAsSold,
    clearError,
  };
};

/**
 * Collection Item Detail Hook
 * Following CLAUDE.md Layer 2 (Services/Hooks) principles
 * 
 * Encapsulates business logic for collection item detail operations:
 * - Item fetching and state management
 * - Price update operations
 * - Delete operations
 * - Image download functionality
 * - Mark as sold operations
 */
export const useCollectionItemDetail = () => {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isMarkSoldModalOpen, setIsMarkSoldModalOpen] = useState(false);
  const [newPrice, setNewPrice] = useState<string>('');

  // Extract type and id from URL path using navigationHelper
  const getUrlParams = () => {
    return navigationHelper.getCollectionItemParams();
  };

  // Use existing collection operations hook
  const collectionOps = useCollectionOperations();

  // ZIP download handler
  const handleDownloadImages = async () => {
    if (!item) return;

    const { type, id } = getUrlParams();
    if (!type || !id) return;

    try {
      setDownloadingZip(true);
      
      switch (type) {
        case 'psa':
          await collectionOps.downloadPsaCardImagesZip([id]);
          break;
        case 'raw':
          await collectionOps.downloadRawCardImagesZip([id]);
          break;
        case 'sealed':
          await collectionOps.downloadSealedProductImagesZip([id]);
          break;
      }
      
      showSuccessToast('Images downloaded successfully!');
    } catch (err: any) {
      setError('Failed to download images');
      handleApiError(err, 'Failed to download images');
    } finally {
      setDownloadingZip(false);
    }
  };

  // Price update handler
  const handlePriceUpdate = async (newPrice: number, date: string) => {
    if (!item) return;

    try {
      setLoading(true);
      const { type, id } = getUrlParams();
      if (!type || !id) throw new Error('Invalid URL parameters');

      const updatedPriceHistory = [
        ...(item.priceHistory || []),
        { price: newPrice, dateUpdated: date },
      ];

      // Update item based on type
      switch (type) {
        case 'psa':
          await collectionOps.updatePsaCard(id, { priceHistory: updatedPriceHistory });
          break;
        case 'raw':
          await collectionOps.updateRawCard(id, { priceHistory: updatedPriceHistory });
          break;
        case 'sealed':
          await collectionOps.updateSealedProduct(id, { priceHistory: updatedPriceHistory });
          break;
      }

      // Refresh item data
      await fetchItem();
      showSuccessToast('Price updated successfully! My Price synced to latest entry.');
    } catch (err: any) {
      setError('Failed to update price');
      handleApiError(err, 'Failed to update price');
    } finally {
      setLoading(false);
    }
  };

  // Handle custom price input
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    setNewPrice(numericValue);
  };

  const handleCustomPriceUpdate = () => {
    if (!newPrice.trim()) return;

    const price = parseInt(newPrice, 10);
    if (isNaN(price) || price <= 0) return;

    const currentPriceInt = Math.round(item?.myPrice || 0);
    if (price === currentPriceInt) return;

    const currentDate = new Date().toISOString();
    handlePriceUpdate(price, currentDate);
    setNewPrice('');
  };

  // Delete operations
  const handleDelete = () => setShowDeleteConfirm(true);
  const handleCancelDelete = () => setShowDeleteConfirm(false);

  const handleConfirmDelete = async () => {
    const { type, id } = getUrlParams();
    if (!item || !type || !id) return;

    try {
      setDeleting(true);
      
      switch (type) {
        case 'psa':
          await collectionOps.deletePsaCard(id);
          break;
        case 'raw':
          await collectionOps.deleteRawCard(id);
          break;
        case 'sealed':
          await collectionOps.deleteSealedProduct(id);
          break;
      }

      showSuccessToast('Item deleted successfully');
      setShowDeleteConfirm(false);
      navigationHelper.navigateToCollection();
    } catch (err) {
      handleApiError(err, 'Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  // Edit operations
  const handleEdit = () => {
    const { type, id } = getUrlParams();
    if (!item || !type || !id) return;
    navigationHelper.navigateToEdit.item(type as 'psa' | 'raw' | 'sealed', id);
  };

  // Mark as sold operations
  const handleMarkSold = () => {
    if (!item || item.sold) return;
    setIsMarkSoldModalOpen(true);
  };

  const handleMarkSoldSuccess = () => {
    setIsMarkSoldModalOpen(false);
    fetchItem();
  };

  const handleModalClose = () => setIsMarkSoldModalOpen(false);

  // Navigation
  const handleBackToCollection = () => navigationHelper.navigateToCollection();

  // Fetch item data
  const fetchItem = async () => {
    const { type, id } = getUrlParams();
    if (!type || !id) {
      setError('Invalid item type or ID');
      setLoading(false);
      return;
    }

    try {
      const collectionApi = getCollectionApiService();
      let fetchedItem;

      switch (type) {
        case 'psa':
          fetchedItem = await collectionApi.getPsaGradedCardById(id);
          break;
        case 'raw':
          fetchedItem = await collectionApi.getRawCardById(id);
          break;
        case 'sealed':
          fetchedItem = await collectionApi.getSealedProductById(id);
          break;
        default:
          throw new Error(`Unknown item type: ${type}`);
      }

      setItem(fetchedItem);
    } catch (err) {
      handleApiError(err, 'Failed to fetch item details');
      setError('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, []);

  return {
    // State
    item, loading, error, downloadingZip, deleting, isMarkSoldModalOpen, showDeleteConfirm, newPrice,
    
    // Actions
    handleDownloadImages, handlePriceUpdate, handlePriceInputChange, handleCustomPriceUpdate,
    handleDelete, handleConfirmDelete, handleCancelDelete, handleEdit, handleMarkSold,
    handleMarkSoldSuccess, handleModalClose, handleBackToCollection,
    
    // Setters
    setNewPrice, setIsMarkSoldModalOpen,
  };
};
