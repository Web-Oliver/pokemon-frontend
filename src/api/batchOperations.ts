/**
 * Batch API Operations
 * Layer 1: Core/Foundation (CLAUDE.md Architecture)
 *
 * Following Context7 + CLAUDE.md principles:
 * - Efficient batch operations for bulk data processing
 * - Request grouping and parallel processing
 * - Error handling and partial success management
 * - Performance optimizations for collection management
 */

import { optimizedApiClient } from './optimizedApiClient';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from '../domain/models/common';

/**
 * Batch operation result interface
 */
interface BatchResult<T> {
  success: boolean;
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: string;
  }>;
  successCount: number;
  errorCount: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

/**
 * Batch operation options
 */
interface BatchOptions {
  batchSize?: number;
  batchDelay?: number;
  continueOnError?: boolean;
}

/**
 * Batch collection operations utility
 */
export class BatchCollectionOperations {
  private static readonly DEFAULT_BATCH_SIZE = 5;
  private static readonly DEFAULT_BATCH_DELAY = 200; // 200ms between batches

  /**
   * Batch add PSA cards
   */
  static async batchAddPsaCards(
    cards: Array<Partial<IPsaGradedCard>>,
    options: BatchOptions = {}
  ): Promise<BatchResult<IPsaGradedCard>> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      batchDelay = this.DEFAULT_BATCH_DELAY,
      continueOnError = true,
    } = options;

    const results: BatchResult<IPsaGradedCard>['results'] = [];
    const errors: Array<{ id: string; error: string }> = [];

    // Process cards in batches
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);
      
      // Create batch requests
      const batchRequests = batch.map((card, index) => ({
        url: '/collection/psa-cards',
        data: card,
        id: `batch-${i + index}`, // Generate temporary ID for tracking
      }));

      try {
        // Execute batch POST requests
        const batchResponses = await optimizedApiClient.batchPost<IPsaGradedCard>(
          batchRequests,
          {
            optimization: {
              enableDeduplication: true,
            },
          },
          {
            batchSize: batchSize,
            batchDelay: batchDelay,
          }
        );

        // Process batch results
        batchResponses.forEach((response, index) => {
          const requestId = batchRequests[index].id;
          
          if (response.status >= 200 && response.status < 300) {
            results.push({
              id: requestId,
              success: true,
              data: response.data,
            });
          } else {
            const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
            results.push({
              id: requestId,
              success: false,
              error: errorMsg,
            });
            errors.push({
              id: requestId,
              error: errorMsg,
            });
          }
        });
      } catch (error) {
        // Handle batch error
        batch.forEach((_, index) => {
          const requestId = batchRequests[index].id;
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          
          results.push({
            id: requestId,
            success: false,
            error: errorMsg,
          });
          errors.push({
            id: requestId,
            error: errorMsg,
          });
        });

        if (!continueOnError) {
          break;
        }
      }

      // Add delay between batches (except for the last batch)
      if (i + batchSize < cards.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    return {
      success: errorCount === 0,
      results,
      successCount,
      errorCount,
      errors,
    };
  }

  /**
   * Batch update collection items
   */
  static async batchUpdateItems<T>(
    updates: Array<{ id: string; data: Partial<T>; type: 'psa' | 'raw' | 'sealed' }>,
    options: BatchOptions = {}
  ): Promise<BatchResult<T>> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      batchDelay = this.DEFAULT_BATCH_DELAY,
      continueOnError = true,
    } = options;

    const results: BatchResult<T>['results'] = [];
    const errors: Array<{ id: string; error: string }> = [];

    // Group updates by type for efficient processing
    const groupedUpdates = {
      psa: updates.filter(u => u.type === 'psa'),
      raw: updates.filter(u => u.type === 'raw'),
      sealed: updates.filter(u => u.type === 'sealed'),
    };

    // Process each type separately
    for (const [type, items] of Object.entries(groupedUpdates)) {
      if (items.length === 0) continue;

      const endpoint = `/collection/${type === 'psa' ? 'psa-cards' : type === 'raw' ? 'raw-cards' : 'sealed-products'}`;

      // Process items in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        // Execute updates in parallel within batch
        const batchPromises = batch.map(async (item) => {
          try {
            const response = await optimizedApiClient.put<T>(
              `${endpoint}/${item.id}`,
              item.data,
              {
                optimization: {
                  enableDeduplication: true,
                },
              }
            );

            return {
              id: item.id,
              success: true,
              data: response.data,
            };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            errors.push({
              id: item.id,
              error: errorMsg,
            });

            return {
              id: item.id,
              success: false,
              error: errorMsg,
            };
          }
        });

        try {
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
        } catch (error) {
          if (!continueOnError) {
            break;
          }
        }

        // Add delay between batches
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    return {
      success: errorCount === 0,
      results,
      successCount,
      errorCount,
      errors,
    };
  }

  /**
   * Batch mark items as sold
   */
  static async batchMarkSold(
    items: Array<{ id: string; type: 'psa' | 'raw' | 'sealed'; saleDetails: ISaleDetails }>,
    options: BatchOptions = {}
  ): Promise<BatchResult<any>> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      batchDelay = this.DEFAULT_BATCH_DELAY,
      continueOnError = true,
    } = options;

    const results: BatchResult<any>['results'] = [];
    const errors: Array<{ id: string; error: string }> = [];

    // Process items in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      // Execute mark-sold operations in parallel within batch
      const batchPromises = batch.map(async (item) => {
        try {
          const endpoint = `/collection/${item.type === 'psa' ? 'psa-cards' : item.type === 'raw' ? 'raw-cards' : 'sealed-products'}/${item.id}/mark-sold`;
          
          const response = await optimizedApiClient.put(
            endpoint,
            item.saleDetails,
            {
              optimization: {
                enableDeduplication: true,
              },
            }
          );

          return {
            id: item.id,
            success: true,
            data: response.data,
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push({
            id: item.id,
            error: errorMsg,
          });

          return {
            id: item.id,
            success: false,
            error: errorMsg,
          };
        }
      });

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        if (!continueOnError) {
          break;
        }
      }

      // Add delay between batches
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    return {
      success: errorCount === 0,
      results,
      successCount,
      errorCount,
      errors,
    };
  }

  /**
   * Batch delete items
   */
  static async batchDelete(
    items: Array<{ id: string; type: 'psa' | 'raw' | 'sealed' }>,
    options: BatchOptions = {}
  ): Promise<BatchResult<void>> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      batchDelay = this.DEFAULT_BATCH_DELAY,
      continueOnError = true,
    } = options;

    const results: BatchResult<void>['results'] = [];
    const errors: Array<{ id: string; error: string }> = [];

    // Process items in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      // Execute delete operations in parallel within batch
      const batchPromises = batch.map(async (item) => {
        try {
          const endpoint = `/collection/${item.type === 'psa' ? 'psa-cards' : item.type === 'raw' ? 'raw-cards' : 'sealed-products'}/${item.id}`;
          
          await optimizedApiClient.delete(endpoint, {
            optimization: {
              enableDeduplication: true,
            },
          });

          return {
            id: item.id,
            success: true,
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push({
            id: item.id,
            error: errorMsg,
          });

          return {
            id: item.id,
            success: false,
            error: errorMsg,
          };
        }
      });

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        if (!continueOnError) {
          break;
        }
      }

      // Add delay between batches
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, batchDelay));
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    return {
      success: errorCount === 0,
      results,
      successCount,
      errorCount,
      errors,
    };
  }

  /**
   * Prefetch collection data for predictive loading
   */
  static async prefetchCollectionData(
    itemIds: string[],
    type: 'psa' | 'raw' | 'sealed'
  ): Promise<void> {
    const endpoint = `/collection/${type === 'psa' ? 'psa-cards' : type === 'raw' ? 'raw-cards' : 'sealed-products'}`;
    
    // Prefetch items in batches to avoid overwhelming the server
    const batchSize = 10;
    
    for (let i = 0; i < itemIds.length; i += batchSize) {
      const batch = itemIds.slice(i, i + batchSize);
      
      // Prefetch each item in the batch
      const prefetchPromises = batch.map(id => 
        optimizedApiClient.prefetch(`${endpoint}/${id}`)
      );
      
      // Execute prefetch operations in parallel
      await Promise.all(prefetchPromises);
      
      // Small delay between batches to be server-friendly
      if (i + batchSize < itemIds.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
  }
}

// Export convenience functions
export const {
  batchAddPsaCards,
  batchUpdateItems,
  batchMarkSold,
  batchDelete,
  prefetchCollectionData,
} = BatchCollectionOperations;