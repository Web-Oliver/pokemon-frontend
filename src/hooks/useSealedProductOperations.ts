/**
 * Sealed Product Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles Sealed product operations
 */

import { useCallback } from 'react';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';
import { getCollectionApiService } from '../services/ServiceRegistry';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { useAsyncOperation } from './useAsyncOperation';

export interface UseSealedProductOperationsReturn {
  loading: boolean;
  error: string | null;
  addSealedProduct: (productData: Partial<ISealedProduct>) => Promise<ISealedProduct>;
  updateSealedProduct: (id: string, productData: Partial<ISealedProduct>) => Promise<ISealedProduct>;
  deleteSealedProduct: (id: string) => Promise<void>;
  markSealedProductSold: (id: string, saleDetails: ISaleDetails) => Promise<ISealedProduct>;
  clearError: () => void;
}

/**
 * Hook for Sealed product operations
 * Follows SRP - only handles Sealed product API operations
 */
export const useSealedProductOperations = (): UseSealedProductOperationsReturn => {
  const { loading, error, execute, clearError } = useAsyncOperation();
  const collectionApi = getCollectionApiService();

  const addSealedProduct = useCallback(
    async (productData: Partial<ISealedProduct>): Promise<ISealedProduct> => {
      return await execute(async () => {
        log('Adding sealed product...');
        const newProduct = await collectionApi.createSealedProduct(productData);
        log('Sealed product added successfully');
        showSuccessToast('Sealed product added to collection!');
        return newProduct;
      });
    },
    [execute, collectionApi]
  );

  const updateSealedProduct = useCallback(
    async (id: string, productData: Partial<ISealedProduct>): Promise<ISealedProduct> => {
      return await execute(async () => {
        log(`Updating sealed product ${id}...`);
        const updatedProduct = await collectionApi.updateSealedProduct(id, productData);
        log('Sealed product updated successfully');
        showSuccessToast('Sealed product updated successfully!');
        return updatedProduct;
      });
    },
    [execute, collectionApi]
  );

  const deleteSealedProduct = useCallback(
    async (id: string): Promise<void> => {
      return await execute(async () => {
        log(`Deleting sealed product ${id}...`);
        await collectionApi.deleteSealedProduct(id);
        log('Sealed product deleted successfully');
        showSuccessToast('Sealed product removed from collection!');
      });
    },
    [execute, collectionApi]
  );

  const markSealedProductSold = useCallback(
    async (id: string, saleDetails: ISaleDetails): Promise<ISealedProduct> => {
      return await execute(async () => {
        log(`Marking sealed product ${id} as sold...`);
        const soldProduct = await collectionApi.markSealedProductSold(id, saleDetails);
        log('Sealed product marked as sold successfully');
        showSuccessToast('Sealed product marked as sold! 💰');
        return soldProduct;
      });
    },
    [execute, collectionApi]
  );

  return {
    loading,
    error,
    addSealedProduct,
    updateSealedProduct,
    deleteSealedProduct,
    markSealedProductSold,
    clearError,
  };
};