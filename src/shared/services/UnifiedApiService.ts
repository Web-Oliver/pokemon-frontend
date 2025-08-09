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

// Domain Models
import { IAuction } from '../domain/models/auction';
import { IPsaGradedCard, IRawCard, ISet, ICard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { IProduct, ISetProduct } from '../domain/models/product';
import { ISaleDetails } from "../../types/common";

// Import type definitions from deprecated API files for interface compatibility
import type * as auctionsApi from '../api/auctionsApi';
import type * as cardsApi from '../api/cardsApi';
import type * as exportApi from '../api/exportApi';
import type * as uploadApi from '../api/uploadApi';
import type * as statusApi from '../api/statusApi';

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
  setId?: string;
  setName?: string;
  year?: number;
  pokemonNumber?: string;
  variety?: string;
  minPsaPopulation?: number;
  limit?: number;
  page?: number;
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
  setProductId?: string;
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  limit?: number;
  page?: number;
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
  getAuctions(params?: auctionsApi.AuctionsParams): Promise<IAuction[]>;
  getAuctionById(id: string): Promise<IAuction>;
  
  // Write operations
  createAuction(auctionData: Partial<IAuction>): Promise<IAuction>;
  updateAuction(id: string, auctionData: Partial<IAuction>): Promise<IAuction>;
  deleteAuction(id: string): Promise<void>;
}

/**
 * Collection domain service interface
 */
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

/**
 * Sets domain service interface
 */
export interface ISetsService {
  getPaginatedSets(params?: PaginatedSetsParams): Promise<{ sets: ISet[]; totalPages: number; currentPage: number; }>;
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
  searchProducts(params: ProductSearchParams): Promise<SearchResponse<IProduct>>;
  getProductSuggestions(query: string, limit?: number): Promise<IProduct[]>;
  getSetProducts(params?: any): Promise<ISetProduct[]>;
  getPaginatedProducts(params?: ProductsParams): Promise<PaginatedProductsResponse>;
}

/**
 * Search domain service interface
 */
export interface ISearchService {
  searchSets(params: SetSearchParams): Promise<SearchResponse<ISet>>;
  searchSetProducts(params: ProductSearchParams): Promise<SearchResponse<IProduct>>;
  searchProducts(params: ProductSearchParams): Promise<SearchResponse<IProduct>>;
  searchCards(params: CardSearchParams): Promise<SearchResponse<ICard>>;
}

/**
 * Export domain service interface
 */
export interface IExportService {
  exportCollectionImages(itemType: 'psaGradedCards' | 'rawCards' | 'sealedProducts'): Promise<Blob>;
  exportAuctionImages(auctionId: string): Promise<Blob>;
  exportDbaItems(): Promise<Blob>;
  exportToDba(exportRequest: any): Promise<any>;
  downloadDbaZip(): Promise<void>;
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
  getDataCounts(): Promise<{ cards: number; sets: number; products: number; setProducts: number; }>;
}

/**
 * DBA Selection domain service interface
 */
export interface IDbaSelectionService {
  getDbaSelections(params?: { active?: boolean; expiring?: boolean; days?: number }): Promise<any[]>;
  addToDbaSelection(items: Array<{ itemId: string; itemType: 'psa' | 'raw' | 'sealed'; notes?: string }>): Promise<any>;
  removeFromDbaSelection(items: Array<{ itemId: string; itemType: 'psa' | 'raw' | 'sealed' }>): Promise<any>;
}

// ========== UNIFIED API SERVICE IMPLEMENTATION ==========

/**
 * Main Unified API Service class
 * Provides domain-based service organization (e.g., unifiedApiService.auctions.getById())
 */
export class UnifiedApiService {
  
  // ========== AUCTION DOMAIN ==========
  
