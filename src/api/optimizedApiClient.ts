/**
 * Optimized API Client
 * Layer 1: Core/Foundation (CLAUDE.md Architecture)
 *
 * Following Context7 + CLAUDE.md principles:
 * - Enhanced apiClient with built-in optimizations
 * - Request deduplication and caching capabilities
 * - Batch operations support
 * - Performance monitoring integration
 */

import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import apiClient from './apiClient';
import { optimizedApiRequest, BatchProcessor } from '../utils/apiOptimization';

/**
 * Optimized API request configuration
 */
interface OptimizedRequestConfig extends AxiosRequestConfig {
  optimization?: {
    enableCache?: boolean;
    cacheTTL?: number;
    enableDeduplication?: boolean;
  };
}

/**
 * Enhanced API client with optimization features
 */
class OptimizedApiClient {
  private client: AxiosInstance;
  private batchProcessors: Map<string, BatchProcessor<any, any>>;

  constructor(axiosInstance: AxiosInstance) {
    this.client = axiosInstance;
    this.batchProcessors = new Map();
  }

  /**
   * Optimized GET request with caching and deduplication
   */
  async get<T>(
    url: string,
    config: OptimizedRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const { optimization, ...axiosConfig } = config;
    
    return optimizedApiRequest(
      () => this.client.get<T>(url, axiosConfig),
      { method: 'GET', url, ...axiosConfig },
      {
        enableCache: true, // Enable caching for GET requests by default
        cacheTTL: 5 * 60 * 1000, // 5 minutes
        enableDeduplication: true,
        ...optimization,
      }
    );
  }

  /**
   * Optimized POST request with deduplication
   */
  async post<T>(
    url: string,
    data?: any,
    config: OptimizedRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const { optimization, ...axiosConfig } = config;
    
    return optimizedApiRequest(
      () => this.client.post<T>(url, data, axiosConfig),
      { method: 'POST', url, data, ...axiosConfig },
      {
        enableCache: false, // Don't cache POST requests by default
        enableDeduplication: true,
        ...optimization,
      }
    );
  }

  /**
   * Optimized PUT request with deduplication
   */
  async put<T>(
    url: string,
    data?: any,
    config: OptimizedRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const { optimization, ...axiosConfig } = config;
    
    return optimizedApiRequest(
      () => this.client.put<T>(url, data, axiosConfig),
      { method: 'PUT', url, data, ...axiosConfig },
      {
        enableCache: false,
        enableDeduplication: true,
        ...optimization,
      }
    );
  }

  /**
   * Optimized DELETE request with deduplication
   */
  async delete<T>(
    url: string,
    config: OptimizedRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const { optimization, ...axiosConfig } = config;
    
    return optimizedApiRequest(
      () => this.client.delete<T>(url, axiosConfig),
      { method: 'DELETE', url, ...axiosConfig },
      {
        enableCache: false,
        enableDeduplication: true,
        ...optimization,
      }
    );
  }

  /**
   * Batch GET requests for multiple resources
   */
  async batchGet<T>(
    urls: string[],
    config: OptimizedRequestConfig = {},
    batchOptions: {
      batchSize?: number;
      batchDelay?: number;
    } = {}
  ): Promise<AxiosResponse<T>[]> {
    const batchKey = `batch-get-${JSON.stringify(batchOptions)}`;
    
    if (!this.batchProcessors.has(batchKey)) {
      this.batchProcessors.set(
        batchKey,
        new BatchProcessor(
          async (urlsBatch: string[]) => {
            const promises = urlsBatch.map(url => this.get<T>(url, config));
            return Promise.all(promises);
          },
          batchOptions
        )
      );
    }

    const batchProcessor = this.batchProcessors.get(batchKey)!;
    const results: AxiosResponse<T>[] = [];

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
    config: OptimizedRequestConfig = {},
    batchOptions: {
      batchSize?: number;
      batchDelay?: number;
    } = {}
  ): Promise<AxiosResponse<T>[]> {
    const batchKey = `batch-post-${JSON.stringify(batchOptions)}`;
    
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
          batchOptions
        )
      );
    }

    const batchProcessor = this.batchProcessors.get(batchKey)!;
    const results: AxiosResponse<T>[] = [];

    for (const request of requests) {
      const result = await batchProcessor.add(request);
      results.push(result);
    }

    return results;
  }

  /**
   * Prefetch data for predictive loading
   */
  async prefetch<T>(
    url: string,
    config: OptimizedRequestConfig = {}
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
      });
    } catch (error) {
      // Prefetch errors should be silent to not affect main functionality
      console.warn('[OptimizedApiClient] Prefetch failed:', error);
    }
  }

  /**
   * Get the underlying axios instance for direct access if needed
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Create and export the optimized API client instance
export const optimizedApiClient = new OptimizedApiClient(apiClient);

// Export the class for custom instances
export { OptimizedApiClient };

// Export convenience methods that match the original apiClient interface
export default {
  get: optimizedApiClient.get.bind(optimizedApiClient),
  post: optimizedApiClient.post.bind(optimizedApiClient),
  put: optimizedApiClient.put.bind(optimizedApiClient),
  delete: optimizedApiClient.delete.bind(optimizedApiClient),
  batchGet: optimizedApiClient.batchGet.bind(optimizedApiClient),
  batchPost: optimizedApiClient.batchPost.bind(optimizedApiClient),
  prefetch: optimizedApiClient.prefetch.bind(optimizedApiClient),
};