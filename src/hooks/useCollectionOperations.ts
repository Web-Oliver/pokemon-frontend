/**
 * Collection Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Following CLAUDE.md + Context7 React optimization principles:
 * - Single Responsibility: Only handles API operations (SRP)
 * - Dependency Inversion: Depends on abstract state management (DIP)
 * - DRY: Centralized API operation patterns
 * - Performance: Memoized operations with useCallback
 */

import { useCallback } from 'react';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';
import * as collectionApi from '../api/collectionApi';
import * as exportApi from '../api/exportApi';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { UseCollectionStateReturn } from './useCollectionState';

export interface UseCollectionOperationsReturn {
  // PSA Graded Cards operations
  addPsaCard: (cardData: Partial<IPsaGradedCard>) => Promise<void>;
  updatePsaCard: (id: string, cardData: Partial<IPsaGradedCard>) => Promise<void>;
  deletePsaCard: (id: string) => Promise<void>;
  markPsaCardSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;

  // Raw Cards operations
  addRawCard: (cardData: Partial<IRawCard>) => Promise<void>;
  updateRawCard: (id: string, cardData: Partial<IRawCard>) => Promise<void>;
  deleteRawCard: (id: string) => Promise<void>;
  markRawCardSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;

  // Sealed Products operations
  addSealedProduct: (productData: Partial<ISealedProduct>) => Promise<void>;
  updateSealedProduct: (id: string, productData: Partial<ISealedProduct>) => Promise<void>;
  deleteSealedProduct: (id: string) => Promise<void>;
  markSealedProductSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;

  // Export operations
  downloadPsaCardImagesZip: (cardIds?: string[]) => Promise<void>;
  downloadRawCardImagesZip: (cardIds?: string[]) => Promise<void>;
  downloadSealedProductImagesZip: (productIds?: string[]) => Promise<void>;
}

/**
 * Collection Operations Hook
 *
 * Handles all API operations for collection management with optimized
 * performance and error handling. Uses dependency injection pattern
 * with state management hook.
 */
