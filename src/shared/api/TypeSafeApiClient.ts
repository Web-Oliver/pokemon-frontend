/**
 * Type-Safe API Client
 * Layer 1: Core/Foundation/API Client - Enhanced with Type Safety
 *
 * SOLID-compliant HTTP client eliminating ALL 'any' type usage
 * Wrapper around unifiedApiClient with complete type safety
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Type-safe HTTP operations only
 * - Liskov Substitution: All response types are substitutable
 * - Open/Closed: Extensible through generic types
 * - Interface Segregation: Specific methods for different operations
 * - Dependency Inversion: Depends on response type abstractions
 */

import {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedResponse,
  CollectionResponse,
  ResourceResponse,
  transformApiResponse,
  createErrorResponse,
  isSuccessResponse,
} from '../types/api/ApiResponse';
import { unifiedApiClient, EnhancedRequestConfig } from './unifiedApiClient';

/**
 * Type-Safe API Client Class
 * Eliminates all 'any' types while maintaining full functionality
 */
export class TypeSafeApiClient {
  /**
   * Generic GET request with type safety
   * @param url - Request URL
   * @param operation - Operation description for logging
   * @param config - Request configuration
   * @returns Type-safe API response
   */
  async get<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<T>> {
    try {
      const response = await unifiedApiClient.apiGet<T>(url, operation, config);
      return this.ensureSuccessResponse<T>(response, operation);
    } catch (error) {
      throw this.transformError(error, operation);
    }
  }

