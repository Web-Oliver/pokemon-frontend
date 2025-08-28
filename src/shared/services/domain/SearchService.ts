/**
 * Search Service - Domain service for search operations
 * Extracted from UnifiedApiService following SOLID principles
 */

import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import { ICard, ISet } from '../../domain/models/card';
import { IProduct, ISetProduct } from '../../domain/models/product';

// Import search types from UnifiedApiService
export interface CardSearchParams {
  query: string;
  setId?: string; // MongoDB ObjectId for hierarchical filtering
  setName?: string;
  year?: number;
  cardNumber?: string;
  variety?: string;
  minPsaPopulation?: number;
  limit?: number;
  page?: number;
  populate?: string; // For auto-population (e.g., 'setId')
  exclude?: string; // For excluding specific card ID
}

export interface SetSearchParams {
  query: string;
  year?: number;
  minYear?: number;
  maxYear?: number;
  minPsaPopulation?: number;
  minCardCount?: number;
  limit?: number;
  page?: number;
}

export interface ProductSearchParams {
  query: string;
  category?: string;
  setName?: string;
  setProductId?: string; // MongoDB ObjectId for hierarchical filtering
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  limit?: number;
  page?: number;
  populate?: string; // For auto-population (e.g., 'setProductId')
  exclude?: string; // For excluding specific product ID
}

export interface SearchResponse<T> {
  success: boolean;
  query: string;
  count: number;
  data: T[];
}

export interface ISearchService {
  searchSets(params: SetSearchParams): Promise<SearchResponse<ISet>>;
  searchSetProducts(params: ProductSearchParams): Promise<SearchResponse<ISetProduct>>;
  searchProducts(params: ProductSearchParams): Promise<SearchResponse<IProduct>>;
  searchCards(params: CardSearchParams): Promise<SearchResponse<ICard>>;
  
  // Hierarchical search methods
  getCardsInSet(setId: string, query?: string): Promise<SearchResponse<ICard>>;
  getProductsInSetProduct(setProductId: string, query?: string): Promise<SearchResponse<IProduct>>;
  getCardWithContext(cardId: string): Promise<{card: ICard; relatedCards: ICard[]; setInfo: ISet}>;
  getProductWithContext(productId: string): Promise<{product: IProduct; relatedProducts: IProduct[]; setProductInfo: ISetProduct}>;
}

export class SearchService extends BaseApiService implements ISearchService {
  constructor(httpClient: IHttpClient) {
    super(httpClient, 'SEARCH SERVICE');
  }

  async searchSets(params: SetSearchParams): Promise<SearchResponse<ISet>> {
    console.log('[API DEBUG] Calling unified /search?type=sets with params:', params);
    try {
      // Use unified search endpoint with type parameter
      const response = await this.httpClient.get<any>('/search/sets', {
        params: {
          query: params.query,
          limit: params.limit,
          page: params.page,
          year: params.year,
          minYear: params.minYear,
          maxYear: params.maxYear,
          minPsaPopulation: params.minPsaPopulation,
          minCardCount: params.minCardCount,
        },
        skipTransform: true,
      });
      
      // Extract sets from nested response structure {data: {sets: [...]}}
      const setsData = response?.data?.sets || response?.data || [];
      const searchResponse: SearchResponse<ISet> = {
        data: setsData,
        count: Array.isArray(setsData) ? setsData.length : 0,
        success: response?.success !== false,
        query: params.query,
      };

      console.log('[API DEBUG] Final searchResponse:', searchResponse);
      return searchResponse;
    } catch (error) {
      console.error('[API DEBUG] /search?type=sets ERROR:', error);
      return { data: [], count: 0, success: false, query: params.query };
    }
  }