  public readonly auctions: IAuctionService = {
    async getAuctions(params?: auctionsApi.AuctionsParams): Promise<IAuction[]> {
      const queryParams = params || {};
      const response = await unifiedHttpClient.get<IAuction[]>('/auctions', { params: queryParams });
      return response.data || response;
    },
    
    async getAuctionById(id: string): Promise<IAuction> {
      return await unifiedHttpClient.getById<IAuction>('/auctions', id);
    },
    
    async createAuction(auctionData: Partial<IAuction>): Promise<IAuction> {
      const response = await unifiedHttpClient.post<IAuction>('/auctions', auctionData);
      return response.data || response;
    },
    
    async updateAuction(id: string, auctionData: Partial<IAuction>): Promise<IAuction> {
      const response = await unifiedHttpClient.put<IAuction>(`/auctions/${id}`, auctionData);
      return response.data || response;
    },
    
    async deleteAuction(id: string): Promise<void> {
      await unifiedHttpClient.delete(`/auctions/${id}`);
    }
  };

  // ========== COLLECTION DOMAIN ==========
  
  public readonly collection: ICollectionService = {
    // PSA Graded Cards
    async getPsaGradedCards(params?: PsaGradedCardsParams): Promise<IPsaGradedCard[]> {
      const response = await unifiedHttpClient.get<IPsaGradedCard[]>('/psa-graded-cards', { params });
      return response.data || response;
    },

    async getPsaGradedCardById(id: string): Promise<IPsaGradedCard> {
      return await unifiedHttpClient.getById<IPsaGradedCard>('/psa-graded-cards', id);
    },

    async getPsaCardById(id: string): Promise<IPsaGradedCard> {
      return await unifiedHttpClient.getById<IPsaGradedCard>('/psa-graded-cards', id);
    },

    async createPsaCard(data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
      const response = await unifiedHttpClient.post<IPsaGradedCard>('/psa-graded-cards', data);
      return response.data || response;
    },

    async updatePsaCard(id: string, data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
      const response = await unifiedHttpClient.put<IPsaGradedCard>(`/psa-graded-cards/${id}`, data);
      return response.data || response;
    },

    async deletePsaCard(id: string): Promise<void> {
      await unifiedHttpClient.delete(`/psa-graded-cards/${id}`);
    },

    async markPsaCardSold(id: string, saleDetails: ISaleDetails): Promise<IPsaGradedCard> {
      const response = await unifiedHttpClient.post<IPsaGradedCard>(`/psa-graded-cards/${id}/mark-sold`, { saleDetails });
      return response.data || response;
    },

    // Raw Cards
    async getRawCards(params?: RawCardsParams): Promise<IRawCard[]> {
      const response = await unifiedHttpClient.get<IRawCard[]>('/raw-cards', { 
        params: {
          ...params,
          _t: Date.now() // Cache busting
        },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      return response.data || response;
    },

    async getRawCardById(id: string): Promise<IRawCard> {
      return await unifiedHttpClient.getById<IRawCard>('/raw-cards', id);
    },

    async createRawCard(data: Partial<IRawCard>): Promise<IRawCard> {
      const response = await unifiedHttpClient.post<IRawCard>('/raw-cards', data);
      return response.data || response;
    },

    async updateRawCard(id: string, data: Partial<IRawCard>): Promise<IRawCard> {
      const response = await unifiedHttpClient.put<IRawCard>(`/raw-cards/${id}`, data);
      return response.data || response;
    },

    async deleteRawCard(id: string): Promise<void> {
      await unifiedHttpClient.delete(`/raw-cards/${id}`);
    },

    async markRawCardSold(id: string, saleDetails: ISaleDetails): Promise<IRawCard> {
      const response = await unifiedHttpClient.post<IRawCard>(`/raw-cards/${id}/mark-sold`, { saleDetails });
      return response.data || response;
    },

    // Sealed Products  
    async getSealedProducts(params?: SealedProductCollectionParams): Promise<ISealedProduct[]> {
      const response = await unifiedHttpClient.get<ISealedProduct[]>('/sealed-products', { params });
      return response.data || response;
    },

    async getSealedProductById(id: string): Promise<ISealedProduct> {
      return await unifiedHttpClient.getById<ISealedProduct>('/sealed-products', id);
    },

    async createSealedProduct(data: Partial<ISealedProduct>): Promise<ISealedProduct> {
      const response = await unifiedHttpClient.post<ISealedProduct>('/sealed-products', data);
      return response.data || response;
    },

    async updateSealedProduct(id: string, data: Partial<ISealedProduct>): Promise<ISealedProduct> {
      const response = await unifiedHttpClient.put<ISealedProduct>(`/sealed-products/${id}`, data);
      return response.data || response;
    },

    async deleteSealedProduct(id: string): Promise<void> {
      await unifiedHttpClient.delete(`/sealed-products/${id}`);
    },

    async markSealedProductSold(id: string, saleDetails: ISaleDetails): Promise<ISealedProduct> {
      const response = await unifiedHttpClient.post<ISealedProduct>(`/sealed-products/${id}/mark-sold`, { saleDetails });
      return response.data || response;
    }
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
      const response = await unifiedHttpClient.get<SearchResponse<ISet>>('/search/sets', { params });
      return response.data || response;
    },
    
    async getSetSuggestions(query: string, limit: number = 10): Promise<ISet[]> {
      const response = await unifiedHttpClient.get<ISet[]>('/search/sets/suggestions', { 
        params: { query, limit } 
      });
      return response.data || response;
    }
  };

  // ========== CARDS DOMAIN ==========
  
  public readonly cards: ICardsService = {
    async searchCards(params: CardSearchParams): Promise<SearchResponse<ICard>> {
      const response = await unifiedHttpClient.get<SearchResponse<ICard>>('/search/cards', { params });
      return response.data || response;
    },
    
    async getCardSuggestions(query: string, limit: number = 10): Promise<ICard[]> {
      const response = await unifiedHttpClient.get<ICard[]>('/search/cards/suggestions', { 
        params: { query, limit } 
      });
      return response.data || response;
    },
    
    async getCardById(id: string): Promise<ICard> {
      return await unifiedHttpClient.getById<ICard>('/cards', id);
    }
  };

  // ========== SEARCH DOMAIN ==========
  
  public readonly search: ISearchService = {
    async searchSets(params: SetSearchParams): Promise<SearchResponse<ISet>> {
      console.log('[API DEBUG] Calling /search/sets with params:', params);
      try {
        const response = await unifiedHttpClient.get<any>('/search/sets', { params });
        console.log('[API DEBUG] /search/sets SUCCESS response:', {
          rawResponse: response,
          responseKeys: response ? Object.keys(response) : 'no response',
          hasDirectSets: response?.sets !== undefined,
          directSetsLength: response?.sets?.length || 0,
          hasData: response?.data !== undefined,
          dataKeys: response?.data ? Object.keys(response.data) : 'no data keys',
          hasNestedSets: response?.data?.sets !== undefined,
          nestedSetsLength: response?.data?.sets?.length || 0
        });
        
        // FIXED: Handle the transformed API response format
        // After transformApiResponse, the response is the extracted data object: {sets: [...], count: N}
        let searchResponse: SearchResponse<ISet>;
        
        if (response?.sets && Array.isArray(response.sets)) {
          // Response is the transformed data object directly
          console.log('[API DEBUG] Using sets from transformed response.sets');
          searchResponse = {
            data: response.sets,
            count: response.count || response.total || response.sets.length,
            success: true,
            query: params.query
          };
        } else if (response?.data?.sets && Array.isArray(response.data.sets)) {
          // Fallback: raw response format if transformer didn't run
          console.log('[API DEBUG] Using sets from response.data.sets (raw format)');
          searchResponse = {
            data: response.data.sets,
            count: response.data.count || response.data.total || response.data.sets.length,
            success: true,
            query: params.query
          };
        } else {
          // Fallback - empty response
          console.warn('[API DEBUG] Unexpected response format, returning empty result');
          searchResponse = { data: [], count: 0, success: false, query: params.query };
        }
        
        console.log('[API DEBUG] Final searchResponse:', searchResponse);
        return searchResponse;
      } catch (error) {
        console.error('[API DEBUG] /search/sets ERROR:', error);
        // Return empty result instead of throwing
        return { data: [], count: 0, success: false, query: params.query };
      }
    },

    async searchSetProducts(params: ProductSearchParams): Promise<SearchResponse<IProduct>> {
      console.log('[API DEBUG] Calling /search/set-products with params:', params);
      try {
        const response = await unifiedHttpClient.get<any>('/search/set-products', { params });
        console.log('[API DEBUG] /search/set-products SUCCESS response:', {
          rawResponse: response,
          responseKeys: response ? Object.keys(response) : 'no response',
          hasData: response?.data !== undefined,
          dataKeys: response?.data ? Object.keys(response.data) : 'no data keys',
          hasProducts: response?.data?.products !== undefined,
          productsLength: response?.data?.products?.length || 0
        });
        
        // FIXED: Handle the transformed API response format
        let searchResponse: SearchResponse<IProduct>;
        
        if (response?.products && Array.isArray(response.products)) {
          // Response is the transformed data object directly
          console.log('[API DEBUG] Using products from transformed response.products');
          searchResponse = {
            data: response.products,
            count: response.count || response.total || response.products.length,
            success: true,
            query: params.query
          };
        } else if (response?.data?.products && Array.isArray(response.data.products)) {
          // Fallback: raw response format if transformer didn't run
          console.log('[API DEBUG] Using products from response.data.products (raw format)');
          searchResponse = {
            data: response.data.products,
            count: response.data.count || response.data.total || response.data.products.length,
            success: true,
            query: params.query
          };
        } else {
          console.warn('[API DEBUG] Unexpected set-products response format, returning empty result');
          searchResponse = { data: [], count: 0, success: false, query: params.query };
        }
        
        console.log('[API DEBUG] Final set-products searchResponse:', searchResponse);
        return searchResponse;
      } catch (error) {
        console.error('[API DEBUG] /search/set-products ERROR:', error);
        return { data: [], count: 0, success: false, query: params.query };
      }
    },

    async searchProducts(params: ProductSearchParams): Promise<SearchResponse<IProduct>> {
      console.log('[API DEBUG] Calling /search/products with params:', params);
      try {
        const response = await unifiedHttpClient.get<any>('/search/products', { params });
        console.log('[API DEBUG] /search/products SUCCESS response:', {
          rawResponse: response,
          responseKeys: response ? Object.keys(response) : 'no response',
          hasData: response?.data !== undefined,
          dataKeys: response?.data ? Object.keys(response.data) : 'no data keys',
          hasProducts: response?.data?.products !== undefined,
          productsLength: response?.data?.products?.length || 0
        });
        
        // FIXED: Handle the transformed API response format
        let searchResponse: SearchResponse<IProduct>;
        
        if (response?.products && Array.isArray(response.products)) {
          // Response is the transformed data object directly
          console.log('[API DEBUG] Using products from transformed response.products');
          searchResponse = {
            data: response.products,
            count: response.count || response.total || response.products.length,
            success: true,
            query: params.query
          };
        } else if (response?.data?.products && Array.isArray(response.data.products)) {
          // Fallback: raw response format if transformer didn't run
          console.log('[API DEBUG] Using products from response.data.products (raw format)');
          searchResponse = {
            data: response.data.products,
            count: response.data.count || response.data.total || response.data.products.length,
            success: true,
            query: params.query
          };
        } else {
          // Fallback - empty response
          console.warn('[API DEBUG] Unexpected products response format, returning empty result');
          searchResponse = { data: [], count: 0, success: false, query: params.query };
        }
        
        console.log('[API DEBUG] Final products searchResponse:', searchResponse);
        return searchResponse;
      } catch (error) {
        console.error('[API DEBUG] /search/products ERROR:', error);
        return { data: [], count: 0, success: false, query: params.query };
      }
    },

    async searchCards(params: CardSearchParams): Promise<SearchResponse<ICard>> {
      console.log('[API DEBUG] Calling /search/cards with params:', params);
      try {
        const response = await unifiedHttpClient.get<any>('/search/cards', { params });
        console.log('[API DEBUG] /search/cards SUCCESS response:', {
          rawResponse: response,
          responseKeys: response ? Object.keys(response) : 'no response',
          hasData: response?.data !== undefined,
          dataKeys: response?.data ? Object.keys(response.data) : 'no data keys',
          hasCards: response?.data?.cards !== undefined,
          cardsLength: response?.data?.cards?.length || 0
        });
        
        // FIXED: Handle the transformed API response format
        let searchResponse: SearchResponse<ICard>;
        
        if (response?.cards && Array.isArray(response.cards)) {
          // Response is the transformed data object directly
          console.log('[API DEBUG] Using cards from transformed response.cards');
          searchResponse = {
            data: response.cards,
            count: response.count || response.total || response.cards.length,
            success: true,
            query: params.query
          };
        } else if (response?.data?.cards && Array.isArray(response.data.cards)) {
          // Fallback: raw response format if transformer didn't run
          console.log('[API DEBUG] Using cards from response.data.cards (raw format)');
          searchResponse = {
            data: response.data.cards,
            count: response.data.count || response.data.total || response.data.cards.length,
            success: true,
            query: params.query
          };
        } else {
          // Fallback - empty response
          console.warn('[API DEBUG] Unexpected cards response format, returning empty result');
          searchResponse = { data: [], count: 0, success: false, query: params.query };
        }
        
        console.log('[API DEBUG] Final cards searchResponse:', searchResponse);
        return searchResponse;
      } catch (error) {
        console.error('[API DEBUG] /search/cards ERROR:', error);
        return { data: [], count: 0, success: false, query: params.query };
      }
    }
  };

  // ========== PRODUCTS DOMAIN ==========
  
  public readonly products: IProductsService = {
    async searchProducts(params: ProductSearchParams): Promise<SearchResponse<IProduct>> {
      const response = await unifiedHttpClient.get<SearchResponse<IProduct>>('/search/products', { params });
      return response.data || response;
    },
    
    async getProductSuggestions(query: string, limit: number = 10): Promise<IProduct[]> {
      const response = await unifiedHttpClient.get<IProduct[]>('/search/products/suggestions', { 
        params: { query, limit } 
      });
      return response.data || response;
    },
    
    async getSetProducts(params?: any): Promise<ISetProduct[]> {
      const response = await unifiedHttpClient.get<ISetProduct[]>('/set-products', { params });
      return response.data || response;
    },
    
    async getPaginatedProducts(params?: ProductsParams): Promise<PaginatedProductsResponse> {
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

        const response = await unifiedHttpClient.get<PaginatedProductsResponse>('/products', { params: queryParams });

        return {
          products: response.products || [],
          total: response.total || 0,
          currentPage: response.currentPage || page,
          totalPages: response.totalPages || 1,
          hasNextPage: response.hasNextPage || false,
          hasPrevPage: response.hasPrevPage || false,
        };
      }
    }
  };

