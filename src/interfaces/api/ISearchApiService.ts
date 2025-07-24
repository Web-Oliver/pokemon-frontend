/**
 * Search API Service Interface
 * Layer 1: Core/Foundation/API Client
 * Follows Dependency Inversion Principle - defines abstractions for search operations
 */

/**
 * Interface for search operations
 * Abstracts the concrete implementation details
 */
export interface ISearchApiService {
  getProductCategories(): Promise<Array<{ value: string; label: string }>>;
}