/**
 * Unified Export API Service Implementation
 * Layer 1: Core/Foundation/API Client
 * Consolidated implementation following SOLID principles and eliminating duplication
 */

import {
  IExportApiService,
  ExportRequest,
  ExportResult,
  ExportItemType,
  ExportFormat,
} from '../interfaces/api/IExportApiService';
import * as exportApi from '../api/exportApi';
import {
  validateExportRequest,
  getExportConfigKey,
  getExportConfig,
  generateExportFilename,
} from '../utils/exportUtils';

/**
 * Unified Export API Service
 * Consolidates all export operations into a single, cohesive interface
 * Follows Single Responsibility and Open/Closed principles
 */
export class ExportApiService implements IExportApiService {
  /**
   * Unified export method - handles all export types and formats
   * Eliminates duplication by routing to appropriate specialized methods
   */
  async export(request: ExportRequest): Promise<ExportResult> {
    const { itemType, format, itemIds, options } = request;

    // Validate request using consolidated validation
    validateExportRequest(itemType, format, itemIds);

    // Get standardized configuration
    const configKey = getExportConfigKey(itemType, format);
    const config = getExportConfig(configKey);

    // Route to appropriate export method based on format
    switch (format) {
      case 'zip':
        return await this.exportImages(request, config);
      case 'facebook-text':
      case 'dba':
      case 'json':
        return await this.exportData(request, config);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Consolidated image export operation
   * Eliminates duplication between zipPsaCardImages, zipRawCardImages, zipSealedProductImages
   */
  async exportImages(request: ExportRequest, config: any): Promise<ExportResult> {
    const { itemType, itemIds, options } = request;
    let blob: Blob;

    // Route to appropriate image zip method
    switch (itemType) {
      case 'psa-card':
        blob = await exportApi.zipPsaCardImages(itemIds);
        break;
      case 'raw-card':
        blob = await exportApi.zipRawCardImages(itemIds);
        break;
      case 'sealed-product':
        blob = await exportApi.zipSealedProductImages(itemIds);
        break;
      case 'auction':
        blob = await exportApi.zipAuctionImages(itemIds![0]);
        break;
      default:
        throw new Error(`Unsupported item type for image export: ${itemType}`);
    }

    // Generate standardized filename
    const filename = options?.filename || generateExportFilename(config, itemIds?.length);

    return {
      blob,
      filename,
      itemCount: itemIds?.length || 0,
      metadata: {
        itemType,
        format: 'zip',
        exportedAt: new Date().toISOString(),
        config,
      },
    };
  }

  /**
   * Consolidated data export operation
   * Handles Facebook text, DBA, and JSON exports
   */
  async exportData(request: ExportRequest, config: any): Promise<ExportResult> {
    const { format, itemIds, options } = request;
    let blob: Blob;
    let itemCount = 0;

    switch (format) {
      case 'facebook-text':
        blob = await exportApi.getCollectionFacebookTextFile(itemIds || []);
        itemCount = itemIds?.length || 0;
        break;
      case 'dba':
        // Handle DBA export (implementation would depend on backend support)
        const dbaItems = (itemIds || []).map(id => ({ id, type: 'mixed' as const }));
        const dbaResponse = await exportApi.exportToDba({
          items: dbaItems,
          customDescription: options?.customDescription,
          includeMetadata: options?.includeMetadata,
        });
        // Note: This would need backend modifications to return blob directly
        blob = new Blob([JSON.stringify(dbaResponse)], { type: config.mimeType });
        itemCount = dbaResponse.data.itemCount;
        break;
      default:
        throw new Error(`Unsupported data export format: ${format}`);
    }

    // Generate standardized filename
    const filename = options?.filename || generateExportFilename(config, itemCount);

    return {
      blob,
      filename,
      itemCount,
      metadata: {
        format,
        exportedAt: new Date().toISOString(),
        options,
        config,
      },
    };
  }

  // Legacy method support - delegates to unified system
  async zipPsaCardImages(cardIds?: string[]): Promise<Blob> {
    const result = await this.exportImages({
      itemType: 'psa-card',
      format: 'zip',
      itemIds: cardIds,
    });
    return result.blob;
  }

  async zipRawCardImages(cardIds?: string[]): Promise<Blob> {
    const result = await this.exportImages({
      itemType: 'raw-card',
      format: 'zip',
      itemIds: cardIds,
    });
    return result.blob;
  }

  async zipSealedProductImages(productIds?: string[]): Promise<Blob> {
    const result = await this.exportImages({
      itemType: 'sealed-product',
      format: 'zip',
      itemIds: productIds,
    });
    return result.blob;
  }

  downloadBlob(blob: Blob, filename: string): void {
    return exportApi.downloadBlob(blob, filename);
  }

  // Legacy method support - delegates to unified system
  async getCollectionFacebookTextFile(itemIds?: string[]): Promise<Blob> {
    const result = await this.exportData({
      itemType: 'psa-card', // Default, but ignored for facebook-text
      format: 'facebook-text',
      itemIds,
    });
    return result.blob;
  }
}

// Export singleton instance following DIP pattern
export const exportApiService = new ExportApiService();
