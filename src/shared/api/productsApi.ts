/**
 * Products API Client (Updated from CardMarket Reference Products)
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 * 
 * @deprecated This file is deprecated. Use UnifiedApiService.products instead.
 * Import: import { unifiedApiService } from '../services/UnifiedApiService'
 * Usage: unifiedApiService.products.searchProducts(), unifiedApiService.products.getPaginatedProducts()
 * 
 * This file will be removed in a future version as part of API consolidation.
 *
 * MIGRATION: Updated to use new SetProduct → Product hierarchy
 * - Old: CardMarketReferenceProduct (single model)
 * - New: SetProduct → Product (hierarchical relationship)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for product operations with SetProduct hierarchy
 * - OCP: Open for extension via createResourceOperations configuration
 * - LSP: Maintains product interface compatibility with new structure
 * - ISP: Provides specific product operations interface
 * - DIP: Depends on genericApiOperations abstraction
 *
 * DRY: Uses createResourceOperations to eliminate boilerplate CRUD patterns
 */

import {
  PRODUCTS_CONFIG,
  createResourceOperations,
  idMapper,
} from './genericApiOperations';
import unifiedApiClient from './unifiedApiClient';
import { searchProducts } from './searchApi';
import { IProduct } from '../domain/models/product';

// ========== INTERFACES (ISP Compliance) ==========

export interface ProductsParams {
  category?: string;
  setProductId?: string; // NEW: Filter by SetProduct ID
  setName?: string; // Legacy support for set name filtering
  available?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProductsResponse {
  products: IProduct[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductSearchParams {
  query: string;
  category?: string;
  setName?: string; // For hierarchical filtering
  setProductId?: string; // NEW: Direct SetProduct filtering
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  limit?: number;
  page?: number;
}

export interface OptimizedProductSearchResponse {
  success: boolean;
  query: string;
  count: number;
  data: IProduct[];
}

/**
 * Product creation payload interface (updated for new structure)
 */
type IProductCreatePayload = Omit<IProduct, 'id' | '_id'>;

/**
 * Product update payload interface
 */
type IProductUpdatePayload = Partial<IProductCreatePayload>;

// ========== GENERIC RESOURCE OPERATIONS ==========

/**
 * Core CRUD operations for products using createResourceOperations
 * Updated to use new /api/products endpoint instead of /api/cardmarket-ref-products
 * Eliminates boilerplate patterns and ensures consistency with other API files
 */
const productOperations = createResourceOperations<
  IProduct,
  IProductCreatePayload,
  IProductUpdatePayload
>(PRODUCTS_CONFIG, {
  includeExportOperations: true,
  // includeBatchOperations removed - not used by any frontend components
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get products with optional parameters (updated for new backend)
 * @param params - Optional filter parameters including SetProduct filtering
 * @returns Promise<IProduct[]> - Array of products with SetProduct population
 */
export const getProducts = async (
  params?: ProductsParams
): Promise<IProduct[]> => {
  if (params?.search && params.search.trim()) {
    // Use optimized search when there's a search term
    const searchParams: ProductSearchParams = {
      query: params.search.trim(),
      category: params?.category,
      setName: params?.setName,
      setProductId: params?.setProductId,
      availableOnly: params?.available,
      limit: params?.limit || 100,
      page: params?.page || 1,
    };

    const response = await searchProducts(searchParams);
    return response.data;
  } else {
    // Use generic getAll operation with ID mapping
    return productOperations.getAll(params, {
      transform: idMapper,
    });
  }
};

/**
 * Search products with parameters - updated for new backend
 * @param searchParams - Product search parameters
 * @returns Promise<IProduct[]> - Search results
 */
export const searchProductsWithParams = async (
  searchParams: ProductSearchParams
): Promise<IProduct[]> => {
  const result = await searchProducts(searchParams);
  return result.data;
};

/**
 * Export products data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportProducts = productOperations.export;

// ========== PRODUCT-SPECIFIC OPERATIONS ==========

/**
 * Get paginated products with filtering (updated for new backend)
 * @param params - Optional pagination and filter parameters
 * @returns Promise<PaginatedProductsResponse> - Paginated products response
 */
export const getPaginatedProducts = async (
  params?: ProductsParams
): Promise<PaginatedProductsResponse> => {
  const {
    page = 1,
    limit = 20,
    category,
    setName,
    setProductId,
    available,
    search,
  } = params || {};

  if (search && search.trim()) {
    // Use optimized search when there's a search term
    const searchParams: ProductSearchParams = {
      query: search.trim(),
      page,
      limit,
      category,
      setName,
      setProductId,
      availableOnly: available,
    };

    const response = await searchProducts(searchParams);

    // Calculate pagination for optimized search
    const totalPages = Math.ceil(response.count / limit);
    return {
      products: response.data,
      total: response.count,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } else {
    // Use the main /api/products endpoint for browsing without search
    const queryParams = {
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(setName && { setName }),
      ...(setProductId && { setProductId }),
      ...(available !== undefined && { available: available.toString() }),
    };

    const response = await unifiedApiClient.apiGet<PaginatedProductsResponse>(
      '/products',
      'paginated products',
      { params: queryParams }
    );

    return {
      products: response.data?.products || [],
      total: response.data?.total || 0,
      currentPage: response.data?.currentPage || page,
      totalPages: response.data?.totalPages || 1,
      hasNextPage: response.data?.hasNextPage || false,
      hasPrevPage: response.data?.hasPrevPage || false,
    };
  }
};

// Import consolidated search functions for product search operations
export {
  searchProducts,
  getProductSuggestions,
  getBestMatchProduct,
  searchProductsInSet,
  searchProductsByCategory,
  searchProductsByPriceRange,
  searchAvailableProducts,
} from './searchApi';
