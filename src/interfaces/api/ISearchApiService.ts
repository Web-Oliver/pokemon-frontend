/**
 * Search API Service Interface
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * UPDATED: Enhanced with hierarchical search abstractions
 * Follows Dependency Inversion Principle - defines abstractions for search operations
 * 
 * Following CLAUDE.md principles:
 * - ISP: Interface segregation for different search capabilities
 * - DIP: High-level modules depend on abstractions
 * - OCP: Open for extension with new search patterns
 */

import { ICard, ISet } from '../../domain/models/card';
import { IProduct } from '../../domain/models/product';
import { ISetProduct } from '../../domain/models/setProduct';

/**
 * Hierarchical search configuration interface
 */
export interface HierarchicalSearchConfig {
  setProductSelected?: ISetProduct;
  setSelected?: ISet;
  productSelected?: IProduct;
  allowSimultaneousSuggestions?: boolean;
}

/**
 * Search context interface for state management
 */
export interface SearchContext {
  activeField: 'setProduct' | 'product' | 'set' | 'card' | null;
  setProductId?: string;
  setName?: string;
  productId?: string;
}

/**
 * Selection handling result interfaces
 */
export interface SetProductSelectionResult {
  setProduct: ISetProduct;
  shouldClearOtherFields: boolean;
}

export interface ProductSelectionResult {
  product: IProduct;
  autofillData?: {
    setName?: string;
    setProductName?: string;
  };
  shouldClearOtherFields: boolean;
}

export interface SetSelectionResult {
  set: ISet;
  shouldClearOtherFields: boolean;
}

/**
 * Enhanced interface for hierarchical search operations
 * Abstracts the concrete implementation details for hierarchical autocomplete
 */
export interface ISearchApiService {
  // Legacy method (backward compatibility)
  getProductCategories(): Promise<Array<{ value: string; label: string }>>;

  // Context management
  updateSearchContext(context: Partial<SearchContext>): void;
  clearSearchContext(): void;
  getSearchContext(): SearchContext;

  // Hierarchical suggestion methods
  getSetProductSuggestions(query: string, limit?: number): Promise<ISetProduct[]>;
  getHierarchicalProductSuggestions(
    query: string,
    config?: HierarchicalSearchConfig,
    limit?: number
  ): Promise<IProduct[]>;
  getHierarchicalSetSuggestions(query: string, limit?: number): Promise<ISet[]>;

  // Selection handling methods
  handleSetProductSelection(setProduct: ISetProduct): Promise<SetProductSelectionResult>;
  handleProductSelection(product: IProduct): Promise<ProductSelectionResult>;
  handleSetSelection(set: ISet): Promise<SetSelectionResult>;

  // State validation
  shouldShowSuggestions(fieldType: 'setProduct' | 'product' | 'set' | 'card'): boolean;
  validateHierarchicalState(): { isValid: boolean; issues: string[] };
}
