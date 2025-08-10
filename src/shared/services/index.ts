/**
 * Services Index
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Central export point for all services following CLAUDE.md architecture
 * Provides clean entry point for service imports throughout the application
 */

// Primary API service facade
export { unifiedApiService, UnifiedApiService } from './UnifiedApiService';
export type {
  IAuctionService,
  ICollectionService,
  ISetsService,
  ICardsService,
  IProductsService,
  IExportService,
  IUploadService,
} from './UnifiedApiService';

// HTTP client and base services
export { unifiedHttpClient, UnifiedHttpClient } from './base/UnifiedHttpClient';
export type { IHttpClient } from './base/HttpClientInterface';

// Available service implementations (only existing services)
// Note: Most services have been consolidated into UnifiedApiService


// Form services
export { FormValidationService } from './forms/FormValidationService';

/**
 * Default export - UnifiedApiService for convenient importing
 * Usage: import apiService from '@/shared/services'
 */
export { unifiedApiService as default } from './UnifiedApiService';
