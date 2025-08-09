/**
 * Composite Collection API Service
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Combines focused services to maintain backward compatibility with existing CollectionApiService
 * Implements composition pattern to delegate to specialized services
 *
 * SOLID Principles:
 * - SRP: Single responsibility for composing collection services
 * - DIP: Depends on service abstractions, not concrete implementations
 * - OCP: Open for extension with additional service types
 * - DRY: Eliminates need to duplicate service logic
 */

import { IPsaGradedCard, IRawCard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { ISaleDetails } from "../../types/common";
import {
  ICollectionApiService,
  IPsaCardApiService,
  IRawCardApiService,
  ISealedProductApiService,
  PsaGradedCardsParams,
  RawCardsParams,
  SealedProductCollectionParams,
} from '../interfaces/api/ICollectionApiService';

/**
 * Composite Collection API Service
 * Delegates to focused services while maintaining existing interface
 */
export class CompositeCollectionApiService implements ICollectionApiService {
  constructor(
    private psaCardService: IPsaCardApiService,
    private rawCardService: IRawCardApiService,
    private sealedProductService: ISealedProductApiService
  ) {}

  // PSA Card operations - delegate to PsaCardApiService
  async getPsaGradedCards(
    filters?: PsaGradedCardsParams
  ): Promise<IPsaGradedCard[]> {
    return this.psaCardService.getPsaGradedCards(filters);
  }

  async getPsaGradedCardById(id: string): Promise<IPsaGradedCard> {
    return this.psaCardService.getPsaGradedCardById(id);
  }

  async createPsaCard(
    cardData: Partial<IPsaGradedCard>
  ): Promise<IPsaGradedCard> {
    return this.psaCardService.createPsaCard(cardData);
  }

  async updatePsaCard(
    id: string,
    cardData: Partial<IPsaGradedCard>
  ): Promise<IPsaGradedCard> {
    return this.psaCardService.updatePsaCard(id, cardData);
  }

  async deletePsaCard(id: string): Promise<void> {
    return this.psaCardService.deletePsaCard(id);
  }

  async markPsaCardSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<IPsaGradedCard> {
    return this.psaCardService.markPsaCardSold(id, saleDetails);
  }

  // Raw Card operations - delegate to RawCardApiService
  async getRawCards(filters?: RawCardsParams): Promise<IRawCard[]> {
    return this.rawCardService.getRawCards(filters);
  }

  async getRawCardById(id: string): Promise<IRawCard> {
    return this.rawCardService.getRawCardById(id);
  }

  async createRawCard(cardData: Partial<IRawCard>): Promise<IRawCard> {
    return this.rawCardService.createRawCard(cardData);
  }

  async updateRawCard(
    id: string,
    cardData: Partial<IRawCard>
  ): Promise<IRawCard> {
    return this.rawCardService.updateRawCard(id, cardData);
  }

  async deleteRawCard(id: string): Promise<void> {
    return this.rawCardService.deleteRawCard(id);
  }

  async markRawCardSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<IRawCard> {
    return this.rawCardService.markRawCardSold(id, saleDetails);
  }

  // Sealed Product operations - delegate to SealedProductApiService
  async getSealedProducts(
    filters?: SealedProductCollectionParams
  ): Promise<ISealedProduct[]> {
    return this.sealedProductService.getSealedProducts(filters);
  }

  async getSealedProductById(id: string): Promise<ISealedProduct> {
    return this.sealedProductService.getSealedProductById(id);
  }

  async createSealedProduct(
    productData: Partial<ISealedProduct>
  ): Promise<ISealedProduct> {
    return this.sealedProductService.createSealedProduct(productData);
  }

  async updateSealedProduct(
    id: string,
    productData: Partial<ISealedProduct>
  ): Promise<ISealedProduct> {
    return this.sealedProductService.updateSealedProduct(id, productData);
  }

  async deleteSealedProduct(id: string): Promise<void> {
    return this.sealedProductService.deleteSealedProduct(id);
  }

  async markSealedProductSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<ISealedProduct> {
    return this.sealedProductService.markSealedProductSold(id, saleDetails);
  }
}
