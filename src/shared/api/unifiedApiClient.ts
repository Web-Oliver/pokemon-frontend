/**
 * Unified API Client
 * Layer 1: Core/Foundation/API Client (CLAUDE.md Architecture)
 *
 * SOLID Principles Implementation:
 * - SRP: Single responsibility for all HTTP requests
 * - OCP: Open for extension via optimization strategies
 * - LSP: Maintains axios interface compatibility
 * - ISP: Provides specific interfaces for different use cases
 * - DIP: Depends on abstractions, not concrete implementations
 *
 * DRY: Consolidates apiClient.ts, optimizedApiClient.ts, and apiWrapper.ts
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, HTTP_CONFIG } from '../utils/helpers/constants';
import { handleApiError } from '../utils/helpers/errorHandler';
import { log } from '../utils/performance/logger';
import { optimizedApiRequest } from '../utils/transformers/apiOptimization';
import {
  transformApiResponse,
  transformRequestData,
} from '../utils/transformers/responseTransformer';
import { IHttpClient } from '../services/base/HttpClientInterface';

// ========== UTILITY FUNCTIONS ==========

/**
 * Validate and sanitize ID parameters to prevent [object Object] URLs
 * @param id - ID parameter to validate
 * @param paramName - Parameter name for error messaging
 * @returns Sanitized string ID
 * @throws Error if ID is invalid
 */
export const validateAndSanitizeId = (
  id: any,
  paramName: string = 'id'
): string => {
  // Handle null, undefined, or empty values
  if (id === null || id === undefined || id === '') {
    throw new Error(
      `Invalid ${paramName}: cannot be null, undefined, or empty`
    );
  }

  // Convert to string and trim
  const sanitizedId = String(id).trim();

  // Check for problematic values
  if (
    sanitizedId === '' ||
    sanitizedId === 'undefined' ||
    sanitizedId === 'null' ||
    sanitizedId === '[object Object]' ||
    sanitizedId.includes('[object') ||
    sanitizedId.length > 100
  ) {
    // Reasonable length limit
    throw new Error(
      `Invalid ${paramName}: "${sanitizedId}" is not a valid identifier`
    );
  }

  return sanitizedId;
};

/**
 * Build URL path with validated ID parameters
 * @param basePath - Base URL path
 * @param id - ID to append (will be validated)
 * @param subPath - Optional sub-path after ID
 * @returns Valid URL path
 */
export const buildUrlWithId = (
  basePath: string,
  id: any,
  subPath?: string
): string => {
  const validId = validateAndSanitizeId(id);
  let url = `${basePath}/${validId}`;
  if (subPath) {
    url += `/${subPath}`;
  }
  return url;
};

// ========== INTERFACES (ISP Compliance) ==========

/**
 * Extended axios config with retry tracking
 */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  __retryCount?: number;
}

/**
 * Base configuration for all API requests
 */
export interface ApiRequestConfig extends ExtendedAxiosRequestConfig {
  operation?: string;
  successMessage?: string;
  errorMessage?: string;
  logRequest?: boolean;
  logResponse?: boolean;
  suppressErrorToast?: boolean;
}

/**
 * Optimization strategy configuration
 */
export interface OptimizationConfig {
  enableCache?: boolean;
  cacheTTL?: number;
  enableDeduplication?: boolean;
  // enableBatching, batchSize, batchDelay removed - not used by any frontend components
}

/**
 * Standard request configuration with optimization options
 */
export interface EnhancedRequestConfig extends ApiRequestConfig {
  optimization?: OptimizationConfig;
  skipTransform?: boolean; // Skip response transformation for raw API access
}

// BatchRequestConfig removed - not used by any frontend components

// ========== OPTIMIZATION STRATEGIES (OCP + DIP) ==========

/**
 * Abstract optimization strategy interface
 */
export interface OptimizationStrategy {
  optimize<T>(
    request: () => Promise<AxiosResponse<T>>,
    config: OptimizationConfig
  ): Promise<AxiosResponse<T>>;
}

/**
 * Default optimization strategy using existing optimization utilities
 */
class DefaultOptimizationStrategy implements OptimizationStrategy {
  async optimize<T>(
    request: () => Promise<AxiosResponse<T>>,
    config: OptimizationConfig
  ): Promise<AxiosResponse<T>> {
    if (config.enableCache || config.enableDeduplication) {
      return optimizedApiRequest(request, {}, config);
    }
    return request();
  }
}

// ========== UNIFIED API CLIENT (SRP + DIP) ==========

/**
 * Unified API client that consolidates all HTTP request patterns
 * Implements Strategy pattern for optimization and wrapper functionality
 */
