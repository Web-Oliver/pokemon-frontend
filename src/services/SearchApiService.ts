/**
 * Search API Service Implementation
 * Layer 1: Core/Foundation/API Client
 * Concrete implementation of ISearchApiService using existing API modules
 */

// Simple category list instead of API call
import { ISearchApiService } from '../interfaces/api/ISearchApiService';

/**
 * Concrete implementation of Search API Service
 * Adapts existing searchApi module to the interface contract
 */
export class SearchApiService implements ISearchApiService {
  async getProductCategories(): Promise<
    Array<{ value: string; label: string }>
  > {
    const categories = [
      'Booster Box',
      'Elite Trainer Box',
      'Theme Deck',
      'Starter Deck',
      'Collection Box',
    ];
    return categories.map((cat) => ({ value: cat, label: cat }));
  }
}

// Export singleton instance following DIP pattern
export const searchApiService = new SearchApiService();
