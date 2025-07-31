/**
 * Collection Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows SOLID principles - composes specialized hooks with separated concerns
 */

import { useEffect, useCallback } from 'react';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';

import { useCollectionState, CollectionState } from './useCollectionState';
import { usePsaCardOperations } from './usePsaCardOperations';
import { useRawCardOperations } from './useRawCardOperations';
import { useSealedProductOperations } from './useSealedProductOperations';
import { useCollectionImageExport } from './useCollectionImageExport';
import { useAsyncOperation } from './useAsyncOperation';

export interface UseCollectionOperationsReturn extends CollectionState {
  // Loading states
  loading: boolean;
  error: string | null;

  // PSA Card operations
  addPsaCard: (cardData: Partial<IPsaGradedCard>) => Promise<void>;
  updatePsaCard: (
    id: string,
    cardData: Partial<IPsaGradedCard>
  ) => Promise<void>;
  deletePsaCard: (id: string) => Promise<void>;
  markPsaCardSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;

  // Raw Card operations
  addRawCard: (cardData: Partial<IRawCard>) => Promise<void>;
  updateRawCard: (id: string, cardData: Partial<IRawCard>) => Promise<void>;
  deleteRawCard: (id: string) => Promise<void>;
  markRawCardSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;

  // Sealed Product operations
  addSealedProduct: (productData: Partial<ISealedProduct>) => Promise<void>;
  updateSealedProduct: (
    id: string,
    productData: Partial<ISealedProduct>
  ) => Promise<void>;
  deleteSealedProduct: (id: string) => Promise<void>;
  markSealedProductSold: (
    id: string,
    saleDetails: ISaleDetails
  ) => Promise<void>;

  // Image Export operations
  downloadPsaCardImagesZip: (cardIds?: string[]) => Promise<void>;
  downloadRawCardImagesZip: (cardIds?: string[]) => Promise<void>;
  downloadSealedProductImagesZip: (productIds?: string[]) => Promise<void>;

  // General operations
  refreshCollection: () => Promise<void>;
  clearError: () => void;
}

/**
 * Main collection operations hook that composes specialized hooks
 * Follows SOLID principles:
 * - SRP: Each composed hook has single responsibility
 * - OCP: Extensible through composition
 * - LSP: All hooks follow consistent interfaces
 * - ISP: Clients can use specific interfaces instead of fat interface
 * - DIP: Depends on abstractions (specialized hooks)
 */
