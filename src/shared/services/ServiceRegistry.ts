/**
 * Service Registry
 * Layer 1: Core/Foundation/API Client
 * Central registry for all API services following Dependency Inversion Principle
 * 
 * UPDATED: Now supports both monolithic and decomposed collection services
 * Implements dependency injection with HTTP client abstraction
 */

import { ICollectionApiService, IPsaCardApiService, IRawCardApiService, ISealedProductApiService } from '../interfaces/api/ICollectionApiService';
import { IExportApiService } from '../interfaces/api/IExportApiService';
import { ISearchApiService } from '../interfaces/api/ISearchApiService';
import { IUploadApiService } from '../interfaces/api/IUploadApiService';

// Import HTTP client abstraction
import { unifiedHttpClient } from './base/UnifiedHttpClient';

// Import focused services
import { PsaCardApiService } from './collection/PsaCardApiService';
import { RawCardApiService } from './collection/RawCardApiService';
import { SealedProductApiService } from './collection/SealedProductApiService';
import { CompositeCollectionApiService } from './CompositeCollectionApiService';

// Import other services
import { exportApiService } from './ExportApiService';
import { searchApiService } from './SearchApiService';
import { uploadApiService } from './UploadApiService';

/**
 * Service Registry for dependency injection
 * Allows easy swapping of implementations for testing or different environments
 * Now supports both composite and focused service access patterns
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;

  private constructor() {
    // Create focused services with dependency injection
    this._psaCardApiService = new PsaCardApiService(unifiedHttpClient);
    this._rawCardApiService = new RawCardApiService(unifiedHttpClient);
    this._sealedProductApiService = new SealedProductApiService(unifiedHttpClient);

    // Create composite service for backward compatibility
    this._collectionApiService = new CompositeCollectionApiService(
      this._psaCardApiService,
      this._rawCardApiService,
      this._sealedProductApiService
    );

    // Initialize other services
    this._exportApiService = exportApiService;
    this._uploadApiService = uploadApiService;
    this._searchApiService = searchApiService;
  }
  
  // Composite service for backward compatibility
  private _collectionApiService: ICollectionApiService;

  // Getters for service instances
  get collectionApiService(): ICollectionApiService {
    return this._collectionApiService;
  }

  // Focused services for direct access
  private _psaCardApiService: IPsaCardApiService;
  
  // Focused service getters for direct access
  get psaCardApiService(): IPsaCardApiService {
    return this._psaCardApiService;
  }

  private _rawCardApiService: IRawCardApiService;

  get rawCardApiService(): IRawCardApiService {
    return this._rawCardApiService;
  }

  private _sealedProductApiService: ISealedProductApiService;

  get sealedProductApiService(): ISealedProductApiService {
    return this._sealedProductApiService;
  }

  // Other services
  private _exportApiService: IExportApiService;

  get exportApiService(): IExportApiService {
    return this._exportApiService;
  }

  private _uploadApiService: IUploadApiService;

  get uploadApiService(): IUploadApiService {
    return this._uploadApiService;
  }

  private _searchApiService: ISearchApiService;

  get searchApiService(): ISearchApiService {
    return this._searchApiService;
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  // Setters for dependency injection (useful for testing)
  setCollectionApiService(service: ICollectionApiService): void {
    this._collectionApiService = service;
  }

  // Focused service setters for direct access
  setPsaCardApiService(service: IPsaCardApiService): void {
    this._psaCardApiService = service;
    // Update composite service with new focused service
    this._collectionApiService = new CompositeCollectionApiService(
      this._psaCardApiService,
      this._rawCardApiService,
      this._sealedProductApiService
    );
  }

  setRawCardApiService(service: IRawCardApiService): void {
    this._rawCardApiService = service;
    // Update composite service with new focused service
    this._collectionApiService = new CompositeCollectionApiService(
      this._psaCardApiService,
      this._rawCardApiService,
      this._sealedProductApiService
    );
  }

  setSealedProductApiService(service: ISealedProductApiService): void {
    this._sealedProductApiService = service;
    // Update composite service with new focused service
    this._collectionApiService = new CompositeCollectionApiService(
      this._psaCardApiService,
      this._rawCardApiService,
      this._sealedProductApiService
    );
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

// Focused service getters for direct access
export const getPsaCardApiService = (): IPsaCardApiService =>
  serviceRegistry.psaCardApiService;

export const getRawCardApiService = (): IRawCardApiService =>
  serviceRegistry.rawCardApiService;

export const getSealedProductApiService = (): ISealedProductApiService =>
  serviceRegistry.sealedProductApiService;

export const getExportApiService = (): IExportApiService =>
  serviceRegistry.exportApiService;

export const getUploadApiService = (): IUploadApiService =>
  serviceRegistry.uploadApiService;

export const getSearchApiService = (): ISearchApiService =>
  serviceRegistry.searchApiService;
