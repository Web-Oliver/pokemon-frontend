/**
 * Collection Overview Hook
 * Replaces the massive useCollectionOperations by composing focused hooks
 * Following SRP - each entity type has its own focused hook
 */

import { useQuery } from '@tanstack/react-query';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';
import { unifiedApiService } from '../../services/UnifiedApiService';
import { queryKeys } from '@/app/lib/queryClient';
import { useCollectionImageExport } from '../useCollectionImageExport';
import { useQueryInvalidation } from '../useQueryInvalidation';
import { usePsaCardOperations } from './usePsaCardOperations';
import { useRawCardOperations } from './useRawCardOperations';
import { useSealedProductOperations } from './useSealedProductOperations';

export interface UseCollectionOverviewReturn {
  // Composed data from focused hooks
  psaCards: IPsaGradedCard[];
  rawCards: IRawCard[];
  sealedProducts: ISealedProduct[];
  soldItems: (IPsaGradedCard | IRawCard | ISealedProduct)[];

  // Loading states
  loading: boolean;
  error: string | null;

  // PSA Card operations (delegated)
  addPsaCard: (cardData: Partial<IPsaGradedCard>) => Promise<void>;
  updatePsaCard: (id: string, cardData: Partial<IPsaGradedCard>) => Promise<void>;
  deletePsaCard: (id: string) => Promise<void>;
  markPsaCardSold: (id: string, saleDetails: any) => Promise<void>;

  // Raw Card operations (delegated)
  addRawCard: (cardData: Partial<IRawCard>) => Promise<void>;
  updateRawCard: (id: string, cardData: Partial<IRawCard>) => Promise<void>;
  deleteRawCard: (id: string) => Promise<void>;
  markRawCardSold: (id: string, saleDetails: any) => Promise<void>;

  // Sealed Product operations (delegated)
  addSealedProduct: (productData: Partial<ISealedProduct>) => Promise<void>;
  updateSealedProduct: (id: string, productData: Partial<ISealedProduct>) => Promise<void>;
  deleteSealedProduct: (id: string) => Promise<void>;
  markSealedProductSold: (id: string, saleDetails: any) => Promise<void>;

  // Image Export operations (delegated)
  downloadPsaCardImagesZip: () => Promise<void>;
  downloadRawCardImagesZip: () => Promise<void>;
  downloadSealedProductImagesZip: () => Promise<void>;

  // General operations
  refreshCollection: () => Promise<void>;
  clearError: () => void;
}

export const useCollectionOverview = (): UseCollectionOverviewReturn => {
  // Use focused hooks for each entity type (SRP compliance)
  const psaCardOps = usePsaCardOperations();
  const rawCardOps = useRawCardOperations();
  const sealedProductOps = useSealedProductOperations();

  // Image export functionality (already extracted)
  const imageExport = useCollectionImageExport();

  // Query invalidation (centralized)
  const { invalidateCollectionQueries } = useQueryInvalidation();

  // Sold items query
  const {
    data: soldItems = [],
    isLoading: soldLoading,
    error: soldError,
  } = useQuery({
    queryKey: queryKeys.soldItems(),
    queryFn: async () => {
      const response = await unifiedApiService.collection.getSoldItems();
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Aggregate loading and error states
  const loading = psaCardOps.loading || rawCardOps.loading || sealedProductOps.loading || soldLoading;
  const error = psaCardOps.error || rawCardOps.error || sealedProductOps.error || soldError?.message || null;

  // General operations
  const refreshCollection = async () => {
    await invalidateCollectionQueries();
  };

  const clearError = () => {
    // Individual hooks handle their own error clearing
    // This could be enhanced to clear errors in focused hooks
  };

  return {
    // Data from focused hooks
    psaCards: psaCardOps.psaCards,
    rawCards: rawCardOps.rawCards,
    sealedProducts: sealedProductOps.sealedProducts,
    soldItems,

    // Aggregate states
    loading,
    error,

    // Delegated operations (SRP - each hook handles its own entity)
    addPsaCard: psaCardOps.addPsaCard,
    updatePsaCard: psaCardOps.updatePsaCard,
    deletePsaCard: psaCardOps.deletePsaCard,
    markPsaCardSold: psaCardOps.markPsaCardSold,

    addRawCard: rawCardOps.addRawCard,
    updateRawCard: rawCardOps.updateRawCard,
    deleteRawCard: rawCardOps.deleteRawCard,
    markRawCardSold: rawCardOps.markRawCardSold,

    addSealedProduct: sealedProductOps.addSealedProduct,
    updateSealedProduct: sealedProductOps.updateSealedProduct,
    deleteSealedProduct: sealedProductOps.deleteSealedProduct,
    markSealedProductSold: sealedProductOps.markSealedProductSold,

    // Image operations
    downloadPsaCardImagesZip: imageExport.downloadPsaCardImagesZip,
    downloadRawCardImagesZip: imageExport.downloadRawCardImagesZip,
    downloadSealedProductImagesZip: imageExport.downloadSealedProductImagesZip,

    // General operations
    refreshCollection,
    clearError,
  };
};