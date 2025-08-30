/**
 * Collection Service - Domain service for collection operations
 * Extracted from UnifiedApiService following SOLID principles
 */

import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';
import { ISaleDetails } from '@/types/common';
import { addCacheBusting, extractResponseData } from '@/shared/utils/responseUtils';

// Import parameter types from UnifiedApiService
export interface PsaGradedCardsParams {
  sold?: boolean;
  grade?: number;
  setName?: string;
  cardName?: string;
  minValue?: number;
  maxValue?: number;
  limit?: number;
  page?: number;
}

export interface RawCardsParams {
  sold?: boolean;
  condition?: string;
  setName?: string;
  cardName?: string;
  minValue?: number;
  maxValue?: number;
  limit?: number;
  page?: number;
}

export interface SealedProductCollectionParams {
  sold?: boolean;
  productType?: string;
  setName?: string;
  minValue?: number;
  maxValue?: number;
  limit?: number;
  page?: number;
}

export interface ICollectionService {
  // Direct methods
  getPsaGradedCards(params?: PsaGradedCardsParams): Promise<IPsaGradedCard[]>;
  getRawCards(params?: RawCardsParams): Promise<IRawCard[]>;
  getSealedProducts(params?: SealedProductCollectionParams): Promise<ISealedProduct[]>;

