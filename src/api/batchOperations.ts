/**
 * Batch API Operations
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for batch operations and bulk processing
 * - OCP: Open for extension via generic batch processors
 * - LSP: Maintains batch operation interface compatibility
 * - ISP: Provides specific batch operation interfaces
 * - DIP: Depends on unifiedApiClient abstraction
 *
 * DRY: Provides generic utilities with common structures and generic types
 * Following Context7 + CLAUDE.md principles for efficient bulk data processing
 */

import { unifiedApiClient } from './unifiedApiClient';
import { IPsaGradedCard } from '../domain/models/card';
import { ISaleDetails } from '../domain/models/common';

// ========== GENERIC BATCH INTERFACES ==========

/**
 * Generic batch operation result interface
 */
export interface BatchResult<T> {
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
 * Generic batch operation options
 */
export interface BatchOptions {
  batchSize?: number;
  batchDelay?: number;
  continueOnError?: boolean;
}

/**
 * Generic batch request interface
 */
export interface BatchRequest<T> {
  id: string;
  data: T;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Generic batch processor interface
 */
export interface BatchProcessor<TInput, TOutput> {
  process(
    items: TInput[],
    options?: BatchOptions
  ): Promise<BatchResult<TOutput>>;
}

// ========== GENERIC BATCH UTILITIES ==========

/**
 * Generic batch processing utility
 * Provides reusable batch processing logic with common structures and generic types
 */
export class GenericBatchProcessor<TInput, TOutput>
  implements BatchProcessor<TInput, TOutput>
{
  private static readonly DEFAULT_BATCH_SIZE = 5;
  private static readonly DEFAULT_BATCH_DELAY = 200; // 200ms between batches

  constructor(
    private processor: (item: TInput) => Promise<TOutput>,
    private options: BatchOptions = {}
  ) {}

  async process(
    items: TInput[],
    options: BatchOptions = {}
  ): Promise<BatchResult<TOutput>> {
    const {
      batchSize = GenericBatchProcessor.DEFAULT_BATCH_SIZE,
      batchDelay = GenericBatchProcessor.DEFAULT_BATCH_DELAY,
      continueOnError = true,
    } = { ...this.options, ...options };

    const results: BatchResult<TOutput>['results'] = [];
    const errors: Array<{ id: string; error: string }> = [];

    // Process items in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      // Execute batch operations in parallel
      const batchPromises = batch.map(async (item, index) => {
        const itemId = `batch-${i + index}`;

        try {
          const result = await this.processor(item);
          return {
            id: itemId,
            success: true,
            data: result,
          };
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : 'Unknown error';
          errors.push({
            id: itemId,
            error: errorMsg,
          });

          return {
            id: itemId,
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

      // Add delay between batches (except for the last batch)
      if (i + batchSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, batchDelay));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    return {
      success: errorCount === 0,
      results,
      successCount,
      errorCount,
      errors,
    };
  }
}

/**
 * Generic API batch processor
 * Handles batch API requests with unified client
 */
export class ApiBatchProcessor<TInput, TOutput> extends GenericBatchProcessor<
  TInput,
  TOutput
> {
  constructor(
    private endpoint: string,
    private method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    options: BatchOptions = {}
  ) {
    super(async (item: TInput) => {
      switch (this.method) {
        case 'POST':
          return unifiedApiClient.apiCreate<TOutput>(
            this.endpoint,
            item,
            `${this.method} ${this.endpoint}`
          );
        case 'PUT':
          return unifiedApiClient.apiUpdate<TOutput>(
            this.endpoint,
            item,
            `${this.method} ${this.endpoint}`
          );
        case 'DELETE':
          return unifiedApiClient.apiDelete<TOutput>(
            this.endpoint,
            `${this.method} ${this.endpoint}`
          );
        case 'GET':
        default:
          return unifiedApiClient.apiGet<TOutput>(
            this.endpoint,
            `${this.method} ${this.endpoint}`
          );
      }
    }, options);
  }
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
        const batchResponses = await unifiedApiClient.batchPost<IPsaGradedCard>(
          batchRequests,
          {
            optimization: {
              enableDeduplication: true,
            },
          },
          {
            batchSize,
            batchDelay,
          }
        );

        // Process batch results
        batchResponses.forEach((response, index) => {
          const requestId = batchRequests[index].id;

          // Since batchPost returns data directly, treat successful responses
          if (response) {
            results.push({
              id: requestId,
              success: true,
              data: response,
            });
          } else {
            const errorMsg = 'No data returned';
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
          const errorMsg =
            error instanceof Error ? error.message : 'Unknown error';

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
        await new Promise((resolve) => setTimeout(resolve, batchDelay));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

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
    updates: Array<{
      id: string;
      data: Partial<T>;
      type: 'psa' | 'raw' | 'sealed';
    }>,
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
      psa: updates.filter((u) => u.type === 'psa'),
      raw: updates.filter((u) => u.type === 'raw'),
      sealed: updates.filter((u) => u.type === 'sealed'),
    };

    // Process each type separately
    for (const [type, items] of Object.entries(groupedUpdates)) {
      if (items.length === 0) {
        continue;
      }

      const endpoint = `/collection/${type === 'psa' ? 'psa-cards' : type === 'raw' ? 'raw-cards' : 'sealed-products'}`;

      // Process items in batches
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        // Execute updates in parallel within batch
        const batchPromises = batch.map(async (item) => {
          try {
            const response = await unifiedApiClient.put<T>(
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
              data: response,
            };
          } catch (error) {
            const errorMsg =
              error instanceof Error ? error.message : 'Unknown error';
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
          await new Promise((resolve) => setTimeout(resolve, batchDelay));
        }
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

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
    items: Array<{
      id: string;
      type: 'psa' | 'raw' | 'sealed';
      saleDetails: ISaleDetails;
    }>,
    options: BatchOptions = {}
  ): Promise<BatchResult<unknown>> {
    const {
      batchSize = this.DEFAULT_BATCH_SIZE,
      batchDelay = this.DEFAULT_BATCH_DELAY,
      continueOnError = true,
    } = options;

    const results: BatchResult<unknown>['results'] = [];
    const errors: Array<{ id: string; error: string }> = [];

    // Process items in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      // Execute mark-sold operations in parallel within batch
      const batchPromises = batch.map(async (item) => {
        try {
          const endpoint = `/collection/${item.type === 'psa' ? 'psa-cards' : item.type === 'raw' ? 'raw-cards' : 'sealed-products'}/${item.id}/mark-sold`;

          const response = await unifiedApiClient.put(
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
            data: response,
          };
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : 'Unknown error';
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
        await new Promise((resolve) => setTimeout(resolve, batchDelay));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

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

          await unifiedApiClient.delete(endpoint, {
            optimization: {
              enableDeduplication: true,
            },
          });

          return {
            id: item.id,
            success: true,
          };
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : 'Unknown error';
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
        await new Promise((resolve) => setTimeout(resolve, batchDelay));
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

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
      const prefetchPromises = batch.map((id) =>
        unifiedApiClient.prefetch(`${endpoint}/${id}`)
      );

      // Execute prefetch operations in parallel
      await Promise.all(prefetchPromises);

      // Small delay between batches to be server-friendly
      if (i + batchSize < itemIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 50));
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
