/**
 * SetProduct API Service Implementation
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * NEWLY CREATED: Concrete implementation of ISetProductApiService
 * Provides SetProduct operations for hierarchical search and data management
 * 
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for SetProduct business logic
 * - DIP: Depends on API client abstractions
 * - OCP: Open for extension through hierarchical patterns
 * - ISP: Implements specific SetProduct interface
 */

import * as setProductsApi from '../api/setProductsApi';
import * as productsApi from '../api/productsApi';
import { 
  getBestMatchSetProduct,
  getSetProductSuggestions,
  searchSetProducts
} from '../api/searchApi';
import { ISetProduct } from '../domain/models/setProduct';
import { IProduct } from '../domain/models/product';
import { 
  ISetProductApiService,
  SetProductFilters
} from '../interfaces/api/ISetProductApiService';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';

/**
 * Enhanced SetProduct API Service with hierarchical capabilities
 * Implements SetProduct operations following the established service pattern
 */
export class SetProductApiService implements ISetProductApiService {
  /**
   * Validate ID parameter to prevent service errors
   */
  private validateId(id: string, operation: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      const error = new Error(`Invalid ID provided for ${operation}: ${id}`);
      log(`[SETPRODUCT SERVICE] ID validation failed for ${operation}`, {
        id,
        operation,
      });
      throw error;
    }
  }

  /**
   * Validate uniqueSetProductId parameter
   */
  private validateUniqueId(uniqueId: number, operation: string): void {
    if (!uniqueId || typeof uniqueId !== 'number' || uniqueId <= 0) {
      const error = new Error(`Invalid unique ID provided for ${operation}: ${uniqueId}`);
      log(`[SETPRODUCT SERVICE] Unique ID validation failed for ${operation}`, {
        uniqueId,
        operation,
      });
      throw error;
    }
  }

  /**
   * Validate data object for create/update operations
   */
  private validateData(data: any, operation: string): void {
    if (!data || typeof data !== 'object') {
      const error = new Error(`Invalid data provided for ${operation}`);
      log(`[SETPRODUCT SERVICE] Data validation failed for ${operation}`, {
        data,
        operation,
      });
      throw error;
    }
  }

  /**
   * Standard error handling wrapper for service methods
   */
  private async executeWithErrorHandling<T>(
    operation: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    try {
      log(`[SETPRODUCT SERVICE] Executing ${operation}`);
      const result = await apiCall();
      log(`[SETPRODUCT SERVICE] Successfully completed ${operation}`);
      return result;
    } catch (error) {
      log(`[SETPRODUCT SERVICE] Error in ${operation}`, { error });
      handleApiError(error, `SetProduct service ${operation} failed`);
      throw error; // Re-throw after logging
    }
  }

  // ===== READ OPERATIONS =====

  /**
   * Get all SetProducts with optional filtering
   */
  async getSetProducts(filters?: SetProductFilters): Promise<ISetProduct[]> {
    return this.executeWithErrorHandling('getSetProducts', async () => {
      const params = filters ? {
        query: filters.query,
        limit: filters.limit,
        page: filters.page,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      } : undefined;

      const result = await setProductsApi.getSetProducts(params);

      // Validate result format (should return array)
      if (!Array.isArray(result)) {
        log('[SETPRODUCT SERVICE] getSetProducts returned non-array result', {
          result,
        });
        throw new Error('Invalid response format: expected array of SetProducts');
      }

      return result;
    });
  }

  /**
   * Get SetProduct by MongoDB ObjectId
   */
  async getSetProductById(id: string): Promise<ISetProduct> {
    this.validateId(id, 'getSetProductById');

    return this.executeWithErrorHandling('getSetProductById', async () => {
      const result = await setProductsApi.getSetProductById(id);

      // Validate result is a valid SetProduct object
      if (!result || typeof result !== 'object' || !result.setProductName) {
        log('[SETPRODUCT SERVICE] getSetProductById returned invalid result', {
          id,
          result,
        });
        throw new Error(`SetProduct not found or invalid format: ${id}`);
      }

      return result;
    });
  }

  /**
   * Get SetProduct by unique identifier
   * Used for backend rebuilding and cross-reference operations
   */
  async getSetProductByUniqueId(uniqueSetProductId: number): Promise<ISetProduct | null> {
    this.validateUniqueId(uniqueSetProductId, 'getSetProductByUniqueId');

    return this.executeWithErrorHandling('getSetProductByUniqueId', async () => {
      const params = { uniqueSetProductId };
      const results = await setProductsApi.getSetProducts(params);

      // Return first match or null if none found
      if (Array.isArray(results) && results.length > 0) {
        return results[0];
      }

      return null;
    });
  }

  // ===== SEARCH OPERATIONS =====

  /**
   * Search SetProducts using the search API
   * For hierarchical autocomplete functionality
   */
  async searchSetProducts(query: string, limit: number = 10): Promise<ISetProduct[]> {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return [];
    }

    return this.executeWithErrorHandling('searchSetProducts', async () => {
      const params = {
        query: query.trim(),
        limit,
        page: 1,
      };

      const response = await searchSetProducts(params);
      return response.data || [];
    });
  }

  /**
   * Get SetProduct suggestions for autocomplete
   * Integrates with hierarchical search system
   */
  async getSetProductSuggestions(query: string, limit: number = 10): Promise<ISetProduct[]> {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return [];
    }

    return this.executeWithErrorHandling('getSetProductSuggestions', async () => {
      return getSetProductSuggestions(query.trim(), limit);
    });
  }

  /**
   * Get best matching SetProduct for a query
   * Used for exact match scenarios and autofill
   */
  async getBestMatchSetProduct(query: string): Promise<ISetProduct | null> {
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return null;
    }

    return this.executeWithErrorHandling('getBestMatchSetProduct', async () => {
      return getBestMatchSetProduct(query.trim());
    });
  }

  // ===== NO WRITE OPERATIONS =====
  // SetProducts are read-only reference data from CardMarket
  // No create, update, or delete operations are available

  // ===== RELATIONSHIP OPERATIONS =====

  /**
   * Get all Products that belong to a specific SetProduct
   * For hierarchical data display and management
   */
  async getProductsBySetProductId(setProductId: string): Promise<IProduct[]> {
    this.validateId(setProductId, 'getProductsBySetProductId');

    return this.executeWithErrorHandling('getProductsBySetProductId', async () => {
      const params = { setProductId };
      const result = await productsApi.getProducts(params);

      // Validate result format
      if (!Array.isArray(result)) {
        log('[SETPRODUCT SERVICE] getProductsBySetProductId returned non-array result', {
          setProductId,
          result,
        });
        throw new Error('Invalid response format: expected array of Products');
      }

      return result;
    });
  }

  /**
   * Get statistical information about a SetProduct
   * Includes product count, total value, and category breakdown
   */
  async getSetProductStats(id: string): Promise<{
    totalProducts: number;
    totalValue: number;
    categoryBreakdown: Record<string, number>;
  }> {
    this.validateId(id, 'getSetProductStats');

    return this.executeWithErrorHandling('getSetProductStats', async () => {
      const products = await this.getProductsBySetProductId(id);

      // Calculate statistics
      const stats = {
        totalProducts: products.length,
        totalValue: 0,
        categoryBreakdown: {} as Record<string, number>,
      };

      products.forEach((product) => {
        // Add to total value (using cardMarketPrice as reference)
        if (product.cardMarketPrice && typeof product.cardMarketPrice === 'number') {
          stats.totalValue += product.cardMarketPrice;
        }

        // Count categories
        const category = product.category || 'Unknown';
        stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;
      });

      return stats;
    });
  }
}

// Export singleton instance following DIP pattern
export const setProductApiService = new SetProductApiService();