/**
 * Upload API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for file upload mechanics only
 * - OCP: Open for extension via different upload strategies
 * - LSP: Maintains upload interface compatibility
 * - ISP: Provides specific upload operations interface
 * - DIP: Depends on unifiedApiClient abstraction
 *
 * Focuses exclusively on file upload and cleanup operations following SRP
 */

import unifiedApiClient from './unifiedApiClient';

/**
 * Upload single image
 * @param image - Image file to upload
 * @returns Promise<string> - URL of uploaded image
 */
export const uploadSingleImage = async (image: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', image);

  const response = await unifiedApiClient.apiCreate<any>(
    '/upload/image',
    formData,
    'image upload',
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  // Extract only the path from the uploaded file
  return response.path;
};

/**
 * Upload multiple images
 * @param images - Array of image files to upload
 * @returns Promise<string[]> - Array of URLs of uploaded images
 */
export const uploadMultipleImages = async (images: File[]): Promise<string[]> => {
  const formData = new FormData();
  images.forEach(image => {
    formData.append(`images`, image);
  });

  const response = await unifiedApiClient.apiCreate<any[]>(
    '/upload/images',
    formData,
    'multiple image upload',
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  // Extract only the path from each uploaded file
  return response.map((file: any) => file.path);
};

/**
 * Cleanup specific images
 * @param imageUrls - Array of image URLs to cleanup
 * @returns Promise<void>
 */
export const cleanupImages = async (imageUrls: string[]): Promise<void> => {
  await unifiedApiClient.apiDelete<void>('/upload/cleanup', 'specific images', {
    data: { imageUrls },
  });
};

/**
 * Cleanup all orphaned images
 * @returns Promise<void>
 */
export const cleanupAllOrphanedImages = async (): Promise<void> => {
  await unifiedApiClient.apiDelete<void>('/upload/cleanup-all', 'orphaned images');
};
