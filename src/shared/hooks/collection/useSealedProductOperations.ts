/**
 * Sealed Product Operations Hook
 * Focused hook following SRP - handles only sealed product operations
 * Extracted from '../../../shared/hooks';
 */

import { useQuery } from '@tanstack/react-query';
import { ISealedProduct } from '../../domain/models/sealedProduct';
import { ISaleDetails } from '../../../types/common';
import { unifiedApiService } from '../../services/UnifiedApiService';
import { queryKeys } from '../../../app/lib/queryClient';
import { useQueryInvalidation } from '../useQueryInvalidation';
import {
  createSealedProductConfig,
  useGenericCrudOperations,
} from '../crud/useGenericCrudOperations';

export interface UseSealedProductOperationsReturn {
  // Data
  sealedProducts: ISealedProduct[];
  loading: boolean;
  error: string | null;

  // Operations
  addSealedProduct: (productData: Partial<ISealedProduct>) => Promise<void>;
  updateSealedProduct: (id: string, productData: Partial<ISealedProduct>) => Promise<void>;
  deleteSealedProduct: (id: string) => Promise<void>;
  markSealedProductSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;
}

export const useSealedProductOperations = (): UseSealedProductOperationsReturn => {
  const collectionApi = unifiedApiService.collection;
  const { invalidateSealedProductQueries } = useQueryInvalidation();

  // Sealed Products data query
  const {
    data: sealedProducts = [],
    isLoading: sealedLoading,
    error: sealedError,
  } = useQuery<ISealedProduct[]>({
    queryKey: queryKeys.sealedProducts(),
    queryFn: async () => {
      const response = await collectionApi.getSealedProducts();
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create Sealed Product configuration and operations
  const sealedEntityConfig = createSealedProductConfig(collectionApi);
  const sealedOperations = useGenericCrudOperations(sealedEntityConfig.apiMethods, {
    entityName: sealedEntityConfig.entityName,
    addSuccess: sealedEntityConfig.messages.addSuccess,
    updateSuccess: sealedEntityConfig.messages.updateSuccess,
    deleteSuccess: sealedEntityConfig.messages.deleteSuccess,
    soldSuccess: sealedEntityConfig.messages.soldSuccess,
  });

  // Sealed Product operations with invalidation
  const addSealedProduct = async (productData: Partial<ISealedProduct>) => {
    await sealedOperations.handleAdd(productData);
    await invalidateSealedProductQueries();
  };

  const updateSealedProduct = async (id: string, productData: Partial<ISealedProduct>) => {
    await sealedOperations.handleUpdate(id, productData);
    await invalidateSealedProductQueries();
  };

  const deleteSealedProduct = async (id: string) => {
    await sealedOperations.handleDelete(id);
    await invalidateSealedProductQueries();
  };

  const markSealedProductSold = async (id: string, saleDetails: ISaleDetails) => {
    await sealedOperations.handleMarkSold(id, saleDetails);
    await invalidateSealedProductQueries();
  };

  return {
    sealedProducts,
    loading: sealedLoading,
    error: sealedError?.message || null,
    addSealedProduct,
    updateSealedProduct,
    deleteSealedProduct,
    markSealedProductSold,
  };
};