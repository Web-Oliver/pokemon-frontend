/**
 * Upload API Service Implementation
 * Layer 1: Core/Foundation/API Client
 * Concrete implementation of IUploadApiService using existing API modules
 */

import { IUploadApiService } from '../interfaces/api/IUploadApiService';
import { uploadMultipleImages } from '../api/uploadApi';

/**
 * Concrete implementation of Upload API Service
 * Adapts existing uploadApi module to the interface contract
 */
export class UploadApiService implements IUploadApiService {
  async uploadMultipleImages(images: File[]): Promise<string[]> {
    return await uploadMultipleImages(images);
  }
}

// Export singleton instance following DIP pattern
export const uploadApiService = new UploadApiService();