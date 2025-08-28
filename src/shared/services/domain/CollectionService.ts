/**
 * Collection Service - Domain service for collection operations
 * Extracted from UnifiedApiService following SOLID principles
 */

import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import { IPsaGradedCard, IRawCard } from '../../domain/models/card';
import { ISealedProduct } from '../../domain/models/sealedProduct';
import { ISaleDetails } from '../../../types/common';

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

  // Direct methods
  async getPsaGradedCards(params?: PsaGradedCardsParams): Promise<IPsaGradedCard[]> {
    const response = await this.httpClient.get<{success: boolean; data: IPsaGradedCard[]; meta?: any}>(
      '/collections/psa-graded-cards',
      { params }
    );
    return response.data || response;
  }

  async getRawCards(params?: RawCardsParams): Promise<IRawCard[]> {
    const response = await this.httpClient.get<{success: boolean; data: IRawCard[]}>('/collections/raw-cards', {
      params: {
        ...params,
        _t: Date.now(), // Cache busting
      },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    return response.data || response;
  }

  async getSealedProducts(params?: SealedProductCollectionParams): Promise<ISealedProduct[]> {
    const response = await this.httpClient.get<{success: boolean; data: ISealedProduct[]}>(
      '/collections/sealed-products',
      { params }
    );
    return response.data || response;
  }

  // PSA Cards CRUD
  async getPsaGradedCardById(id: string): Promise<IPsaGradedCard> {
    const response = await this.httpClient.get<{success: boolean; data: IPsaGradedCard}>(
      `/collections/psa-graded-cards/${id}`
    );
    return response.data || response;
  }

  async getPsaCardById(id: string): Promise<IPsaGradedCard> {
    return await this.httpClient.getById<IPsaGradedCard>('/collections/psa-graded-cards', id);
  }

  async createPsaCard(data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
    const response = await this.httpClient.post<{success: boolean; data: IPsaGradedCard}>(
      '/collections/psa-graded-cards',
      data
    );
    return response.data || response;
  }

  async updatePsaCard(id: string, data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
    const response = await this.httpClient.put<{success: boolean; data: IPsaGradedCard}>(
      `/collections/psa-graded-cards/${id}`,
      data
    );
    return response.data || response;
  }

  async deletePsaCard(id: string): Promise<void> {
    await this.httpClient.delete(`/collections/psa-graded-cards/${id}`);
  }

  async markPsaCardSold(id: string, saleDetails: ISaleDetails): Promise<IPsaGradedCard> {
    const response = await this.httpClient.patch<{success: boolean; data: IPsaGradedCard}>(
      `/collections/psa-graded-cards/${id}`,
      { sold: true, saleDetails }
    );
    return response.data || response;
  }

  // Raw Cards CRUD
  async getRawCardById(id: string): Promise<IRawCard> {
    const response = await this.httpClient.get<{success: boolean; data: IRawCard}>(
      `/collections/raw-cards/${id}`
    );
    return response.data || response;
  }

  async createRawCard(data: Partial<IRawCard>): Promise<IRawCard> {
    const response = await this.httpClient.post<{success: boolean; data: IRawCard}>(
      '/collections/raw-cards',
      data
    );
    return response.data || response;
  }

  async updateRawCard(id: string, data: Partial<IRawCard>): Promise<IRawCard> {
    const response = await this.httpClient.put<{success: boolean; data: IRawCard}>(
      `/collections/raw-cards/${id}`,
      data
    );
    return response.data || response;
  }

  async deleteRawCard(id: string): Promise<void> {
    await this.httpClient.delete(`/collections/raw-cards/${id}`);
  }

  async markRawCardSold(id: string, saleDetails: ISaleDetails): Promise<IRawCard> {
    const response = await this.httpClient.patch<{success: boolean; data: IRawCard}>(
      `/collections/raw-cards/${id}`,
      { sold: true, saleDetails }
    );
    return response.data || response;
  }

  // Sealed Products CRUD
  async getSealedProductById(id: string): Promise<ISealedProduct> {
    const response = await this.httpClient.get<{success: boolean; data: ISealedProduct}>(
      `/collections/sealed-products/${id}`
    );
    return response.data || response;
  }

  async createSealedProduct(data: Partial<ISealedProduct>): Promise<ISealedProduct> {
    const response = await this.httpClient.post<{success: boolean; data: ISealedProduct}>(
      '/collections/sealed-products',
      data
    );
    return response.data || response;
  }

  async updateSealedProduct(id: string, data: Partial<ISealedProduct>): Promise<ISealedProduct> {
    const response = await this.httpClient.put<{success: boolean; data: ISealedProduct}>(
      `/collections/sealed-products/${id}`,
      data
    );
    return response.data || response;
  }

  async deleteSealedProduct(id: string): Promise<void> {
    await this.httpClient.delete(`/collections/sealed-products/${id}`);
  }

  async markSealedProductSold(id: string, saleDetails: ISaleDetails): Promise<ISealedProduct> {
    const response = await this.httpClient.patch<{success: boolean; data: ISealedProduct}>(
      `/collections/sealed-products/${id}`,
      { sold: true, saleDetails }
    );
    return response.data || response;
  }
}