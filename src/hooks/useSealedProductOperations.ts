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
  addSealedProduct: (productData: Partial<ISealedProduct>) => Promise<ISealedProduct>;
  updateSealedProduct: (
    id: string,
    productData: Partial<ISealedProduct>
  ) => Promise<ISealedProduct>;
  deleteSealedProduct: (id: string) => Promise<void>;
  markSealedProductSold: (id: string, saleDetails: ISaleDetails) => Promise<ISealedProduct>;
  clearError: () => void;
}

/**
 * Hook for Sealed product operations
 * Uses generic CRUD operations to eliminate code duplication
 * Follows SRP - only handles Sealed product configuration and interface mapping
 */
export const useSealedProductOperations = (): UseSealedProductOperationsReturn => {
  const collectionApi = getCollectionApiService();

  // Memoize API operations configuration to prevent unnecessary re-renders
  const apiOperations = useMemo(() => ({
    create: collectionApi.createSealedProduct.bind(collectionApi),
    update: collectionApi.updateSealedProduct.bind(collectionApi),
    delete: collectionApi.deleteSealedProduct.bind(collectionApi),
    markSold: collectionApi.markSealedProductSold.bind(collectionApi),
  }), [collectionApi]);

  // Memoize messages configuration
  const messages = useMemo(() => ({
    entityName: 'Sealed Product',
    addSuccess: 'Sealed product added to collection!',
    updateSuccess: 'Sealed product updated successfully!',
    deleteSuccess: 'Sealed product removed from collection!',
    soldSuccess: 'Sealed product marked as sold!',
  }), []);

  const { loading, error, add, update, delete: deleteItem, markSold, clearError } = 
    useGenericCrudOperations<ISealedProduct>(apiOperations, messages);

  // Return interface-compatible methods
  return {
    loading,
    error,
    addSealedProduct: add,
    updateSealedProduct: update,
    deleteSealedProduct: deleteItem,
    markSealedProductSold: markSold,
    clearError,
  };
};