/**
 * Raw Card Operations Hook
 * Focused hook following SRP - handles only raw card operations
 * Extracted from "@/shared/hooks';
 */

import { useQuery } from '@tanstack/react-query';
import { IRawCard } from '../../domain/models/card';
import { ISaleDetails } from '@/types/common';
import { unifiedApiService } from '../../services/UnifiedApiService';
import { queryKeys } from '@/app/lib/queryClient';
import { useQueryInvalidation } from '../useQueryInvalidation';
import {
  createRawCardConfig,
  useGenericCrudOperations,
} from '../crud/useGenericCrudOperations';

export interface UseRawCardOperationsReturn {
  // Data
  rawCards: IRawCard[];
  loading: boolean;
  error: string | null;

  // Operations
  addRawCard: (cardData: Partial<IRawCard>) => Promise<void>;
  updateRawCard: (id: string, cardData: Partial<IRawCard>) => Promise<void>;
  deleteRawCard: (id: string) => Promise<void>;
  markRawCardSold: (id: string, saleDetails: ISaleDetails) => Promise<void>;
}

export const useRawCardOperations = (): UseRawCardOperationsReturn => {
  const collectionApi = unifiedApiService.collection;
  const { invalidateRawCardQueries } = useQueryInvalidation();

  // Raw Cards data query
  const {
    data: rawCards = [],
    isLoading: rawLoading,
    error: rawError,
  } = useQuery<IRawCard[]>({
    queryKey: queryKeys.rawCards(),
    queryFn: async () => {
      const response = await collectionApi.getRawCards();
      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create Raw Card configuration and operations
  const rawEntityConfig = createRawCardConfig(collectionApi);
  const rawOperations = useGenericCrudOperations(rawEntityConfig.apiMethods, {
    entityName: rawEntityConfig.entityName,
    addSuccess: rawEntityConfig.messages.addSuccess,
    updateSuccess: rawEntityConfig.messages.updateSuccess,
    deleteSuccess: rawEntityConfig.messages.deleteSuccess,
    soldSuccess: rawEntityConfig.messages.soldSuccess,
  });

  // Raw Card operations with invalidation
  const addRawCard = async (cardData: Partial<IRawCard>) => {
    await rawOperations.handleAdd(cardData);
    await invalidateRawCardQueries();
  };

  const updateRawCard = async (id: string, cardData: Partial<IRawCard>) => {
    await rawOperations.handleUpdate(id, cardData);
    await invalidateRawCardQueries();
  };

  const deleteRawCard = async (id: string) => {
    await rawOperations.handleDelete(id);
    await invalidateRawCardQueries();
  };

  const markRawCardSold = async (id: string, saleDetails: ISaleDetails) => {
    await rawOperations.handleMarkSold(id, saleDetails);
    await invalidateRawCardQueries();
  };

  return {
    rawCards,
    loading: rawLoading,
    error: rawError?.message || null,
    addRawCard,
    updateRawCard,
    deleteRawCard,
    markRawCardSold,
  };
};