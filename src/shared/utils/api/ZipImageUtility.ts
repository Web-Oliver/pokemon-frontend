/**
 * ZIP Image Utility
 * Layer 1: Core/Foundation (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for ZIP file creation with images
 * - OCP: Open for extension via configuration options
 * - DRY: Eliminates API client duplication (32+ lines)
 * - DIP: Depends on abstractions via interfaces
 */

import { unifiedHttpClient } from '../../services/base/UnifiedHttpClient';

export interface ZipImageConfig {
  imageUrls: string[];
  itemNames: string[];
  errorMessage?: string;
}

/**
 * Consolidated ZIP image creation utility
 * Eliminates duplication between different export API functions
 */
export class ZipImageUtility {
  /**
   * Create ZIP file containing multiple images
   * Consolidates the duplicated ZIP creation logic from exportApi.ts
   *
   * @param config - Configuration object with image URLs and names
   * @returns Promise<Blob> - Generated ZIP file blob
   */
  static async createImageZip(config: ZipImageConfig): Promise<Blob> {
    const { imageUrls, itemNames, errorMessage = 'No images found' } = config;

    // Validation
    if (imageUrls.length === 0) {
      throw new Error(errorMessage);
    }

    if (imageUrls.length !== itemNames.length) {
      throw new Error(
        'Image URLs and item names arrays must have the same length'
      );
    }

    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Fetch all images and add them to the zip using UnifiedHttpClient
    const imagePromises = imageUrls.map(async (url, index) => {
      try {
        // For external image URLs, use the underlying axios instance to get blob response
        const axiosInstance = unifiedHttpClient.getAxiosInstance();
        const response = await axiosInstance.get(url, {
          responseType: 'blob',
        });
        zip.file(itemNames[index], response.data);
      } catch (error) {
        console.warn(`Failed to fetch image ${url}:`, error);
      }
    });

    await Promise.all(imagePromises);

    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return zipBlob;
  }

  /**
   * Create ZIP file for auction items (specialized wrapper)
   * Maintains backward compatibility while using consolidated logic
   */
  static async createAuctionImageZip(
    imageUrls: string[],
    itemNames: string[]
  ): Promise<Blob> {
    return this.createImageZip({
      imageUrls,
      itemNames,
      errorMessage: 'No images found in auction items',
    });
  }

  /**
   * Create ZIP file for collection items (specialized wrapper)
   * Maintains backward compatibility while using consolidated logic
   */
  static async createCollectionImageZip(
    imageUrls: string[],
    itemNames: string[],
    itemType: string
  ): Promise<Blob> {
    return this.createImageZip({
      imageUrls,
      itemNames,
      errorMessage: `No images found in ${itemType}s`,
    });
  }

  /**
   * Generate safe filename from item data
   * Utility method for creating consistent filenames
   */
  static generateSafeFilename(itemData: any, index: number): string {
    const name =
      itemData?.name ||
      itemData?.cardName ||
      itemData?.cardId?.cardName ||
      `item-${index}`;

    // Replace invalid filename characters
    return name.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
  }

  /**
   * Extract image URL from item data
   * Utility method for consistent image URL extraction
   */
  static extractImageUrl(itemData: any): string | null {
    if (!itemData) return null;

    // Try various possible image URL locations
    const imageUrl =
      itemData.images?.[0] ||
      itemData.itemData?.images?.[0] ||
      itemData.image ||
      itemData.imageUrl;

    return imageUrl || null;
  }
}
