/**
 * PSA Card Operations Hook
 * Focused hook following SRP - handles only PSA card operations
 * Extracted from "@/shared/hooks';
 */

import { useQuery } from '@tanstack/react-query';
import { IPsaGradedCard } from '../../domain/models/card';
import { ISaleDetails } from '@/types/common';
import { unifiedApiService } from '../../services/UnifiedApiService';
import { queryKeys } from '@/app/lib/queryClient';
import { useQueryInvalidation } from '../useQueryInvalidation';
import {
  createPsaCardConfig,
  useGenericCrudOperations,
} from '../crud/useGenericCrudOperations';

export interface UsePsaCardOperationsReturn {
  // Data
  psaCards: IPsaGradedCard[];
  loading: boolean;
  error: string | null;

  // Operations
  addPsaCard: (cardData: Partial<IPsaGradedCard>) => Promise<void>;
  updatePsaCard: (id: string, cardData: Partial<IPsaGradedCard>) => Promise<void>;
  deletePsaCard: (id: string) => Promise<void>;
  markPsaCardSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;
}

export const usePsaCardOperations = (): UsePsaCardOperationsReturn => {
  const collectionApi = unifiedApiService.collection;
  const { invalidatePsaCardQueries } = useQueryInvalidation();

  // PSA Cards data query
  const {
    data: psaCards = [],
    isLoading: psaLoading,
    error: psaError,
  } = useQuery<IPsaGradedCard[]>({
    queryKey: queryKeys.psaCards(),
    queryFn: async () => {
      const response = await collectionApi.getPsaGradedCards();
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create PSA Card configuration and operations
  const psaEntityConfig = createPsaCardConfig(collectionApi);
  const psaOperations = useGenericCrudOperations(psaEntityConfig.apiMethods, {
    entityName: psaEntityConfig.entityName,
    addSuccess: psaEntityConfig.messages.addSuccess,
    updateSuccess: psaEntityConfig.messages.updateSuccess,
    deleteSuccess: psaEntityConfig.messages.deleteSuccess,
    soldSuccess: psaEntityConfig.messages.soldSuccess,
  });

  // PSA Card operations with invalidation
  const addPsaCard = async (cardData: Partial<IPsaGradedCard>) => {
    await psaOperations.handleAdd(cardData);
    await invalidatePsaCardQueries();
  };

  const updatePsaCard = async (id: string, cardData: Partial<IPsaGradedCard>) => {
    await psaOperations.handleUpdate(id, cardData);
    await invalidatePsaCardQueries();
  };

  const deletePsaCard = async (id: string) => {
    await psaOperations.handleDelete(id);
    await invalidatePsaCardQueries();
  };

  const markPsaCardSold = async (id: string, saleDetails: ISaleDetails) => {
    await psaOperations.handleMarkSold(id, saleDetails);
    await invalidatePsaCardQueries();
  };

  return {
    psaCards,
    loading: psaLoading,
    error: psaError?.message || null,
    addPsaCard,
    updatePsaCard,
    deletePsaCard,
    markPsaCardSold,
  };
};