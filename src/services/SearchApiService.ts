/**
 * Search API Service Implementation
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 *
 * UPDATED: Enhanced with hierarchical search capabilities
 * - SetProduct → Product filtering
 * - Set-first filtering logic
 * - Product autofill functionality
 * - No simultaneous suggestions enforcement
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for search orchestration
 * - DIP: Depends on searchApi abstractions
 * - OCP: Open for extension through hierarchical patterns
 */

import { ISet } from '../domain/models/card';
import { IProduct } from '../domain/models/product';
import { ISetProduct } from '../domain/models/setProduct';
import {
  ISearchApiService,
  HierarchicalSearchConfig,
  SearchContext,
  SetProductSelectionResult,
  ProductSelectionResult,
  SetSelectionResult,
} from '../interfaces/api/ISearchApiService';
import {
  getBestMatchSetProduct,
  getProductSuggestions,
  getSetProductSuggestions,
  getSetSuggestions,
  searchProducts,
  searchProductsInSet,
} from '../api/searchApi';

/**
 * Enhanced Search API Service with hierarchical capabilities
 * Implements the user's specification for hierarchical autocomplete
 */
export class SearchApiService implements ISearchApiService {
  private searchContext: SearchContext = { activeField: null };

  /**
   * Get product categories (legacy method)
   */
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

  /**
   * Update search context for hierarchical filtering
   */
  updateSearchContext(context: Partial<SearchContext>): void {
    this.searchContext = { ...this.searchContext, ...context };
  }

  /**
   * Clear search context
   */
  clearSearchContext(): void {
    this.searchContext = { activeField: null };
  }

  /**
   * Get SetProduct suggestions
   * Only returns suggestions when no other field is active (user spec)
   */
  async getSetProductSuggestions(
    query: string,
    limit: number = 10
  ): Promise<ISetProduct[]> {
    if (!query.trim()) {
      return [];
    }

    // Per user spec: no simultaneous suggestions
    if (
      this.searchContext.activeField &&
      this.searchContext.activeField !== 'setProduct'
    ) {
      return [];
    }

    this.searchContext.activeField = 'setProduct';
    return getSetProductSuggestions(query, limit);
  }

  /**
   * Get Product suggestions with hierarchical filtering
   * Filters by SetProduct if one is selected (user spec)
   */
  async getHierarchicalProductSuggestions(
    query: string,
    config: HierarchicalSearchConfig = {},
    limit: number = 10
  ): Promise<IProduct[]> {
    if (!query.trim()) {
      return [];
    }

    // Per user spec: no simultaneous suggestions
    if (
      this.searchContext.activeField &&
      this.searchContext.activeField !== 'product'
    ) {
      return [];
    }

    this.searchContext.activeField = 'product';

    // If SetProduct is selected, filter products by that SetProduct
    if (config.setProductSelected) {
      // Use SetProduct ID to filter products
      const params = {
        query: query.trim(),
        setProductId: config.setProductSelected.id,
        limit,
        page: 1,
      };
      const response = await searchProducts(params);
      return response.data;
    }

    // If Set is selected (alternative path), filter products by set name
    if (config.setSelected) {
      return searchProductsInSet(query, config.setSelected.setName, limit);
    }

    // No filtering context - return all matching products
    return getProductSuggestions(query, limit);
  }

  /**
   * Get Set suggestions
   * Only returns suggestions when no other field is active (user spec)
   */
  async getHierarchicalSetSuggestions(
    query: string,
    limit: number = 10
  ): Promise<ISet[]> {
    if (!query.trim()) {
      return [];
    }

    // Per user spec: no simultaneous suggestions
    if (
      this.searchContext.activeField &&
      this.searchContext.activeField !== 'set'
    ) {
      return [];
    }

    this.searchContext.activeField = 'set';
    return getSetSuggestions(query, limit);
  }

  /**
   * Handle SetProduct selection and autofill logic
   * Per user spec: selecting SetProduct should not show other suggestions
   */
  async handleSetProductSelection(
    setProduct: ISetProduct
  ): Promise<SetProductSelectionResult> {
    this.updateSearchContext({
      setProductId: setProduct.id,
      activeField: null, // Clear active field after selection
    });

    return {
      setProduct,
      shouldClearOtherFields: false, // SetProduct doesn't autofill other fields
    };
  }

  /**
   * Handle Product selection and autofill logic
   * Per user spec: selecting Product should autofill Set information
   */
  async handleProductSelection(
    product: IProduct
  ): Promise<ProductSelectionResult> {
    this.updateSearchContext({
      productId: product.id,
      activeField: null, // Clear active field after selection
    });

    // Autofill logic: Product selection should populate set information
    const autofillData: { setName?: string; setProductName?: string } = {};

    // If product has setName, autofill it
    if (product.setName) {
      autofillData.setName = product.setName;
    }

    // If product has setProductId, fetch SetProduct for autofill
    if (product.setProductId) {
      try {
        const setProduct = await getBestMatchSetProduct(product.setProductId);
        if (setProduct) {
          autofillData.setProductName = setProduct.setProductName;
        }
      } catch (error) {
        console.warn('Failed to fetch SetProduct for autofill:', error);
      }
    }

    return {
      product,
      autofillData,
      shouldClearOtherFields: true, // Product selection should clear other suggestions
    };
  }

  /**
   * Handle Set selection and filtering setup
   * Per user spec: selecting Set should filter subsequent product searches
   */
  async handleSetSelection(set: ISet): Promise<SetSelectionResult> {
    this.updateSearchContext({
      setName: set.setName,
      activeField: null, // Clear active field after selection
    });

    return {
      set,
      shouldClearOtherFields: false, // Set selection enables filtering, doesn't clear
    };
  }

  /**
   * Check if suggestions should be shown for a specific field
   * Implements "no simultaneous suggestions" rule
   */
  shouldShowSuggestions(
    fieldType: 'setProduct' | 'product' | 'set' | 'card'
  ): boolean {
    // If no field is active, allow suggestions
    if (!this.searchContext.activeField) {
      return true;
    }

    // Only show suggestions for the currently active field
    return this.searchContext.activeField === fieldType;
  }

  /**
   * Get current search context (for debugging/state management)
   */
  getSearchContext(): SearchContext {
    return { ...this.searchContext };
  }

  /**
   * Validate hierarchical search state
   * Ensures search context is consistent with user's specification
   */
  validateHierarchicalState(): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for invalid simultaneous active states
    if (
      this.searchContext.activeField &&
      this.searchContext.setProductId &&
      this.searchContext.productId
    ) {
      issues.push('Invalid state: both SetProduct and Product are selected');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}

// Export singleton instance following DIP pattern
export const searchApiService = new SearchApiService();
