/**
 * Upload API Client
 * Handles image upload and cleanup operations
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

  const response = await unifiedApiClient.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const uploadedFile = response.data || response;

  // Extract only the path from the uploaded file
  return uploadedFile.path;
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

  const response = await unifiedApiClient.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  const uploadedFiles = response.data || response;

  // Extract only the path from each uploaded file
  return uploadedFiles.map((file: any) => file.path);
};

/**
 * Cleanup specific images
 * @param imageUrls - Array of image URLs to cleanup
 * @returns Promise<void>
 */
export const cleanupImages = async (imageUrls: string[]): Promise<void> => {
  await unifiedApiClient.delete('/upload/cleanup', {
    data: { imageUrls },
  });
};

/**
 * Cleanup all orphaned images
 * @returns Promise<void>
 */
export const cleanupAllOrphanedImages = async (): Promise<void> => {
  await unifiedApiClient.delete('/upload/cleanup-all');
};
