/**
 * Batch Operations Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Following CLAUDE.md + Context7 principles:
 * - Custom hook for batch collection operations
 * - Optimized state management for bulk operations
 * - Progress tracking and error handling
 * - Performance-focused batch processing
 */

import { useState, useCallback } from 'react';
import { 
  BatchCollectionOperations,
  batchAddPsaCards,
  batchUpdateItems,
  batchMarkSold,
  batchDelete,
} from '../api/batchOperations';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';
import { showSuccessToast, showErrorToast } from '../utils/errorHandler';

/**
 * Batch operation progress state
 */
interface BatchProgress {
  isProcessing: boolean;
  totalItems: number;
  processedItems: number;
  successCount: number;
  errorCount: number;
  currentOperation: string;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Batch operations hook return type
 */
interface UseBatchOperationsReturn {
  progress: BatchProgress;
  isProcessing: boolean;
  
  // Batch operations
  batchAddCards: (cards: Array<Partial<IPsaGradedCard>>) => Promise<boolean>;
  batchUpdateCollection: (updates: Array<{ id: string; data: any; type: 'psa' | 'raw' | 'sealed' }>) => Promise<boolean>;
  batchMarkItemsSold: (items: Array<{ id: string; type: 'psa' | 'raw' | 'sealed'; saleDetails: ISaleDetails }>) => Promise<boolean>;
  batchDeleteItems: (items: Array<{ id: string; type: 'psa' | 'raw' | 'sealed' }>) => Promise<boolean>;
  
