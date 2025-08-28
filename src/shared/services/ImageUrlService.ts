/**
 * Image URL Service - SOLID & DRY Implementation
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles image URL transformation and management
 * - Open/Closed: Extensible for new image types without modification
 * - Liskov Substitution: Can be substituted anywhere IImageUrlService is expected
 * - Interface Segregation: Clean, focused interface
 * - Dependency Inversion: Depends on configuration abstractions
 * 
 * DRY: Single source of truth for ALL image URL handling across the application
 */

import { API_BASE_URL } from '../utils/helpers/constants';

export interface IImageUrlService {
  getFullImageUrl(relativeUrl: string): string;
  getLabelImageUrl(relativeUrl: string): string;
  getStitchedImageUrl(relativeUrl: string): string;
  transformApiResponse<T>(data: T): T;
}

export class ImageUrlService implements IImageUrlService {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    // Remove /api suffix if present, we'll add the full path
    this.baseUrl = baseUrl.replace('/api', '');
  }

  /**
   * Convert relative ICR full image URL to absolute URL
   */
  getFullImageUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    
    // If already absolute, return as-is
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    
    // Handle relative URLs that start with /api/icr/images/full/
    if (relativeUrl.startsWith('/api/icr/images/full/')) {
      return `${this.baseUrl}${relativeUrl}`;
    }
    
    // Handle just filename
    if (!relativeUrl.includes('/')) {
      return `${this.baseUrl}/api/icr/images/full/${relativeUrl}`;
    }
    
    return `${this.baseUrl}${relativeUrl}`;
  }

  /**
   * Convert relative ICR label image URL to absolute URL  
   */
  getLabelImageUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    
    // If already absolute, return as-is
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    
    // Handle relative URLs that start with /api/icr/images/labels/
    if (relativeUrl.startsWith('/api/icr/images/labels/')) {
      return `${this.baseUrl}${relativeUrl}`;
    }
    
    // Handle just filename
    if (!relativeUrl.includes('/')) {
      return `${this.baseUrl}/api/icr/images/labels/${relativeUrl}`;
    }
    
    return `${this.baseUrl}${relativeUrl}`;
  }

  /**
   * Convert relative ICR stitched image URL to absolute URL
   */
  getStitchedImageUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    
    // If already absolute, return as-is
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    
    // Handle relative URLs that start with /api/icr/images/stitched/
    if (relativeUrl.startsWith('/api/icr/images/stitched/')) {
      return `${this.baseUrl}${relativeUrl}`;
    }
    
    // Handle just filename
    if (!relativeUrl.includes('/')) {
      return `${this.baseUrl}/api/icr/images/stitched/${relativeUrl}`;
    }
    
    return `${this.baseUrl}${relativeUrl}`;
  }

  /**
   * Transform API response data by converting all relative image URLs to absolute URLs
   * DRY: Single method to transform entire API responses
   */
  transformApiResponse<T>(data: T): T {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.transformApiResponse(item)) as unknown as T;
    }

    // Handle objects
    if (typeof data === 'object' && data !== null) {
      const transformed = { ...data } as any;

      // Transform known image URL fields
      if (transformed.fullImageUrl) {
        transformed.fullImageUrl = this.getFullImageUrl(transformed.fullImageUrl);
      }
      
      if (transformed.labelImageUrl) {
        transformed.labelImageUrl = this.getLabelImageUrl(transformed.labelImageUrl);
      }
      
      if (transformed.stitchedImageUrl) {
        transformed.stitchedImageUrl = this.getStitchedImageUrl(transformed.stitchedImageUrl);
      }

      // Recursively transform nested objects
      for (const key in transformed) {
        if (transformed.hasOwnProperty(key) && typeof transformed[key] === 'object') {
          transformed[key] = this.transformApiResponse(transformed[key]);
        }
      }

      return transformed;
    }

    return data;
  }
}

// Singleton instance - DRY principle
export const imageUrlService = new ImageUrlService();
export default imageUrlService;