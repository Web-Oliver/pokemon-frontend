/**
 * Search Pagination Service
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for search pagination logic
 * - DRY: Eliminates duplicate pagination logic across search pages
 * - DIP: Depends on UnifiedApiService abstraction
 */

import { unifiedApiService } from './UnifiedApiService';
import { log } from '../utils/performance/logger';

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  total: number;
}

export interface SearchResult<T> {
  data: T[];
  pagination: PaginationData;
}

export interface SetSearchParams {
  search?: string;
  year?: string;
  page?: number;
  limit?: number;
}

export interface ProductSearchParams {
  searchTerm?: string;
  categoryFilter?: string;
  setProductId?: string;
  availableOnly?: boolean;
  page?: number;
  limit?: number;
}

export class SearchPaginationService {
  
  /**
   * Calculate pagination data from API response
   */
  private static calculatePagination(
    currentPage: number,
    totalResults: number,
    limit: number
  ): PaginationData {
    const totalPages = Math.ceil(totalResults / limit);
    return {
      currentPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
      total: totalResults,
    };
  }

  /**
   * Search sets with pagination
   */
  static async searchSets(params: SetSearchParams): Promise<SearchResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 12;

    log('SearchPaginationService: Fetching sets with params:', {
      page,
      limit,
      search: params.search,
      year: params.year,
    });

    let fetchedSets: any[] = [];
    let totalResults = 0;

    if (params.search?.trim()) {
      // Use search API when there's a search term
      const searchParams = {
        query: params.search.trim(),
        page,
        limit,
        ...(params.year && { year: params.year }),
      };

      const optimizedResponse = await unifiedApiService.sets.searchSets(searchParams);
      fetchedSets = optimizedResponse.data;
      totalResults = optimizedResponse.count;
    } else {
      // Use paginated sets API for browsing
      const requestParams = {
        page,
        limit,
        ...(params.year && { year: params.year }),
      };

      const response = await unifiedApiService.sets.getPaginatedSets(requestParams);
      fetchedSets = response.sets;
      totalResults = response.totalSets || 0;
    }

    const pagination = this.calculatePagination(page, totalResults, limit);

    log('SearchPaginationService: Sets fetched successfully:', fetchedSets.length, 'sets');

    return {
      data: fetchedSets,
      pagination,
    };
  }

  /**
   * Search products with pagination
   */
  static async searchProducts(params: ProductSearchParams): Promise<SearchResult<any>> {
    const page = params.page || 1;
    const limit = params.limit || 12;

    log('SearchPaginationService: Fetching products with params:', {
      page,
      limit,
      categoryFilter: params.categoryFilter,
      availableOnly: params.availableOnly,
      searchTerm: params.searchTerm,
    });

    let fetchedProducts: any[] = [];
    let totalResults = 0;

    if (params.searchTerm?.trim()) {
      // Use search API when there's a search term
      const searchParams = {
        query: params.searchTerm.trim(),
        page,
        limit,
        ...(params.categoryFilter && { category: params.categoryFilter }),
        ...(params.setProductId && { setProductId: params.setProductId }),
        ...(params.availableOnly && { availableOnly: true }),
      };

      const searchResponse = await unifiedApiService.products.searchProducts(searchParams);
      fetchedProducts = searchResponse.data || [];
      totalResults = searchResponse.count || 0;
    } else {
      // Use paginated products API for browsing
      const requestParams = {
        page,
        limit,
        ...(params.categoryFilter && { category: params.categoryFilter }),
        ...(params.setProductId && { setProductId: params.setProductId }),
        ...(params.availableOnly && { availableOnly: true }),
      };

      const response = await unifiedApiService.products.getPaginatedProducts(requestParams);
      fetchedProducts = response.products || [];
      totalResults = response.total || 0;
    }

    const pagination = this.calculatePagination(page, totalResults, limit);

    log('SearchPaginationService: Products fetched successfully:', fetchedProducts.length, 'products');

    return {
      data: fetchedProducts,
      pagination,
    };
  }
}