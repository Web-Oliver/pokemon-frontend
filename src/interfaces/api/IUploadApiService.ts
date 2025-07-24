/**
 * Upload API Service Interface
 * Layer 1: Core/Foundation/API Client
 * Follows Dependency Inversion Principle - defines abstractions for upload operations
 */

/**
 * Interface for image upload operations
 * Abstracts the concrete implementation details
 */
export interface IUploadApiService {
  uploadMultipleImages(images: File[]): Promise<string[]>;
}