export class UnifiedApiClient implements IHttpClient {
  private client: AxiosInstance;
  private optimizationStrategy: OptimizationStrategy;

  // batchProcessors removed - not used by any frontend components

  constructor(
    baseURL: string = API_BASE_URL,
    optimizationStrategy: OptimizationStrategy = new DefaultOptimizationStrategy()
  ) {
    this.client = this.createAxiosInstance(baseURL);
    this.optimizationStrategy = optimizationStrategy;
    // this.batchProcessors = new Map(); - removed
  }

  /**
   * GET request with optimization support
   */
  async get<T>(url: string, config: EnhancedRequestConfig = {}): Promise<T> {
    const { optimization, ...axiosConfig } = config;

    const defaultOptimization: OptimizationConfig = {
      enableCache: false, // ❌ DISABLED - Using pure TanStack Query caching strategy (Context7 best practice)
      cacheTTL: 0, // No internal caching - TanStack Query handles all caching
      enableDeduplication: false, // ❌ DISABLED - TanStack Query handles deduplication natively
      ...optimization,
    };

    return this.makeRequest(() => this.client.get<T>(url, axiosConfig), {
      ...config,
      operation: config.operation || `fetch ${url}`,
      optimization: defaultOptimization,
    });
  }

  /**
   * POST request with optimization support
   */
  async post<T>(
    url: string,
    data?: any,
    config: EnhancedRequestConfig = {}
  ): Promise<T> {
    const { optimization, ...axiosConfig } = config;

    const defaultOptimization: OptimizationConfig = {
      enableCache: false,
      enableDeduplication: true,
      ...optimization,
    };

    // Transform request data to convert ObjectId objects to strings
    // Skip transformation for FormData objects (used in file uploads)
    const transformedData =
      data && !(data instanceof FormData) ? transformRequestData(data) : data;

    return this.makeRequest(
      () => this.client.post<T>(url, transformedData, axiosConfig),
      {
        ...config,
        operation: config.operation || `create ${url}`,
        optimization: defaultOptimization,
      }
    );
  }

  /**
   * PUT request with optimization support
   */
  async put<T>(
    url: string,
    data?: any,
    config: EnhancedRequestConfig = {}
  ): Promise<T> {
    const { optimization, ...axiosConfig } = config;

    const defaultOptimization: OptimizationConfig = {
      enableCache: false,
      enableDeduplication: true,
      ...optimization,
    };

    // Transform request data to convert ObjectId objects to strings
    // Skip transformation for FormData objects (used in file uploads)
    const transformedData =
      data && !(data instanceof FormData) ? transformRequestData(data) : data;

    return this.makeRequest(
      () => this.client.put<T>(url, transformedData, axiosConfig),
      {
        ...config,
        operation: config.operation || `update ${url}`,
        optimization: defaultOptimization,
      }
    );
  }

  // ========== BASIC HTTP METHODS ==========

  /**
   * DELETE request with optimization support
   * DELETE operations often return empty responses, so we handle them specially
   */
  async delete<T = void>(
    url: string,
    config: EnhancedRequestConfig = {}
  ): Promise<T> {
    const { optimization, ...axiosConfig } = config;

    const defaultOptimization: OptimizationConfig = {
      enableCache: false,
      enableDeduplication: true,
      ...optimization,
    };

    // Special handling for DELETE operations
    return this.makeDeleteRequest(
      () => this.client.delete<T>(url, axiosConfig),
      {
        ...config,
        operation: config.operation || `delete ${url}`,
        optimization: defaultOptimization,
      }
    );
  }

