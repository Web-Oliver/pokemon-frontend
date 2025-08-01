/**
 * Collection Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows SOLID principles - composes specialized hooks with separated concerns
 */

import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { log } from '../utils/logger';
import { queryKeys } from '../lib/queryClient';

import { usePsaCardOperations } from './usePsaCardOperations';
import { useRawCardOperations } from './useRawCardOperations';
import { useSealedProductOperations } from './useSealedProductOperations';
import { useCollectionImageExport } from './useCollectionImageExport';

export interface UseCollectionOperationsReturn {
  // Collection data
  psaCards: IPsaGradedCard[];
  rawCards: IRawCard[];
  sealedProducts: ISealedProduct[];
  soldItems: (IPsaGradedCard | IRawCard | ISealedProduct)[];

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
 * Main collection operations hook using React Query for performance
 * Follows SOLID principles:
 * - SRP: Each composed hook has single responsibility
 * - OCP: Extensible through composition
 * - LSP: All hooks follow consistent interfaces
 * - ISP: Clients can use specific interfaces instead of fat interface
 * - DIP: Depends on abstractions (specialized hooks)
 */
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

export const useCollectionOperations = (): UseCollectionOperationsReturn => {
  const queryClient = useQueryClient();
  const psaOperations = usePsaCardOperations();
  const rawOperations = useRawCardOperations();
  const sealedOperations = useSealedProductOperations();
  const imageExport = useCollectionImageExport();
  const collectionApi = getCollectionApiService();

  // React Query for PSA Cards
  const {
    data: psaCards = [],
    isLoading: psaLoading,
    error: psaError,
  } = useQuery({
    queryKey: queryKeys.psaCards(),
    queryFn: () => collectionApi.getPsaGradedCards({ sold: false }),
    select: (data) => validateCollectionResponse(data, 'PSA cards'),
  });

  // React Query for Raw Cards
  const {
    data: rawCards = [],
    isLoading: rawLoading,
    error: rawError,
  } = useQuery({
    queryKey: queryKeys.rawCards(),
    queryFn: () => collectionApi.getRawCards({ sold: false }),
    select: (data) => validateCollectionResponse(data, 'raw cards'),
  });

  // React Query for Sealed Products
  const {
    data: sealedProducts = [],
    isLoading: sealedLoading,
    error: sealedError,
  } = useQuery({
    queryKey: queryKeys.sealedProducts(),
    queryFn: () => collectionApi.getSealedProducts({ sold: false }),
    select: (data) => validateCollectionResponse(data, 'sealed products'),
  });

  // React Query for Sold Items
  const {
    data: soldItems = [],
    isLoading: soldLoading,
    error: soldError,
  } = useQuery({
    queryKey: queryKeys.soldItems(),
    queryFn: async () => {
      const [soldPsaCards, soldRawCards, soldSealedProducts] =
        await Promise.all([
          collectionApi.getPsaGradedCards({ sold: true }),
          collectionApi.getRawCards({ sold: true }),
          collectionApi.getSealedProducts({ sold: true }),
        ]);

      return [
        ...validateCollectionResponse(soldPsaCards, 'sold PSA cards'),
        ...validateCollectionResponse(soldRawCards, 'sold raw cards'),
        ...validateCollectionResponse(
          soldSealedProducts,
          'sold sealed products'
        ),
      ];
    },
  });

  /**
   * Refresh collection data using React Query
   */
  const refreshCollection = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.psaCards() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.rawCards() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sealedProducts() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.soldItems() }),
    ]);
  }, [queryClient]);

  // PSA Card operations with cache invalidation
  const addPsaCard = useCallback(
    async (cardData: Partial<IPsaGradedCard>) => {
      try {
        const newCard = await psaOperations.addPsaCard(cardData);
        queryClient.invalidateQueries({ queryKey: queryKeys.psaCards() });
        return newCard;
      } catch (error) {
        // Error already handled by psaOperations
        throw error;
      }
    },
    [psaOperations, queryClient]
  );

  const updatePsaCard = useCallback(
    async (id: string, cardData: Partial<IPsaGradedCard>) => {
      try {
        const updatedCard = await psaOperations.updatePsaCard(id, cardData);
        queryClient.invalidateQueries({ queryKey: queryKeys.psaCards() });
        return updatedCard;
      } catch (error) {
        // Error already handled by psaOperations
        throw error;
      }
    },
    [psaOperations, queryClient]
  );

  const deletePsaCard = useCallback(
    async (id: string) => {
      try {
        await psaOperations.deletePsaCard(id);
        queryClient.invalidateQueries({ queryKey: queryKeys.psaCards() });
      } catch (error) {
        // Error already handled by psaOperations
        throw error;
      }
    },
    [psaOperations, queryClient]
  );

  const markPsaCardSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      try {
        const soldCard = await psaOperations.markPsaCardSold(id, saleDetails);
        queryClient.invalidateQueries({ queryKey: queryKeys.psaCards() });
        queryClient.invalidateQueries({ queryKey: queryKeys.soldItems() });
        return soldCard;
      } catch (error) {
        // Error already handled by psaOperations
        throw error;
      }
    },
    [psaOperations, queryClient]
  );

  // Raw Card operations with cache invalidation
  const addRawCard = useCallback(
    async (cardData: Partial<IRawCard>) => {
      try {
        const newCard = await rawOperations.addRawCard(cardData);
        queryClient.invalidateQueries({ queryKey: queryKeys.rawCards() });
        return newCard;
      } catch (error) {
        // Error already handled by rawOperations
        throw error;
      }
    },
    [rawOperations, queryClient]
  );

  const updateRawCard = useCallback(
    async (id: string, cardData: Partial<IRawCard>) => {
      try {
        const updatedCard = await rawOperations.updateRawCard(id, cardData);
        queryClient.invalidateQueries({ queryKey: queryKeys.rawCards() });
        return updatedCard;
      } catch (error) {
        // Error already handled by rawOperations
        throw error;
      }
    },
    [rawOperations, queryClient]
  );

  const deleteRawCard = useCallback(
    async (id: string) => {
      try {
        await rawOperations.deleteRawCard(id);
        queryClient.invalidateQueries({ queryKey: queryKeys.rawCards() });
      } catch (error) {
        // Error already handled by rawOperations
        throw error;
      }
    },
    [rawOperations, queryClient]
  );

  const markRawCardSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      try {
        const soldCard = await rawOperations.markRawCardSold(id, saleDetails);
        queryClient.invalidateQueries({ queryKey: queryKeys.rawCards() });
        queryClient.invalidateQueries({ queryKey: queryKeys.soldItems() });
        return soldCard;
      } catch (error) {
        // Error already handled by rawOperations
        throw error;
      }
    },
    [rawOperations, queryClient]
  );

  // Sealed Product operations with cache invalidation
  const addSealedProduct = useCallback(
    async (productData: Partial<ISealedProduct>) => {
      try {
        const newProduct = await sealedOperations.addSealedProduct(productData);
        queryClient.invalidateQueries({ queryKey: queryKeys.sealedProducts() });
        return newProduct;
      } catch (error) {
        // Error already handled by sealedOperations
        throw error;
      }
    },
    [sealedOperations, queryClient]
  );

  const updateSealedProduct = useCallback(
    async (id: string, productData: Partial<ISealedProduct>) => {
      try {
        const updatedProduct = await sealedOperations.updateSealedProduct(
          id,
          productData
        );
        queryClient.invalidateQueries({ queryKey: queryKeys.sealedProducts() });
        return updatedProduct;
      } catch (error) {
        // Error already handled by sealedOperations
        throw error;
      }
    },
    [sealedOperations, queryClient]
  );

  const deleteSealedProduct = useCallback(
    async (id: string) => {
      try {
        await sealedOperations.deleteSealedProduct(id);
        queryClient.invalidateQueries({ queryKey: queryKeys.sealedProducts() });
      } catch (error) {
        // Error already handled by sealedOperations
        throw error;
      }
    },
    [sealedOperations, queryClient]
  );

  const markSealedProductSold = useCallback(
    async (id: string, saleDetails: ISaleDetails) => {
      try {
        const soldProduct = await sealedOperations.markSealedProductSold(
          id,
          saleDetails
        );
        queryClient.invalidateQueries({ queryKey: queryKeys.sealedProducts() });
        queryClient.invalidateQueries({ queryKey: queryKeys.soldItems() });
        return soldProduct;
      } catch (error) {
        // Error already handled by sealedOperations
        throw error;
      }
    },
    [sealedOperations, queryClient]
  );

  // Handle refresh requests from session storage
  useEffect(() => {
    const needsRefresh = sessionStorage.getItem('collectionNeedsRefresh');
    if (needsRefresh === 'true') {
      sessionStorage.removeItem('collectionNeedsRefresh');
      log(
        'Collection refresh requested via sessionStorage, invalidating queries...'
      );
      setTimeout(() => {
        refreshCollection();
      }, 200);
    }
  }, [refreshCollection]);

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
    psaLoading ||
    rawLoading ||
    sealedLoading ||
    soldLoading ||
    psaOperations.loading ||
    rawOperations.loading ||
    sealedOperations.loading ||
    imageExport.loading;

  // Determine overall error state
  const overallError =
    psaError?.message ||
    rawError?.message ||
    sealedError?.message ||
    soldError?.message ||
    psaOperations.error ||
    rawOperations.error ||
    sealedOperations.error ||
    imageExport.error;

  // Combined clear error function
  const clearAllErrors = useCallback(() => {
    queryClient.resetQueries({ queryKey: queryKeys.collection });
    psaOperations.clearError();
    rawOperations.clearError();
    sealedOperations.clearError();
    imageExport.clearError();
  }, [
    queryClient,
    psaOperations,
    rawOperations,
    sealedOperations,
    imageExport,
  ]);

  return {
    // Collection data from React Query
    psaCards,
    rawCards,
    sealedProducts,
    soldItems,
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
