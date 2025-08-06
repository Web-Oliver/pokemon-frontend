/**
 * Unified HTTP Client Implementation
 * Layer 1: Core/Foundation/API Client
 *
 * Concrete implementation of HTTP client interface
 * Wraps existing unifiedApiClient to provide abstraction layer
 *
 * SOLID Principles:
 * - SRP: Single responsibility for HTTP operations
 * - DIP: Implements abstraction interface
 * - LSP: Substitutable HTTP client implementation
 */

import {
  unifiedApiClient,
  EnhancedRequestConfig,
} from '../../api/unifiedApiClient';
import { IHttpClient } from './HttpClientInterface';

/**
 * Unified HTTP client implementation
 * Wraps existing unifiedApiClient with interface abstraction
 */
export class UnifiedHttpClient implements IHttpClient {
  /**
   * GET request
   */
  async get<T>(url: string, config?: EnhancedRequestConfig): Promise<T> {
    return unifiedApiClient.get<T>(url, config);
  }

  /**
   * POST request
   */
  async post<T>(
    url: string,
    data?: any,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    return unifiedApiClient.post<T>(url, data, config);
  }

  /**
   * PUT request
   */
  async put<T>(
    url: string,
    data?: any,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    return unifiedApiClient.put<T>(url, data, config);
  }

  /**
   * DELETE request
   */
  async delete<T = void>(
    url: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    return unifiedApiClient.delete<T>(url, config);
  }

  /**
   * GET by ID with validation
   */
  async getById<T>(
    basePath: string,
    id: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    return unifiedApiClient.getById<T>(basePath, id, subPath, config);
  }

  /**
   * PUT by ID with validation
   */
  async putById<T>(
    basePath: string,
    id: any,
    data: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    return unifiedApiClient.putById<T>(basePath, id, data, subPath, config);
  }

  /**
   * POST by ID with validation
   */
  async postById<T>(
    basePath: string,
    id: any,
    data: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    return unifiedApiClient.postById<T>(basePath, id, data, subPath, config);
  }

  /**
   * DELETE by ID with validation
   */
  async deleteById<T = void>(
    basePath: string,
    id: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    return unifiedApiClient.deleteById<T>(basePath, id, subPath, config);
  }
}

// Export singleton instance
export const unifiedHttpClient = new UnifiedHttpClient();
