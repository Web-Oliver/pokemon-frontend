/**
 * Search Service - Domain service for search operations
 * Extracted from UnifiedApiService following SOLID principles
 */

import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import { ICard, ISet } from '../../domain/models/card';
import { IProduct, ISetProduct } from '../../domain/models/product';
import { SearchResponse } from '@/types/search';
import { extractResponseData, extractSearchResponse, buildHierarchicalParams } from '@/shared/utils/responseUtils';
import { createApiLogger } from '../../utils/performance/apiLogger';
import { filterCardsBySetId } from '../../utils/search/searchFilters';

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
  private logger = createApiLogger('SEARCH SERVICE');

  constructor(httpClient: IHttpClient) {
    super(httpClient, 'SEARCH SERVICE');
  }

  async searchSets(params: SetSearchParams): Promise<SearchResponse<ISet>> {
    this.logger.logApiCall('searchSets', params);
    return this.executeWithErrorHandling('SEARCH Sets', async () => {
      const response = await this.httpClient.get<any>('/search/sets', {
        params: buildHierarchicalParams({
          query: params.query,
          limit: params.limit,
          page: params.page,
          year: params.year,
          minYear: params.minYear,
          maxYear: params.maxYear,
          minPsaPopulation: params.minPsaPopulation,
          minCardCount: params.minCardCount,
        }),
        skipTransform: true,
      });
      
      return extractSearchResponse<ISet>(response, params.query);
    });
  }

  async searchSetProducts(params: ProductSearchParams): Promise<SearchResponse<ISetProduct>> {
    this.logger.logApiCall('searchSetProducts', params);
    return this.executeWithErrorHandling('SEARCH Set Products', async () => {
      const response = await this.httpClient.get<any>('/set-products', {
        params: buildHierarchicalParams({
          q: params.query, // Use 'q' parameter instead of 'query'
          limit: params.limit || 10,
          page: params.page || 1,
          category: params.category,
          setName: params.setName,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          availableOnly: params.availableOnly,
        }),
        skipTransform: true,
      });

      return extractSearchResponse<ISetProduct>(response, params.query);
    });
  }

  async searchProducts(params: ProductSearchParams): Promise<SearchResponse<IProduct>> {
    this.logger.logApiCall('searchProducts', params);
    return this.executeWithErrorHandling('SEARCH Products', async () => {
      const response = await this.httpClient.get<any>('/search/products', {
        params: buildHierarchicalParams({
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
        }),
        skipTransform: true,
      });

      return extractSearchResponse<IProduct>(response, params.query);
    });
  }

  async searchCards(params: CardSearchParams): Promise<SearchResponse<ICard>> {
    this.logger.logApiCall('searchCards', params);
    return this.executeWithErrorHandling('SEARCH Cards', async () => {
      const response = await this.httpClient.get<any>('/search/cards', {
        params: buildHierarchicalParams({
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
        }),
        skipTransform: true,
      });

      const searchResponse = extractSearchResponse<ICard>(response, params.query);
      
      // Apply hierarchical filtering if setId is provided
      return params.setId 
        ? filterCardsBySetId(searchResponse, params.setId)
        : searchResponse;
    });
  }

  // Hierarchical search methods using centralized patterns
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
    return this.executeWithErrorHandling('GET Card with Context', async () => {
      const response = await this.httpClient.get<any>(`/search/cards/${cardId}/context`);
      return extractResponseData(response);
    });
  }

  async getProductWithContext(productId: string): Promise<{product: IProduct; relatedProducts: IProduct[]; setProductInfo: ISetProduct}> {
    return this.executeWithErrorHandling('GET Product with Context', async () => {
      const response = await this.httpClient.get<any>(`/search/products/${productId}/context`);
      return extractResponseData(response);
    });
  }
}