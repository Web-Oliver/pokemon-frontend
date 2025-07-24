/**
 * Service Registry
 * Layer 1: Core/Foundation/API Client
 * Central registry for all API services following Dependency Inversion Principle
 */

import { ICollectionApiService } from '../interfaces/api/ICollectionApiService';
import { IExportApiService } from '../interfaces/api/IExportApiService';
import { IUploadApiService } from '../interfaces/api/IUploadApiService';
import { ISearchApiService } from '../interfaces/api/ISearchApiService';
import { collectionApiService } from './CollectionApiService';
import { exportApiService } from './ExportApiService';
import { uploadApiService } from './UploadApiService';
import { searchApiService } from './SearchApiService';

/**
 * Service Registry for dependency injection
 * Allows easy swapping of implementations for testing or different environments
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;

  private _collectionApiService: ICollectionApiService;
  private _exportApiService: IExportApiService;
  private _uploadApiService: IUploadApiService;
  private _searchApiService: ISearchApiService;

  private constructor() {
    // Default concrete implementations
    this._collectionApiService = collectionApiService;
    this._exportApiService = exportApiService;
    this._uploadApiService = uploadApiService;
    this._searchApiService = searchApiService;
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  // Getters for service instances
  get collectionApiService(): ICollectionApiService {
    return this._collectionApiService;
  }

  get exportApiService(): IExportApiService {
    return this._exportApiService;
  }

  get uploadApiService(): IUploadApiService {
    return this._uploadApiService;
  }

  get searchApiService(): ISearchApiService {
    return this._searchApiService;
  }

  // Setters for dependency injection (useful for testing)
  setCollectionApiService(service: ICollectionApiService): void {
    this._collectionApiService = service;
  }

  setExportApiService(service: IExportApiService): void {
    this._exportApiService = service;
  }

  setUploadApiService(service: IUploadApiService): void {
    this._uploadApiService = service;
  }

  setSearchApiService(service: ISearchApiService): void {
    this._searchApiService = service;
  }
}

// Export singleton instance
export const serviceRegistry = ServiceRegistry.getInstance();

// Export convenience getters for direct access
export const getCollectionApiService = (): ICollectionApiService =>
  serviceRegistry.collectionApiService;

export const getExportApiService = (): IExportApiService => serviceRegistry.exportApiService;

export const getUploadApiService = (): IUploadApiService => serviceRegistry.uploadApiService;

export const getSearchApiService = (): ISearchApiService => serviceRegistry.searchApiService;