  async searchSetProducts(params: ProductSearchParams): Promise<SearchResponse<ISetProduct>> {
    console.log('[API DEBUG] FIXED: Calling /set-products?q= with params:', params);
    try {
      // FIXED: Use direct set-products endpoint with q parameter
      const response = await this.httpClient.get<any>('/set-products', {
        params: {
          q: params.query, // Use 'q' parameter instead of 'query'
          limit: params.limit || 10,
          page: params.page || 1,
          category: params.category,
          setName: params.setName,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          availableOnly: params.availableOnly,
        },
        skipTransform: true,
      });

      const responseData = response?.data || response || [];
      const searchResponse: SearchResponse<ISetProduct> = {
        data: responseData,
        count: Array.isArray(responseData) ? responseData.length : 0,
        success: response?.success !== false,
        query: params.query,
      };

      console.log('[API DEBUG] Final searchResponse:', searchResponse);
      return searchResponse;
    } catch (error) {
      console.error('[API DEBUG] /set-products ERROR:', error);
      return { data: [], count: 0, success: false, query: params.query };
    }
  }

  async searchProducts(params: ProductSearchParams): Promise<SearchResponse<IProduct>> {
    console.log('[API DEBUG] Calling /search/products with params:', params);
    try {
      const response = await this.httpClient.get<any>('/search/products', {
        params: {
          query: params.query,
          limit: params.limit || 10,
          page: params.page || 1,
          category: params.category,
          setName: params.setName,
          setProductId: params.setProductId,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          availableOnly: params.availableOnly,
          populate: params.populate,
          exclude: params.exclude,
        },
        skipTransform: true,
      });

      const responseData = response?.data || response || [];
      return {
        data: responseData,
        count: Array.isArray(responseData) ? responseData.length : 0,
        success: response?.success !== false,
        query: params.query,
      };
    } catch (error) {
      console.error('[API DEBUG] /search/products ERROR:', error);
      return { data: [], count: 0, success: false, query: params.query };
    }
  }

  async searchCards(params: CardSearchParams): Promise<SearchResponse<ICard>> {
    console.log('[API DEBUG] Calling /search/cards with params:', params);
    try {
      const response = await this.httpClient.get<any>('/search/cards', {
        params: {
          query: params.query,
          limit: params.limit || 10,
          page: params.page || 1,
          setId: params.setId,
          setName: params.setName,
          year: params.year,
          cardNumber: params.cardNumber,
          variety: params.variety,
          minPsaPopulation: params.minPsaPopulation,
          populate: params.populate,
          exclude: params.exclude,
        },
        skipTransform: true,
      });

      // Handle MongoDB ObjectId filtering for hierarchical search
      let responseData = response?.data || response || [];
      if (params.setId && Array.isArray(responseData)) {
        responseData = responseData.filter((card: any) => {
          return card.setId === params.setId || card.set?._id === params.setId;
        });
      }

      return {
        data: responseData,
        count: Array.isArray(responseData) ? responseData.length : 0,
        success: response?.success !== false,
        query: params.query,
      };
    } catch (error) {
      console.error('[API DEBUG] /search/cards ERROR:', error);
      return { data: [], count: 0, success: false, query: params.query };
    }
  }

  // Hierarchical search methods
  async getCardsInSet(setId: string, query?: string): Promise<SearchResponse<ICard>> {
    return this.searchCards({
      query: query || '',
      setId,
      populate: 'setId',
    });
  }

  async getProductsInSetProduct(setProductId: string, query?: string): Promise<SearchResponse<IProduct>> {
    return this.searchProducts({
      query: query || '',
      setProductId,
      populate: 'setProductId',
    });
  }

  async getCardWithContext(cardId: string): Promise<{card: ICard; relatedCards: ICard[]; setInfo: ISet}> {
    try {
      const response = await this.httpClient.get<any>(`/search/cards/${cardId}/context`);
      return response?.data || response;
    } catch (error) {
      console.error('[API DEBUG] /search/cards/context ERROR:', error);
      throw error;
    }
  }

  async getProductWithContext(productId: string): Promise<{product: IProduct; relatedProducts: IProduct[]; setProductInfo: ISetProduct}> {
    try {
      const response = await this.httpClient.get<any>(`/search/products/${productId}/context`);
      return response?.data || response;
    } catch (error) {
      console.error('[API DEBUG] /search/products/context ERROR:', error);
      throw error;
    }
  }
}