export const useCollectionOperations = (
  stateManager: UseCollectionStateReturn
): UseCollectionOperationsReturn => {
  const {
    setLoading,
    setError,
    addPsaCard: addPsaCardToState,
    addRawCard: addRawCardToState,
    addSealedProduct: addSealedProductToState,
    updatePsaCard: updatePsaCardInState,
    updateRawCard: updateRawCardInState,
    updateSealedProduct: updateSealedProductInState,
    removePsaCard,
    removeRawCard,
    removeSealedProduct,
    movePsaCardToSold,
    moveRawCardToSold,
    moveSealedProductToSold,
  } = stateManager;

  // PSA Graded Cards Operations - memoized for performance
  const addPsaCard = useCallback(
    async (cardData: Partial<IPsaGradedCard>) => {
      setError(null);

      try {
        log('Adding PSA graded card...');
        const newCard = await collectionApi.createPsaGradedCard(cardData);

        // Optimistic update - immediately add to state
        addPsaCardToState(newCard);

        log('PSA graded card added successfully');
        showSuccessToast('PSA graded card added to collection!');
      } catch (error) {
        handleApiError(error, 'Failed to add PSA graded card');
        setError('Failed to add PSA graded card');
      }
    },
    [setError, addPsaCardToState]
  );

  const updatePsaCard = useCallback(
    async (id: string, cardData: Partial<IPsaGradedCard>) => {
      setLoading(true);
      setError(null);

      try {
        log(`[useCollectionOperations] Updating PSA graded card ${id}...`);
        log(`[useCollectionOperations] Update data:`, cardData);
        const updatedCard = await collectionApi.updatePsaGradedCard(id, cardData);
        log(`[useCollectionOperations] API response:`, updatedCard);

        // Ensure the updated card has the proper ID
        const cardWithId = {
          ...updatedCard,
          id: updatedCard.id || (updatedCard as any)._id || id,
        };

        log(`[useCollectionOperations] Card with ensured ID:`, cardWithId);

        // Update state with new card data
        updatePsaCardInState(id, cardWithId);
        setLoading(false);

        log('[useCollectionOperations] PSA graded card updated successfully - state updated');
        showSuccessToast('PSA graded card updated successfully!');
      } catch (error) {
        console.error('[useCollectionOperations] PSA update failed:', error);
        handleApiError(error, 'Failed to update PSA graded card');
        setError('Failed to update PSA graded card');
        setLoading(false);
      }
    },
    [setLoading, setError, updatePsaCardInState]
  );

  const deletePsaCard = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        log(`Deleting PSA graded card ${id}...`);
        await collectionApi.deletePsaGradedCard(id);

        // Optimistic update
        removePsaCard(id);
        setLoading(false);

        log('PSA graded card deleted successfully');
        showSuccessToast('PSA graded card removed from collection!');
      } catch (error) {
        handleApiError(error, 'Failed to delete PSA graded card');
        setError('Failed to delete PSA graded card');
        setLoading(false);
      }
    },
    [setLoading, setError, removePsaCard]
  );

  const markPsaCardSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      setLoading(true);
      setError(null);

      try {
        log(`Marking PSA graded card ${id} as sold...`);
        const soldCard = await collectionApi.markPsaGradedCardSold(id, saleDetails);

        // Move card from collection to sold items
        movePsaCardToSold(id, soldCard);
        setLoading(false);

        log('PSA graded card marked as sold successfully');
        showSuccessToast('PSA graded card marked as sold! 💰');
      } catch (error) {
        handleApiError(error, 'Failed to mark PSA graded card as sold');
        setError('Failed to mark PSA graded card as sold');
        setLoading(false);
      }
    },
    [setLoading, setError, movePsaCardToSold]
  );

  // Raw Cards Operations - memoized for performance
  const addRawCard = useCallback(
    async (cardData: Partial<IRawCard>) => {
      setError(null);

      try {
        log('Adding raw card...');
        const newCard = await collectionApi.createRawCard(cardData);

        addRawCardToState(newCard);

        log('Raw card added successfully');
        showSuccessToast('Raw card added to collection!');
      } catch (error) {
        handleApiError(error, 'Failed to add raw card');
        setError('Failed to add raw card');
      }
    },
    [setError, addRawCardToState]
  );

  const updateRawCard = useCallback(
    async (id: string, cardData: Partial<IRawCard>) => {
      setLoading(true);
      setError(null);

      try {
        log(`[useCollectionOperations] Updating raw card ${id}...`);
        log(`[useCollectionOperations] Update data:`, cardData);
        const updatedCard = await collectionApi.updateRawCard(id, cardData);
        log(`[useCollectionOperations] API response:`, updatedCard);

        // Ensure the updated card has the proper ID
        const cardWithId = {
          ...updatedCard,
          id: updatedCard.id || (updatedCard as any)._id || id,
        };

        log(`[useCollectionOperations] Raw card with ensured ID:`, cardWithId);

        updateRawCardInState(id, cardWithId);
        setLoading(false);

        log('[useCollectionOperations] Raw card updated successfully - state updated');
        showSuccessToast('Raw card updated successfully!');
      } catch (error) {
        console.error('[useCollectionOperations] Raw card update failed:', error);
        handleApiError(error, 'Failed to update raw card');
        setError('Failed to update raw card');
        setLoading(false);
      }
    },
    [setLoading, setError, updateRawCardInState]
  );

  const deleteRawCard = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        log(`Deleting raw card ${id}...`);
        await collectionApi.deleteRawCard(id);

        removeRawCard(id);
        setLoading(false);

        log('Raw card deleted successfully');
        showSuccessToast('Raw card removed from collection!');
      } catch (error) {
        handleApiError(error, 'Failed to delete raw card');
        setError('Failed to delete raw card');
        setLoading(false);
      }
    },
    [setLoading, setError, removeRawCard]
  );

  const markRawCardSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      setLoading(true);
      setError(null);

      try {
        log(`Marking raw card ${id} as sold...`);
        const soldCard = await collectionApi.markRawCardSold(id, saleDetails);

        moveRawCardToSold(id, soldCard);
        setLoading(false);

        log('Raw card marked as sold successfully');
        showSuccessToast('Raw card marked as sold! 💰');
      } catch (error) {
        handleApiError(error, 'Failed to mark raw card as sold');
        setError('Failed to mark raw card as sold');
        setLoading(false);
      }
    },
    [setLoading, setError, moveRawCardToSold]
  );

  // Sealed Products Operations - memoized for performance
  const addSealedProduct = useCallback(
    async (productData: Partial<ISealedProduct>) => {
      setError(null);

      try {
        log('Adding sealed product...');
        const newProduct = await collectionApi.createSealedProduct(productData);

        addSealedProductToState(newProduct);

        log('Sealed product added successfully');
        showSuccessToast('Sealed product added to collection!');
      } catch (error) {
        handleApiError(error, 'Failed to add sealed product');
        setError('Failed to add sealed product');
      }
    },
    [setError, addSealedProductToState]
  );

  const updateSealedProduct = useCallback(
    async (id: string, productData: Partial<ISealedProduct>) => {
      setLoading(true);
      setError(null);

      try {
        log(`Updating sealed product ${id}...`);
        const updatedProduct = await collectionApi.updateSealedProduct(id, productData);

        updateSealedProductInState(id, updatedProduct);
        setLoading(false);

        log('Sealed product updated successfully');
        showSuccessToast('Sealed product updated successfully!');
      } catch (error) {
        handleApiError(error, 'Failed to update sealed product');
        setError('Failed to update sealed product');
        setLoading(false);
      }
    },
    [setLoading, setError, updateSealedProductInState]
  );

  const deleteSealedProduct = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        log(`Deleting sealed product ${id}...`);
        await collectionApi.deleteSealedProduct(id);

        removeSealedProduct(id);
        setLoading(false);

        log('Sealed product deleted successfully');
        showSuccessToast('Sealed product removed from collection!');
      } catch (error) {
        handleApiError(error, 'Failed to delete sealed product');
        setError('Failed to delete sealed product');
        setLoading(false);
      }
    },
    [setLoading, setError, removeSealedProduct]
  );

  const markSealedProductSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      setLoading(true);
      setError(null);

      try {
        log(`Marking sealed product ${id} as sold...`);
        const soldProduct = await collectionApi.markSealedProductSold(id, saleDetails);

        moveSealedProductToSold(id, soldProduct);
        setLoading(false);

        log('Sealed product marked as sold successfully');
        showSuccessToast('Sealed product marked as sold! 💰');
      } catch (error) {
        handleApiError(error, 'Failed to mark sealed product as sold');
        setError('Failed to mark sealed product as sold');
        setLoading(false);
      }
    },
    [setLoading, setError, moveSealedProductToSold]
  );

  // Export Operations - memoized for performance
  const downloadPsaCardImagesZip = useCallback(
    async (cardIds?: string[]) => {
      setLoading(true);
      setError(null);

      try {
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
      } catch (error) {
        handleApiError(error, 'Failed to download PSA card images');
        setError('Failed to download PSA card images');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const downloadRawCardImagesZip = useCallback(
    async (cardIds?: string[]) => {
      setLoading(true);
      setError(null);

      try {
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
      } catch (error) {
        handleApiError(error, 'Failed to download raw card images');
        setError('Failed to download raw card images');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const downloadSealedProductImagesZip = useCallback(
    async (productIds?: string[]) => {
      setLoading(true);
      setError(null);

      try {
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
      } catch (error) {
        handleApiError(error, 'Failed to download sealed product images');
        setError('Failed to download sealed product images');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  return {
    // PSA Cards operations
    addPsaCard,
    updatePsaCard,
    deletePsaCard,
    markPsaCardSold,

    // Raw Cards operations
    addRawCard,
    updateRawCard,
    deleteRawCard,
    markRawCardSold,

    // Sealed Products operations
    addSealedProduct,
    updateSealedProduct,
    deleteSealedProduct,
    markSealedProductSold,

    // Export operations
    downloadPsaCardImagesZip,
    downloadRawCardImagesZip,
    downloadSealedProductImagesZip,
  };
};