  // Utility functions
  clearProgress: () => void;
  cancelOperation: () => void;
}

/**
 * Initial progress state
 */
const initialProgress: BatchProgress = {
  isProcessing: false,
  totalItems: 0,
  processedItems: 0,
  successCount: 0,
  errorCount: 0,
  currentOperation: '',
  errors: [],
};

/**
 * Custom hook for batch collection operations
 */
export function useBatchOperations(): UseBatchOperationsReturn {
  const [progress, setProgress] = useState<BatchProgress>(initialProgress);
  const [operationCancelled, setOperationCancelled] = useState(false);

  /**
   * Update progress state
   */
  const updateProgress = useCallback((updates: Partial<BatchProgress>) => {
    setProgress(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Clear progress state
   */
  const clearProgress = useCallback(() => {
    setProgress(initialProgress);
    setOperationCancelled(false);
  }, []);

  /**
   * Cancel current operation
   */
  const cancelOperation = useCallback(() => {
    setOperationCancelled(true);
    updateProgress({ 
      isProcessing: false,
      currentOperation: 'Cancelled',
    });
  }, [updateProgress]);

  /**
   * Batch add PSA cards
   */
  const batchAddCards = useCallback(async (cards: Array<Partial<IPsaGradedCard>>): Promise<boolean> => {
    if (progress.isProcessing) {
      showErrorToast('Another batch operation is already in progress');
      return false;
    }

    setOperationCancelled(false);
    updateProgress({
      isProcessing: true,
      totalItems: cards.length,
      processedItems: 0,
      successCount: 0,
      errorCount: 0,
      currentOperation: 'Adding PSA cards...',
      errors: [],
    });

    try {
      const result = await batchAddPsaCards(cards, {
        batchSize: 5,
        batchDelay: 200,
        continueOnError: true,
      });

      updateProgress({
        isProcessing: false,
        processedItems: result.results.length,
        successCount: result.successCount,
        errorCount: result.errorCount,
        currentOperation: result.success ? 'Completed successfully' : 'Completed with errors',
        errors: result.errors,
      });

      if (result.success) {
        showSuccessToast(`Successfully added ${result.successCount} PSA cards`);
      } else {
        showErrorToast(`Added ${result.successCount} cards, ${result.errorCount} failed`);
      }

      return result.success;
    } catch (error) {
      updateProgress({
        isProcessing: false,
        currentOperation: 'Failed',
        errors: [{ id: 'batch', error: error instanceof Error ? error.message : 'Unknown error' }],
      });
      
      showErrorToast('Batch add operation failed');
      return false;
    }
  }, [progress.isProcessing, updateProgress]);

  /**
   * Batch update collection items
   */
  const batchUpdateCollection = useCallback(async (
    updates: Array<{ id: string; data: any; type: 'psa' | 'raw' | 'sealed' }>
  ): Promise<boolean> => {
    if (progress.isProcessing) {
      showErrorToast('Another batch operation is already in progress');
      return false;
    }

    setOperationCancelled(false);
    updateProgress({
      isProcessing: true,
      totalItems: updates.length,
      processedItems: 0,
      successCount: 0,
      errorCount: 0,
      currentOperation: 'Updating collection items...',
      errors: [],
    });

    try {
      const result = await batchUpdateItems(updates, {
        batchSize: 5,
        batchDelay: 200,
        continueOnError: true,
      });

      updateProgress({
        isProcessing: false,
        processedItems: result.results.length,
        successCount: result.successCount,
        errorCount: result.errorCount,
        currentOperation: result.success ? 'Completed successfully' : 'Completed with errors',
        errors: result.errors,
      });

      if (result.success) {
        showSuccessToast(`Successfully updated ${result.successCount} items`);
      } else {
        showErrorToast(`Updated ${result.successCount} items, ${result.errorCount} failed`);
      }

      return result.success;
    } catch (error) {
      updateProgress({
        isProcessing: false,
        currentOperation: 'Failed',
        errors: [{ id: 'batch', error: error instanceof Error ? error.message : 'Unknown error' }],
      });
      
      showErrorToast('Batch update operation failed');
      return false;
    }
  }, [progress.isProcessing, updateProgress]);

  /**
   * Batch mark items as sold
   */
  const batchMarkItemsSold = useCallback(async (
    items: Array<{ id: string; type: 'psa' | 'raw' | 'sealed'; saleDetails: ISaleDetails }>
  ): Promise<boolean> => {
    if (progress.isProcessing) {
      showErrorToast('Another batch operation is already in progress');
      return false;
    }

    setOperationCancelled(false);
    updateProgress({
      isProcessing: true,
      totalItems: items.length,
      processedItems: 0,
      successCount: 0,
      errorCount: 0,
      currentOperation: 'Marking items as sold...',
      errors: [],
    });

    try {
      const result = await batchMarkSold(items, {
        batchSize: 5,
        batchDelay: 200,
        continueOnError: true,
      });

      updateProgress({
        isProcessing: false,
        processedItems: result.results.length,
        successCount: result.successCount,
        errorCount: result.errorCount,
        currentOperation: result.success ? 'Completed successfully' : 'Completed with errors',
        errors: result.errors,
      });

      if (result.success) {
        showSuccessToast(`Successfully marked ${result.successCount} items as sold`);
      } else {
        showErrorToast(`Marked ${result.successCount} items as sold, ${result.errorCount} failed`);
      }

      return result.success;
    } catch (error) {
      updateProgress({
        isProcessing: false,
        currentOperation: 'Failed',
        errors: [{ id: 'batch', error: error instanceof Error ? error.message : 'Unknown error' }],
      });
      
      showErrorToast('Batch mark sold operation failed');
      return false;
    }
  }, [progress.isProcessing, updateProgress]);

  /**
   * Batch delete items
   */
  const batchDeleteItems = useCallback(async (
    items: Array<{ id: string; type: 'psa' | 'raw' | 'sealed' }>
  ): Promise<boolean> => {
    if (progress.isProcessing) {
      showErrorToast('Another batch operation is already in progress');
      return false;
    }

    setOperationCancelled(false);
    updateProgress({
      isProcessing: true,
      totalItems: items.length,
      processedItems: 0,
      successCount: 0,
      errorCount: 0,
      currentOperation: 'Deleting items...',
      errors: [],
    });

    try {
      const result = await batchDelete(items, {
        batchSize: 5,
        batchDelay: 200,
        continueOnError: true,
      });

      updateProgress({
        isProcessing: false,
        processedItems: result.results.length,
        successCount: result.successCount,
        errorCount: result.errorCount,
        currentOperation: result.success ? 'Completed successfully' : 'Completed with errors',
        errors: result.errors,
      });

      if (result.success) {
        showSuccessToast(`Successfully deleted ${result.successCount} items`);
      } else {
        showErrorToast(`Deleted ${result.successCount} items, ${result.errorCount} failed`);
      }

      return result.success;
    } catch (error) {
      updateProgress({
        isProcessing: false,
        currentOperation: 'Failed',
        errors: [{ id: 'batch', error: error instanceof Error ? error.message : 'Unknown error' }],
      });
      
      showErrorToast('Batch delete operation failed');
      return false;
    }
  }, [progress.isProcessing, updateProgress]);

  return {
    progress,
    isProcessing: progress.isProcessing,
    batchAddCards,
    batchUpdateCollection,
    batchMarkItemsSold,
    batchDeleteItems,
    clearProgress,
    cancelOperation,
  };
}