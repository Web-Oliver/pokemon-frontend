/**
 * Search API Service Implementation
 * Layer 1: Core/Foundation/API Client
 * Concrete implementation of ISearchApiService using existing API modules
 */

import { ISearchApiService } from '../interfaces/api/ISearchApiService';
import { getProductCategories } from '../api/searchApi';

/**
 * Concrete implementation of Search API Service
 * Adapts existing searchApi module to the interface contract
 */
export class SearchApiService implements ISearchApiService {
  async getProductCategories(): Promise<Array<{ value: string; label: string }>> {
    return await getProductCategories();
  }
}

// Export singleton instance following DIP pattern
export const searchApiService = new SearchApiService();
