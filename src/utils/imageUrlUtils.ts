/**
 * Image URL Utilities
 * 
 * Centralized utilities for handling image URLs consistently across the application.
 * Follows CLAUDE.md principles for DRY and single source of truth.
 */

import { API_BASE_URL } from './constants';

/**
 * Get the base URL for the image server
 * Extracts the base URL from API_BASE_URL by removing '/api'
 */
export const getImageBaseUrl = (): string => {
  return API_BASE_URL.replace('/api', '');
};

/**
 * Convert a relative image path to a full URL
 * @param imagePath - The relative image path (e.g., "/uploads/image.jpg")
 * @returns Full image URL
 */
export const getFullImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    return '';
  }

  // Fix multiple localhost prefix patterns (handles any number of duplicates)
  let cleanPath = imagePath;
  const baseUrl = getImageBaseUrl();
  while (cleanPath.includes(`${baseUrl}${baseUrl}`)) {
    cleanPath = cleanPath.replace(`${baseUrl}${baseUrl}`, baseUrl);
  }

  // If already a full URL after cleaning, return as-is
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // Handle paths that don't start with /uploads/
  let normalizedPath = cleanPath;
  if (!normalizedPath.startsWith('/uploads/')) {
    // If it's just a filename, prepend /uploads/
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = `/uploads/${normalizedPath}`;
    } else {
      normalizedPath = normalizedPath;
    }
  }
  
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Convert an array of image paths to full URLs
 * @param imagePaths - Array of relative image paths
 * @returns Array of full image URLs
 */
export const getFullImageUrls = (imagePaths: string[]): string[] => {
  return imagePaths.map(path => getFullImageUrl(path));
};

/**
 * Get the first image URL from an array, with fallback
 * @param images - Array of image paths
 * @param fallback - Fallback URL if no images
 * @returns First image URL or fallback
 */
export const getFirstImageUrl = (images: string[], fallback: string = ''): string => {
  if (!images || images.length === 0) {
    return fallback;
  }
  
  return getFullImageUrl(images[0]);
};

/**
 * Extract relative path from full URL
 * @param fullUrl - Full image URL
 * @returns Relative path
 */
export const getRelativeImagePath = (fullUrl: string): string => {
  if (!fullUrl) {
    return '';
  }

  const baseUrl = getImageBaseUrl();
  return fullUrl.replace(baseUrl, '');
};

/**
 * Check if an image URL is valid (not empty and properly formatted)
 * @param imageUrl - Image URL to validate
 * @returns Whether the URL is valid
 */
export const isValidImageUrl = (imageUrl: string): boolean => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return false;
  }

  // Check if it's a proper URL or relative path
  return imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('./');
};

/**
 * Generate optimized image URL with format conversion (for future WebP support)
 * @param imagePath - Original image path
 * @param format - Target format (webp, jpg, png)
 * @returns Optimized image URL
 */
export const getOptimizedImageUrl = (imagePath: string, format?: 'webp' | 'jpg' | 'png'): string => {
  const fullUrl = getFullImageUrl(imagePath);
  
  if (!format) {
    return fullUrl;
  }

  // For future implementation: add format conversion
  // For now, just return the original URL
  return fullUrl;
};

/**
 * Generate responsive image srcSet for different sizes
 * @param imagePath - Base image path
 * @param sizes - Array of sizes (e.g., [320, 640, 1024])
 * @returns srcSet string
 */
export const generateResponsiveSrcSet = (imagePath: string, sizes: number[] = [320, 640, 1024]): string => {
  const baseUrl = getFullImageUrl(imagePath);
  
  // For future implementation: add responsive image generation
  // For now, just return the original URL for all sizes
  return sizes.map(size => `${baseUrl} ${size}w`).join(', ');
};