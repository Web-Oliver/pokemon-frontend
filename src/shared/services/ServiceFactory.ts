/**
 * Service Factory - Dependency injection container
 * Provides centralized service instantiation following SOLID principles
 */

import { unifiedHttpClient } from './base/UnifiedHttpClient';
import { AuctionService } from './domain/AuctionService';
import { CollectionService } from './domain/CollectionService';
import { SearchService } from './domain/SearchService';
import { ExportService } from './domain/ExportService';
import { UploadService } from './domain/UploadService';
import { StatusService } from './domain/StatusService';
import { DbaSelectionService } from './domain/DbaSelectionService';

/**
 * Service Factory - Singleton pattern for service management
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private auctionService?: AuctionService;
  private collectionService?: CollectionService;
  private searchService?: SearchService;
  private exportService?: ExportService;
  private uploadService?: UploadService;
  private statusService?: StatusService;
  private dbaSelectionService?: DbaSelectionService;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Get Auction Service (lazy initialization)
   */
  public getAuctionService(): AuctionService {
    if (!this.auctionService) {
      this.auctionService = new AuctionService(unifiedHttpClient);
    }
    return this.auctionService;
  }

  /**
   * Get Collection Service (lazy initialization)
   */
  public getCollectionService(): CollectionService {
    if (!this.collectionService) {
      this.collectionService = new CollectionService(unifiedHttpClient);
    }
    return this.collectionService;
  }

  /**
   * Get Search Service (lazy initialization)
   */
  public getSearchService(): SearchService {
    if (!this.searchService) {
      this.searchService = new SearchService(unifiedHttpClient);
    }
    return this.searchService;
  }

  /**
   * Get Export Service (lazy initialization)
   */
  public getExportService(): ExportService {
    if (!this.exportService) {
      this.exportService = new ExportService(unifiedHttpClient);
    }
    return this.exportService;
  }

  /**
   * Get Upload Service (lazy initialization)
   */
  public getUploadService(): UploadService {
    if (!this.uploadService) {
      this.uploadService = new UploadService(unifiedHttpClient);
    }
    return this.uploadService;
  }

  /**
   * Get Status Service (lazy initialization)
   */
  public getStatusService(): StatusService {
    if (!this.statusService) {
      this.statusService = new StatusService(unifiedHttpClient);
    }
    return this.statusService;
  }

  /**
   * Get DBA Selection Service (lazy initialization)
   */
  public getDbaSelectionService(): DbaSelectionService {
    if (!this.dbaSelectionService) {
      this.dbaSelectionService = new DbaSelectionService(unifiedHttpClient);
    }
    return this.dbaSelectionService;
  }
}

// Export singleton instance
export const serviceFactory = ServiceFactory.getInstance();

// Export individual service getters for convenience
export const getAuctionService = () => serviceFactory.getAuctionService();
export const getCollectionService = () => serviceFactory.getCollectionService();
export const getSearchService = () => serviceFactory.getSearchService();
export const getExportService = () => serviceFactory.getExportService();
export const getUploadService = () => serviceFactory.getUploadService();
export const getStatusService = () => serviceFactory.getStatusService();
export const getDbaSelectionService = () => serviceFactory.getDbaSelectionService();