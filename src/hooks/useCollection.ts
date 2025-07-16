/**
 * Collection Management Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Manages all collection-related state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';
import * as collectionApi from '../api/collectionApi';
import * as exportApi from '../api/exportApi';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';

export interface CollectionState {
  psaCards: IPsaGradedCard[];
  rawCards: IRawCard[];
  sealedProducts: ISealedProduct[];
  soldItems: (IPsaGradedCard | IRawCard | ISealedProduct)[];
  loading: boolean;
  error: string | null;
}

export interface UseCollectionReturn extends CollectionState {
  // PSA Graded Cards operations
  addPsaCard: (_cardData: Partial<IPsaGradedCard>) => Promise<void>;
  updatePsaCard: (_id: string, _cardData: Partial<IPsaGradedCard>) => Promise<void>;
  deletePsaCard: (_id: string) => Promise<void>;
  markPsaCardSold: (_id: string, _saleDetails: ISaleDetails) => Promise<void>;

  // Raw Cards operations
  addRawCard: (_cardData: Partial<IRawCard>) => Promise<void>;
  updateRawCard: (_id: string, _cardData: Partial<IRawCard>) => Promise<void>;
  deleteRawCard: (_id: string) => Promise<void>;
  markRawCardSold: (_id: string, _saleDetails: ISaleDetails) => Promise<void>;

  // Sealed Products operations
  addSealedProduct: (_productData: Partial<ISealedProduct>) => Promise<void>;
  updateSealedProduct: (_id: string, _productData: Partial<ISealedProduct>) => Promise<void>;
  deleteSealedProduct: (_id: string) => Promise<void>;
  markSealedProductSold: (_id: string, _saleDetails: ISaleDetails) => Promise<void>;

  // Export operations
  downloadPsaCardImagesZip: (_cardIds?: string[]) => Promise<void>;
  downloadRawCardImagesZip: (_cardIds?: string[]) => Promise<void>;
  downloadSealedProductImagesZip: (_productIds?: string[]) => Promise<void>;

  // General operations
  refreshCollection: () => Promise<void>;
  clearError: () => void;
}

export const useCollection = (): UseCollectionReturn => {
  const [state, setState] = useState<CollectionState>({
    psaCards: [],
    rawCards: [],
    sealedProducts: [],
    soldItems: [],
    loading: false,
    error: null,
  });

  /**
   * Set loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  /**
   * Set error state
   */
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  /**
   * Fetch all collection data from the backend
   */
  const fetchAllCollectionData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      log('Fetching collection data...');

      // Fetch all collection items in parallel
      const [psaCardsResponse, rawCardsResponse, sealedProductsResponse] = await Promise.all([
        collectionApi.getPsaGradedCards({ sold: false }),
        collectionApi.getRawCards({ sold: false }),
        collectionApi.getSealedProductCollection({ sold: false }),
      ]);

      // Fetch sold items separately
      const [soldPsaCards, soldRawCards, soldSealedProducts] = await Promise.all([
        collectionApi.getPsaGradedCards({ sold: true }),
        collectionApi.getRawCards({ sold: true }),
        collectionApi.getSealedProductCollection({ sold: true }),
      ]);

      const soldItems = [...soldPsaCards, ...soldRawCards, ...soldSealedProducts];

      setState(prev => ({
        ...prev,
        psaCards: psaCardsResponse,
        rawCards: rawCardsResponse,
        sealedProducts: sealedProductsResponse,
        soldItems,
        loading: false,
      }));

      log('Collection data fetched successfully');
    } catch (error) {
      handleApiError(error, 'Failed to fetch collection data');
      setError('Failed to load collection data');
      setLoading(false);
    }
  }, [setLoading, setError]);

  /**
   * Refresh collection data
   */
  const refreshCollection = useCallback(async () => {
    await fetchAllCollectionData();
  }, [fetchAllCollectionData]);

  // PSA Graded Cards Operations
  const addPsaCard = useCallback(
    async (cardData: Partial<IPsaGradedCard>) => {
      setError(null);

      try {
        log('Adding PSA graded card...');
        const newCard = await collectionApi.createPsaGradedCard(cardData);

        // Optimistic update - immediately add to state
        setState(prev => ({
          ...prev,
          psaCards: [...prev.psaCards, newCard],
        }));

        log('PSA graded card added successfully');
        showSuccessToast('PSA graded card added to collection!');
      } catch (error) {
        handleApiError(error, 'Failed to add PSA graded card');
        setError('Failed to add PSA graded card');
      }
    },
    [setError]
  );

  const updatePsaCard = useCallback(
    async (id: string, cardData: Partial<IPsaGradedCard>) => {
      setLoading(true);
      setError(null);

      try {
        log(`[useCollection] Updating PSA graded card ${id}...`);
        log(`[useCollection] Update data:`, cardData);
        const updatedCard = await collectionApi.updatePsaGradedCard(id, cardData);
        log(`[useCollection] API response:`, updatedCard);

        // Ensure the updated card has the proper ID
        const cardWithId = {
          ...updatedCard,
          id: updatedCard.id || (updatedCard as any)._id || id,
        };

        log(`[useCollection] Card with ensured ID:`, cardWithId);

        // Debug the current state and the comparison
        setState(prev => {
          const cardToUpdate = prev.psaCards.find(card => card.id === id);
          log(`[useCollection] Looking for card with ID: ${id}`);
          log(`[useCollection] Found card:`, cardToUpdate);
          log(
            `[useCollection] Current psaCards IDs:`,
            prev.psaCards.map(c => ({ id: c.id, _id: (c as any)._id }))
          );

          const updatedCards = prev.psaCards.map(card => {
            const matches = card.id === id;
            log(`[useCollection] Card ${card.id} matches ${id}? ${matches}`);
            return matches ? cardWithId : card;
          });

          log(`[useCollection] Updated cards count: ${updatedCards.length}`);
          log(
            `[useCollection] Updated card at position:`,
            updatedCards.findIndex(c => c.id === id)
          );

          return {
            ...prev,
            psaCards: updatedCards,
            loading: false,
          };
        });

        log('[useCollection] PSA graded card updated successfully - state updated');
        showSuccessToast('PSA graded card updated successfully!');
      } catch (error) {
        console.error('[useCollection] PSA update failed:', error);
        handleApiError(error, 'Failed to update PSA graded card');
        setError('Failed to update PSA graded card');
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const deletePsaCard = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        log(`Deleting PSA graded card ${id}...`);
        await collectionApi.deletePsaGradedCard(id);

        // Optimistic update
        setState(prev => ({
          ...prev,
          psaCards: prev.psaCards.filter(card => card.id !== id),
          loading: false,
        }));

        log('PSA graded card deleted successfully');
        showSuccessToast('PSA graded card removed from collection!');
      } catch (error) {
        handleApiError(error, 'Failed to delete PSA graded card');
        setError('Failed to delete PSA graded card');
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const markPsaCardSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      setLoading(true);
      setError(null);

      try {
        log(`Marking PSA graded card ${id} as sold...`);
        const soldCard = await collectionApi.markPsaGradedCardSold(id, saleDetails);

        // Move card from collection to sold items
        setState(prev => ({
          ...prev,
          psaCards: prev.psaCards.filter(card => card.id !== id),
          soldItems: [...prev.soldItems, soldCard],
          loading: false,
        }));

        log('PSA graded card marked as sold successfully');
        showSuccessToast('PSA graded card marked as sold! 💰');
      } catch (error) {
        handleApiError(error, 'Failed to mark PSA graded card as sold');
        setError('Failed to mark PSA graded card as sold');
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Raw Cards Operations (similar pattern)
  const addRawCard = useCallback(
    async (cardData: Partial<IRawCard>) => {
      setError(null);

      try {
        log('Adding raw card...');
        const newCard = await collectionApi.createRawCard(cardData);

        setState(prev => ({
          ...prev,
          rawCards: [...prev.rawCards, newCard],
        }));

        log('Raw card added successfully');
        showSuccessToast('Raw card added to collection!');
      } catch (error) {
        handleApiError(error, 'Failed to add raw card');
        setError('Failed to add raw card');
      }
    },
    [setError]
  );

  const updateRawCard = useCallback(
    async (id: string, cardData: Partial<IRawCard>) => {
      setLoading(true);
      setError(null);

      try {
        log(`[useCollection] Updating raw card ${id}...`);
        log(`[useCollection] Update data:`, cardData);
        const updatedCard = await collectionApi.updateRawCard(id, cardData);
        log(`[useCollection] API response:`, updatedCard);

        // Ensure the updated card has the proper ID
        const cardWithId = {
          ...updatedCard,
          id: updatedCard.id || (updatedCard as any)._id || id,
        };

        log(`[useCollection] Raw card with ensured ID:`, cardWithId);

        setState(prev => {
          const updatedCards = prev.rawCards.map(card => {
            const matches = card.id === id;
            log(`[useCollection] Raw card ${card.id} matches ${id}? ${matches}`);
            return matches ? cardWithId : card;
          });

          return {
            ...prev,
            rawCards: updatedCards,
            loading: false,
          };
        });

        log('[useCollection] Raw card updated successfully - state updated');
        showSuccessToast('Raw card updated successfully!');
      } catch (error) {
        console.error('[useCollection] Raw card update failed:', error);
        handleApiError(error, 'Failed to update raw card');
        setError('Failed to update raw card');
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const deleteRawCard = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        log(`Deleting raw card ${id}...`);
        await collectionApi.deleteRawCard(id);

        setState(prev => ({
          ...prev,
          rawCards: prev.rawCards.filter(card => card.id !== id),
          loading: false,
        }));

        log('Raw card deleted successfully');
      } catch (error) {
        handleApiError(error, 'Failed to delete raw card');
        setError('Failed to delete raw card');
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const markRawCardSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      setLoading(true);
      setError(null);

      try {
        log(`Marking raw card ${id} as sold...`);
        const soldCard = await collectionApi.markRawCardSold(id, saleDetails);

        setState(prev => ({
          ...prev,
          rawCards: prev.rawCards.filter(card => card.id !== id),
          soldItems: [...prev.soldItems, soldCard],
          loading: false,
        }));

        log('Raw card marked as sold successfully');
      } catch (error) {
        handleApiError(error, 'Failed to mark raw card as sold');
        setError('Failed to mark raw card as sold');
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Sealed Products Operations (similar pattern)
  const addSealedProduct = useCallback(
    async (productData: Partial<ISealedProduct>) => {
      setError(null);

      try {
        log('Adding sealed product...');
        const newProduct = await collectionApi.createSealedProduct(productData);

        setState(prev => ({
          ...prev,
          sealedProducts: [...prev.sealedProducts, newProduct],
        }));

        log('Sealed product added successfully');
        showSuccessToast('Sealed product added to collection!');
      } catch (error) {
        handleApiError(error, 'Failed to add sealed product');
        setError('Failed to add sealed product');
      }
    },
    [setError]
  );

  const updateSealedProduct = useCallback(
    async (id: string, productData: Partial<ISealedProduct>) => {
      setLoading(true);
      setError(null);

      try {
        log(`Updating sealed product ${id}...`);
        const updatedProduct = await collectionApi.updateSealedProduct(id, productData);

        setState(prev => ({
          ...prev,
          sealedProducts: prev.sealedProducts.map(product =>
            product.id === id ? updatedProduct : product
          ),
          loading: false,
        }));

        log('Sealed product updated successfully');
      } catch (error) {
        handleApiError(error, 'Failed to update sealed product');
        setError('Failed to update sealed product');
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const deleteSealedProduct = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        log(`Deleting sealed product ${id}...`);
        await collectionApi.deleteSealedProduct(id);

        setState(prev => ({
          ...prev,
          sealedProducts: prev.sealedProducts.filter(product => product.id !== id),
          loading: false,
        }));

        log('Sealed product deleted successfully');
      } catch (error) {
        handleApiError(error, 'Failed to delete sealed product');
        setError('Failed to delete sealed product');
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const markSealedProductSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      setLoading(true);
      setError(null);

      try {
        log(`Marking sealed product ${id} as sold...`);
        const soldProduct = await collectionApi.markSealedProductSold(id, saleDetails);

        setState(prev => ({
          ...prev,
          sealedProducts: prev.sealedProducts.filter(product => product.id !== id),
          soldItems: [...prev.soldItems, soldProduct],
          loading: false,
        }));

        log('Sealed product marked as sold successfully');
      } catch (error) {
        handleApiError(error, 'Failed to mark sealed product as sold');
        setError('Failed to mark sealed product as sold');
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Download PSA Card images as ZIP
   */
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

  /**
   * Download Raw Card images as ZIP
   */
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

  /**
   * Download Sealed Product images as ZIP
   */
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

  // Load collection data on hook initialization
  useEffect(() => {
    fetchAllCollectionData();

    // Check if collection needs refresh after returning from add-item page
    const needsRefresh = sessionStorage.getItem('collectionNeedsRefresh');
    if (needsRefresh === 'true') {
      sessionStorage.removeItem('collectionNeedsRefresh');
      log('Collection refresh requested via sessionStorage, fetching fresh data...');
      // Small delay to ensure any pending operations complete
      setTimeout(() => {
        fetchAllCollectionData();
      }, 200);
    }
  }, [fetchAllCollectionData]);

  // Listen for collection update events (triggered when items are added from other pages)
  useEffect(() => {
    const handleCollectionUpdate = () => {
      log('Collection update event received, refreshing data...');
      refreshCollection();
    };

    // Listen for custom collection update events
    window.addEventListener('collectionUpdated', handleCollectionUpdate);

    return () => {
      window.removeEventListener('collectionUpdated', handleCollectionUpdate);
    };
  }, [refreshCollection]);

  return {
    // State
    ...state,

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

    // General operations
    refreshCollection,
    clearError,
  };
};
