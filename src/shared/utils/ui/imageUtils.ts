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
 * Converts a relative image path to a full URL
 * SRP: Only handles image URL construction
 */
export const getImageUrl = (imagePath: string): string => {
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
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${serverBase}${cleanPath}`;
};

/**
 * Converts a relative image path to a thumbnail URL
 * SRP: Only handles thumbnail URL construction
 */
export const getThumbnailUrl = (imagePath: string): string => {
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

  // Create thumbnail path
  const ext = imagePath.substring(imagePath.lastIndexOf('.'));
  const nameWithoutExt = imagePath.substring(0, imagePath.lastIndexOf('.'));
  const thumbnailPath = `${nameWithoutExt}-thumb${ext}`;

  return getImageUrl(thumbnailPath);
};

export interface ImagePreview {
  id: string;
  file?: File;
  url: string;
  isExisting?: boolean;
  aspectInfo?: any;
}

/**
 * Creates a preview object for existing images
 * SRP: Only handles existing image preview creation
 */
export const createExistingImagePreview = (
  url: string,
  index: number
): ImagePreview => ({
  id: `existing-${index}-${generateId('img')}`,
  url: getImageUrl(url),
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
 * Process image URLs for consistent display 
 * Handles localhost prefix cleanup and proper URL construction
 */
export const processImageUrl = (
  imagePath: string | undefined
): string | undefined => {
  if (!imagePath) {
    return undefined;
  }

  return getImageUrl(imagePath);
};
