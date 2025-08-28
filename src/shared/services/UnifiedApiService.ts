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

import { unifiedApiClient } from '../api/unifiedApiClient';
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
/**
 * UNIFIED API SERVICE - Phase 1 SOLID/DRY Refactoring Complete
 * 
 * This service now follows SOLID principles by delegating to domain services
 * instead of implementing all functionality directly (SRP, OCP, ISP compliance)
 * 
 * Before: 1000+ lines with 8 domain implementations
 * After: Lightweight orchestrator delegating to focused domain services
 */

// Domain Services (SOLID SRP - Single Responsibility Principle)
import { AuctionService } from './domain/AuctionService';
import { CollectionService } from './domain/CollectionService';
import { SearchService } from './domain/SearchService';
import { ExportService } from './domain/ExportService';
import { UploadService } from './domain/UploadService';
import { StatusService } from './domain/StatusService';
import { DbaSelectionService } from './domain/DbaSelectionService';

// Service Interfaces
import type {
  IAuctionService,
  ICollectionService,
  ISearchService,
  IExportService,
  IUploadService,
  IStatusService,
  IDbaSelectionService,
} from '@/interfaces/api';

/**
 * UnifiedApiService - Orchestrator Pattern (SOLID ISP - Interface Segregation)
 * 
 * Each domain service implements its own interface, clients depend only on what they need.
 * This follows the Interface Segregation Principle - clients are not forced to depend
 * on methods they don't use.
 */
export class UnifiedApiService {
  // Domain service instances (Dependency Injection)
  public readonly auctions: IAuctionService;
  public readonly collection: ICollectionService;
  public readonly search: ISearchService;
  public readonly export: IExportService;
  public readonly upload: IUploadService;
  public readonly status: IStatusService;
  public readonly dbaSelection: IDbaSelectionService;

  constructor() {
    // Initialize domain services with shared HTTP client (DIP - Dependency Inversion)
    this.auctions = new AuctionService(unifiedApiClient);
    this.collection = new CollectionService(unifiedApiClient);
    this.search = new SearchService(unifiedApiClient);
    this.export = new ExportService(unifiedApiClient);
    this.upload = new UploadService(unifiedApiClient);
    this.status = new StatusService(unifiedApiClient);
    this.dbaSelection = new DbaSelectionService(unifiedApiClient);
  }

  /**
   * Service Health Information
   * Reduced from complex debugging methods to essential service info
   */
  getServiceInfo() {
    return {
      name: 'UnifiedApiService',
      version: '2.0.0-solid-refactored',
      architecture: 'Domain Service Orchestrator',
      domains: [
        'auctions',
        'collection', 
        'search',
        'export',
        'upload',
        'status',
        'dbaSelection'
      ],
      principles: ['SOLID', 'DRY', 'Single Responsibility'],
      refactoringPhase: 'Phase 1 Complete'
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