  /**
   * GET request with ID validation (prevents [object Object] URLs)
   * @param basePath - Base API path (e.g., '/cards')
   * @param id - Resource ID to validate and append
   * @param subPath - Optional sub-path after ID
   * @param config - Request configuration
   */
  async getById<T>(
    basePath: string,
    id: any,
    subPath?: string,
    config: EnhancedRequestConfig = {}
  ): Promise<T> {
    try {
      const url = buildUrlWithId(basePath, id, subPath);
      return this.get<T>(url, {
        ...config,
        operation:
          config.operation ||
          `fetch ${basePath}/${String(id)}${subPath ? `/${subPath}` : ''}`,
      });
    } catch (error) {
      // Log ID validation errors for debugging
      log(`ID validation failed for ${basePath}:`, {
        providedId: id,
        typeOfId: typeof id,
        stringValue: String(id),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * PUT request with ID validation
   * @param basePath - Base API path (e.g., '/cards')
   * @param id - Resource ID to validate and append
   * @param data - Data to update
   * @param subPath - Optional sub-path after ID
   * @param config - Request configuration
   */
  async putById<T>(
    basePath: string,
    id: any,
    data: any,
    subPath?: string,
    config: EnhancedRequestConfig = {}
  ): Promise<T> {
    try {
      const url = buildUrlWithId(basePath, id, subPath);
      // Transform request data to convert ObjectId objects to strings
      // Skip transformation for FormData objects (used in file uploads)
      const transformedData =
        data && !(data instanceof FormData) ? transformRequestData(data) : data;
      return this.put<T>(url, transformedData, {
        ...config,
        operation:
          config.operation ||
          `update ${basePath}/${String(id)}${subPath ? `/${subPath}` : ''}`,
      });
    } catch (error) {
      log(`ID validation failed for PUT ${basePath}:`, {
        providedId: id,
        typeOfId: typeof id,
        stringValue: String(id),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * POST request with ID validation
   * @param basePath - Base API path (e.g., '/cards')
   * @param id - Resource ID to validate and append
   * @param data - Data to send with the request
   * @param subPath - Optional sub-path after ID
   * @param config - Request configuration
   */
  async postById<T>(
    basePath: string,
    id: any,
    data: any,
    subPath?: string,
    config: EnhancedRequestConfig = {}
  ): Promise<T> {
    try {
      const url = buildUrlWithId(basePath, id, subPath);
      // Transform request data to convert ObjectId objects to strings
      // Skip transformation for FormData objects (used in file uploads)
      const transformedData =
        data && !(data instanceof FormData) ? transformRequestData(data) : data;
      return this.post<T>(url, transformedData, {
        ...config,
        operation:
          config.operation ||
          `post ${basePath}/${String(id)}${subPath ? `/${subPath}` : ''}`,
      });
    } catch (error) {
      log(`ID validation failed for POST ${basePath}:`, {
        providedId: id,
        typeOfId: typeof id,
        stringValue: String(id),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // ========== ID-VALIDATED CONVENIENCE METHODS ==========

  /**
   * DELETE request with ID validation
   * @param basePath - Base API path (e.g., '/cards')
   * @param id - Resource ID to validate and append
   * @param subPath - Optional sub-path after ID
   * @param config - Request configuration
   */
  async deleteById<T = void>(
    basePath: string,
    id: any,
    subPath?: string,
    config: EnhancedRequestConfig = {}
  ): Promise<T> {
    try {
      const url = buildUrlWithId(basePath, id, subPath);
      return this.delete<T>(url, {
        ...config,
        operation:
          config.operation ||
          `delete ${basePath}/${String(id)}${subPath ? `/${subPath}` : ''}`,
      });
    } catch (error) {
      log(`ID validation failed for DELETE ${basePath}:`, {
        providedId: id,
        typeOfId: typeof id,
        stringValue: String(id),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Wrapper for fetching data with standardized logging
   */
  async apiGet<T>(
    url: string,
    operation: string,
    config?: Partial<EnhancedRequestConfig>
  ): Promise<T> {
    return this.get<T>(url, {
      operation: `fetch ${operation}`,
      ...config,
    });
  }

  /**
   * Wrapper for creating resources with standardized messaging
   */
  async apiCreate<T>(
    url: string,
    data: any,
    resource: string,
    config?: Partial<EnhancedRequestConfig>
  ): Promise<T> {
    return this.post<T>(url, data, {
      operation: `create ${resource}`,
      successMessage: `${resource} created successfully`,
      ...config,
    });
  }

  /**
   * Wrapper for updating resources with standardized messaging
   */
  async apiUpdate<T>(
    url: string,
    data: any,
    resource: string,
    config?: Partial<EnhancedRequestConfig>
  ): Promise<T> {
    return this.put<T>(url, data, {
      operation: `update ${resource}`,
      successMessage: `${resource} updated successfully`,
      ...config,
    });
  }

  // ========== BATCH OPERATIONS REMOVED ==========
  // Batch operations were not used by any frontend components and have been removed
  // to reduce code complexity and maintain only actually needed functionality

  // ========== SPECIALIZED WRAPPER METHODS (DRY) ==========

  /**
   * Wrapper for deleting resources with standardized messaging
   */
  async apiDelete<T = void>(
    url: string,
    resource: string,
    config?: Partial<EnhancedRequestConfig>
  ): Promise<T> {
    return this.delete<T>(url, {
      operation: `delete ${resource}`,
      successMessage: `${resource} deleted successfully`,
      ...config,
    });
  }

  /**
   * Wrapper for export operations with standardized messaging
   */
  async apiExport<T>(
    url: string,
    exportType: string,
    config?: Partial<EnhancedRequestConfig>
  ): Promise<T> {
    return this.get<T>(url, {
      operation: `export ${exportType}`,
      successMessage: `${exportType} exported successfully`,
      ...config,
    });
  }

  /**
   * Prefetch data for predictive loading
   */
  async prefetch<T>(
    url: string,
    config: EnhancedRequestConfig = {}
  ): Promise<void> {
    try {
      await this.get<T>(url, {
        ...config,
        optimization: {
          enableCache: true,
          cacheTTL: 10 * 60 * 1000, // 10 minutes for prefetched data
          enableDeduplication: true,
          ...config.optimization,
        },
        logRequest: false,
        logResponse: false,
      });
    } catch (error) {
      // Prefetch errors should be silent
      console.warn('[UnifiedApiClient] Prefetch failed:', error);
    }
  }

  /**
   * Set optimization strategy (Strategy Pattern - OCP compliance)
   */
  setOptimizationStrategy(strategy: OptimizationStrategy): void {
    this.optimizationStrategy = strategy;
  }

  /**
   * Get the underlying axios instance for direct access if needed
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Get current HTTP client configuration for debugging and monitoring
   */
  getConfig(): {
    baseURL: string;
    timeout: number;
    headers: Record<string, string>;
    retryConfig: {
      maxAttempts: number;
      retryDelay: number;
    };
  } {
    return {
      baseURL: this.client.defaults.baseURL || API_BASE_URL,
      timeout: this.client.defaults.timeout || HTTP_CONFIG.TIMEOUT,
      headers: this.client.defaults.headers as Record<string, string>,
      retryConfig: {
        maxAttempts: HTTP_CONFIG.RETRY_ATTEMPTS,
        retryDelay: HTTP_CONFIG.RETRY_DELAY,
      },
    };
  }

  // ========== UTILITY METHODS ==========

  /**
   * Create and configure axios instance with comprehensive interceptors
   * Implements all common HTTP concerns: base URL, headers, error parsing, timeouts
   */
  private createAxiosInstance(baseURL: string): AxiosInstance {
    const instance = axios.create({
      baseURL,
      headers: {
        ...HTTP_CONFIG.REQUEST_HEADERS,
      },
      timeout: HTTP_CONFIG.TIMEOUT,
      // Ensure credentials are included for authentication
      withCredentials: false, // Set to true if using cookies/sessions
    });

    // Request interceptor for common request transformations
    instance.interceptors.request.use(
      (config) => {
        // Add timestamp for cache busting if needed
        if (config.method?.toLowerCase() === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now(), // Cache busting for GET requests
          };
        }

        // Log request for debugging (in development)
        if (import.meta.env.MODE === 'development') {
          log(
            `[HTTP ${config.method?.toUpperCase()}] ${config.url}`,
            config.params || config.data
          );
        }

        return config;
      },
      (error) => {
        log('[HTTP Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for global error handling and transformation
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful response (in development)
        if (import.meta.env.MODE === 'development') {
          log(`[HTTP ${response.status}] ${response.config.url} - Success`);
        }
        return response;
      },
      async (error) => {
        const config = error.config;

        // Enhanced error logging with request context
        if (config) {
          log(`[HTTP Error] ${config.method?.toUpperCase()} ${config.url}:`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            attempt: config.__retryCount || 0,
          });
        }

        // Handle network errors
        if (!error.response) {
          log('[Network Error] No response received', error.message);
        }

        // Retry logic for transient errors
        if (this.shouldRetry(error) && config) {
          config.__retryCount = config.__retryCount || 0;

          if (config.__retryCount < HTTP_CONFIG.RETRY_ATTEMPTS) {
            config.__retryCount++;
            log(
              `[HTTP Retry] Attempt ${config.__retryCount}/${HTTP_CONFIG.RETRY_ATTEMPTS} for ${config.url}`
            );

            // Wait before retrying
            await new Promise((resolve) =>
              setTimeout(resolve, HTTP_CONFIG.RETRY_DELAY * config.__retryCount)
            );

            // Retry the request
            return instance(config);
          }
        }

        // Global error handling
        handleApiError(error);
        return Promise.reject(error);
      }
    );

    return instance;
  }

  /**
   * Determines if a request should be retried based on error type and status
   * @param error - The axios error object
   * @returns true if the request should be retried
   */
  private shouldRetry(error: any): boolean {
    // Don't retry if it's not a network error or server error
    if (!error.response && !error.code) {
      return false;
    }

    // Don't retry for client errors (4xx)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false;
    }

    // Retry for network errors
    if (
      error.code === 'ECONNABORTED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNRESET'
    ) {
      return true;
    }

    // Retry for server errors (5xx)
    if (error.response?.status >= 500) {
      return true;
    }

    // Retry for timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return true;
    }

    return false;
  }

  /**
   * Generic request method with wrapper functionality and optimization
   */
  private async makeRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    config: EnhancedRequestConfig = {}
  ): Promise<T> {
    const {
      operation = 'API request',
      successMessage,
      errorMessage = `Failed to ${operation}`,
      logRequest = true,
      logResponse = true,
      optimization = {},
      skipTransform = false,
    } = config;

    try {
      if (logRequest) {
        log(`Starting ${operation}...`);
      }

      // Apply optimization strategy
      const response = await this.optimizationStrategy.optimize(
        requestFn,
        optimization
      );

      if (logResponse) {
        log(`${operation} completed successfully`);
      }

      if (successMessage) {
        log(successMessage);
      }

      // CRITICAL FIX: Allow skipping transformation for raw API access
      if (skipTransform) {
        if (import.meta.env.MODE === 'development') {
          console.log('[HTTP CLIENT] Skipping transformation, returning raw response.data');
        }
        return response.data as T;
      }

      // Use simplified response transformer for new API format only
      // response.data already contains the full API response: {success, status, data, meta}
      return transformApiResponse<T>(response.data);
    } catch (error) {
      if (logRequest) {
        log(`${operation} failed:`, error);
      }

      handleApiError(error, errorMessage);
      throw error;
    }
  }

  /**
   * Specialized request handler for DELETE operations
   * DELETE operations often return simple responses that don't follow the full API format
   */
  private async makeDeleteRequest<T>(
    requestFn: () => Promise<AxiosResponse<T>>,
    config: EnhancedRequestConfig = {}
  ): Promise<T> {
    const {
      operation = 'DELETE request',
      successMessage,
      errorMessage = `Failed to ${operation}`,
      logRequest = true,
      logResponse = true,
      optimization = {},
    } = config;

    try {
      if (logRequest) {
        log(`Starting ${operation}...`);
      }

      // Apply optimization strategy
      const response = await this.optimizationStrategy.optimize(
        requestFn,
        optimization
      );

      if (logResponse) {
        log(`${operation} completed successfully`);
      }

      if (successMessage) {
        log(successMessage);
      }

      // For DELETE operations, handle different response formats more gracefully
      if (
        response.data === null ||
        response.data === undefined ||
        response.data === ''
      ) {
        // Empty response is valid for DELETE operations
        return undefined as T;
      }

      // Try to use the standard API format transformer, but fall back gracefully
      try {
        return transformApiResponse<T>(response.data);
      } catch (transformError) {
        // If standard transformation fails, check if it's a simple success response
        if (response.status >= 200 && response.status < 300) {
          // DELETE succeeded but response doesn't match new format
          log(
            `${operation} completed with non-standard response format`,
            response.data
          );
          return response.data as T;
        }
        // Re-throw transformation error if it's not a simple success case
        throw transformError;
      }
    } catch (error) {
      if (logRequest) {
        log(`${operation} failed:`, error);
      }

      handleApiError(error, errorMessage);
      throw error;
    }
  }
}

// ========== SINGLETON INSTANCE ==========

/**
 * Default unified API client instance
 */
export const unifiedApiClient = new UnifiedApiClient();

/**
 * Convenience exports that maintain compatibility with existing code
 */
export default {
  // Basic HTTP methods
  get: unifiedApiClient.get.bind(unifiedApiClient),
  post: unifiedApiClient.post.bind(unifiedApiClient),
  put: unifiedApiClient.put.bind(unifiedApiClient),
  delete: unifiedApiClient.delete.bind(unifiedApiClient),

  // Batch operations removed - not used by any frontend components

  // Specialized wrappers
  apiGet: unifiedApiClient.apiGet.bind(unifiedApiClient),
  apiCreate: unifiedApiClient.apiCreate.bind(unifiedApiClient),
  apiUpdate: unifiedApiClient.apiUpdate.bind(unifiedApiClient),
  apiDelete: unifiedApiClient.apiDelete.bind(unifiedApiClient),
  apiExport: unifiedApiClient.apiExport.bind(unifiedApiClient),

  // Utility methods
  prefetch: unifiedApiClient.prefetch.bind(unifiedApiClient),

  // Instance access
  instance: unifiedApiClient,
};
