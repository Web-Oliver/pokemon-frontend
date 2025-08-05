/**
 * PSA Card Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles PSA card operations
 *
 * OPTIMIZED: Now uses useGenericCrudOperations to eliminate code duplication
 * Following CLAUDE.md DRY principles - reduced from ~100 lines to ~30 lines
 */

import { useMemo } from 'react';
import { IPsaGradedCard } from '../domain/models/card';
import { ISaleDetails } from '../domain/models/common';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { useGenericCrudOperations } from './useGenericCrudOperations';

export interface UsePsaCardOperationsReturn {
  loading: boolean;
  error: string | null;
  addPsaCard: (cardData: Partial<IPsaGradedCard>) => Promise<IPsaGradedCard>;
  updatePsaCard: (
    id: string,
    cardData: Partial<IPsaGradedCard>
  ) => Promise<IPsaGradedCard>;
  deletePsaCard: (id: string) => Promise<void>;
  markPsaCardSold: (
    id: string,
    saleDetails: ISaleDetails
  ) => Promise<IPsaGradedCard>;
  clearError: () => void;
}

/**
 * Hook for PSA card operations
 * Uses generic CRUD operations to eliminate code duplication
 * Follows SRP - only handles PSA card configuration and interface mapping
 */
export const // ========================================
// CONSOLIDATED PSA CARD OPERATIONS HOOK
// ========================================
// Now uses consolidated useConsolidatedCollectionOperations following SOLID/DRY principles

import { useMemo } from 'react';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { 
  useConsolidatedCollectionOperations, 
  createPsaCardConfig 
} from './useGenericCrudOperations';

/**
 * PSA Card operations hook - uses consolidated collection operations
 * Maintains backward compatibility while eliminating code duplication
 */
export const usePsaCardOperations = () => {
  const collectionApi = getCollectionApiService();

  // Create entity configuration using factory
  const entityConfig = useMemo(
    () => createPsaCardConfig(collectionApi),
    [collectionApi]
  );

  // Use consolidated operations hook
  const operations = useConsolidatedCollectionOperations(entityConfig);

  // Return interface-compatible methods for backward compatibility
  return {
    loading: operations.loading,
    error: operations.error,
    addPsaCard: operations.add,
    updatePsaCard: operations.update,
    deletePsaCard: operations.delete,
    markPsaCardSold: operations.markSold,
    clearError: operations.clearError,
  };
};;