  // ========== EXPORT DOMAIN ==========
  
  public readonly export: IExportService = {
    async exportCollectionImages(itemType: 'psaGradedCards' | 'rawCards' | 'sealedProducts'): Promise<Blob> {
      // Get collection data based on item type
      const endpoint = itemType === 'psaGradedCards' 
        ? '/export/zip/psa-cards' 
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
              const category = itemType === 'psaGradedCards' ? 'PSA' 
                : itemType === 'rawCards' ? 'RAW' : 'SEALED';
              
              if (itemType === 'psaGradedCards' || itemType === 'rawCards') {
                const cardName = (item.cardId?.cardName || item.cardId?.baseName || 'Unknown')
                  .replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
                const setName = (item.cardId?.setId?.setName || 'Unknown')
                  .replace(/^(pokemon\s+)?(japanese\s+)?/i, '')
                  .replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
                const number = item.cardId?.pokemonNumber || '000';
                
                if (itemType === 'psaGradedCards' && item.grade) {
                  itemName = `${category}_${setName}_${cardName}_${number}_PSA${item.grade}`;
                } else if (itemType === 'rawCards' && item.condition) {
                  const condition = item.condition.replace(/\s+/g, '').toUpperCase();
                  itemName = `${category}_${setName}_${cardName}_${number}_${condition}`;
                } else {
                  itemName = `${category}_${setName}_${cardName}_${number}`;
                }
              } else {
                const productName = (item.name || 'Unknown')
                  .replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
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
          item.itemData.images.forEach((imagePath: string, imageIndex: number) => {
            if (imagePath) {
              const imageUrl = imagePath.startsWith('http') 
                ? imagePath 
                : `http://localhost:3000${imagePath}`;
              imageUrls.push(imageUrl);
              
              // Generate improved filename
              const category = item.itemCategory === 'PsaGradedCard' ? 'PSA'
                : item.itemCategory === 'RawCard' ? 'RAW' : 'SEALED';
              
              let itemName = '';
              if (item.itemCategory === 'PsaGradedCard' || item.itemCategory === 'RawCard') {
                const cardName = (item.itemData.cardId?.cardName || item.itemData.cardId?.baseName || 'Unknown')
                  .replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
                const setName = (item.itemData.cardId?.setId?.setName || 'Unknown')
                  .replace(/^(pokemon\s+)?(japanese\s+)?/i, '')
                  .replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
                const number = item.itemData.cardId?.pokemonNumber || '000';
                
                if (item.itemCategory === 'PsaGradedCard') {
                  const grade = item.itemData.grade || '0';
                  itemName = `${category}_${setName}_${cardName}_${number}_PSA${grade}`;
                } else {
                  const condition = (item.itemData.condition || 'NM').replace(/\s+/g, '').toUpperCase();
                  itemName = `${category}_${setName}_${cardName}_${number}_${condition}`;
                }
              } else {
                const productName = (item.itemData.name || 'Unknown')
                  .replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
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
    
    async exportDbaItems(): Promise<Blob> {
      return await unifiedHttpClient.get('/export/dba/download', { responseType: 'blob' });
    },

    async exportToDba(exportRequest: any): Promise<any> {
      const response = await unifiedHttpClient.post<any>('/export/dba', exportRequest);
      return response.data || response;
    },

    async downloadDbaZip(): Promise<void> {
      const response = await unifiedHttpClient.get('/export/dba/download', { responseType: 'blob' });
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `dba-export-${timestamp}.zip`;
      
      // Create download link
      const url = window.URL.createObjectURL(response as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }
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
    }
  };

  // ========== STATUS DOMAIN ==========
  
  public readonly status: IStatusService = {
    async getApiStatus(): Promise<statusApi.ApiStatusResponse> {
      const response = await unifiedHttpClient.get<statusApi.ApiStatusResponse>('/status');
      return response.data || response;
    },
    
    async getDataCounts(): Promise<{ cards: number; sets: number; products: number; setProducts: number; }> {
      const status = await this.getApiStatus();
      return {
        cards: status.data.cards,
        sets: status.data.sets,
        products: status.data.products,
        setProducts: status.data.setProducts,
      };
    }
  };

  // ========== DBA SELECTION DOMAIN ==========
  
  public readonly dbaSelection: IDbaSelectionService = {
    async getDbaSelections(params?: { active?: boolean; expiring?: boolean; days?: number }): Promise<any[]> {
      const queryParams: any = {};
      if (params?.active !== undefined) queryParams.active = params.active.toString();
      if (params?.expiring !== undefined) queryParams.expiring = params.expiring.toString();
      if (params?.days !== undefined) queryParams.days = params.days.toString();

      console.log('[UNIFIED API DEBUG] DBA Selection request:', { 
        url: '/dba-selection', 
        params: queryParams,
        originalParams: params 
      });

      try {
        const response = await unifiedHttpClient.get<any[]>('/dba-selection', { params: queryParams });
        console.log('[UNIFIED API DEBUG] DBA Selection response:', {
          raw: response,
          data: response.data,
          final: response.data || response
        });
        return response.data || response;
      } catch (error) {
        console.error('[UNIFIED API DEBUG] DBA Selection error:', error);
        throw error;
      }
    },

    async addToDbaSelection(items: Array<{ itemId: string; itemType: 'psa' | 'raw' | 'sealed'; notes?: string }>): Promise<any> {
      const response = await unifiedHttpClient.post<any>('/dba-selection', { items });
      return response.data || response;
    },

    async removeFromDbaSelection(items: Array<{ itemId: string; itemType: 'psa' | 'raw' | 'sealed' }>): Promise<any> {
      const response = await unifiedHttpClient.delete<any>('/dba-selection', { data: { items } });
      return response.data || response;
    }
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
      domains: ['auctions', 'collection', 'sets', 'cards', 'products', 'search', 'export', 'upload', 'status', 'dbaSelection'],
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