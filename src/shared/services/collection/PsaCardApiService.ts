/**
 * PSA Card API Service
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Focused service for PSA graded card operations following SRP
 * Extends BaseApiService for common functionality
 *
 * SOLID Principles:
 * - SRP: Single responsibility for PSA graded card operations only
 * - DIP: Depends on HTTP client abstraction
 * - OCP: Open for extension with additional PSA-specific operations
 * - DRY: Reuses base service functionality
 */

// Removed circular dependency - import unifiedApiService directly in components/hooks instead
import { IPsaGradedCard } from '../../domain/models/card';
import { ISaleDetails } from "../../types/common";
import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import {
  IPsaCardApiService,
  PsaGradedCardsParams,
} from '../../interfaces/api/ICollectionApiService';

/**
 * PSA Card API Service
 * Handles all PSA graded card operations with proper validation and error handling
 */
export class PsaCardApiService
  extends BaseApiService
  implements IPsaCardApiService
{
  constructor(httpClient: IHttpClient) {
    super(httpClient, 'PSA CARD SERVICE');
  }

  /**
   * DEPRECATED - Use unifiedApiService.collection.getPsaGradedCards() directly
   * This service creates circular dependencies and violates CLAUDE.md principles
   */
  async getPsaGradedCards(
    filters?: PsaGradedCardsParams
  ): Promise<IPsaGradedCard[]> {
    throw new Error('DEPRECATED: Use unifiedApiService.collection.getPsaGradedCards() directly to avoid circular dependencies');
  }

  /**
   * Get PSA graded card by ID
   */
  async getPsaGradedCardById(id: string): Promise<IPsaGradedCard> {
    return this.getResourceById<IPsaGradedCard>(
      '/psa-graded-cards',
      id,
      'getPsaGradedCardById'
    );
  }

  /**
   * Create new PSA graded card
   */
  async createPsaCard(
    cardData: Partial<IPsaGradedCard>
  ): Promise<IPsaGradedCard> {
    return this.createResource<IPsaGradedCard>(
      '/psa-graded-cards',
      cardData,
      'createPsaCard',
      'cardId'
    );
  }

  /**
   * Update PSA graded card
   */
  async updatePsaCard(
    id: string,
    cardData: Partial<IPsaGradedCard>
  ): Promise<IPsaGradedCard> {
    return this.updateResource<IPsaGradedCard>(
      '/psa-graded-cards',
      id,
      cardData,
      'updatePsaCard'
    );
  }

  /**
   * Delete PSA graded card
   */
  async deletePsaCard(id: string): Promise<void> {
    return this.deleteResource('/psa-graded-cards', id, 'deletePsaCard');
  }

  /**
   * Mark PSA graded card as sold
   */
  async markPsaCardSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<IPsaGradedCard> {
    this.validateId(id, 'markPsaCardSold');
    this.validateData(saleDetails, 'markPsaCardSold');

    return this.executeWithErrorHandling('markPsaCardSold', async () => {
      const result = await this.httpClient.postById<IPsaGradedCard>(
        '/psa-graded-cards',
        id,
        { saleDetails },
        'mark-sold'
      );
      return this.validateSoldResponse<IPsaGradedCard>(
        result,
        'markPsaCardSold',
        id,
        saleDetails
      );
    });
  }
}
