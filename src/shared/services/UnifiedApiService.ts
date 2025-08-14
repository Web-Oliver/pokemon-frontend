/**
 * Unified API Service
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * COMPLETE API FACADE - All backend operations consolidated here
 * Following CLAUDE.md architecture and SOLID principles:
 * - SRP: Single responsibility for ALL API operations
 * - OCP: Open for extension via domain service composition
 * - LSP: Maintains interface compatibility across all domains
 * - ISP: Segregated interfaces for different domains
 * - DIP: Depends on HTTP client abstraction, not concrete implementations
 *
 * DRY: Eliminates ALL direct imports of individual API files
 * Reusability: Single source of truth for ALL backend communication
 * Architecture: NO CIRCULAR DEPENDENCIES - this service imports nothing from other services
 */

import { unifiedHttpClient } from './base/UnifiedHttpClient';
import { generateFacebookPostFromAuction } from '../utils/formatting/facebookPostFormatter';

// Domain Models
import { IAuction } from '../domain/models/auction';
import { ICard, IPsaGradedCard, IRawCard, ISet } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { IProduct, ISetProduct } from '../domain/models/product';
import { ISaleDetails } from '../../types/common';

// Type definitions for auction operations (replacing deprecated auctionsApi)
export interface AuctionsParams {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
}

export interface AddItemToAuctionData {
  itemId: string;
  itemCategory: string;
  startingPrice?: number;
}

// ========== TYPE DEFINITIONS ==========

/**
 * Sets query parameters interface (from deprecated setsApi)
 */
export interface PaginatedSetsParams {
  page?: number;
  limit?: number;
  search?: string;
  year?: number;
}

/**
 * Search interfaces (from deprecated searchApi)
 */
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

/**
 * Collection interfaces (from deprecated collectionApi)
 */
export interface PsaGradedCardsParams {
  grade?: string;
  setName?: string;
  cardName?: string;
  sold?: boolean;
}

export interface RawCardsParams {
  condition?: string;
  setName?: string;
  cardName?: string;
  sold?: boolean;
}

export interface SealedProductCollectionParams {
  category?: string;
  setName?: string;
  sold?: boolean;
  search?: string;
}

/**
 * Products query parameters interface
 */
