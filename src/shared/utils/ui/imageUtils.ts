/**
 * Image Utilities - Following SOLID and DRY principles
 * Single Responsibility: Each function has one clear purpose
 * Open/Closed: Extensible without modification
 * Dependency Inversion: Uses abstractions, not concretions
 */

import { generateId } from '../core';
import { API_BASE_URL } from '../helpers/constants';

/**
 * Get the server base URL for images (without /api suffix)
 * SRP: Only handles server base URL calculation
 */
const getServerBaseUrl = (): string => {
  return API_BASE_URL.replace('/api', '');
};

/**
 * Image source context for proper URL routing
 */
export type ImageSource = 'collection' | 'psa-label' | 'generic';

/**
 * Converts a relative image path to a full URL with context awareness
 * SRP: Only handles image URL construction with source context
 */
export const getImageUrl = (imagePath: string, source: ImageSource = 'collection'): string => {
  if (!imagePath) return '';

  // If already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If starts with blob: (for object URLs), return as-is
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }

  const serverBase = getServerBaseUrl();
  
  // Route based on source context
  switch (source) {
    case 'collection':
      // Fix malformed paths with doubled /api/images/ prefix
      let cleanPath = imagePath;
      if (cleanPath.includes('/api/images/api/images/')) {
        // Remove the doubled prefix and keep only the last part
        cleanPath = cleanPath.replace('/api/images/api/images/', '/');
      } else if (cleanPath.startsWith('/api/images/')) {
        // Remove the existing /api/images/ prefix
        cleanPath = cleanPath.replace('/api/images/', '/');
      } else if (!cleanPath.startsWith('/')) {
        // Add leading slash if missing
        cleanPath = `/${cleanPath}`;
      }
      
      return `${serverBase}/api/images${cleanPath}`;
      
    case 'psa-label':
      // ICR workflow PSA labels use specific endpoint based on filename
      return `${serverBase}/api/icr/images/labels/${imagePath}`;
      
    case 'generic':
    default:
      // Generic images (fallback to old behavior)
      const genericPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `${serverBase}${genericPath}`;
  }
};

/**
 * Converts a relative image path to a thumbnail URL with context awareness
 * SRP: Only handles thumbnail URL construction
 */
export const getThumbnailUrl = (imagePath: string, source: ImageSource = 'collection'): string => {
  if (!imagePath) return '';

  // If already a full URL, convert to thumbnail
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    const ext = imagePath.substring(imagePath.lastIndexOf('.'));
    const nameWithoutExt = imagePath.substring(0, imagePath.lastIndexOf('.'));
    return `${nameWithoutExt}-thumb${ext}`;
  }

  // If starts with blob:, return original (object URLs don't have thumbnails)
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }

  // PSA labels don't have thumbnails, return full image
  if (source === 'psa-label') {
    return getImageUrl(imagePath, source);
  }

  // Create thumbnail path for collection images
  const ext = imagePath.substring(imagePath.lastIndexOf('.'));
  const nameWithoutExt = imagePath.substring(0, imagePath.lastIndexOf('.'));
  const thumbnailPath = `${nameWithoutExt}-thumb${ext}`;

  return getImageUrl(thumbnailPath, source);
};

export interface ImagePreview {
  id: string;
  file?: File;
  url: string;
  isExisting?: boolean;
  aspectInfo?: any;
}

/**
 * Creates a preview object for existing images with context
 * SRP: Only handles existing image preview creation
 */
export const createExistingImagePreview = (
  url: string,
  index: number,
  source: ImageSource = 'collection'
): ImagePreview => ({
  id: `existing-${index}-${generateId('img')}`,
  url: getImageUrl(url, source),
  isExisting: true,
});

/**
 * Processes uploaded files and creates previews
 * SRP: Only handles file processing and validation
 */
export const processImageFiles = async (
  files: FileList,
  existingPreviews: ImagePreview[],
  maxFiles: number,
  maxFileSize: number,
  acceptedTypes: string[]
): Promise<{
  newFiles: File[];
  newPreviews: ImagePreview[];
  errorMessage: string | null;
}> => {
  const fileArray = Array.from(files);
  const newFiles: File[] = [];
  const newPreviews: ImagePreview[] = [];
  let errorMessage: string | null = null;

  // Check total file count
  if (existingPreviews.length + fileArray.length > maxFiles) {
    errorMessage = `Maximum ${maxFiles} files allowed`;
    return { newFiles, newPreviews, errorMessage };
  }

  for (const file of fileArray) {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      errorMessage = `File type ${file.type} not supported`;
      break;
    }

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errorMessage = `File ${file.name} exceeds ${maxFileSize}MB limit`;
      break;
    }

    // Create preview
    const preview: ImagePreview = {
      id: `new-${generateId('img')}`,
      file,
      url: URL.createObjectURL(file),
      isExisting: false,
    };

    newFiles.push(file);
    newPreviews.push(preview);
  }

  return { newFiles, newPreviews, errorMessage };
};

/**
 * Cleans up object URLs to prevent memory leaks
 * SRP: Only handles URL cleanup
 */
export const cleanupObjectURL = (preview: ImagePreview) => {
  if (!preview.isExisting && preview.url.startsWith('blob:')) {
    URL.revokeObjectURL(preview.url);
  }
};

/**
 * Process image URLs for consistent display with context awareness
 * Handles localhost prefix cleanup and proper URL construction
 */
export const processImageUrl = (
  imagePath: string | undefined,
  source: ImageSource = 'collection'
): string | undefined => {
  if (!imagePath) {
    return undefined;
  }

  return getImageUrl(imagePath, source);
};
