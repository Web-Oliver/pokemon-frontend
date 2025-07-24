/**
 * Image Upload Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Follows Single Responsibility Principle - only handles image upload logic
 */

import { useState, useCallback } from 'react';
import { getUploadApiService } from '../services/ServiceRegistry';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { useAsyncOperation } from './useAsyncOperation';

export interface UseImageUploadReturn {
  selectedImages: File[];
  remainingExistingImages: string[];
  loading: boolean;
  error: string | null;
  setSelectedImages: (files: File[]) => void;
  setRemainingExistingImages: (urls: string[]) => void;
  handleImagesChange: (files: File[], remainingExistingUrls?: string[]) => void;
  uploadImages: () => Promise<string[]>;
  removeExistingImage: (imageUrl: string) => void;
  clearImages: () => void;
  clearError: () => void;
}

/**
 * Hook for image upload operations
 * Follows SRP - only handles image selection, upload, and management
 */
export const useImageUpload = (initialImages: string[] = []): UseImageUploadReturn => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [remainingExistingImages, setRemainingExistingImages] = useState<string[]>(initialImages);
  const { loading, error, execute, clearError } = useAsyncOperation();
  const uploadApi = getUploadApiService();

  const handleImagesChange = useCallback((files: File[], remainingExistingUrls?: string[]) => {
    setSelectedImages(files);
    if (remainingExistingUrls !== undefined) {
      setRemainingExistingImages(remainingExistingUrls);
    }
  }, []);

  const uploadImages = useCallback(async (): Promise<string[]> => {
    return await execute(async () => {
      if (selectedImages.length === 0) {
        log('No new images to upload');
        return [];
      }

      log(`Uploading ${selectedImages.length} images...`);
      const uploadedUrls = await uploadApi.uploadMultipleImages(selectedImages);
      log(`Successfully uploaded ${uploadedUrls.length} images`);
      showSuccessToast(`Uploaded ${uploadedUrls.length} images successfully`);

      // Clear selected images after successful upload
      setSelectedImages([]);

      return uploadedUrls;
    });
  }, [selectedImages, execute, uploadApi]);

  const removeExistingImage = useCallback((imageUrl: string) => {
    setRemainingExistingImages(prev => prev.filter(url => url !== imageUrl));
  }, []);

  const clearImages = useCallback(() => {
    setSelectedImages([]);
    setRemainingExistingImages([]);
  }, []);

  return {
    selectedImages,
    remainingExistingImages,
    loading,
    error,
    setSelectedImages,
    setRemainingExistingImages,
    handleImagesChange,
    uploadImages,
    removeExistingImage,
    clearImages,
    clearError,
  };
};
