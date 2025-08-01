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

// ========== INTERFACES (ISP Compliance) ==========

/**
 * Upload response interface matching API documentation
 */
export interface UploadResponse {
  filename: string;
  originalName: string;
  size: number;
  thumbnail: string;
  url: string;
  thumbnailUrl: string;
}

/**
 * Single upload result interface
 */
export interface SingleUploadResult {
  path: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  filename?: string;
  originalName?: string;
  size?: number;
}

/**
 * Multiple upload result interface
 */
export interface MultipleUploadResult {
  paths: string[];
  thumbnails: string[];
  thumbnailUrls: string[];
  filenames: string[];
}

/**
 * Upload single image
 * @param image - Image file to upload
 * @returns Promise<SingleUploadResult> - Upload result with thumbnail information
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

  // Extract only the path from the uploaded file (backward compatibility)
  return uploadedFile.path || uploadedFile.url;
};

/**
 * Upload single image with full response including thumbnails
 * @param image - Image file to upload
 * @returns Promise<SingleUploadResult> - Full upload result with thumbnail information
 */
export const uploadSingleImageWithThumbnails = async (
  image: File
): Promise<SingleUploadResult> => {
  // Validate that image file is provided
  if (!image) {
    throw new Error('No image file provided for upload');
  }

  const formData = new FormData();
  formData.append('image', image);

  const response = await unifiedApiClient.apiCreate<
    { success: boolean; data: UploadResponse } | UploadResponse
  >('/upload/image', formData, 'image upload', {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Handle wrapped response format {success: true, data: {...}} or direct response
  const uploadedFile = response.data || response;

  return {
    path: uploadedFile.url || uploadedFile.path,
    thumbnail: uploadedFile.thumbnail,
    thumbnailUrl: uploadedFile.thumbnailUrl,
    filename: uploadedFile.filename,
    originalName: uploadedFile.originalName,
    size: uploadedFile.size,
  };
};

/**
 * Upload multiple images
 * @param images - Array of image files to upload
 * @returns Promise<string[]> - Array of URLs of uploaded images (backward compatibility)
 */
export const uploadMultipleImages = async (
  images: File[]
): Promise<string[]> => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[UPLOAD API] uploadMultipleImages called with:', {
      images: images,
      imageCount: images ? images.length : 0,
      imageTypes: images ? images.map((img) => img.type) : [],
      imageSizes: images ? images.map((img) => img.size) : [],
    });
  }

  // Add stack trace to see where this is being called from
  if (process.env.NODE_ENV === 'development') {
    console.log('[UPLOAD API] Call stack:', new Error().stack);
  }

  // Return empty array immediately if no images to upload
  if (!images || images.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[UPLOAD API] No images provided for upload, returning empty array'
      );
    }
    return [];
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[UPLOAD API] Creating FormData with images...');
  }
  const formData = new FormData();
  images.forEach((image, index) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[UPLOAD API] Appending image ${index}:`,
        image.name,
        image.size,
        'bytes'
      );
    }
    formData.append(`images`, image);
  });

  // Debug FormData contents
  if (process.env.NODE_ENV === 'development') {
    console.log('[UPLOAD API] FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[UPLOAD API] Making API call to /upload/images...');
  }
  const response = await unifiedApiClient.apiCreate<{
    success: boolean;
    data: UploadResponse[];
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
    if (process.env.NODE_ENV === 'development') {
      console.error('[UPLOAD API] Expected array but got:', uploadedFiles);
    }
    throw new Error('Invalid response format from upload API');
  }

  // Extract only the path from each uploaded file (backward compatibility)
  return uploadedFiles.map((file: any) => file.path || file.url);
};

/**
 * Upload multiple images with full response including thumbnails
 * @param images - Array of image files to upload
 * @returns Promise<MultipleUploadResult> - Full upload results with thumbnail information
 */
export const uploadMultipleImagesWithThumbnails = async (
  images: File[]
): Promise<MultipleUploadResult> => {
  // Return empty result immediately if no images to upload
  if (!images || images.length === 0) {
    return {
      paths: [],
      thumbnails: [],
      thumbnailUrls: [],
      filenames: [],
    };
  }

  const formData = new FormData();
  images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await unifiedApiClient.apiCreate<{
    success: boolean;
    data: UploadResponse[];
  }>('/upload/images', formData, 'multiple image upload', {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Handle wrapped response format {success: true, data: [...]}
  const uploadedFiles = response.data || response || [];

  // Ensure we have an array to work with
  if (!Array.isArray(uploadedFiles)) {
    throw new Error('Invalid response format from upload API');
  }

  return {
    paths: uploadedFiles.map(
      (file: UploadResponse) => file.url || file.filename
    ),
    thumbnails: uploadedFiles.map((file: UploadResponse) => file.thumbnail),
    thumbnailUrls: uploadedFiles.map(
      (file: UploadResponse) => file.thumbnailUrl
    ),
    filenames: uploadedFiles.map((file: UploadResponse) => file.filename),
  };
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