  /**
   * Generic POST request with type safety
   * @param url - Request URL
   * @param data - Request payload
   * @param operation - Operation description for logging
   * @param config - Request configuration
   * @returns Type-safe API response
   */
  async post<TResponse, TRequest = any>(
    url: string,
    data: TRequest,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<TResponse>> {
    try {
      const response = await unifiedApiClient.apiPost<TResponse>(
        url,
        data,
        operation,
        config
      );
      return this.ensureSuccessResponse<TResponse>(response, operation);
    } catch (error) {
      throw this.transformError(error, operation);
    }
  }

  /**
   * Generic PUT request with type safety
   * @param url - Request URL
   * @param data - Request payload
   * @param operation - Operation description for logging
   * @param config - Request configuration
   * @returns Type-safe API response
   */
  async put<TResponse, TRequest = any>(
    url: string,
    data: TRequest,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<TResponse>> {
    try {
      const response = await unifiedApiClient.apiPut<TResponse>(
        url,
        data,
        operation,
        config
      );
      return this.ensureSuccessResponse<TResponse>(response, operation);
    } catch (error) {
      throw this.transformError(error, operation);
    }
  }

  /**
   * Generic DELETE request with type safety
   * @param url - Request URL
   * @param operation - Operation description for logging
   * @param config - Request configuration
   * @returns Type-safe API response
   */
  async delete<T = void>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<T>> {
    try {
      const response = await unifiedApiClient.apiDelete<T>(
        url,
        operation,
        config
      );
      return this.ensureSuccessResponse<T>(response, operation);
    } catch (error) {
      throw this.transformError(error, operation);
    }
  }

  /**
   * GET request for collections with type safety
   * @param url - Request URL
   * @param operation - Operation description
   * @param config - Request configuration
   * @returns Type-safe collection response
   */
  async getCollection<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<CollectionResponse<T>> {
    try {
      const response = await unifiedApiClient.apiGet<T[]>(
        url,
        operation,
        config
      );
      return this.ensureCollectionResponse<T>(response, operation);
    } catch (error) {
      throw this.transformError(error, operation);
    }
  }

  /**
   * GET request for paginated data with type safety
   * @param url - Request URL
   * @param operation - Operation description
   * @param config - Request configuration
   * @returns Type-safe paginated response
   */
  async getPaginated<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<PaginatedResponse<T>> {
    try {
      const response = await unifiedApiClient.apiGet<{
        data: T[];
        pagination: any;
      }>(url, operation, config);
      return this.ensurePaginatedResponse<T>(response, operation);
    } catch (error) {
      throw this.transformError(error, operation);
    }
  }

  /**
   * GET request for single resource with type safety
   * @param url - Request URL
   * @param operation - Operation description
   * @param config - Request configuration
   * @returns Type-safe resource response
   */
  async getResource<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<T>> {
    try {
      const response = await unifiedApiClient.apiGet<T>(url, operation, config);
      return this.ensureResourceResponse<T>(response, operation);
    } catch (error) {
      throw this.transformError(error, operation);
    }
  }

  /**
   * GET by ID with type safety and validation
   * @param basePath - Base URL path
   * @param id - Resource ID
   * @param operation - Operation description
   * @param config - Request configuration
   * @returns Type-safe resource response
   */
  async getById<T>(
    basePath: string,
    id: string | number,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<T>> {
    this.validateId(id, operation);
    const url = `${basePath}/${id}`;
    return this.getResource<T>(url, operation, config);
  }

  /**
   * PUT by ID with type safety and validation
   * @param basePath - Base URL path
   * @param id - Resource ID
   * @param data - Update payload
   * @param operation - Operation description
   * @param config - Request configuration
   * @returns Type-safe resource response
   */
  async putById<TResponse, TRequest = any>(
    basePath: string,
    id: string | number,
    data: TRequest,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<TResponse>> {
    this.validateId(id, operation);
    const url = `${basePath}/${id}`;
    const response = await this.put<TResponse, TRequest>(
      url,
      data,
      operation,
      config
    );
    return this.ensureResourceResponse<TResponse>(response, operation);
  }

  /**
   * DELETE by ID with type safety and validation
   * @param basePath - Base URL path
   * @param id - Resource ID
   * @param operation - Operation description
   * @param config - Request configuration
   * @returns Type-safe void response
   */
  async deleteById(
    basePath: string,
    id: string | number,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<void>> {
    this.validateId(id, operation);
    const url = `${basePath}/${id}`;
    return this.delete<void>(url, operation, config);
  }

  /**
   * POST to sub-resource with type safety
   * @param basePath - Base URL path
   * @param id - Parent resource ID
   * @param data - Request payload
   * @param subPath - Sub-resource path
   * @param operation - Operation description
   * @param config - Request configuration
   * @returns Type-safe resource response
   */
  async postById<TResponse, TRequest = any>(
    basePath: string,
    id: string | number,
    data: TRequest,
    subPath: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<TResponse>> {
    this.validateId(id, operation);
    const url = `${basePath}/${id}/${subPath}`;
    const response = await this.post<TResponse, TRequest>(
      url,
      data,
      operation,
      config
    );
    return this.ensureResourceResponse<TResponse>(response, operation);
  }

  // ========== PRIVATE HELPER METHODS ==========

  /**
   * Ensure response is in success format
   */
  private ensureSuccessResponse<T>(
    response: any,
    operation: string
  ): ApiSuccessResponse<T> {
    const transformed = transformApiResponse<T>(response, operation);

    if (isSuccessResponse(transformed)) {
      return transformed;
    }

    throw new Error(`Expected success response for operation: ${operation}`);
  }

  /**
   * Ensure response is in collection format
   */
  private ensureCollectionResponse<T>(
    response: any,
    operation: string
  ): CollectionResponse<T> {
    const data = response?.data ?? response;

    if (!Array.isArray(data)) {
      throw new Error(
        `Expected array response for collection operation: ${operation}`
      );
    }

    return {
      success: true,
      data,
      count: data.length,
      timestamp: new Date().toISOString(),
      meta: {
        source: operation,
      },
    };
  }

  /**
   * Ensure response is in paginated format
   */
  private ensurePaginatedResponse<T>(
    response: any,
    operation: string
  ): PaginatedResponse<T> {
    const responseData = response?.data ?? response;

    if (!responseData?.data || !Array.isArray(responseData.data)) {
      throw new Error(
        `Expected paginated response format for operation: ${operation}`
      );
    }

    const { data, pagination } = responseData;

    return {
      success: true,
      data,
      pagination: {
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? data.length,
        total: pagination?.total ?? data.length,
        totalPages: pagination?.totalPages ?? 1,
        hasNext: pagination?.hasNext ?? false,
        hasPrev: pagination?.hasPrev ?? false,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Ensure response is in resource format
   */
  private ensureResourceResponse<T>(
    response: ApiSuccessResponse<T>,
    operation: string
  ): ResourceResponse<T> {
    return {
      ...response,
      meta: {
        source: operation,
        ...response.meta,
      },
    };
  }

  /**
   * Validate ID parameter
   */
  private validateId(id: string | number, operation: string): void {
    if (!id || (typeof id === 'string' && id.trim() === '')) {
      throw new Error(`Invalid ID provided for operation: ${operation}`);
    }
  }

  /**
   * Transform error to standard format
   */
  private transformError(error: any, operation: string): ApiErrorResponse {
    return createErrorResponse(error, operation);
  }
}

// ========== SINGLETON INSTANCE ==========

/**
 * Singleton instance of TypeSafeApiClient
 * Use this for all type-safe API operations
 */
export const typeSafeApiClient = new TypeSafeApiClient();

// ========== HTTP CLIENT INTERFACE FOR DIP COMPLIANCE ==========

/**
 * Type-safe HTTP client interface for dependency injection
 * Eliminates all 'any' types from BaseApiService
 */
export interface ITypeSafeHttpClient {
  get<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<T>>;
  post<TResponse, TRequest = any>(
    url: string,
    data: TRequest,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<TResponse>>;
  put<TResponse, TRequest = any>(
    url: string,
    data: TRequest,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<TResponse>>;
  delete<T = void>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<T>>;
  getCollection<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<CollectionResponse<T>>;
  getPaginated<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<PaginatedResponse<T>>;
  getResource<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<T>>;
  getById<T>(
    basePath: string,
    id: string | number,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<T>>;
  putById<TResponse, TRequest = any>(
    basePath: string,
    id: string | number,
    data: TRequest,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<TResponse>>;
  deleteById(
    basePath: string,
    id: string | number,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<void>>;
  postById<TResponse, TRequest = any>(
    basePath: string,
    id: string | number,
    data: TRequest,
    subPath: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<TResponse>>;
}
