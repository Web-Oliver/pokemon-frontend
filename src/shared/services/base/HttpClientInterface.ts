/**
 * HTTP Client Interface
 * Layer 1: Core/Foundation/API Client
 * 
 * Abstract interface for HTTP operations following DIP principle
 * Enables dependency injection and testability
 * 
 * SOLID Principles:
 * - SRP: Single responsibility for HTTP abstraction
 * - DIP: Services depend on this abstraction, not concrete implementations
 * - ISP: Interface segregation for specific HTTP needs
 */

import { EnhancedRequestConfig } from '../../api/unifiedApiClient';

/**
 * Abstract HTTP client interface
 * Provides common HTTP operations without exposing underlying implementation
 */
export interface IHttpClient {
  /**
   * GET request
   */
  get<T>(url: string, config?: EnhancedRequestConfig): Promise<T>;

  /**
   * POST request
   */
  post<T>(url: string, data?: any, config?: EnhancedRequestConfig): Promise<T>;

  /**
   * PUT request
   */
  put<T>(url: string, data?: any, config?: EnhancedRequestConfig): Promise<T>;

  /**
   * DELETE request
   */
  delete<T = void>(url: string, config?: EnhancedRequestConfig): Promise<T>;

  /**
   * GET by ID with validation
   */
  getById<T>(
    basePath: string,
    id: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T>;

  /**
   * PUT by ID with validation
   */
  putById<T>(
    basePath: string,
    id: any,
    data: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T>;

  /**
   * POST by ID with validation
   */
  postById<T>(
    basePath: string,
    id: any,
    data: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T>;

  /**
   * DELETE by ID with validation
   */
  deleteById<T = void>(
    basePath: string,
    id: any,
    subPath?: string,
    config?: EnhancedRequestConfig
  ): Promise<T>;
}