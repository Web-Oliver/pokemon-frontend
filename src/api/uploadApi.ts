/**
 * Upload API Client
 * Handles image upload and cleanup operations
 */

import { apiClient } from './apiClient';

/**
 * Upload single image
 * @param image - Image file to upload
 * @returns Promise<string> - URL of uploaded image
 */
export const uploadSingleImage = async (image: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', image);

  const response = await apiClient.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data || response.data;
};

/**
 * Upload multiple images
 * @param images - Array of image files to upload
 * @returns Promise<string[]> - Array of URLs of uploaded images
 */
export const uploadMultipleImages = async (images: File[]): Promise<string[]> => {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append(`images`, image);
  });

  const response = await apiClient.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data || response.data;
};

/**
 * Cleanup specific images
 * @param imageUrls - Array of image URLs to cleanup
 * @returns Promise<void>
 */
export const cleanupImages = async (imageUrls: string[]): Promise<void> => {
  await apiClient.delete('/upload/cleanup', {
    data: { imageUrls }
  });
};

/**
 * Cleanup all orphaned images
 * @returns Promise<void>
 */
export const cleanupAllOrphanedImages = async (): Promise<void> => {
  await apiClient.delete('/upload/cleanup-all');
};