export const useCollectionOperations = (): UseCollectionOperationsReturn => {
  const collectionState = useCollectionState();
  const {
    setCollectionState,
    addPsaCardToState,
    updatePsaCardInState,
    removePsaCardFromState,
    movePsaCardToSold,
    addRawCardToState,
    updateRawCardInState,
    removeRawCardFromState,
    moveRawCardToSold,
    addSealedProductToState,
    updateSealedProductInState,
    removeSealedProductFromState,
    moveSealedProductToSold,
  } = collectionState;
  const psaOperations = usePsaCardOperations();
  const rawOperations = useRawCardOperations();
  const sealedOperations = useSealedProductOperations();
  const imageExport = useCollectionImageExport();
  const { loading, error, execute, clearError } = useAsyncOperation();
  const collectionApi = getCollectionApiService();

  /**
   * Validate collection response arrays for new API format
   */
  const validateCollectionResponse = (data: any[], type: string): any[] => {
    if (!Array.isArray(data)) {
      log(`[COLLECTION OPERATIONS] ${type} response is not an array`, { data });
      return [];
    }

    return data.filter((item) => {
      if (!item || typeof item !== 'object') {
        log(`[COLLECTION OPERATIONS] Invalid ${type} item filtered out`, {
          item,
        });
        return false;
      }

      if (!('id' in item) && !('_id' in item)) {
        log(`[COLLECTION OPERATIONS] ${type} item missing ID filtered out`, {
          item,
        });
        return false;
      }

      return true;
    });
  };

  /**
   * Fetch all collection data from the backend with enhanced error handling
   */
  const fetchAllCollectionData = useCallback(async () => {
    return await execute(async () => {
      log('[COLLECTION OPERATIONS] Fetching collection data...');

      try {
        // Fetch all collection items in parallel
        const [psaCardsResponse, rawCardsResponse, sealedProductsResponse] =
          await Promise.all([
            collectionApi.getPsaGradedCards({ sold: false }),
            collectionApi.getRawCards({ sold: false }),
            collectionApi.getSealedProducts({ sold: false }),
          ]);

        // Validate and clean responses
        const psaCards = validateCollectionResponse(
          psaCardsResponse,
          'PSA cards'
        );
        const rawCards = validateCollectionResponse(
          rawCardsResponse,
          'raw cards'
        );
        const sealedProducts = validateCollectionResponse(
          sealedProductsResponse,
          'sealed products'
        );

        // Fetch sold items separately
        const [soldPsaCards, soldRawCards, soldSealedProducts] =
          await Promise.all([
            collectionApi.getPsaGradedCards({ sold: true }),
            collectionApi.getRawCards({ sold: true }),
            collectionApi.getSealedProducts({ sold: true }),
          ]);

        // Validate and combine all sold items
        const validSoldPsaCards = validateCollectionResponse(
          soldPsaCards,
          'sold PSA cards'
        );
        const validSoldRawCards = validateCollectionResponse(
          soldRawCards,
          'sold raw cards'
        );
        const validSoldSealedProducts = validateCollectionResponse(
          soldSealedProducts,
          'sold sealed products'
        );

        const soldItems = [
          ...validSoldPsaCards,
          ...validSoldRawCards,
          ...validSoldSealedProducts,
        ];

        setCollectionState({
          psaCards,
          rawCards,
          sealedProducts,
          soldItems,
        });

        log('[COLLECTION OPERATIONS] Collection data fetched successfully', {
          psaCards: psaCards.length,
          rawCards: rawCards.length,
          sealedProducts: sealedProducts.length,
          soldItems: soldItems.length,
        });

        // Return the collection data for useAsyncOperation validation
        return {
          psaCards: psaCards.length,
          rawCards: rawCards.length,
          sealedProducts: sealedProducts.length,
          soldItems: soldItems.length,
        };
      } catch (error) {
        log('[COLLECTION OPERATIONS] Error fetching collection data', {
          error,
        });
        // Set empty arrays as fallbacks to prevent undefined access
        setCollectionState({
          psaCards: [],
          rawCards: [],
          sealedProducts: [],
          soldItems: [],
        });
        throw error;
      }
    });
  }, [execute, setCollectionState, collectionApi]);

  /**
   * Refresh collection data
   */
  const refreshCollection = useCallback(async () => {
    await fetchAllCollectionData();
  }, [fetchAllCollectionData]);

  // PSA Card operations with state integration
  const addPsaCard = useCallback(
    async (cardData: Partial<IPsaGradedCard>) => {
      try {
        const newCard = await psaOperations.addPsaCard(cardData);
        addPsaCardToState(newCard);
      } catch (error) {
        // Error already handled by psaOperations
      }
    },
    [psaOperations, addPsaCardToState]
  );

  const updatePsaCard = useCallback(
    async (id: string, cardData: Partial<IPsaGradedCard>) => {
      try {
        const updatedCard = await psaOperations.updatePsaCard(id, cardData);
        updatePsaCardInState(id, updatedCard);
      } catch (error) {
        // Error already handled by psaOperations
      }
    },
    [psaOperations, updatePsaCardInState]
  );

  const deletePsaCard = useCallback(
    async (id: string) => {
      try {
        await psaOperations.deletePsaCard(id);
        removePsaCardFromState(id);
      } catch (error) {
        // Error already handled by psaOperations
      }
    },
    [psaOperations, removePsaCardFromState]
  );

  const markPsaCardSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      try {
        const soldCard = await psaOperations.markPsaCardSold(id, saleDetails);
        movePsaCardToSold(id, soldCard);
      } catch (error) {
        // Error already handled by psaOperations
      }
    },
    [psaOperations, movePsaCardToSold]
  );

  // Raw Card operations with state integration
  const addRawCard = useCallback(
    async (cardData: Partial<IRawCard>) => {
      try {
        const newCard = await rawOperations.addRawCard(cardData);
        addRawCardToState(newCard);
      } catch (error) {
        // Error already handled by rawOperations
      }
    },
    [rawOperations, addRawCardToState]
  );

  const updateRawCard = useCallback(
    async (id: string, cardData: Partial<IRawCard>) => {
      try {
        const updatedCard = await rawOperations.updateRawCard(id, cardData);
        updateRawCardInState(id, updatedCard);
      } catch (error) {
        // Error already handled by rawOperations
      }
    },
    [rawOperations, updateRawCardInState]
  );

  const deleteRawCard = useCallback(
    async (id: string) => {
      try {
        await rawOperations.deleteRawCard(id);
        removeRawCardFromState(id);
      } catch (error) {
        // Error already handled by rawOperations
      }
    },
    [rawOperations, removeRawCardFromState]
  );

  const markRawCardSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      try {
        const soldCard = await rawOperations.markRawCardSold(id, saleDetails);
        moveRawCardToSold(id, soldCard);
      } catch (error) {
        // Error already handled by rawOperations
      }
    },
    [rawOperations, moveRawCardToSold]
  );

  // Sealed Product operations with state integration
  const addSealedProduct = useCallback(
    async (productData: Partial<ISealedProduct>) => {
      try {
        const newProduct = await sealedOperations.addSealedProduct(productData);
        addSealedProductToState(newProduct);
      } catch (error) {
        // Error already handled by sealedOperations
      }
    },
    [sealedOperations, addSealedProductToState]
  );

  const updateSealedProduct = useCallback(
    async (id: string, productData: Partial<ISealedProduct>) => {
      try {
        const updatedProduct = await sealedOperations.updateSealedProduct(
          id,
          productData
        );
        updateSealedProductInState(id, updatedProduct);
      } catch (error) {
        // Error already handled by sealedOperations
      }
    },
    [sealedOperations, updateSealedProductInState]
  );

  const deleteSealedProduct = useCallback(
    async (id: string) => {
      try {
        await sealedOperations.deleteSealedProduct(id);
        removeSealedProductFromState(id);
      } catch (error) {
        // Error already handled by sealedOperations
      }
    },
    [sealedOperations, removeSealedProductFromState]
  );

  const markSealedProductSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      try {
        const soldProduct = await sealedOperations.markSealedProductSold(
          id,
          saleDetails
        );
        moveSealedProductToSold(id, soldProduct);
      } catch (error) {
        // Error already handled by sealedOperations
      }
    },
    [sealedOperations, moveSealedProductToSold]
  );

  // Load collection data on hook initialization
  useEffect(() => {
    fetchAllCollectionData();

    // Check if collection needs refresh after returning from add-item page
    const needsRefresh = sessionStorage.getItem('collectionNeedsRefresh');
    if (needsRefresh === 'true') {
      sessionStorage.removeItem('collectionNeedsRefresh');
      log(
        'Collection refresh requested via sessionStorage, fetching fresh data...'
      );
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

  // Determine overall loading state
  const isLoading =
    loading ||
    psaOperations.loading ||
    rawOperations.loading ||
    sealedOperations.loading ||
    imageExport.loading;

  // Determine overall error state (prioritize operation errors over general errors)
  const overallError =
    psaOperations.error ||
    rawOperations.error ||
    sealedOperations.error ||
    imageExport.error ||
    error;

  // Combined clear error function
  const clearAllErrors = useCallback(() => {
    clearError();
    psaOperations.clearError();
    rawOperations.clearError();
    sealedOperations.clearError();
    imageExport.clearError();
  }, [clearError, psaOperations, rawOperations, sealedOperations, imageExport]);

  return {
    // State
    ...collectionState,
    loading: isLoading,
    error: overallError,

    // PSA Card operations
    addPsaCard,
    updatePsaCard,
    deletePsaCard,
    markPsaCardSold,

    // Raw Card operations
    addRawCard,
    updateRawCard,
    deleteRawCard,
    markRawCardSold,

    // Sealed Product operations
    addSealedProduct,
    updateSealedProduct,
    deleteSealedProduct,
    markSealedProductSold,

    // Image Export operations
    downloadPsaCardImagesZip: imageExport.downloadPsaCardImagesZip,
    downloadRawCardImagesZip: imageExport.downloadRawCardImagesZip,
    downloadSealedProductImagesZip: imageExport.downloadSealedProductImagesZip,

    // General operations
    refreshCollection,
    clearError: clearAllErrors,
  };
};
