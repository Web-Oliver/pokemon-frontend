/**
 * Unified Export API Service Interface
 * Layer 1: Core/Foundation/API Client
 * Follows SOLID principles with consolidated export operations
 */

/**
 * Export item type enumeration
 */
export type ExportItemType =
  | 'psa-card'
  | 'raw-card'
  | 'sealed-product'
  | 'auction';

/**
 * Export format enumeration
 */
export type ExportFormat = 'zip' | 'facebook-text' | 'dba' | 'json';

/**
 * Generic export request interface
 */
export interface ExportRequest {
  itemType: ExportItemType;
  format: ExportFormat;
  itemIds?: string[];
  options?: {
    includeMetadata?: boolean;
    customDescription?: string;
    filename?: string;
  };
}

/**
 * Enhanced export request with ordering capabilities
 * Extends base ExportRequest for item ordering functionality
 */
export interface OrderedExportRequest extends ExportRequest {
  itemOrder?: string[]; // Specific order for items
  sortByPrice?: boolean; // Auto-sort by price
  sortAscending?: boolean; // Sort direction (default: false for highest to lowest)
  maintainCategoryGrouping?: boolean; // Keep items grouped by category
}

/**
 * Export result interface
 */
export interface ExportResult {
  blob: Blob;
  filename: string;
  itemCount: number;
  metadata?: Record<string, unknown>;
}

/**
 * Interface for image export operations
 * Consolidated to eliminate duplication
 */
export interface IImageExportApiService {
  exportImages(request: ExportRequest): Promise<ExportResult>;
  zipPsaCardImages(cardIds?: string[]): Promise<Blob>;
  zipRawCardImages(cardIds?: string[]): Promise<Blob>;
  zipSealedProductImages(productIds?: string[]): Promise<Blob>;
  downloadBlob(blob: Blob, filename: string): void;
}

/**
 * Interface for data export operations
 * Consolidated with unified export pattern
 */
export interface IDataExportApiService {
  exportData(request: ExportRequest): Promise<ExportResult>;
  getCollectionFacebookTextFile(itemIds?: string[]): Promise<Blob>;
}

/**
 * Combined Export API Service Interface
 * Follows Interface Segregation Principle with unified operations
 */
export interface IExportApiService
  extends IImageExportApiService,
    IDataExportApiService {
  // Unified export method that handles all export types
  export(request: ExportRequest): Promise<ExportResult>;
}