  // PSA Cards CRUD
  getPsaGradedCardById(id: string): Promise<IPsaGradedCard>;
  getPsaCardById(id: string): Promise<IPsaGradedCard>;
  createPsaCard(data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard>;
  updatePsaCard(id: string, data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard>;
  deletePsaCard(id: string): Promise<void>;
  markPsaCardSold(id: string, saleDetails: ISaleDetails): Promise<IPsaGradedCard>;

  // Raw Cards CRUD
  getRawCardById(id: string): Promise<IRawCard>;
  createRawCard(data: Partial<IRawCard>): Promise<IRawCard>;
  updateRawCard(id: string, data: Partial<IRawCard>): Promise<IRawCard>;
  deleteRawCard(id: string): Promise<void>;
  markRawCardSold(id: string, saleDetails: ISaleDetails): Promise<IRawCard>;

  // Sealed Products CRUD
  getSealedProductById(id: string): Promise<ISealedProduct>;
  createSealedProduct(data: Partial<ISealedProduct>): Promise<ISealedProduct>;
  updateSealedProduct(id: string, data: Partial<ISealedProduct>): Promise<ISealedProduct>;
  deleteSealedProduct(id: string): Promise<void>;
  markSealedProductSold(id: string, saleDetails: ISaleDetails): Promise<ISealedProduct>;
}

export class CollectionService extends BaseApiService implements ICollectionService {
  constructor(httpClient: IHttpClient) {
    super(httpClient, 'COLLECTION SERVICE');
  }

  // Collection overview methods using centralized response handling
  async getPsaGradedCards(params?: PsaGradedCardsParams): Promise<IPsaGradedCard[]> {
    return this.getCollection<IPsaGradedCard>(
      '/collections/psa-graded-cards',
      'GET PSA Cards',
      { params }
    );
  }

  async getRawCards(params?: RawCardsParams): Promise<IRawCard[]> {
    return this.getCollection<IRawCard>(
      '/collections/raw-cards',
      'GET Raw Cards',
      addCacheBusting({ params })
    );
  }

  async getSealedProducts(params?: SealedProductCollectionParams): Promise<ISealedProduct[]> {
    return this.getCollection<ISealedProduct>(
      '/collections/sealed-products',
      'GET Sealed Products',
      { params }
    );
  }

  // PSA Cards CRUD Operations
  async getPsaGradedCardById(id: string): Promise<IPsaGradedCard> {
    return this.getResourceById<IPsaGradedCard>(
      '/collections/psa-graded-cards',
      id,
      'GET PSA Card by ID'
    );
  }

  async getPsaCardById(id: string): Promise<IPsaGradedCard> {
    return this.getResourceById<IPsaGradedCard>(
      '/collections/psa-graded-cards',
      id,
      'GET PSA Card by ID (alias)'
    );
  }

  async createPsaCard(data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
    return this.createResource<IPsaGradedCard & { [key: string]: any }>(
      '/collections/psa-graded-cards',
      data,
      'CREATE PSA Card',
      '_id'
    );
  }

  async updatePsaCard(id: string, data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
    return this.updateResource<IPsaGradedCard>(
      '/collections/psa-graded-cards',
      id,
      data,
      'UPDATE PSA Card'
    );
  }

  async deletePsaCard(id: string): Promise<void> {
    return this.deleteResource(
      '/collections/psa-graded-cards',
      id,
      'DELETE PSA Card'
    );
  }

  async markPsaCardSold(id: string, saleDetails: ISaleDetails): Promise<IPsaGradedCard> {
    return this.markResourceSold<IPsaGradedCard & { sold?: boolean }>(
      '/collections/psa-graded-cards',
      id,
      saleDetails,
      'MARK PSA Card SOLD'
    );
  }

  // Raw Cards CRUD Operations
  async getRawCardById(id: string): Promise<IRawCard> {
    return this.getResourceById<IRawCard>(
      '/collections/raw-cards',
      id,
      'GET Raw Card by ID'
    );
  }

  async createRawCard(data: Partial<IRawCard>): Promise<IRawCard> {
    return this.createResource<IRawCard & { [key: string]: any }>(
      '/collections/raw-cards',
      data,
      'CREATE Raw Card',
      '_id'
    );
  }

  async updateRawCard(id: string, data: Partial<IRawCard>): Promise<IRawCard> {
    return this.updateResource<IRawCard>(
      '/collections/raw-cards',
      id,
      data,
      'UPDATE Raw Card'
    );
  }

  async deleteRawCard(id: string): Promise<void> {
    return this.deleteResource(
      '/collections/raw-cards',
      id,
      'DELETE Raw Card'
    );
  }

  async markRawCardSold(id: string, saleDetails: ISaleDetails): Promise<IRawCard> {
    return this.markResourceSold<IRawCard & { sold?: boolean }>(
      '/collections/raw-cards',
      id,
      saleDetails,
      'MARK Raw Card SOLD'
    );
  }

  // Sealed Products CRUD Operations
  async getSealedProductById(id: string): Promise<ISealedProduct> {
    return this.getResourceById<ISealedProduct>(
      '/collections/sealed-products',
      id,
      'GET Sealed Product by ID'
    );
  }

  async createSealedProduct(data: Partial<ISealedProduct>): Promise<ISealedProduct> {
    return this.createResource<ISealedProduct & { [key: string]: any }>(
      '/collections/sealed-products',
      data,
      'CREATE Sealed Product',
      '_id'
    );
  }

  async updateSealedProduct(id: string, data: Partial<ISealedProduct>): Promise<ISealedProduct> {
    return this.updateResource<ISealedProduct>(
      '/collections/sealed-products',
      id,
      data,
      'UPDATE Sealed Product'
    );
  }

  async deleteSealedProduct(id: string): Promise<void> {
    return this.deleteResource(
      '/collections/sealed-products',
      id,
      'DELETE Sealed Product'
    );
  }

  async markSealedProductSold(id: string, saleDetails: ISaleDetails): Promise<ISealedProduct> {
    return this.markResourceSold<ISealedProduct & { sold?: boolean }>(
      '/collections/sealed-products',
      id,
      saleDetails,
      'MARK Sealed Product SOLD'
    );
  }
}

/**
 * PSA Graded Cards Service
 * Focused service following BaseCrudService pattern
 */
export class PsaCardService extends BaseCrudService<IPsaGradedCard> {
  protected endpoint = '/collections/psa-graded-cards';

  constructor(httpClient: IHttpClient) {
    super(httpClient, 'PSA Card');
  }

  /**
   * Get PSA cards with optional filtering parameters
   */
  async getPsaGradedCards(params?: PsaGradedCardsParams): Promise<IPsaGradedCard[]> {
    return this.getAll(params);
  }

  /**
   * Alias method for backward compatibility
   */
  async getPsaCardById(id: string): Promise<IPsaGradedCard> {
    return this.getById(id);
  }

  /**
   * Alias method for backward compatibility
   */
  async getPsaGradedCardById(id: string): Promise<IPsaGradedCard> {
    return this.getById(id);
  }

  /**
   * Create PSA card with proper typing
   */
  async createPsaCard(data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
    return this.create(data);
  }

  /**
   * Update PSA card with proper typing
   */
  async updatePsaCard(id: string, data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
    return this.update(id, data);
  }

  /**
   * Delete PSA card with proper typing
   */
  async deletePsaCard(id: string): Promise<void> {
    return this.delete(id);
  }

  /**
   * Mark PSA card as sold with sale details
   */
  async markPsaCardSold(id: string, saleDetails: ISaleDetails): Promise<IPsaGradedCard> {
    return this.markSold(id, saleDetails);
  }
}

/**
 * Raw Cards Service
 * Focused service following BaseCrudService pattern
 */
export class RawCardService extends BaseCrudService<IRawCard> {
  protected endpoint = '/collections/raw-cards';

  constructor(httpClient: IHttpClient) {
    super(httpClient, 'Raw Card');
  }

  /**
   * Get raw cards with optional filtering parameters
   */
  async getRawCards(params?: RawCardsParams): Promise<IRawCard[]> {
    return this.getCollection<IRawCard>(
      this.endpoint,
      'GET Raw Cards',
      addCacheBusting({ params })
    );
  }

  /**
   * Create raw card with proper typing
   */
  async createRawCard(data: Partial<IRawCard>): Promise<IRawCard> {
    return this.create(data);
  }

  /**
   * Update raw card with proper typing
   */
  async updateRawCard(id: string, data: Partial<IRawCard>): Promise<IRawCard> {
    return this.update(id, data);
  }

  /**
   * Delete raw card with proper typing
   */
  async deleteRawCard(id: string): Promise<void> {
    return this.delete(id);
  }

  /**
   * Get raw card by ID - alias for consistency
   */
  async getRawCardById(id: string): Promise<IRawCard> {
    return this.getById(id);
  }

  /**
   * Mark raw card as sold with sale details
   */
  async markRawCardSold(id: string, saleDetails: ISaleDetails): Promise<IRawCard> {
    return this.markSold(id, saleDetails);
  }
}

/**
 * Sealed Products Service
 * Focused service following BaseCrudService pattern
 */
export class SealedProductService extends BaseCrudService<ISealedProduct> {
  protected endpoint = '/collections/sealed-products';

  constructor(httpClient: IHttpClient) {
    super(httpClient, 'Sealed Product');
  }

  /**
   * Get sealed products with optional filtering parameters
   */
  async getSealedProducts(params?: SealedProductCollectionParams): Promise<ISealedProduct[]> {
    return this.getAll(params);
  }

  /**
   * Create sealed product with proper typing
   */
  async createSealedProduct(data: Partial<ISealedProduct>): Promise<ISealedProduct> {
    return this.create(data);
  }

  /**
   * Update sealed product with proper typing
   */
  async updateSealedProduct(id: string, data: Partial<ISealedProduct>): Promise<ISealedProduct> {
    return this.update(id, data);
  }

  /**
   * Delete sealed product with proper typing
   */
  async deleteSealedProduct(id: string): Promise<void> {
    return this.delete(id);
  }

  /**
   * Get sealed product by ID - alias for consistency
   */
  async getSealedProductById(id: string): Promise<ISealedProduct> {
    return this.getById(id);
  }

  /**
   * Mark sealed product as sold with sale details
   */
  async markSealedProductSold(id: string, saleDetails: ISaleDetails): Promise<ISealedProduct> {
    return this.markSold(id, saleDetails);
  }
}
