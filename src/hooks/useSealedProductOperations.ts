/**
 * Sealed Product Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles Sealed product operations
 *
 * OPTIMIZED: Now uses useGenericCrudOperations to eliminate code duplication
 * Following CLAUDE.md DRY principles - reduced from ~100 lines to ~30 lines
 */

import { useMemo } from 'react';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { useGenericCrudOperations } from './useGenericCrudOperations';

export interface UseSealedProductOperationsReturn {
  loading: boolean;
  error: string | null;
  addSealedProduct: (
    productData: Partial<ISealedProduct>
  ) => Promise<ISealedProduct>;
  updateSealedProduct: (
    id: string,
    productData: Partial<ISealedProduct>
  ) => Promise<ISealedProduct>;
  deleteSealedProduct: (id: string) => Promise<void>;
  markSealedProductSold: (
    id: string,
    saleDetails: ISaleDetails
  ) => Promise<ISealedProduct>;
  clearError: () => void;
}

/**
 * Hook for Sealed product operations
 * Uses generic CRUD operations to eliminate code duplication
 * Follows SRP - only handles Sealed product configuration and interface mapping
 */


/**
 * Sealed Product operations hook - uses consolidated collection operations
 * Maintains backward compatibility while eliminating code duplication
 */
export const useSealedProductOperations = () => {
  const collectionApi = getCollectionApiService();

  // Create entity configuration using factory
  const entityConfig = useMemo(
    () => createSealedProductConfig(collectionApi),
    [collectionApi]
  );

  // Use consolidated operations hook
  const operations = useConsolidatedCollectionOperations(entityConfig);

  // Return interface-compatible methods for backward compatibility
  return {
    loading: operations.loading,
    error: operations.error,
    addSealedProduct: operations.add,
    updateSealedProduct: operations.update,
    deleteSealedProduct: operations.delete,
    markSealedProductSold: operations.markSold,
    clearError: operations.clearError,
  };
};;
