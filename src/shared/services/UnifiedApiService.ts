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

// API Operations - Import from existing API files temporarily
import * as auctionsApi from '../api/auctionsApi';
import * as collectionApi from '../api/collectionApi';
import * as setsApi from '../api/setsApi';
import * as cardsApi from '../api/cardsApi';
import * as productsApi from '../api/productsApi';
import * as searchApi from '../api/searchApi';
import * as exportApi from '../api/exportApi';
import * as uploadApi from '../api/uploadApi';
import * as statusApi from '../api/statusApi';

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
  getPaginatedSets(params?: setsApi.PaginatedSetsParams): Promise<{ sets: ISet[]; totalPages: number; currentPage: number; }>;
  getSetById(id: string): Promise<ISet>;
  searchSets(params: searchApi.SetSearchParams): Promise<searchApi.SearchResponse<ISet>>;
  getSetSuggestions(query: string, limit?: number): Promise<ISet[]>;
}

/**
 * Cards domain service interface  
 */
export interface ICardsService {
  searchCards(params: searchApi.CardSearchParams): Promise<searchApi.SearchResponse<ICard>>;
  getCardSuggestions(query: string, limit?: number): Promise<ICard[]>;
  getCardById(id: string): Promise<ICard>;
}

/**
 * Products domain service interface
 */
