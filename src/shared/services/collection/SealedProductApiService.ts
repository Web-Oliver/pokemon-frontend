/**
 * Sealed Product API Service
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * Focused service for sealed product operations following SRP
 * Extends BaseApiService for common functionality
 *
 * SOLID Principles:
 * - SRP: Single responsibility for sealed product operations only
 * - DIP: Depends on HTTP client abstraction
 * - OCP: Open for extension with additional sealed product-specific operations
 * - DRY: Reuses base service functionality
 */

// Removed circular dependency - import unifiedApiService directly in components/hooks instead
import { ISealedProduct } from '../../domain/models/sealedProduct';
import { ISaleDetails } from '../../domain/models/common';
import { BaseApiService } from '../base/BaseApiService';
import { IHttpClient } from '../base/HttpClientInterface';
import {
  ISealedProductApiService,
  SealedProductCollectionParams,
} from '../../interfaces/api/ICollectionApiService';

/**
 * Sealed Product API Service
 * Handles all sealed product operations with proper validation and error handling
 */
export class SealedProductApiService
  extends BaseApiService
  implements ISealedProductApiService
{
  constructor(httpClient: IHttpClient) {
    super(httpClient, 'SEALED PRODUCT SERVICE');
  }

  /**
   * DEPRECATED - Use unifiedApiService.collection.getSealedProducts() directly
   * This service creates circular dependencies and violates CLAUDE.md principles
   */
  async getSealedProducts(
    filters?: SealedProductCollectionParams
  ): Promise<ISealedProduct[]> {
    throw new Error('DEPRECATED: Use unifiedApiService.collection.getSealedProducts() directly to avoid circular dependencies');
  }

  /**
   * Get sealed product by ID
   */
  async getSealedProductById(id: string): Promise<ISealedProduct> {
    return this.getResourceById<ISealedProduct>(
      '/sealed-products',
      id,
      'getSealedProductById'
    );
  }

  /**
   * Create new sealed product
   */
  async createSealedProduct(
    productData: Partial<ISealedProduct>
  ): Promise<ISealedProduct> {
    return this.createResource<ISealedProduct>(
      '/sealed-products',
      productData,
      'createSealedProduct',
      'productId'
    );
  }

  /**
   * Update sealed product
   */
  async updateSealedProduct(
    id: string,
    productData: Partial<ISealedProduct>
  ): Promise<ISealedProduct> {
    return this.updateResource<ISealedProduct>(
      '/sealed-products',
      id,
      productData,
      'updateSealedProduct'
    );
  }

  /**
   * Delete sealed product
   */
  async deleteSealedProduct(id: string): Promise<void> {
    return this.deleteResource('/sealed-products', id, 'deleteSealedProduct');
  }

  /**
   * Mark sealed product as sold
   */
  async markSealedProductSold(
    id: string,
    saleDetails: ISaleDetails
  ): Promise<ISealedProduct> {
    this.validateId(id, 'markSealedProductSold');
    this.validateData(saleDetails, 'markSealedProductSold');

    return this.executeWithErrorHandling('markSealedProductSold', async () => {
      const result = await this.httpClient.postById<ISealedProduct>(
        '/sealed-products',
        id,
        { saleDetails },
        'mark-sold'
      );
      return this.validateSoldResponse<ISealedProduct>(
        result,
        'markSealedProductSold',
        id,
        saleDetails
      );
    });
  }
}
