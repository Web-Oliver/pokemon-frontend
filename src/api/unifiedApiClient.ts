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
import { API_BASE_URL } from '../utils/constants';
import { handleApiError } from '../utils/errorHandler';
import { log } from '../utils/logger';
import { optimizedApiRequest, BatchProcessor } from '../utils/apiOptimization';

// ========== INTERFACES (ISP Compliance) ==========

/**
 * Base configuration for all API requests
 */
export interface ApiRequestConfig extends AxiosRequestConfig {
  operation?: string;
  successMessage?: string;
  errorMessage?: string;
  logRequest?: boolean;
  logResponse?: boolean;
}

/**
 * Optimization strategy configuration
 */
export interface OptimizationConfig {
  enableCache?: boolean;
  cacheTTL?: number;
  enableDeduplication?: boolean;
  enableBatching?: boolean;
  batchSize?: number;
  batchDelay?: number;
}

/**
 * Enhanced request configuration with optimization options
 */
export interface EnhancedRequestConfig extends ApiRequestConfig {
  optimization?: OptimizationConfig;
}

/**
 * Batch request configuration
 */
export interface BatchRequestConfig {
  batchSize?: number;
  batchDelay?: number;
}

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

/**
 * No-op optimization strategy for cases where optimization is not needed
 */
class NoOptimizationStrategy implements OptimizationStrategy {
  async optimize<T>(
    request: () => Promise<AxiosResponse<T>>,
    config: OptimizationConfig
  ): Promise<AxiosResponse<T>> {
    return request();
  }
}

// ========== UNIFIED API CLIENT (SRP + DIP) ==========

/**
 * Unified API client that consolidates all HTTP request patterns
 * Implements Strategy pattern for optimization and wrapper functionality
 */
export class UnifiedApiClient {
  private client: AxiosInstance;
  private optimizationStrategy: OptimizationStrategy;
  private batchProcessors: Map<string, BatchProcessor<any, any>>;

  constructor(
    baseURL: string = API_BASE_URL,
    optimizationStrategy: OptimizationStrategy = new DefaultOptimizationStrategy()
  ) {
    this.client = this.createAxiosInstance(baseURL);
    this.optimizationStrategy = optimizationStrategy;
    this.batchProcessors = new Map();
  }

  /**
   * Create and configure axios instance with interceptors
   */
  private createAxiosInstance(baseURL: string): AxiosInstance {
    const instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
      timeout: 10000,
    });

    // Response interceptor for global error handling
    instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      error => {
        handleApiError(error);
        return Promise.reject(error);
      }
    );

    return instance;
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
      ...axiosConfig
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

      return response.data;
    } catch (error) {
      if (logRequest) {
        log(`${operation} failed:`, error);
      }

      handleApiError(error, errorMessage);
      throw error;
    }
  }

  // ========== BASIC HTTP METHODS ==========

  /**
   * GET request with optimization support
   */
  async get<T>(
    url: string,
    config: EnhancedRequestConfig = {}
  ): Promise<T> {
    const { optimization, ...axiosConfig } = config;
    
    const defaultOptimization: OptimizationConfig = {
      enableCache: false, // Disable default caching
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      enableDeduplication: false, // Disable default deduplication
      ...optimization,
    };

    return this.makeRequest(
      () => this.client.get<T>(url, axiosConfig),
      { 
        ...config,
        operation: config.operation || `fetch ${url}`,
        optimization: defaultOptimization,
      }
    );
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

    return this.makeRequest(
      () => this.client.post<T>(url, data, axiosConfig),
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

    return this.makeRequest(
      () => this.client.put<T>(url, data, axiosConfig),
      { 
        ...config,
        operation: config.operation || `update ${url}`,
        optimization: defaultOptimization,
      }
    );
  }

  /**
   * DELETE request with optimization support
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

    return this.makeRequest(
      () => this.client.delete<T>(url, axiosConfig),
      { 
        ...config,
        operation: config.operation || `delete ${url}`,
        optimization: defaultOptimization,
      }
    );
  }

  // ========== BATCH OPERATIONS ==========

  /**
   * Batch GET requests for multiple resources
   */
  async batchGet<T>(
    urls: string[],
    config: EnhancedRequestConfig = {},
    batchConfig: BatchRequestConfig = {}
  ): Promise<T[]> {
    const batchKey = `batch-get-${JSON.stringify(batchConfig)}`;
    
    if (!this.batchProcessors.has(batchKey)) {
      this.batchProcessors.set(
        batchKey,
        new BatchProcessor(
          async (urlsBatch: string[]) => {
            const promises = urlsBatch.map(url => this.get<T>(url, config));
            return Promise.all(promises);
          },
          batchConfig
        )
      );
    }

    const batchProcessor = this.batchProcessors.get(batchKey)!;
    const results: T[] = [];

    for (const url of urls) {
      const result = await batchProcessor.add(url);
      results.push(result);
    }

    return results;
  }

  /**
   * Batch POST requests for bulk operations
   */
  async batchPost<T>(
    requests: Array<{ url: string; data?: any }>,
    config: EnhancedRequestConfig = {},
    batchConfig: BatchRequestConfig = {}
  ): Promise<T[]> {
    const batchKey = `batch-post-${JSON.stringify(batchConfig)}`;
    
    if (!this.batchProcessors.has(batchKey)) {
      this.batchProcessors.set(
        batchKey,
        new BatchProcessor(
          async (requestsBatch: Array<{ url: string; data?: any }>) => {
            const promises = requestsBatch.map(req => 
              this.post<T>(req.url, req.data, config)
            );
            return Promise.all(promises);
          },
          batchConfig
        )
      );
    }

    const batchProcessor = this.batchProcessors.get(batchKey)!;
    const results: T[] = [];

    for (const request of requests) {
      const result = await batchProcessor.add(request);
      results.push(result);
    }

    return results;
  }

  // ========== SPECIALIZED WRAPPER METHODS (DRY) ==========

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

  // ========== UTILITY METHODS ==========

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

  // Batch operations
  batchGet: unifiedApiClient.batchGet.bind(unifiedApiClient),
  batchPost: unifiedApiClient.batchPost.bind(unifiedApiClient),

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