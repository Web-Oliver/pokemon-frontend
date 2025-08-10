/**
 * Raw Card API Service
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Focused service for raw card operations following SRP
 * Extends BaseApiService for common functionality
 *
 * SOLID Principles:
 * - SRP: Single responsibility for raw card operations only
 * - DIP: Depends on HTTP client abstraction
 * - OCP: Open for extension with additional raw card-specific operations
 * - DRY: Reuses base service functionality
 */

// Removed circular dependency - import unifiedApiService directly in components/hooks instead
import { IRawCard } from '../../domain/models/card';
import { ISaleDetails } from '../../types/common';
import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import { IRawCardApiService, RawCardsParams } from '../../interfaces/api/ICollectionApiService';

/**
 * Raw Card API Service
 * Handles all raw card operations with proper validation and error handling
 */
export class RawCardApiService
  extends BaseApiService
  implements IRawCardApiService
{
  constructor(httpClient: IHttpClient) {
    super(httpClient, 'RAW CARD SERVICE');
  }

  /**
   * DEPRECATED - Use unifiedApiService.collection.getRawCards() directly
   * This service creates circular dependencies and violates CLAUDE.md principles
   */
  async getRawCards(filters?: RawCardsParams): Promise<IRawCard[]> {
    throw new Error(
      'DEPRECATED: Use unifiedApiService.collection.getRawCards() directly to avoid circular dependencies'
    );
  }

  /**
   * Get raw card by ID
   */
  async getRawCardById(id: string): Promise<IRawCard> {
    return this.getResourceById<IRawCard>('/raw-cards', id, 'getRawCardById');
  }

  /**
   * Create new raw card
   */
  async createRawCard(cardData: Partial<IRawCard>): Promise<IRawCard> {
    return this.createResource<IRawCard>(
      '/raw-cards',
      cardData,
      'createRawCard',
      'cardId'
    );
  }

  /**
   * Update raw card
   */
  async updateRawCard(
    id: string,
    cardData: Partial<IRawCard>
  ): Promise<IRawCard> {
    return this.updateResource<IRawCard>(
      '/raw-cards',
      id,
      cardData,
      'updateRawCard'
    );
  }

  /**
   * Delete raw card
   */
  async deleteRawCard(id: string): Promise<void> {
    return this.deleteResource('/raw-cards', id, 'deleteRawCard');
  }

  /**
   * Mark raw card as sold
   */
  async markRawCardSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<IRawCard> {
    this.validateId(id, 'markRawCardSold');
    this.validateData(saleDetails, 'markRawCardSold');

    return this.executeWithErrorHandling('markRawCardSold', async () => {
      const result = await this.httpClient.postById<IRawCard>(
        '/raw-cards',
        id,
        { saleDetails },
        'mark-sold'
      );
      return this.validateSoldResponse<IRawCard>(
        result,
        'markRawCardSold',
        id,
        saleDetails
      );
    });
  }
}
