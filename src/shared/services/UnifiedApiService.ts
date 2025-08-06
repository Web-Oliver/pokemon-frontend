/**
 * Unified API Service
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Single API facade that consolidates all domain-specific API operations
 * Following CLAUDE.md architecture and SOLID principles:
 * - SRP: Single responsibility for API orchestration and domain abstraction
 * - OCP: Open for extension via domain service composition
 * - LSP: Maintains interface compatibility across all domains
 * - ISP: Segregated interfaces for different domains
 * - DIP: Depends on HTTP client abstraction, not concrete implementations
 *
 * DRY: Eliminates direct imports of individual API files across the application
 * Reusability: Provides consistent API interface for all features
 */

import { unifiedHttpClient } from './base/UnifiedHttpClient';

// Domain Models
import { IAuction } from '../domain/models/auction';
import { IPsaGradedCard, IRawCard, ISet, ICard } from '../domain/models/card';
import { ISealedProduct } from '../domain/models/sealedProduct';
import { IProduct, ISetProduct } from '../domain/models/product';
import { ISaleDetails } from '../domain/models/common';

// Import type definitions from deprecated API files for interface compatibility
import type * as auctionsApi from '../api/auctionsApi';
import type * as collectionApi from '../api/collectionApi';
import type * as cardsApi from '../api/cardsApi';
import type * as productsApi from '../api/productsApi';
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
  // PSA Cards
  psaCards: {
    getAll(params?: collectionApi.PsaGradedCardsParams): Promise<IPsaGradedCard[]>;
    getById(id: string): Promise<IPsaGradedCard>;
    create(data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard>;
    update(id: string, data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard>;
    delete(id: string): Promise<void>;
    markSold(id: string, saleDetails: ISaleDetails): Promise<IPsaGradedCard>;
  };
  
  // Raw Cards
  rawCards: {
    getAll(params?: collectionApi.RawCardsParams): Promise<IRawCard[]>;
    getById(id: string): Promise<IRawCard>;
    create(data: Partial<IRawCard>): Promise<IRawCard>;
    update(id: string, data: Partial<IRawCard>): Promise<IRawCard>;
    delete(id: string): Promise<void>;
    markSold(id: string, saleDetails: ISaleDetails): Promise<IRawCard>;
  };
  
  // Sealed Products
  sealedProducts: {
    getAll(params?: collectionApi.SealedProductCollectionParams): Promise<ISealedProduct[]>;
    getById(id: string): Promise<ISealedProduct>;
    create(data: Partial<ISealedProduct>): Promise<ISealedProduct>;
    update(id: string, data: Partial<ISealedProduct>): Promise<ISealedProduct>;
    delete(id: string): Promise<void>;
    markSold(id: string, saleDetails: ISaleDetails): Promise<ISealedProduct>;
  };
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
 * Export domain service interface
 */
export interface IExportService {
  exportCollectionImages(itemType: 'psaGradedCards' | 'rawCards' | 'sealedProducts'): Promise<Blob>;
  exportAuctionImages(auctionId: string): Promise<Blob>;
  exportDbaItems(): Promise<Blob>;
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
    psaCards: {
      async getAll(params?: collectionApi.PsaGradedCardsParams): Promise<IPsaGradedCard[]> {
        const response = await unifiedHttpClient.get<IPsaGradedCard[]>('/psa-graded-cards', { params });
        return response.data || response;
      },
      
      async getById(id: string): Promise<IPsaGradedCard> {
        return await unifiedHttpClient.getById<IPsaGradedCard>('/psa-graded-cards', id);
      },
      
      async create(data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
        const response = await unifiedHttpClient.post<IPsaGradedCard>('/psa-graded-cards', data);
        return response.data || response;
      },
      
      async update(id: string, data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
        const response = await unifiedHttpClient.put<IPsaGradedCard>(`/psa-graded-cards/${id}`, data);
        return response.data || response;
      },
      
      async delete(id: string): Promise<void> {
        await unifiedHttpClient.delete(`/psa-graded-cards/${id}`);
      },
      
      async markSold(id: string, saleDetails: ISaleDetails): Promise<IPsaGradedCard> {
        const response = await unifiedHttpClient.post<IPsaGradedCard>(`/psa-graded-cards/${id}/mark-sold`, { saleDetails });
        return response.data || response;
      }
    },
    
    rawCards: {
      async getAll(params?: collectionApi.RawCardsParams): Promise<IRawCard[]> {
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
      
      async getById(id: string): Promise<IRawCard> {
        return await unifiedHttpClient.getById<IRawCard>('/raw-cards', id);
      },
      
      async create(data: Partial<IRawCard>): Promise<IRawCard> {
        const response = await unifiedHttpClient.post<IRawCard>('/raw-cards', data);
        return response.data || response;
      },
      
      async update(id: string, data: Partial<IRawCard>): Promise<IRawCard> {
        const response = await unifiedHttpClient.put<IRawCard>(`/raw-cards/${id}`, data);
        return response.data || response;
      },
      
      async delete(id: string): Promise<void> {
        await unifiedHttpClient.delete(`/raw-cards/${id}`);
      },
      
      async markSold(id: string, saleDetails: ISaleDetails): Promise<IRawCard> {
        const response = await unifiedHttpClient.post<IRawCard>(`/raw-cards/${id}/mark-sold`, { saleDetails });
        return response.data || response;
      }
    },
    
    sealedProducts: {
      async getAll(params?: collectionApi.SealedProductCollectionParams): Promise<ISealedProduct[]> {
        const response = await unifiedHttpClient.get<ISealedProduct[]>('/sealed-products', { params });
        return response.data || response;
      },
      
      async getById(id: string): Promise<ISealedProduct> {
        return await unifiedHttpClient.getById<ISealedProduct>('/sealed-products', id);
      },
      
      async create(data: Partial<ISealedProduct>): Promise<ISealedProduct> {
        const response = await unifiedHttpClient.post<ISealedProduct>('/sealed-products', data);
        return response.data || response;
      },
      
      async update(id: string, data: Partial<ISealedProduct>): Promise<ISealedProduct> {
        const response = await unifiedHttpClient.put<ISealedProduct>(`/sealed-products/${id}`, data);
        return response.data || response;
      },
      
      async delete(id: string): Promise<void> {
        await unifiedHttpClient.delete(`/sealed-products/${id}`);
      },
      
      async markSold(id: string, saleDetails: ISaleDetails): Promise<ISealedProduct> {
        const response = await unifiedHttpClient.post<ISealedProduct>(`/sealed-products/${id}/mark-sold`, { saleDetails });
        return response.data || response;
      }
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

        const response = await searchApi.searchProducts(searchParams);

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
      domains: ['auctions', 'collection', 'sets', 'cards', 'products', 'export', 'upload', 'status'],
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