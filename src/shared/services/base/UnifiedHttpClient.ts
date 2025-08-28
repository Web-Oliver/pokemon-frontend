/**
 * DEPRECATED: UnifiedHttpClient wrapper layer removed in Phase 2C
 * 
 * This wrapper was redundant - it just forwarded all calls to unifiedApiClient.
 * Use unifiedApiClient directly instead.
 * 
 * Consolidation rationale:
 * - Eliminates unnecessary abstraction layer (YAGNI principle)
 * - Reduces complexity from 3 HTTP clients to 1 primary client
 * - Maintains same interface through direct unifiedApiClient usage
 */

import { EnhancedRequestConfig, unifiedApiClient } from '../../api/unifiedApiClient';
import { IHttpClient } from './HttpClientInterface';

/**
 * @deprecated Use unifiedApiClient directly instead of this wrapper
 * This class will be removed in a future version
 */
export class UnifiedHttpClient implements IHttpClient {
  async get<T>(url: string, config?: EnhancedRequestConfig): Promise<T> {
    console.warn('[DEPRECATED] UnifiedHttpClient wrapper used. Use unifiedApiClient directly.');
    return unifiedApiClient.get<T>(url, config);
  }

  async post<T>(
    url: string,
    data?: any,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    console.warn('[DEPRECATED] UnifiedHttpClient wrapper used. Use unifiedApiClient directly.');
    return unifiedApiClient.post<T>(url, data, config);
  }

  async put<T>(
    url: string,
    data?: any,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    console.warn('[DEPRECATED] UnifiedHttpClient wrapper used. Use unifiedApiClient directly.');
    return unifiedApiClient.put<T>(url, data, config);
  }

  async delete<T = void>(
    url: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    console.warn('[DEPRECATED] UnifiedHttpClient wrapper used. Use unifiedApiClient directly.');
    return unifiedApiClient.delete<T>(url, config);
  }

  async getById<T>(
    basePath: string,
    id: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    console.warn('[DEPRECATED] UnifiedHttpClient wrapper used. Use unifiedApiClient directly.');
    return unifiedApiClient.getById<T>(basePath, id, subPath, config);
  }

  async putById<T>(
    basePath: string,
    id: any,
    data: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    console.warn('[DEPRECATED] UnifiedHttpClient wrapper used. Use unifiedApiClient directly.');
    return unifiedApiClient.putById<T>(basePath, id, data, subPath, config);
  }

  async postById<T>(
    basePath: string,
    id: any,
    data: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    console.warn('[DEPRECATED] UnifiedHttpClient wrapper used. Use unifiedApiClient directly.');
    return unifiedApiClient.postById<T>(basePath, id, data, subPath, config);
  }

  async deleteById<T = void>(
    basePath: string,
    id: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    console.warn('[DEPRECATED] UnifiedHttpClient wrapper used. Use unifiedApiClient directly.');
    return unifiedApiClient.deleteById<T>(basePath, id, subPath, config);
  }

  getAxiosInstance() {
    console.warn('[DEPRECATED] UnifiedHttpClient wrapper used. Use unifiedApiClient directly.');
    return unifiedApiClient.getAxiosInstance();
  }

  getConfig() {
    console.warn('[DEPRECATED] UnifiedHttpClient wrapper used. Use unifiedApiClient directly.');
    return unifiedApiClient.getConfig();
  }
}

// Export singleton instance with deprecation warning
export const unifiedHttpClient = new UnifiedHttpClient();