export interface IProductsService {
  searchProducts(params: searchApi.ProductSearchParams): Promise<searchApi.SearchResponse<IProduct>>;
  getProductSuggestions(query: string, limit?: number): Promise<IProduct[]>;
  getSetProducts(params?: any): Promise<ISetProduct[]>;
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
      return auctionsApi.getAuctions(params);
    },
    
    async getAuctionById(id: string): Promise<IAuction> {
      return auctionsApi.getAuctionById(id);
    },
    
    async createAuction(auctionData: Partial<IAuction>): Promise<IAuction> {
      return auctionsApi.createAuction(auctionData);
    },
    
    async updateAuction(id: string, auctionData: Partial<IAuction>): Promise<IAuction> {
      return auctionsApi.updateAuction(id, auctionData);
    },
    
    async deleteAuction(id: string): Promise<void> {
      return auctionsApi.deleteAuction(id);
    }
  };

  // ========== COLLECTION DOMAIN ==========
  
  public readonly collection: ICollectionService = {
    psaCards: {
      async getAll(params?: collectionApi.PsaGradedCardsParams): Promise<IPsaGradedCard[]> {
        return collectionApi.getPsaGradedCards(params);
      },
      
      async getById(id: string): Promise<IPsaGradedCard> {
        return collectionApi.getPsaGradedCardById(id);
      },
      
      async create(data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
        return collectionApi.createPsaGradedCard(data);
      },
      
      async update(id: string, data: Partial<IPsaGradedCard>): Promise<IPsaGradedCard> {
        return collectionApi.updatePsaGradedCard(id, data);
      },
      
      async delete(id: string): Promise<void> {
        return collectionApi.deletePsaGradedCard(id);
      },
      
      async markSold(id: string, saleDetails: ISaleDetails): Promise<IPsaGradedCard> {
        return collectionApi.markPsaGradedCardSold(id, saleDetails);
      }
    },
    
    rawCards: {
      async getAll(params?: collectionApi.RawCardsParams): Promise<IRawCard[]> {
        return collectionApi.getRawCards(params);
      },
      
      async getById(id: string): Promise<IRawCard> {
        return collectionApi.getRawCardById(id);
      },
      
      async create(data: Partial<IRawCard>): Promise<IRawCard> {
        return collectionApi.createRawCard(data);
      },
      
      async update(id: string, data: Partial<IRawCard>): Promise<IRawCard> {
        return collectionApi.updateRawCard(id, data);
      },
      
      async delete(id: string): Promise<void> {
        return collectionApi.deleteRawCard(id);
      },
      
      async markSold(id: string, saleDetails: ISaleDetails): Promise<IRawCard> {
        return collectionApi.markRawCardSold(id, saleDetails);
      }
    },
    
    sealedProducts: {
      async getAll(params?: collectionApi.SealedProductCollectionParams): Promise<ISealedProduct[]> {
        return collectionApi.getSealedProductCollection(params);
      },
      
      async getById(id: string): Promise<ISealedProduct> {
        return collectionApi.getSealedProductById(id);
      },
      
      async create(data: Partial<ISealedProduct>): Promise<ISealedProduct> {
        return collectionApi.createSealedProduct(data);
      },
      
      async update(id: string, data: Partial<ISealedProduct>): Promise<ISealedProduct> {
        return collectionApi.updateSealedProduct(id, data);
      },
      
      async delete(id: string): Promise<void> {
        return collectionApi.deleteSealedProduct(id);
      },
      
      async markSold(id: string, saleDetails: ISaleDetails): Promise<ISealedProduct> {
        return collectionApi.markSealedProductSold(id, saleDetails);
      }
    }
  };

  // ========== SETS DOMAIN ==========
  
  public readonly sets: ISetsService = {
    async getPaginatedSets(params?: setsApi.PaginatedSetsParams) {
      return setsApi.getPaginatedSets(params);
    },
    
    async getSetById(id: string): Promise<ISet> {
      return setsApi.getSetById(id);
    },
    
    async searchSets(params: searchApi.SetSearchParams): Promise<searchApi.SearchResponse<ISet>> {
      return searchApi.searchSets(params);
    },
    
    async getSetSuggestions(query: string, limit: number = 10): Promise<ISet[]> {
      return searchApi.getSetSuggestions(query, limit);
    }
  };

  // ========== CARDS DOMAIN ==========
  
  public readonly cards: ICardsService = {
    async searchCards(params: searchApi.CardSearchParams): Promise<searchApi.SearchResponse<ICard>> {
      return searchApi.searchCards(params);
    },
    
    async getCardSuggestions(query: string, limit: number = 10): Promise<ICard[]> {
      return searchApi.getCardSuggestions(query, limit);
    },
    
    async getCardById(id: string): Promise<ICard> {
      return cardsApi.getCardById(id);
    }
  };

  // ========== PRODUCTS DOMAIN ==========
  
  public readonly products: IProductsService = {
    async searchProducts(params: searchApi.ProductSearchParams): Promise<searchApi.SearchResponse<IProduct>> {
      return searchApi.searchProducts(params);
    },
    
    async getProductSuggestions(query: string, limit: number = 10): Promise<IProduct[]> {
      return searchApi.getProductSuggestions(query, limit);
    },
    
    async getSetProducts(params?: any): Promise<ISetProduct[]> {
      return productsApi.getSetProducts(params);
    }
  };

  // ========== EXPORT DOMAIN ==========
  
  public readonly export: IExportService = {
    async exportCollectionImages(itemType: 'psaGradedCards' | 'rawCards' | 'sealedProducts'): Promise<Blob> {
      return exportApi.exportCollectionImages(itemType);
    },
    
    async exportAuctionImages(auctionId: string): Promise<Blob> {
      return exportApi.exportAuctionImages(auctionId);
    },
    
    async exportDbaItems(): Promise<Blob> {
      return exportApi.exportDbaItems();
    }
  };

  // ========== UPLOAD DOMAIN ==========
  
  public readonly upload: IUploadService = {
    async uploadMultipleImages(images: File[]): Promise<string[]> {
      return uploadApi.uploadMultipleImages(images);
    },
    
    async uploadSingleImage(image: File): Promise<string> {
      return uploadApi.uploadSingleImage(image);
    }
  };

  // ========== STATUS DOMAIN ==========
  
  public readonly status: IStatusService = {
    async getApiStatus(): Promise<statusApi.ApiStatusResponse> {
      return statusApi.getApiStatus();
    },
    
    async getDataCounts(): Promise<{ cards: number; sets: number; products: number; setProducts: number; }> {
      return statusApi.getDataCounts();
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