export interface ProductsParams {
  category?: string;
  setProductId?: string;
  setName?: string;
  available?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Paginated products response interface
 */
export interface PaginatedProductsResponse {
  products: IProduct[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Optimized product search response (from deprecated productsApi)
 */
export interface OptimizedProductSearchResponse {
  success: boolean;
  query: string;
  count: number;
  data: IProduct[];
}

// ========== DOMAIN SERVICE INTERFACES ==========

/**
 * Auction domain service interface
 */
export interface IAuctionService {
  // Read operations
  getAuctions(params?: AuctionsParams): Promise<IAuction[]>;

  getAuctionById(id: string): Promise<IAuction>;

  // Write operations
  createAuction(auctionData: Partial<IAuction>): Promise<IAuction>;

  updateAuction(id: string, auctionData: Partial<IAuction>): Promise<IAuction>;

  deleteAuction(id: string): Promise<void>;

  // Auction item operations
  addItemToAuction(id: string, itemData: AddItemToAuctionData): Promise<IAuction>;

  removeItemFromAuction(id: string, itemId: string, itemCategory?: string): Promise<IAuction>;

  markAuctionItemSold(id: string, saleData: { itemId: string; itemCategory: string; soldPrice: number }): Promise<IAuction>;
}

/**
 * Collection domain service interface
 */
export interface ICollectionService {
  // Direct methods
  getPsaGradedCards(params?: PsaGradedCardsParams): Promise<IPsaGradedCard[]>;

  getRawCards(params?: RawCardsParams): Promise<IRawCard[]>;

  getSealedProducts(
    params?: SealedProductCollectionParams
  ): Promise<ISealedProduct[]>;

  // PSA Cards CRUD
  getPsaGradedCardById(id: string): Promise<IPsaGradedCard>;

  getPsaCardById(id: string): Promise<IPsaGradedCard>;

  createPsaCard(data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard>;

  updatePsaCard(
    id: string,
    data: Partial<IPsaGradedCard>
  ): Promise<IPsaGradedCard>;

  deletePsaCard(id: string): Promise<void>;

  markPsaCardSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<IPsaGradedCard>;

  // Raw Cards CRUD
  getRawCardById(id: string): Promise<IRawCard>;

  createRawCard(data: Partial<IRawCard>): Promise<IRawCard>;

  updateRawCard(id: string, data: Partial<IRawCard>): Promise<IRawCard>;

  deleteRawCard(id: string): Promise<void>;

  markRawCardSold(id: string, saleDetails: ISaleDetails): Promise<IRawCard>;

  // Sealed Products CRUD
  getSealedProductById(id: string): Promise<ISealedProduct>;

  createSealedProduct(data: Partial<ISealedProduct>): Promise<ISealedProduct>;

  updateSealedProduct(
    id: string,
    data: Partial<ISealedProduct>
  ): Promise<ISealedProduct>;

  deleteSealedProduct(id: string): Promise<void>;

  markSealedProductSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<ISealedProduct>;
}

/**
 * Sets domain service interface
 */
export interface ISetsService {
  getPaginatedSets(
    params?: PaginatedSetsParams
  ): Promise<{ sets: ISet[]; totalPages: number; currentPage: number }>;

  getSetById(id: string): Promise<ISet>;

  searchSets(params: SetSearchParams): Promise<SearchResponse<ISet>>;

  getSetSuggestions(query: string, limit?: number): Promise<ISet[]>;
}

/**
 * Cards domain service interface
 */
export interface ICardsService {
  searchCards(params: CardSearchParams): Promise<SearchResponse<ICard>>;

  getCardSuggestions(query: string, limit?: number): Promise<ICard[]>;

  getCardById(id: string): Promise<ICard>;
}

/**
 * Products domain service interface
 */
export interface IProductsService {
  searchProducts(
    params: ProductSearchParams
  ): Promise<SearchResponse<IProduct>>;

  getProductSuggestions(query: string, limit?: number): Promise<IProduct[]>;

  getSetProducts(params?: any): Promise<ISetProduct[]>;

  getPaginatedProducts(
    params?: ProductsParams
  ): Promise<PaginatedProductsResponse>;
}

/**
 * Search domain service interface
 */
export interface ISearchService {
  searchSets(params: SetSearchParams): Promise<SearchResponse<ISet>>;

  searchSetProducts(
    params: ProductSearchParams
  ): Promise<SearchResponse<ISetProduct>>;

  searchProducts(
    params: ProductSearchParams
  ): Promise<SearchResponse<IProduct>>;

  searchCards(params: CardSearchParams): Promise<SearchResponse<ICard>>;

  // Hierarchical search methods
  getCardsInSet(setId: string, query?: string): Promise<SearchResponse<ICard>>;
  getProductsInSetProduct(setProductId: string, query?: string): Promise<SearchResponse<IProduct>>;
  getCardWithContext(cardId: string): Promise<{card: ICard; relatedCards: ICard[]; setInfo: ISet}>;
  getProductWithContext(productId: string): Promise<{product: IProduct; relatedProducts: IProduct[]; setProductInfo: ISetProduct}>;
}

/**
 * Export domain service interface
 */
export interface IExportService {
  exportCollectionImages(
    itemType: 'psaGradedCards' | 'rawCards' | 'sealedProducts'
  ): Promise<Blob>;

  exportAuctionImages(auctionId: string): Promise<Blob>;

  exportDbaItems(): Promise<Blob>;

  exportToDba(exportRequest: any): Promise<any>;

  downloadDbaZip(): Promise<void>;

  // Auction-specific exports
  generateAuctionFacebookPost(auctionId: string): Promise<string>;

  getAuctionFacebookTextFile(auctionId: string): Promise<Blob>;

  downloadBlob(blob: Blob, filename: string): void;
}

/**
 * Upload domain service interface
 */
export interface IUploadService {
  uploadMultipleImages(images: File[]): Promise<string[]>;

  uploadSingleImage(image: File): Promise<string>;
}

/**
 * Status domain service interface
 */
export interface IStatusService {
  getApiStatus(): Promise<statusApi.ApiStatusResponse>;

  getDataCounts(): Promise<{
    cards: number;
    sets: number;
    products: number;
    setProducts: number;
  }>;
}

/**
 * DBA Selection domain service interface
 */
export interface IDbaSelectionService {
  getDbaSelections(params?: {
    active?: boolean;
    expiring?: boolean;
    days?: number;
  }): Promise<any[]>;

  addToDbaSelection(
    items: Array<{
      itemId: string;
      itemType: 'psa' | 'raw' | 'sealed';
      notes?: string;
    }>
  ): Promise<any>;

  removeFromDbaSelection(
    items: Array<{ itemId: string; itemType: 'psa' | 'raw' | 'sealed' }>
  ): Promise<any>;
}

// ========== UNIFIED API SERVICE IMPLEMENTATION ==========

/**
 * Main Unified API Service class
 * Provides domain-based service organization (e.g., unifiedApiService.auctions.getById())
 */
export class UnifiedApiService {
  // ========== AUCTION DOMAIN ==========

  public readonly auctions: IAuctionService = {
    async getAuctions(
      params?: AuctionsParams
    ): Promise<IAuction[]> {
      const queryParams = params || {};
      const response = await unifiedHttpClient.get<IAuction[]>('/auctions', {
        params: queryParams,
      });
      return response.data || response;
    },

    async getAuctionById(id: string): Promise<IAuction> {
      return await unifiedHttpClient.getById<IAuction>('/auctions', id);
    },

    async createAuction(auctionData: Partial<IAuction>): Promise<IAuction> {
      const response = await unifiedHttpClient.post<IAuction>(
        '/auctions',
        auctionData
      );
      return response.data || response;
    },

    async updateAuction(
      id: string,
      auctionData: Partial<IAuction>
    ): Promise<IAuction> {
      const response = await unifiedHttpClient.put<IAuction>(
        `/auctions/${id}`,
        auctionData
      );
      return response.data || response;
    },

    async deleteAuction(id: string): Promise<void> {
      await unifiedHttpClient.delete(`/auctions/${id}`);
    },

    async addItemToAuction(
      id: string,
      itemData: AddItemToAuctionData
    ): Promise<IAuction> {
      const response = await unifiedHttpClient.post<IAuction>(
        `/auctions/${id}/items`,
        itemData
      );
      return response.data || response;
    },

    async removeItemFromAuction(
      id: string,
      itemId: string,
      itemCategory?: string
    ): Promise<IAuction> {
      const body = { itemId, itemCategory };
      const response = await unifiedHttpClient.delete(
        `/auctions/${id}/items/${itemId}`,
        { data: body }
      );
      return response.data || response;
    },

    async markAuctionItemSold(
      id: string,
      saleData: { itemId: string; itemCategory: string; soldPrice: number }
    ): Promise<IAuction> {
      const response = await unifiedHttpClient.put<IAuction>(
        `/auctions/${id}/items/sold`,
        saleData
      );
      return response.data || response;
    },
  };

  // ========== COLLECTION DOMAIN ==========

  public readonly collection: ICollectionService = {
    // PSA Graded Cards - Updated to use unified collections endpoint
    async getPsaGradedCards(
      params?: PsaGradedCardsParams
    ): Promise<IPsaGradedCard[]> {
      const response = await unifiedHttpClient.get<{success: boolean; data: IPsaGradedCard[]; meta?: any}>(
        '/collections/psa-graded-cards',
        { params }
      );
      return response.data || response;
    },

    async getPsaGradedCardById(id: string): Promise<IPsaGradedCard> {
      const response = await unifiedHttpClient.get<{success: boolean; data: IPsaGradedCard}>(
        `/collections/psa-graded-cards/${id}`
      );
      return response.data || response;
    },

    async getPsaCardById(id: string): Promise<IPsaGradedCard> {
      return await unifiedHttpClient.getById<IPsaGradedCard>(
        '/collections/psa-graded-cards',
        id
      );
    },

    async createPsaCard(
      data: Partial<IPsaGradedCard>
    ): Promise<IPsaGradedCard> {
      const response = await unifiedHttpClient.post<{success: boolean; data: IPsaGradedCard}>(
        '/collections/psa-graded-cards',
        data
      );
      return response.data || response;
    },

    async updatePsaCard(
      id: string,
      data: Partial<IPsaGradedCard>
    ): Promise<IPsaGradedCard> {
      const response = await unifiedHttpClient.put<{success: boolean; data: IPsaGradedCard}>(
        `/collections/psa-graded-cards/${id}`,
        data
      );
      return response.data || response;
    },

    async deletePsaCard(id: string): Promise<void> {
      await unifiedHttpClient.delete(`/collections/psa-graded-cards/${id}`);
    },

    async markPsaCardSold(
      id: string,
      saleDetails: ISaleDetails
    ): Promise<IPsaGradedCard> {
      const response = await unifiedHttpClient.patch<{success: boolean; data: IPsaGradedCard}>(
        `/collections/psa-graded-cards/${id}`,
        { sold: true, saleDetails }
      );
      return response.data || response;
    },

    // Raw Cards - Updated to use unified collections endpoint
    async getRawCards(params?: RawCardsParams): Promise<IRawCard[]> {
      const response = await unifiedHttpClient.get<{success: boolean; data: IRawCard[]}>('/collections/raw-cards', {
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
    },

    async getRawCardById(id: string): Promise<IRawCard> {
      const response = await unifiedHttpClient.get<{success: boolean; data: IRawCard}>(
        `/collections/raw-cards/${id}`
      );
      return response.data || response;
    },

    async createRawCard(data: Partial<IRawCard>): Promise<IRawCard> {
      const response = await unifiedHttpClient.post<{success: boolean; data: IRawCard}>(
        '/collections/raw-cards',
        data
      );
      return response.data || response;
    },

    async updateRawCard(
      id: string,
      data: Partial<IRawCard>
    ): Promise<IRawCard> {
      const response = await unifiedHttpClient.put<{success: boolean; data: IRawCard}>(
        `/collections/raw-cards/${id}`,
        data
      );
      return response.data || response;
    },

    async deleteRawCard(id: string): Promise<void> {
      await unifiedHttpClient.delete(`/collections/raw-cards/${id}`);
    },

    async markRawCardSold(
      id: string,
      saleDetails: ISaleDetails
    ): Promise<IRawCard> {
      const response = await unifiedHttpClient.patch<{success: boolean; data: IRawCard}>(
        `/collections/raw-cards/${id}`,
        { sold: true, saleDetails }
      );
      return response.data || response;
    },

    // Sealed Products - Updated to use unified collections endpoint
    async getSealedProducts(
      params?: SealedProductCollectionParams
    ): Promise<ISealedProduct[]> {
      const response = await unifiedHttpClient.get<{success: boolean; data: ISealedProduct[]}>(
        '/collections/sealed-products',
        { params }
      );
      return response.data || response;
    },

    async getSealedProductById(id: string): Promise<ISealedProduct> {
      const response = await unifiedHttpClient.get<{success: boolean; data: ISealedProduct}>(
        `/collections/sealed-products/${id}`
      );
      return response.data || response;
    },

    async createSealedProduct(
      data: Partial<ISealedProduct>
    ): Promise<ISealedProduct> {
      const response = await unifiedHttpClient.post<{success: boolean; data: ISealedProduct}>(
        '/collections/sealed-products',
        data
      );
      return response.data || response;
    },

    async updateSealedProduct(
      id: string,
      data: Partial<ISealedProduct>
    ): Promise<ISealedProduct> {
      const response = await unifiedHttpClient.put<{success: boolean; data: ISealedProduct}>(
        `/collections/sealed-products/${id}`,
        data
      );
      return response.data || response;
    },

    async deleteSealedProduct(id: string): Promise<void> {
      await unifiedHttpClient.delete(`/collections/sealed-products/${id}`);
    },

    async markSealedProductSold(
      id: string,
      saleDetails: ISaleDetails
    ): Promise<ISealedProduct> {
      const response = await unifiedHttpClient.patch<{success: boolean; data: ISealedProduct}>(
        `/collections/sealed-products/${id}`,
        { sold: true, saleDetails }
      );
      return response.data || response;
    },
  };

  // ========== SETS DOMAIN ==========

  public readonly sets: ISetsService = {
    async getPaginatedSets(params?: PaginatedSetsParams) {
      const response = await unifiedHttpClient.get('/sets', { params });
      return response.data || response;
    },

    async getSetById(id: string): Promise<ISet> {
      return await unifiedHttpClient.getById<ISet>('/sets', id);
    },

    async searchSets(params: SetSearchParams): Promise<SearchResponse<ISet>> {
      const response = await unifiedHttpClient.get<SearchResponse<ISet>>(
        '/search/sets',
        { params }
      );
      return response.data || response;
    },

    async getSetSuggestions(
      query: string,
      limit: number = 10
    ): Promise<ISet[]> {
      const response = await unifiedHttpClient.get<ISet[]>(
        '/search/sets/suggestions',
        {
          params: { query, limit },
        }
      );
      return response.data || response;
    },
  };

  // ========== CARDS DOMAIN ==========

  public readonly cards: ICardsService = {
    async searchCards(
      params: CardSearchParams
    ): Promise<SearchResponse<ICard>> {
      const response = await unifiedHttpClient.get<SearchResponse<ICard>>(
        '/search/cards',
        { params }
      );
      return response.data || response;
    },

    async getCardSuggestions(
      query: string,
      limit: number = 10
    ): Promise<ICard[]> {
      const response = await unifiedHttpClient.get<ICard[]>(
        '/search/cards/suggestions',
        {
          params: { query, limit },
        }
      );
      return response.data || response;
    },

    async getCardById(id: string): Promise<ICard> {
      return await unifiedHttpClient.getById<ICard>('/cards', id);
    },
  };

  // ========== SEARCH DOMAIN ==========

  public readonly search: ISearchService = {
    async searchSets(params: SetSearchParams): Promise<SearchResponse<ISet>> {
      console.log('[API DEBUG] Calling unified /search?type=sets with params:', params);
      try {
        // Use unified search endpoint with type parameter
        const response = await unifiedHttpClient.get<any>('/search', {
          params: {
            domain: 'cards', // Card Domain: Set → Card hierarchy
            type: 'sets',
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
    },

    async searchSetProducts(
      params: ProductSearchParams
    ): Promise<SearchResponse<ISetProduct>> {
      console.log(
        '[API DEBUG] Calling unified /search?type=set-products with params:',
        params
      );
      try {
        // Use unified search endpoint for set products
        const response = await unifiedHttpClient.get<any>('/search', {
          params: {
            domain: 'products', // Product Domain: SetProduct → Product hierarchy
            type: 'set-products',
            query: params.query,
            limit: params.limit,
            page: params.page,
            category: params.category,
            setName: params.setName,
          },
          skipTransform: true
        });

        // Extract setProducts from nested response structure {data: {setProducts: [...]}}
        const setProductsData = response?.data?.setProducts || response?.data || [];
        const searchResponse: SearchResponse<ISetProduct> = {
          data: setProductsData,
          count: Array.isArray(setProductsData) ? setProductsData.length : 0,
          success: response?.success !== false,
          query: params.query,
        };

        console.log(
          '[API DEBUG] Final set-products searchResponse:',
          searchResponse
        );
        return searchResponse;
      } catch (error) {
        console.error('[API DEBUG] /search?type=set-products ERROR:', error);
        return { data: [], count: 0, success: false, query: params.query };
      }
    },

    async searchProducts(
      params: ProductSearchParams
    ): Promise<SearchResponse<IProduct>> {
      console.log('[API DEBUG] Calling unified /search?type=products with params:', params);
      try {
        const response = await unifiedHttpClient.get<any>('/search', {
          params: {
            domain: 'products', // Product Domain: SetProduct → Product hierarchy
            type: 'products',
            query: params.query,
            limit: params.limit,
            page: params.page,
            category: params.category,
            setName: params.setName,
            setProductId: params.setProductId, // For hierarchical filtering
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            availableOnly: params.availableOnly,
            populate: params.populate, // For auto-population
            exclude: params.exclude, // For excluding items
          },
          skipTransform: true,
        });

        // Extract products from nested response structure {data: {products: {results: [...]}}}
        const productsContainer = response?.data?.products;
        const productsData = productsContainer?.results || response?.data || [];
        const searchResponse: SearchResponse<IProduct> = {
          data: productsData,
          count: productsContainer?.total || (Array.isArray(productsData) ? productsData.length : 0),
          success: response?.success !== false,
          query: params.query,
        };

        console.log(
          '[API DEBUG] Final products searchResponse:',
          searchResponse
        );
        return searchResponse;
      } catch (error) {
        console.error('[API DEBUG] /search?type=products ERROR:', error);
        return { data: [], count: 0, success: false, query: params.query };
      }
    },

    async searchCards(
      params: CardSearchParams
    ): Promise<SearchResponse<ICard>> {
      console.log('[API DEBUG] Calling unified /search?type=cards with params:', params);
      try {
        const response = await unifiedHttpClient.get<any>('/search', {
          params: {
            domain: 'cards', // Card Domain: Set → Card hierarchy
            type: 'cards',
            query: params.query,
            limit: params.limit,
            page: params.page,
            setId: params.setId, // For hierarchical filtering by MongoDB ObjectId
            setName: params.setName,
            year: params.year,
            cardNumber: params.cardNumber,
            variety: params.variety,
            minPsaPopulation: params.minPsaPopulation,
            populate: params.populate, // For auto-population (e.g., 'setId')
            exclude: params.exclude, // For excluding specific cards
          },
          skipTransform: true,
        });

        // Extract cards from nested response structure {data: {cards: [...]}}
        const cardsData = response?.data?.cards || response?.data || [];
        const searchResponse: SearchResponse<ICard> = {
          data: cardsData,
          count: Array.isArray(cardsData) ? cardsData.length : 0,
          success: response?.success !== false,
          query: params.query,
        };

        console.log('[API DEBUG] Final cards searchResponse:', searchResponse);
        return searchResponse;
      } catch (error) {
        console.error('[API DEBUG] /search?type=cards ERROR:', error);
        return { data: [], count: 0, success: false, query: params.query };
      }
    },

    // Hierarchical search methods for MongoDB ObjectId relationships
    async getCardsInSet(setId: string, query?: string): Promise<SearchResponse<ICard>> {
      console.log('[API DEBUG] Getting cards in set:', { setId, query });
      return this.searchCards({
        query: query || '',
        setId, // Filter by MongoDB ObjectId
        populate: 'setId', // Auto-populate set information
        limit: 20,
      });
    },

    async getProductsInSetProduct(setProductId: string, query?: string): Promise<SearchResponse<IProduct>> {
      console.log('[API DEBUG] Getting products in set product:', { setProductId, query });
      return this.searchProducts({
        query: query || '',
        setProductId, // Filter by MongoDB ObjectId
        populate: 'setProductId', // Auto-populate set product information
        limit: 20,
      });
    },

    async getCardWithContext(cardId: string): Promise<{card: ICard; relatedCards: ICard[]; setInfo: ISet}> {
      console.log('[API DEBUG] Getting card with context:', { cardId });
      try {
        // Get the card with its set information populated
        const cardResponse = await unifiedHttpClient.get<any>(`/cards/${cardId}`, {
          params: { populate: 'setId' },
          skipTransform: true,
        });
        const card = cardResponse?.data || cardResponse;
        
        if (!card?.setId?._id) {
          throw new Error('Card does not have set information');
        }

        // Get related cards in the same set (excluding the current card)
        const relatedCardsResponse = await this.searchCards({
          query: '',
          setId: card.setId._id,
          exclude: cardId,
          limit: 10,
        });

        return {
          card,
          relatedCards: relatedCardsResponse.data,
          setInfo: card.setId,
        };
      } catch (error) {
        console.error('[API DEBUG] Error getting card with context:', error);
        throw error;
      }
    },

    async getProductWithContext(productId: string): Promise<{product: IProduct; relatedProducts: IProduct[]; setProductInfo: ISetProduct}> {
      console.log('[API DEBUG] Getting product with context:', { productId });
      try {
        // Get the product with its set product information populated
        const productResponse = await unifiedHttpClient.get<any>(`/products/${productId}`, {
          params: { populate: 'setProductId' },
          skipTransform: true,
        });
        const product = productResponse?.data || productResponse;
        
        if (!product?.setProductId?._id) {
          throw new Error('Product does not have set product information');
        }

        // Get related products in the same set product (excluding the current product)
        const relatedProductsResponse = await this.searchProducts({
          query: '',
          setProductId: product.setProductId._id,
          exclude: productId,
          limit: 10,
        });

        return {
          product,
          relatedProducts: relatedProductsResponse.data,
          setProductInfo: product.setProductId,
        };
      } catch (error) {
        console.error('[API DEBUG] Error getting product with context:', error);
        throw error;
      }
    },
  };

  // ========== PRODUCTS DOMAIN ==========

  public readonly products: IProductsService = {
    async searchProducts(
      params: ProductSearchParams
    ): Promise<SearchResponse<IProduct>> {
      const response = await unifiedHttpClient.get<SearchResponse<IProduct>>(
        '/search/products',
        { params }
      );
      return response.data || response;
    },

    async getProductSuggestions(
      query: string,
      limit: number = 10
    ): Promise<IProduct[]> {
      const response = await unifiedHttpClient.get<IProduct[]>(
        '/search/products/suggestions',
        {
          params: { query, limit },
        }
      );
      return response.data || response;
    },

    async getSetProducts(params?: any): Promise<ISetProduct[]> {
      const response = await unifiedHttpClient.get<ISetProduct[]>(
        '/set-products',
        { params }
      );
      return response.data || response;
    },

    async getPaginatedProducts(
      params?: ProductsParams
    ): Promise<PaginatedProductsResponse> {
      const {
        page = 1,
        limit = 20,
        category,
        setName,
        setProductId,
        available,
        search,
      } = params || {};

      if (search && search.trim()) {
        // Use optimized search when there's a search term
        const searchParams = {
          query: search.trim(),
          page,
          limit,
          category,
          setName,
          setProductId,
          availableOnly: available,
        };

        const response = await this.products.searchProducts(searchParams);

        // Calculate pagination for optimized search
        const totalPages = Math.ceil(response.count / limit);
        return {
          products: response.data,
          total: response.count,
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        };
      } else {
        // Use the main /api/products endpoint for browsing without search
        const queryParams = {
          page: page.toString(),
          limit: limit.toString(),
          ...(category && { category }),
          ...(setName && { setName }),
          ...(setProductId && { setProductId }),
          ...(available !== undefined && { available: available.toString() }),
        };

        const response = await unifiedHttpClient.get<PaginatedProductsResponse>(
          '/products',
          { params: queryParams }
        );

        return {
          products: response.products || [],
          total: response.total || 0,
          currentPage: response.currentPage || page,
          totalPages: response.totalPages || 1,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
        };
      }
    },
  };

  // ========== EXPORT DOMAIN ==========

  public readonly export: IExportService = {
    async exportCollectionImages(
      itemType: 'psaGradedCards' | 'rawCards' | 'sealedProducts'
    ): Promise<Blob> {
      // Get collection data based on item type
      const endpoint =
        itemType === 'psaGradedCards'
          ? '/export/zip/psa-graded-cards'
          : itemType === 'rawCards'
            ? '/export/zip/raw-cards'
            : '/export/zip/sealed-products';

      const collectionData = await unifiedHttpClient.get(endpoint);
      const items = collectionData.data || collectionData;

      // Extract image URLs and create zip
      const imageUrls: string[] = [];
      const itemNames: string[] = [];

      items.forEach((item: any, index: number) => {
        if (item.images && item.images.length > 0) {
          item.images.forEach((imagePath: string, imageIndex: number) => {
            if (imagePath) {
              const imageUrl = imagePath.startsWith('http')
                ? imagePath
                : `http://localhost:3000${imagePath}`;
              imageUrls.push(imageUrl);

              // Generate filename based on item type
              let itemName = '';
              const category =
                itemType === 'psaGradedCards'
                  ? 'PSA'
                  : itemType === 'rawCards'
                    ? 'RAW'
                    : 'SEALED';

              if (itemType === 'psaGradedCards' || itemType === 'rawCards') {
                const cardName = (
                  item.cardId?.cardName ||
                  'Unknown'
                )
                  .replace(/[^a-zA-Z0-9\s]/g, '')
                  .replace(/\s+/g, '_')
                  .toLowerCase();
                const setName = (item.cardId?.setId?.setName || 'Unknown')
                  .replace(/^(pokemon\s+)?(japanese\s+)?/i, '')
                  .replace(/[^a-zA-Z0-9\s]/g, '')
                  .replace(/\s+/g, '_')
                  .toLowerCase();
                const number = item.cardId?.cardNumber || '000';

                if (itemType === 'psaGradedCards' && item.grade) {
                  itemName = `${category}_${setName}_${cardName}_${number}_PSA${item.grade}`;
                } else if (itemType === 'rawCards' && item.condition) {
                  const condition = item.condition
                    .replace(/\s+/g, '')
                    .toUpperCase();
                  itemName = `${category}_${setName}_${cardName}_${number}_${condition}`;
                } else {
                  itemName = `${category}_${setName}_${cardName}_${number}`;
                }
              } else {
                const productName = (item.name || 'Unknown')
                  .replace(/[^a-zA-Z0-9\s]/g, '')
                  .replace(/\s+/g, '_')
                  .toLowerCase();
                itemName = `${category}_${productName}`;
              }

              const extension = imagePath.split('.').pop() || 'jpg';
              const imageNumber = String(imageIndex + 1).padStart(2, '0');
              itemNames.push(`${itemName}_img${imageNumber}.${extension}`);
            }
          });
        }
      });

      // Create ZIP using JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Download and add images to zip
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const response = await fetch(imageUrls[i]);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(itemNames[i], blob);
          }
        } catch (error) {
          console.warn(`Failed to download image: ${imageUrls[i]}`);
        }
      }

      return await zip.generateAsync({ type: 'blob' });
    },

    async exportAuctionImages(auctionId: string): Promise<Blob> {
      // Get auction data
      const auction = await unifiedHttpClient.getById('/auctions', auctionId);

      // Extract image URLs from auction items
      const imageUrls: string[] = [];
      const itemNames: string[] = [];

      auction.items.forEach((item: any) => {
        if (item.itemData && item.itemData.images) {
          item.itemData.images.forEach(
            (imagePath: string, imageIndex: number) => {
              if (imagePath) {
                const imageUrl = imagePath.startsWith('http')
                  ? imagePath
                  : `http://localhost:3000${imagePath}`;
                imageUrls.push(imageUrl);

                // Generate improved filename
                const category =
                  item.itemCategory === 'PsaGradedCard'
                    ? 'PSA'
                    : item.itemCategory === 'RawCard'
                      ? 'RAW'
                      : 'SEALED';

                let itemName = '';
                if (
                  item.itemCategory === 'PsaGradedCard' ||
                  item.itemCategory === 'RawCard'
                ) {
                  const cardName = (
                    item.itemData.cardId?.cardName ||
                    'Unknown'
                  )
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\s+/g, '_')
                    .toLowerCase();
                  const setName = (
                    item.itemData.cardId?.setId?.setName || 'Unknown'
                  )
                    .replace(/^(pokemon\s+)?(japanese\s+)?/i, '')
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\s+/g, '_')
                    .toLowerCase();
                  const number = item.itemData.cardId?.cardNumber || '000';

                  if (item.itemCategory === 'PsaGradedCard') {
                    const grade = item.itemData.grade || '0';
                    itemName = `${category}_${setName}_${cardName}_${number}_PSA${grade}`;
                  } else {
                    const condition = (item.itemData.condition || 'NM')
                      .replace(/\s+/g, '')
                      .toUpperCase();
                    itemName = `${category}_${setName}_${cardName}_${number}_${condition}`;
                  }
                } else {
                  const productName = (item.itemData.name || 'Unknown')
                    .replace(/[^a-zA-Z0-9\s]/g, '')
                    .replace(/\s+/g, '_')
                    .toLowerCase();
                  itemName = `${category}_${productName}`;
                }

                const extension = imagePath.split('.').pop() || 'jpg';
                const imageNumber = String(imageIndex + 1).padStart(2, '0');
                itemNames.push(`${itemName}_img${imageNumber}.${extension}`);
              }
            }
          );
        }
      });

      // Create ZIP using JSZip
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Download and add images to zip
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const response = await fetch(imageUrls[i]);
          if (response.ok) {
            const blob = await response.blob();
            zip.file(itemNames[i], blob);
          }
        } catch (error) {
          console.warn(`Failed to download image: ${imageUrls[i]}`);
        }
      }

      return await zip.generateAsync({ type: 'blob' });
    },

    async exportDbaItems(): Promise<Blob> {
      return await unifiedHttpClient.get('/collections/exports/dba', {
        responseType: 'blob',
      });
    },

    async exportToDba(exportRequest: any): Promise<any> {
      // Use the correct REST endpoint that the backend actually supports
      const { type = 'psa-graded-cards', ...requestData } = exportRequest;
      const response = await unifiedHttpClient.post<any>(
        `/collections/${type}/exports`,
        { format: 'dba', ...requestData }
      );
      return response.data || response;
    },

    async downloadDbaZip(): Promise<void> {
      try {
        // Use raw fetch to ensure proper binary handling
        const response = await fetch('http://localhost:3000/api/collections/exports/dba', {
          method: 'GET',
          headers: {
            'Accept': 'application/zip, application/octet-stream',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the filename from Content-Disposition header if available
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'dba-export.zip';
        
        if (contentDisposition && contentDisposition.includes('filename=')) {
          const matches = contentDisposition.match(/filename="?(.+?)"?$/);
          if (matches?.[1]) {
            filename = matches[1];
          }
        } else {
          // Fallback filename with timestamp
          const timestamp = new Date().toISOString().split('T')[0];
          filename = `dba-export-${timestamp}.zip`;
        }

        // Convert response to blob
        const blob = await response.blob();

        // Validate that we got a substantial file
        if (blob.size === 0) {
          throw new Error('Received empty file from server');
        }

        // Log successful download info
        console.log(`[DBA EXPORT] Downloaded zip file: ${filename}, size: ${blob.size} bytes`);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 1000);
        
      } catch (error) {
        console.error('[DBA EXPORT] Download failed:', error);
        
        // Create a fallback download with error information
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `dba-export-error-${timestamp}.txt`;
        const errorText = `DBA Export Download Failed: ${timestamp}\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThe backend zip file could not be downloaded properly.\nPlease try again or contact support.\n\nTechnical details:\n- Backend endpoint: /api/collections/exports/dba\n- Expected: Binary zip file\n- Error type: ${typeof error}\n\nTroubleshooting:\n1. Check if backend is running\n2. Verify export was successful\n3. Check browser console for network errors`;
        
        const errorBlob = new Blob([errorText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(errorBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 1000);
        
        // Re-throw the error for proper error handling in the UI
        throw error;
      }
    },

    async generateAuctionFacebookPost(auctionId: string): Promise<string> {
      // Get the auction data directly from the API
      const auction = await unifiedHttpClient.getById<IAuction>('/auctions', auctionId);
      
      // Use dedicated formatter utility (SOLID SRP principle)
      return generateFacebookPostFromAuction(auction);
    },

    async getAuctionFacebookTextFile(auctionId: string): Promise<Blob> {
      // Generate the Facebook post text
      const postText = await this.generateAuctionFacebookPost(auctionId);
      
      // Create a blob from the text
      return new Blob([postText], { type: 'text/plain' });
    },

    downloadBlob(blob: Blob, filename: string): void {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    },
  };

  // ========== UPLOAD DOMAIN ==========

  public readonly upload: IUploadService = {
    async uploadMultipleImages(images: File[]): Promise<string[]> {
      if (!images || images.length === 0) {
        return [];
      }

      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await unifiedHttpClient.post<{
        success: boolean;
        data: any[];
      }>('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedFiles = response.data || response || [];
      if (!Array.isArray(uploadedFiles)) {
        throw new Error('Invalid response format from upload API');
      }

      return uploadedFiles.map((file: any) => file.path || file.url);
    },

    async uploadSingleImage(image: File): Promise<string> {
      if (!image) {
        throw new Error('No image file provided for upload');
      }

      const formData = new FormData();
      formData.append('image', image);

      const response = await unifiedHttpClient.post<
        { success: boolean; data: any } | any
      >('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedFile = response.data || response;
      return uploadedFile.path || uploadedFile.url;
    },
  };

  // ========== STATUS DOMAIN ==========

  public readonly status: IStatusService = {
    async getApiStatus(): Promise<statusApi.ApiStatusResponse> {
      const response =
        await unifiedHttpClient.get<statusApi.ApiStatusResponse>('/status');
      return response.data || response;
    },

    async getDataCounts(): Promise<{
      cards: number;
      sets: number;
      products: number;
      setProducts: number;
    }> {
      const status = await this.getApiStatus();
      return {
        cards: status.data.cards,
        sets: status.data.sets,
        products: status.data.products,
        setProducts: status.data.setProducts,
      };
    },
  };

  // ========== DBA SELECTION DOMAIN ==========

  public readonly dbaSelection: IDbaSelectionService = {
    async getDbaSelections(params?: {
      active?: boolean;
      expiring?: boolean;
      days?: number;
    }): Promise<any[]> {
      const queryParams: any = {};
      if (params?.active !== undefined)
        queryParams.active = params.active.toString();
      if (params?.expiring !== undefined)
        queryParams.expiring = params.expiring.toString();
      if (params?.days !== undefined) queryParams.days = params.days.toString();

      console.log('[UNIFIED API DEBUG] DBA Selection request:', {
        url: '/dba-selection',
        params: queryParams,
        originalParams: params,
      });

      try {
        const response = await unifiedHttpClient.get<any[]>('/dba-selection', {
          params: queryParams,
        });
        console.log('[UNIFIED API DEBUG] DBA Selection response:', {
          raw: response,
          data: response.data,
          final: response.data || response,
        });
        return response.data || response;
      } catch (error) {
        console.error('[UNIFIED API DEBUG] DBA Selection error:', error);
        throw error;
      }
    },

    async addToDbaSelection(
      items: Array<{
        itemId: string;
        itemType: 'psa' | 'raw' | 'sealed';
        notes?: string;
      }>
    ): Promise<any> {
      const response = await unifiedHttpClient.post<any>('/dba-selection', {
        items,
      });
      return response.data || response;
    },

    async removeFromDbaSelection(
      items: Array<{ itemId: string; itemType: 'psa' | 'raw' | 'sealed' }>
    ): Promise<any> {
      const response = await unifiedHttpClient.delete<any>('/dba-selection', {
        data: { items },
      });
      return response.data || response;
    },
  };

  // ========== UTILITY METHODS ==========

  /**
   * Get HTTP client configuration for debugging
   */
  getHttpClientConfig() {
    return unifiedHttpClient.getConfig();
  }

  /**
   * Get service health information
   */
  getServiceInfo() {
    return {
      name: 'UnifiedApiService',
      version: '1.0.0',
      domains: [
        'auctions',
        'collection',
        'sets',
        'cards',
        'products',
        'search',
        'export',
        'upload',
        'status',
        'dbaSelection',
      ],
      httpClient: this.getHttpClientConfig(),
    };
  }
}

// ========== SINGLETON INSTANCE ==========

/**
 * Singleton instance of the UnifiedApiService
 * Export as default for easy importing: import unifiedApiService from './UnifiedApiService'
 * Also export as named export for explicit imports: import { unifiedApiService } from './UnifiedApiService'
 */
export const unifiedApiService = new UnifiedApiService();

/**
 * Default export for convenient importing
 */
export default unifiedApiService;
