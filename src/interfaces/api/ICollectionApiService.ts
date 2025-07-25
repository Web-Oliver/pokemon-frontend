/**
 * Collection API Service Interface
 * Layer 1: Core/Foundation/API Client
 * Follows Dependency Inversion Principle - defines abstractions for collection operations
 */

import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';
import { ISaleDetails } from '../../domain/models/common';

/**
 * Interface for PSA Card operations
 * Abstracts the concrete implementation details
 */
export interface IPsaCardApiService {
  // Read operations
  getPsaGradedCards(filters?: { sold?: boolean }): Promise<IPsaGradedCard[]>;
  getPsaGradedCardById(id: string): Promise<IPsaGradedCard>;

  // Write operations
  createPsaCard(cardData: Partial<IPsaGradedCard>): Promise<IPsaGradedCard>;
  updatePsaCard(
    id: string,
    cardData: Partial<IPsaGradedCard>
  ): Promise<IPsaGradedCard>;
  deletePsaCard(id: string): Promise<void>;
  markPsaCardSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<IPsaGradedCard>;
}

/**
 * Interface for Raw Card operations
 * Abstracts the concrete implementation details
 */
export interface IRawCardApiService {
  // Read operations
  getRawCards(filters?: { sold?: boolean }): Promise<IRawCard[]>;
  getRawCardById(id: string): Promise<IRawCard>;

  // Write operations
  createRawCard(cardData: Partial<IRawCard>): Promise<IRawCard>;
  updateRawCard(id: string, cardData: Partial<IRawCard>): Promise<IRawCard>;
  deleteRawCard(id: string): Promise<void>;
  markRawCardSold(id: string, saleDetails: ISaleDetails): Promise<IRawCard>;
}

/**
 * Interface for Sealed Product operations
 * Abstracts the concrete implementation details
 */
export interface ISealedProductApiService {
  // Read operations
  getSealedProducts(filters?: { sold?: boolean }): Promise<ISealedProduct[]>;
  getSealedProductById(id: string): Promise<ISealedProduct>;

  // Write operations
  createSealedProduct(
    productData: Partial<ISealedProduct>
  ): Promise<ISealedProduct>;
  updateSealedProduct(
    id: string,
    productData: Partial<ISealedProduct>
  ): Promise<ISealedProduct>;
  deleteSealedProduct(id: string): Promise<void>;
  markSealedProductSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<ISealedProduct>;
}

/**
 * Combined Collection API Service Interface
 * Follows Interface Segregation Principle - clients can depend on specific interfaces
 */
export interface ICollectionApiService
  extends IPsaCardApiService,
    IRawCardApiService,
    ISealedProductApiService {}
