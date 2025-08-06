/**
 * Collection API Service Implementation
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * UPDATED: Enhanced for new backend architecture with Product model structure
 * - SealedProduct now references Product model (instead of CardMarketReferenceProduct)
 * - Field mappings handle cardNumber (instead of pokemonNumber)
 * - Updated grades structure (grade_1 through grade_10)
 *
 * Following CLAUDE.md SOLID principles:
 * - SRP: Single responsibility for collection business logic
 * - DIP: Depends on API client abstractions
 * - ISP: Interface segregation for different collection types
 * - OCP: Open for extension through new model structures
 */

import * as collectionApi from '../api/collectionApi';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISaleDetails } from '../domain/models/common';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ICollectionApiService } from '../interfaces/api/ICollectionApiService';
import { handleApiError } from '../utils/helpers/errorHandler';
import { log } from '../utils/performance/logger';

/**
 * Concrete implementation of Collection API Service
 * Standard with comprehensive error handling and validation for new API format
 */
export class CollectionApiService implements ICollectionApiService {
  /**
   * Validate ID parameter to prevent service errors
   */
  private validateId(id: string, operation: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      const error = new Error(`Invalid ID provided for ${operation}: ${id}`);
      log(`[COLLECTION SERVICE] ID validation failed for ${operation}`, {
        id,
        operation,
      });
      throw error;
    }
  }

  /**
   * Validate data object for create/update operations
   */
  private validateData(data: any, operation: string): void {
    if (!data || typeof data !== 'object') {
      const error = new Error(`Invalid data provided for ${operation}`);
      log(`[COLLECTION SERVICE] Data validation failed for ${operation}`, {
        data,
        operation,
      });
      throw error;
    }
  }

  /**
   * Standard error handling wrapper for service methods
   */
  private async executeWithErrorHandling<T>(
    operation: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    try {
      log(`[COLLECTION SERVICE] Executing ${operation}`);
      const result = await apiCall();
      log(`[COLLECTION SERVICE] Successfully completed ${operation}`);
      return result;
    } catch (error) {
      log(`[COLLECTION SERVICE] Error in ${operation}`, { error });
      handleApiError(error, `Collection service ${operation} failed`);
      throw error; // Re-throw after logging
    }
  }
  // PSA Card operations
  async getPsaGradedCards(filters?: {
    sold?: boolean;
  }): Promise<IPsaGradedCard[]> {
    return this.executeWithErrorHandling('getPsaGradedCards', async () => {
      const result = await collectionApi.getPsaGradedCards(filters);

      // Validate result format (new API format should return array)
      if (!Array.isArray(result)) {
        log(
          '[COLLECTION SERVICE] getPsaGradedCards returned non-array result',
          { result }
        );
        throw new Error('Invalid response format: expected array of PSA cards');
      }

      return result;
    });
  }

  async getPsaGradedCardById(id: string): Promise<IPsaGradedCard> {
    this.validateId(id, 'getPsaGradedCardById');

    return this.executeWithErrorHandling('getPsaGradedCardById', async () => {
      const result = await collectionApi.getPsaGradedCardById(id);

      // Validate result is a valid card object
      if (!result || typeof result !== 'object') {
        log(
          '[COLLECTION SERVICE] getPsaGradedCardById returned invalid result',
          { id, result }
        );
        throw new Error(`PSA card not found or invalid format: ${id}`);
      }

      return result;
    });
  }

  async createPsaCard(
    cardData: Partial<IPsaGradedCard>
  ): Promise<IPsaGradedCard> {
    this.validateData(cardData, 'createPsaCard');

    return this.executeWithErrorHandling('createPsaCard', async () => {
      const result = await collectionApi.createPsaGradedCard(cardData);

      // Validate created card has required properties (Card model reference with cardNumber field)
      if (!result || typeof result !== 'object' || !result.cardId) {
        log('[COLLECTION SERVICE] createPsaCard returned invalid result', {
          cardData,
          result,
        });
        throw new Error(
          'Failed to create PSA card: invalid response format or missing Card reference'
        );
      }

      return result;
    });
  }

  async updatePsaCard(
    id: string,
    cardData: Partial<IPsaGradedCard>
  ): Promise<IPsaGradedCard> {
    this.validateId(id, 'updatePsaCard');
    this.validateData(cardData, 'updatePsaCard');

    return this.executeWithErrorHandling('updatePsaCard', async () => {
      const result = await collectionApi.updatePsaGradedCard(id, cardData);

      // Validate updated card
      if (!result || typeof result !== 'object') {
        log('[COLLECTION SERVICE] updatePsaCard returned invalid result', {
          id,
          cardData,
          result,
        });
        throw new Error(`Failed to update PSA card: ${id}`);
      }

      return result;
    });
  }

  async deletePsaCard(id: string): Promise<void> {
    this.validateId(id, 'deletePsaCard');

    return this.executeWithErrorHandling('deletePsaCard', async () => {
      await collectionApi.deletePsaGradedCard(id);
      // No return value expected for delete operations
    });
  }

  async markPsaCardSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<IPsaGradedCard> {
    this.validateId(id, 'markPsaCardSold');
    this.validateData(saleDetails, 'markPsaCardSold');

    return this.executeWithErrorHandling('markPsaCardSold', async () => {
      const result = await collectionApi.markPsaGradedCardSold(id, saleDetails);

      // Validate marked card has sold status
      if (!result || typeof result !== 'object' || !result.sold) {
        log('[COLLECTION SERVICE] markPsaCardSold returned invalid result', {
          id,
          saleDetails,
          result,
        });
        throw new Error(`Failed to mark PSA card as sold: ${id}`);
      }

      return result;
    });
  }

  // Raw Card operations
  async getRawCards(filters?: { sold?: boolean }): Promise<IRawCard[]> {
    return this.executeWithErrorHandling('getRawCards', async () => {
      const result = await collectionApi.getRawCards(filters);

      // Validate result format (new API format should return array)
      if (!Array.isArray(result)) {
        log('[COLLECTION SERVICE] getRawCards returned non-array result', {
          result,
        });
        throw new Error('Invalid response format: expected array of raw cards');
      }

      return result;
    });
  }

  async getRawCardById(id: string): Promise<IRawCard> {
    this.validateId(id, 'getRawCardById');

    return this.executeWithErrorHandling('getRawCardById', async () => {
      const result = await collectionApi.getRawCardById(id);

      // Validate result is a valid card object
      if (!result || typeof result !== 'object') {
        log('[COLLECTION SERVICE] getRawCardById returned invalid result', {
          id,
          result,
        });
        throw new Error(`Raw card not found or invalid format: ${id}`);
      }

      return result;
    });
  }

  async createRawCard(cardData: Partial<IRawCard>): Promise<IRawCard> {
    this.validateData(cardData, 'createRawCard');

    return this.executeWithErrorHandling('createRawCard', async () => {
      const result = await collectionApi.createRawCard(cardData);

      // Validate created card has required properties (Card model reference with cardNumber field)
      if (!result || typeof result !== 'object' || !result.cardId) {
        log('[COLLECTION SERVICE] createRawCard returned invalid result', {
          cardData,
          result,
        });
        throw new Error(
          'Failed to create raw card: invalid response format or missing Card reference'
        );
      }

      return result;
    });
  }

  async updateRawCard(
    id: string,
    cardData: Partial<IRawCard>
  ): Promise<IRawCard> {
    this.validateId(id, 'updateRawCard');
    this.validateData(cardData, 'updateRawCard');

    return this.executeWithErrorHandling('updateRawCard', async () => {
      const result = await collectionApi.updateRawCard(id, cardData);

      // Validate updated card
      if (!result || typeof result !== 'object') {
        log('[COLLECTION SERVICE] updateRawCard returned invalid result', {
          id,
          cardData,
          result,
        });
        throw new Error(`Failed to update raw card: ${id}`);
      }

      return result;
    });
  }

  async deleteRawCard(id: string): Promise<void> {
    this.validateId(id, 'deleteRawCard');

    return this.executeWithErrorHandling('deleteRawCard', async () => {
      await collectionApi.deleteRawCard(id);
      // No return value expected for delete operations
    });
  }

  async markRawCardSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<IRawCard> {
    this.validateId(id, 'markRawCardSold');
    this.validateData(saleDetails, 'markRawCardSold');

    return this.executeWithErrorHandling('markRawCardSold', async () => {
      const result = await collectionApi.markRawCardSold(id, saleDetails);

      // Validate marked card has sold status
      if (!result || typeof result !== 'object' || !result.sold) {
        log('[COLLECTION SERVICE] markRawCardSold returned invalid result', {
          id,
          saleDetails,
          result,
        });
        throw new Error(`Failed to mark raw card as sold: ${id}`);
      }

      return result;
    });
  }

  // Sealed Product operations
  async getSealedProducts(filters?: {
    sold?: boolean;
  }): Promise<ISealedProduct[]> {
    return this.executeWithErrorHandling('getSealedProducts', async () => {
      const result = await collectionApi.getSealedProductCollection(filters);

      // Validate result format (new API format should return array)
      if (!Array.isArray(result)) {
        log(
          '[COLLECTION SERVICE] getSealedProducts returned non-array result',
          { result }
        );
        throw new Error(
          'Invalid response format: expected array of sealed products'
        );
      }

      return result;
    });
  }

  async getSealedProductById(id: string): Promise<ISealedProduct> {
    this.validateId(id, 'getSealedProductById');

    return this.executeWithErrorHandling('getSealedProductById', async () => {
      const result = await collectionApi.getSealedProductById(id);

      // Validate result is a valid product object
      if (!result || typeof result !== 'object') {
        log(
          '[COLLECTION SERVICE] getSealedProductById returned invalid result',
          { id, result }
        );
        throw new Error(`Sealed product not found or invalid format: ${id}`);
      }

      return result;
    });
  }

  async createSealedProduct(
    productData: Partial<ISealedProduct>
  ): Promise<ISealedProduct> {
    this.validateData(productData, 'createSealedProduct');

    return this.executeWithErrorHandling('createSealedProduct', async () => {
      const result = await collectionApi.createSealedProduct(productData);

      // Validate created product has required properties (Product model reference)
      if (!result || typeof result !== 'object' || !result.productId) {
        log(
          '[COLLECTION SERVICE] createSealedProduct returned invalid result',
          { productData, result }
        );
        throw new Error(
          'Failed to create sealed product: invalid response format or missing Product reference'
        );
      }

      return result;
    });
  }

  async updateSealedProduct(
    id: string,
    productData: Partial<ISealedProduct>
  ): Promise<ISealedProduct> {
    this.validateId(id, 'updateSealedProduct');
    this.validateData(productData, 'updateSealedProduct');

    return this.executeWithErrorHandling('updateSealedProduct', async () => {
      const result = await collectionApi.updateSealedProduct(id, productData);

      // Validate updated product
      if (!result || typeof result !== 'object') {
        log(
          '[COLLECTION SERVICE] updateSealedProduct returned invalid result',
          { id, productData, result }
        );
        throw new Error(`Failed to update sealed product: ${id}`);
      }

      return result;
    });
  }

  async deleteSealedProduct(id: string): Promise<void> {
    this.validateId(id, 'deleteSealedProduct');

    return this.executeWithErrorHandling('deleteSealedProduct', async () => {
      await collectionApi.deleteSealedProduct(id);
      // No return value expected for delete operations
    });
  }

  async markSealedProductSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<ISealedProduct> {
    this.validateId(id, 'markSealedProductSold');
    this.validateData(saleDetails, 'markSealedProductSold');

    return this.executeWithErrorHandling('markSealedProductSold', async () => {
      const result = await collectionApi.markSealedProductSold(id, saleDetails);

      // Validate marked product has sold status
      if (!result || typeof result !== 'object' || !result.sold) {
        log(
          '[COLLECTION SERVICE] markSealedProductSold returned invalid result',
          { id, saleDetails, result }
        );
        throw new Error(`Failed to mark sealed product as sold: ${id}`);
      }

      return result;
    });
  }
}

// Export singleton instance following DIP pattern
export const collectionApiService = new CollectionApiService();
