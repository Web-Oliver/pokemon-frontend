/**
 * Export API Service Interface
 * Layer 1: Core/Foundation/API Client
 * Follows Dependency Inversion Principle - defines abstractions for export operations
 */

/**
 * Interface for image export operations
 * Abstracts the concrete implementation details
 */
export interface IImageExportApiService {
  zipPsaCardImages(cardIds?: string[]): Promise<Blob>;
  zipRawCardImages(cardIds?: string[]): Promise<Blob>;
  zipSealedProductImages(productIds?: string[]): Promise<Blob>;
  downloadBlob(blob: Blob, filename: string): void;
}

/**
 * Interface for data export operations
 * Abstracts the concrete implementation details
 */
export interface IDataExportApiService {
  getCollectionFacebookTextFile(): Promise<Blob>;
}

/**
 * Combined Export API Service Interface
 * Follows Interface Segregation Principle - clients can depend on specific interfaces
 */
export interface IExportApiService extends IImageExportApiService, IDataExportApiService {}
