/**
 * useMarkSold Hook
 * Encapsulates mark as sold functionality and API interactions
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles only mark as sold operations
 * - Dependency Inversion: Uses abstract API services
 * - DRY: Centralizes sale logic
 */

import { useCallback, useState } from 'react';
import { ISaleDetails } from '../domain/models/common';
import { useCollectionOperations } from './useCollectionOperations';

interface UseMarkSoldOptions {
  /** Item type being sold */
  itemType: 'psa' | 'raw' | 'sealed';
  /** Item ID to mark as sold */
  itemId: string;
  /** Callback when sale is successful */
  onSuccess?: () => void;
  /** Callback when sale fails */
  onError?: (error: Error) => void;
}

interface UseMarkSoldReturn {
  /** Whether the sale is being processed */
  isProcessing: boolean;
  /** Any error that occurred during sale */
  error: Error | null;
  /** Function to execute the mark as sold operation */
  markAsSold: (saleDetails: ISaleDetails) => Promise<void>;
  /** Function to clear any existing errors */
  clearError: () => void;
}

export const useMarkSold = ({
  itemType,
  itemId,
  onSuccess,
  onError,
}: UseMarkSoldOptions): UseMarkSoldReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { updatePsaCard, updateRawCard, updateSealedProduct } =
    useCollectionOperations();

  const markAsSold = useCallback(
    async (saleDetails: ISaleDetails): Promise<void> => {
      setIsProcessing(true);
      setError(null);

      try {
        // Prepare the update data with sale details
        const updateData = {
          sold: true,
          saleDetails,
        };

        // Call the appropriate update function based on item type
        switch (itemType) {
          case 'psa':
            await updatePsaCard(itemId, updateData);
            break;
          case 'raw':
            await updateRawCard(itemId, updateData);
            break;
          case 'sealed':
            await updateSealedProduct(itemId, updateData);
            break;
          default:
            throw new Error(`Unsupported item type: ${itemType}`);
        }

        // Call success callback if provided
        onSuccess?.();
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to mark item as sold');
        setError(error);
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    },
    [
      itemType,
      itemId,
      updatePsaCard,
      updateRawCard,
      updateSealedProduct,
      onSuccess,
      onError,
    ]
  );

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    markAsSold,
    clearError,
  };
};
