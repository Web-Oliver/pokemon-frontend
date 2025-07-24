/**
 * Export API Service Implementation
 * Layer 1: Core/Foundation/API Client
 * Concrete implementation of IExportApiService using existing API modules
 */

import { IExportApiService } from '../interfaces/api/IExportApiService';
import * as exportApi from '../api/exportApi';

/**
 * Concrete implementation of Export API Service
 * Adapts existing exportApi module to the interface contract
 */
export class ExportApiService implements IExportApiService {
  // Image export operations
  async zipPsaCardImages(cardIds?: string[]): Promise<Blob> {
    return await exportApi.zipPsaCardImages(cardIds);
  }

  async zipRawCardImages(cardIds?: string[]): Promise<Blob> {
    return await exportApi.zipRawCardImages(cardIds);
  }

  async zipSealedProductImages(productIds?: string[]): Promise<Blob> {
    return await exportApi.zipSealedProductImages(productIds);
  }

  downloadBlob(blob: Blob, filename: string): void {
    return exportApi.downloadBlob(blob, filename);
  }

  // Data export operations
  async getCollectionFacebookTextFile(): Promise<Blob> {
    return await exportApi.getCollectionFacebookTextFile();
  }
}

// Export singleton instance following DIP pattern
export const exportApiService = new ExportApiService();