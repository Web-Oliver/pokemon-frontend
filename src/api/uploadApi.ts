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
  // Validate that image file is provided
  if (!image) {
    throw new Error('No image file provided for upload');
  }

  const formData = new FormData();
  formData.append('image', image);

  const response = await unifiedApiClient.apiCreate<
    { success: boolean; data: any } | any
  >('/upload/image', formData, 'image upload', {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Handle wrapped response format {success: true, data: {...}} or direct response
  const uploadedFile = response.data || response;

  // Extract only the path from the uploaded file
  return uploadedFile.path;
};

/**
 * Upload multiple images
 * @param images - Array of image files to upload
 * @returns Promise<string[]> - Array of URLs of uploaded images
 */
export const uploadMultipleImages = async (
  images: File[]
): Promise<string[]> => {
  console.log('[UPLOAD API] uploadMultipleImages called with:', {
    images: images,
    imageCount: images ? images.length : 0,
    imageTypes: images ? images.map(img => img.type) : [],
    imageSizes: images ? images.map(img => img.size) : []
  });
  
  // Add stack trace to see where this is being called from
  console.log('[UPLOAD API] Call stack:', new Error().stack);

  // Return empty array immediately if no images to upload
  if (!images || images.length === 0) {
    console.log('[UPLOAD API] No images provided for upload, returning empty array');
    return [];
  }

  console.log('[UPLOAD API] Creating FormData with images...');
  const formData = new FormData();
  images.forEach((image, index) => {
    console.log(`[UPLOAD API] Appending image ${index}:`, image.name, image.size, 'bytes');
    formData.append(`images`, image);
  });

  // Debug FormData contents
  console.log('[UPLOAD API] FormData entries:');
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value);
  }

  console.log('[UPLOAD API] Making API call to /upload/images...');
  const response = await unifiedApiClient.apiCreate<{
    success: boolean;
    data: any[];
  }>('/upload/images', formData, 'multiple image upload', {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Handle wrapped response format {success: true, data: [...]}
  // Extract the actual data array from the response
  const uploadedFiles = response.data || response || [];

  // Ensure we have an array to work with
  if (!Array.isArray(uploadedFiles)) {
    console.error('[UPLOAD API] Expected array but got:', uploadedFiles);
    throw new Error('Invalid response format from upload API');
  }

  // Extract only the path from each uploaded file
  return uploadedFiles.map((file: any) => file.path);
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
  await unifiedApiClient.apiDelete<void>(
    '/upload/cleanup-all',
    'orphaned images'
  );
};
