/**
 * SetProducts API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * NEW: SetProduct operations for hierarchical SetProduct → Product structure
 * Handles the new top-level SetProduct entities (e.g., "Pokemon Scarlet & Violet")
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for SetProduct operations
 * - OCP: Open for extension via createResourceOperations configuration
 * - LSP: Maintains SetProduct interface compatibility
 * - ISP: Provides specific SetProduct operations interface
 * - DIP: Depends on genericApiOperations abstraction
 *
 * DRY: Uses createResourceOperations to eliminate boilerplate CRUD patterns
 */

import {
  SET_PRODUCTS_CONFIG,
  createResourceOperations,
  idMapper,
} from './genericApiOperations';
import unifiedApiClient from './unifiedApiClient';
import { ISetProduct } from '../domain/models/setProduct';

// ========== INTERFACES (ISP Compliance) ==========

export interface SetProductsParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedSetProductsResponse {
  setProducts: ISetProduct[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SetProductSearchParams {
  query: string;
  limit?: number;
  page?: number;
}

/**
 * SetProduct creation payload interface
 */
type ISetProductCreatePayload = Omit<ISetProduct, 'id' | '_id'>;

/**
 * SetProduct update payload interface
 */
type ISetProductUpdatePayload = Partial<ISetProductCreatePayload>;

// ========== GENERIC RESOURCE OPERATIONS ==========

/**
 * Core CRUD operations for SetProducts using createResourceOperations
 * Eliminates boilerplate patterns and ensures consistency with other API files
 */
const setProductOperations = createResourceOperations<
  ISetProduct,
  ISetProductCreatePayload,
  ISetProductUpdatePayload
>(SET_PRODUCTS_CONFIG, {
  includeExportOperations: true,
});

// ========== EXPORTED API OPERATIONS ==========

/**
 * Get all SetProducts with optional parameters
 * @param params - Optional filter parameters
 * @returns Promise<ISetProduct[]> - Array of SetProducts
 */
export const getSetProducts = async (
  params?: SetProductsParams
): Promise<ISetProduct[]> => {
  return setProductOperations.getAll(params, {
    transform: idMapper,
  });
};

/**
 * Get SetProduct by ID
 * @param id - SetProduct ID
 * @returns Promise<ISetProduct> - Single SetProduct
 */
export const getSetProductById = async (id: string): Promise<ISetProduct> => {
  return setProductOperations.getById(id, {
    transform: idMapper,
  });
};

/**
 * Search SetProducts with query
 * @param query - Search query
 * @param limit - Result limit (default: 50)
 * @returns Promise<ISetProduct[]> - Search results
 */
export const searchSetProducts = async (
  query: string,
  limit: number = 50
): Promise<ISetProduct[]> => {
  console.log('[SETPRODUCTS API DEBUG] searchSetProducts called with:', {
    query,
    limit,
  });

  if (!query.trim()) {
    console.log('[SETPRODUCTS API DEBUG] Empty query, returning empty array');
    return [];
  }

  const queryParams = new URLSearchParams({
    search: query.trim(),
    limit: limit.toString(),
  });

  const url = `/set-products/search?${queryParams.toString()}`;
  console.log('[SETPRODUCTS API DEBUG] Making request to:', url);

  const response = await unifiedApiClient.apiGet<{
    setProducts: ISetProduct[];
  }>(url, 'search SetProducts');

  console.log('[SETPRODUCTS API DEBUG] API response:', response);
  const results = response.data?.setProducts || [];
  console.log('[SETPRODUCTS API DEBUG] Returning results:', results);
  return results;
};

/**
 * Get SetProduct suggestions for autocomplete
 * @param query - Search query
 * @param limit - Result limit (default: 10)
 * @returns Promise<ISetProduct[]> - Suggestion results
 */
export const getSetProductSuggestions = async (
  query: string,
  limit: number = 10
): Promise<ISetProduct[]> => {
  if (!query.trim()) {
    return [];
  }

  return searchSetProducts(query, limit);
};

/**
 * Get paginated SetProducts with filtering
 * @param params - Optional pagination and filter parameters
 * @returns Promise<PaginatedSetProductsResponse> - Paginated SetProducts response
 */
export const getPaginatedSetProducts = async (
  params?: SetProductsParams
): Promise<PaginatedSetProductsResponse> => {
  const { page = 1, limit = 20, search } = params || {};

  const queryParams = {
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
  };

  const response = await unifiedApiClient.apiGet<PaginatedSetProductsResponse>(
    '/set-products',
    'paginated SetProducts',
    { params: queryParams }
  );

  return {
    setProducts: response.data?.setProducts || [],
    total: response.data?.total || 0,
    currentPage: response.data?.currentPage || page,
    totalPages: response.data?.totalPages || 1,
    hasNextPage: response.data?.hasNextPage || false,
    hasPrevPage: response.data?.hasPrevPage || false,
  };
};

// ===== NO WRITE OPERATIONS =====
// SetProducts are read-only reference data from CardMarket
// No create, update, or delete operations are available for frontend use

/**
 * Export SetProducts data
 * @param exportParams - Export parameters
 * @returns Promise<Blob> - Export file blob
 */
export const exportSetProducts = setProductOperations.export;
