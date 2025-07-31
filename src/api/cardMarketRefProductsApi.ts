/**
 * CardMarket Reference Products API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for CardMarket reference product operations
 * - OCP: Open for extension via createResourceOperations configuration
 * - LSP: Maintains ICardMarketReferenceProduct interface compatibility
 * - ISP: Provides specific CardMarket product operations interface
 * - DIP: Depends on genericApiOperations abstraction
 *
 * DRY: Uses createResourceOperations to eliminate boilerplate CRUD patterns
 */

import {
  createResourceOperations,
  CARDMARKET_REF_PRODUCTS_CONFIG,
  idMapper,
} from './genericApiOperations';
import unifiedApiClient from './unifiedApiClient';
import { searchProducts } from './searchApi';
import { ICardMarketReferenceProduct } from '../domain/models/sealedProduct';

// ========== INTERFACES (ISP Compliance) ==========

export interface CardMarketRefProductsParams {
  category?: string;
  setName?: string;
  available?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedCardMarketRefProductsResponse {
  products: ICardMarketReferenceProduct[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductSearchParams {
  query: string;
  category?: string;
  setName?: string;
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
  data: ICardMarketReferenceProduct[];
}

/**
 * CardMarket reference product creation payload interface
 */
interface ICardMarketRefProductCreatePayload
  extends Omit<ICardMarketReferenceProduct, 'id' | '_id'> {}

/**
 * CardMarket reference product update payload interface
 */
interface ICardMarketRefProductUpdatePayload
  extends Partial<ICardMarketRefProductCreatePayload> {}

// ========== GENERIC RESOURCE OPERATIONS ==========

/**
 * Core CRUD operations for CardMarket reference products using createResourceOperations
 * Eliminates boilerplate patterns and ensures consistency with other API files
 */
const cardMarketRefProductOperations = createResourceOperations<
  ICardMarketReferenceProduct,
  ICardMarketRefProductCreatePayload,
  ICardMarketRefProductUpdatePayload
>(CARDMARKET_REF_PRODUCTS_CONFIG, {
  includeExportOperations: true,
  includeBatchOperations: true,
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get CardMarket reference products with optional parameters
 * @param params - Optional filter parameters
 * @returns Promise<ICardMarketReferenceProduct[]> - Array of reference products
 */
export const getCardMarketRefProducts = async (
  params?: CardMarketRefProductsParams
): Promise<ICardMarketReferenceProduct[]> => {
  if (params?.search && params.search.trim()) {
    // Use optimized search when there's a search term
    const searchParams: ProductSearchParams = {
      query: params.search.trim(),
      category: params?.category,
      setName: params?.setName,
      availableOnly: params?.available,
      limit: params?.limit || 100,
      page: params?.page || 1,
    };

    const response = await searchProducts(searchParams);
    return response.data;
  } else {
    // Use generic getAll operation with ID mapping
    return cardMarketRefProductOperations.getAll(params, {
      transform: idMapper,
    });
  }
};

/**
 * Get CardMarket reference product by ID
 * @param id - Product ID
 * @returns Promise<ICardMarketReferenceProduct> - Single reference product
 */
export const getCardMarketRefProductById = async (
  id: string
): Promise<ICardMarketReferenceProduct> => {
  return cardMarketRefProductOperations.getById(id, {
    transform: idMapper,
  });
};

/**
 * Create a new CardMarket reference product
 * @param productData - Product creation data
 * @returns Promise<ICardMarketReferenceProduct> - Created product
 */
export const createCardMarketRefProduct = cardMarketRefProductOperations.create;

/**
 * Update existing CardMarket reference product
 * @param id - Product ID
 * @param productData - Product update data
 * @returns Promise<ICardMarketReferenceProduct> - Updated product
 */
export const updateCardMarketRefProduct = cardMarketRefProductOperations.update;

/**
 * Delete CardMarket reference product
 * @param id - Product ID
 * @returns Promise<void>
 */
export const removeCardMarketRefProduct = cardMarketRefProductOperations.remove;

/**
 * Search CardMarket reference products with parameters - consolidated implementation
 * @param searchParams - Product search parameters
 * @returns Promise<ICardMarketReferenceProduct[]> - Search results
 */
export const searchCardMarketRefProducts = async (searchParams: any): Promise<ICardMarketReferenceProduct[]> => {
  const result = await searchProducts(searchParams);
  return result.data;
};

/**
 * Bulk create CardMarket reference products
 * @param productsData - Array of product creation data
 * @returns Promise<ICardMarketReferenceProduct[]> - Created products
 */
export const bulkCreateCardMarketRefProducts =
  cardMarketRefProductOperations.bulkCreate;

/**
 * Export CardMarket reference products data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportCardMarketRefProducts =
  cardMarketRefProductOperations.export;

/**
 * Batch operation on CardMarket reference products
 * @param operation - Operation name
 * @param ids - Product IDs
 * @param operationData - Operation-specific data
 * @returns Promise<ICardMarketReferenceProduct[]> - Operation results
 */
export const batchCardMarketRefProductOperation =
  cardMarketRefProductOperations.batchOperation;

// ========== CARDMARKET-SPECIFIC OPERATIONS ==========

/**
 * Get paginated CardMarket reference products with filtering
 * @param params - Optional pagination and filter parameters
 * @returns Promise<PaginatedCardMarketRefProductsResponse> - Paginated products response
 */
export const getPaginatedCardMarketRefProducts = async (
  params?: CardMarketRefProductsParams
): Promise<PaginatedCardMarketRefProductsResponse> => {
  const {
    page = 1,
    limit = 20,
    category,
    setName,
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
    // Use the main cardmarket-ref-products endpoint for browsing without search
    const queryParams = {
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(setName && { setName }),
      ...(available !== undefined && { available: available.toString() }),
    };

    const response =
      await unifiedApiClient.apiGet<PaginatedCardMarketRefProductsResponse>(
        '/cardmarket-ref-products',
        'paginated CardMarket reference products',
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

// Import consolidated search functions for CardMarket-specific search operations
export {
  searchProducts,
  getProductSuggestions,
  getBestMatchProduct,
  searchProductsInSet,
  searchProductsByCategory,
  searchProductsByPriceRange,
  searchAvailableProducts,
  getCardMarketSetNames,
  searchCardMarketSetNames,
} from './searchApi';
