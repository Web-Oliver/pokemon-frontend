/**
 * Collection API Service Implementation
 * Layer 1: Core/Foundation/API Client
 * Concrete implementation of ICollectionApiService using existing API modules
 */

import * as collectionApi from '../api/collectionApi';
import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISaleDetails } from '../domain/models/common';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ICollectionApiService } from '../interfaces/api/ICollectionApiService';

/**
 * Concrete implementation of Collection API Service
 * Adapts existing collectionApi module to the interface contract
 */
export class CollectionApiService implements ICollectionApiService {
  // PSA Card operations
  async getPsaGradedCards(filters?: {
    sold?: boolean;
  }): Promise<IPsaGradedCard[]> {
    return await collectionApi.getPsaGradedCards(filters);
  }

  async getPsaGradedCardById(id: string): Promise<IPsaGradedCard> {
    return await collectionApi.getPsaGradedCardById(id);
  }

  async createPsaCard(
    cardData: Partial<IPsaGradedCard>
  ): Promise<IPsaGradedCard> {
    return await collectionApi.createPsaGradedCard(cardData);
  }

  async updatePsaCard(
    id: string,
    cardData: Partial<IPsaGradedCard>
  ): Promise<IPsaGradedCard> {
    return await collectionApi.updatePsaGradedCard(id, cardData);
  }

  async deletePsaCard(id: string): Promise<void> {
    return await collectionApi.deletePsaGradedCard(id);
  }

  async markPsaCardSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<IPsaGradedCard> {
    return await collectionApi.markPsaGradedCardSold(id, saleDetails);
  }

  // Raw Card operations
  async getRawCards(filters?: { sold?: boolean }): Promise<IRawCard[]> {
    return await collectionApi.getRawCards(filters);
  }

  async getRawCardById(id: string): Promise<IRawCard> {
    return await collectionApi.getRawCardById(id);
  }

  async createRawCard(cardData: Partial<IRawCard>): Promise<IRawCard> {
    return await collectionApi.createRawCard(cardData);
  }

  async updateRawCard(
    id: string,
    cardData: Partial<IRawCard>
  ): Promise<IRawCard> {
    return await collectionApi.updateRawCard(id, cardData);
  }

  async deleteRawCard(id: string): Promise<void> {
    return await collectionApi.deleteRawCard(id);
  }

  async markRawCardSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<IRawCard> {
    return await collectionApi.markRawCardSold(id, saleDetails);
  }

  // Sealed Product operations
  async getSealedProducts(filters?: {
    sold?: boolean;
  }): Promise<ISealedProduct[]> {
    return await collectionApi.getSealedProductCollection(filters);
  }

  async getSealedProductById(id: string): Promise<ISealedProduct> {
    return await collectionApi.getSealedProductById(id);
  }

  async createSealedProduct(
    productData: Partial<ISealedProduct>
  ): Promise<ISealedProduct> {
    return await collectionApi.createSealedProduct(productData);
  }

  async updateSealedProduct(
    id: string,
    productData: Partial<ISealedProduct>
  ): Promise<ISealedProduct> {
    return await collectionApi.updateSealedProduct(id, productData);
  }

  async deleteSealedProduct(id: string): Promise<void> {
    return await collectionApi.deleteSealedProduct(id);
  }

  async markSealedProductSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<ISealedProduct> {
    return await collectionApi.markSealedProductSold(id, saleDetails);
  }
}

// Export singleton instance following DIP pattern
export const collectionApiService = new CollectionApiService();
