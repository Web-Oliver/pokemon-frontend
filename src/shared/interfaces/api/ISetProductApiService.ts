/**
 * SetProduct API Service Interface
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * NEWLY CREATED: Interface for SetProduct operations
 * Follows Dependency Inversion Principle - defines abstractions for SetProduct operations
 *
 * Following CLAUDE.md principles:
 * - ISP: Interface segregation for SetProduct-specific operations
 * - DIP: High-level modules depend on abstractions
 * - SRP: Single responsibility for SetProduct API abstraction
 */

import { ISetProduct } from '../../domain/models/setProduct';

/**
 * Search and filtering parameters for SetProduct operations
 */
export interface SetProductFilters {
  query?: string;
  limit?: number;
  page?: number;
  sortBy?: 'setProductName' | 'uniqueSetProductId' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface for SetProduct operations
 * Abstracts the concrete implementation details for hierarchical SetProduct management
 */
export interface ISetProductApiService {
  // Read operations
  getSetProducts(filters?: SetProductFilters): Promise<ISetProduct[]>;
  getSetProductById(id: string): Promise<ISetProduct>;
  getSetProductByUniqueId(
    uniqueSetProductId: number
  ): Promise<ISetProduct | null>;

  // Search operations (for hierarchical autocomplete)
  searchSetProducts(query: string, limit?: number): Promise<ISetProduct[]>;
  getSetProductSuggestions(
    query: string,
    limit?: number
  ): Promise<ISetProduct[]>;
  getBestMatchSetProduct(query: string): Promise<ISetProduct | null>;

  // No write operations - SetProducts are read-only reference data

  // Relationship operations
  getProductsBySetProductId(setProductId: string): Promise<any[]>; // Returns related Products
  getSetProductStats(id: string): Promise<{
    totalProducts: number;
    totalValue: number;
    categoryBreakdown: Record<string, number>;
  }>;
}
