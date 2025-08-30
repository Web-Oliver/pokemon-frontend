/**
 * Generic API Client - SOLID Architecture
 * Single Responsibility: HTTP request/response handling with error management
 * Open/Closed: Extensible via interceptors without modifying core logic  
 * Liskov Substitution: ApiClient can be substituted anywhere IApiClient is expected
 * Interface Segregation: Clean interfaces, no forced dependencies
 * Dependency Inversion: Depends on abstractions (interfaces), not concrete implementations
 * DRY: Centralized request logic eliminates duplication
 */

import { apiDebugger } from '@/shared/utils/debug.js';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    processingTime?: number;
  };
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: any,
    public readonly requestConfig?: RequestConfig
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, requestConfig?: RequestConfig) {
    super(message, undefined, undefined, requestConfig);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(timeout: number, requestConfig?: RequestConfig) {
    super(`Request timed out after ${timeout}ms`, 408, undefined, requestConfig);
    this.name = 'TimeoutError';
  }
}

export class ApiClient {
  private readonly _baseUrl: string;
  private readonly defaultConfig: RequestConfig;
  private readonly requestInterceptors: Array<(config: RequestConfig) => RequestConfig | Promise<RequestConfig>> = [];
  private readonly responseInterceptors: Array<(response: ApiResponse) => ApiResponse | Promise<ApiResponse>> = [];

  get baseUrl(): string {
    return this._baseUrl;
  }

  constructor(
    baseUrl: string = '',
    defaultConfig: RequestConfig = {}
  ) {
    this._baseUrl = baseUrl;
    this.defaultConfig = {
      timeout: 30000,
      retries: 2,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json'
      },
      ...defaultConfig
    };
  }

  addRequestInterceptor(
    interceptor: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  ): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(
    interceptor: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>
  ): void {
    this.responseInterceptors.push(interceptor);
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const fullUrl = this.buildUrl(url);
    const requestConfig = await this.prepareConfig(config);
    const startTime = Date.now();
    
    let lastError: Error | null = null;
    const maxRetries = requestConfig.retries || 0;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.executeRequest<T>(
          method,
          fullUrl,
          data,
          requestConfig
        );
        
        const processingTime = Date.now() - startTime;
        const enhancedResponse = {
          ...response,
          meta: {
            ...response.meta,
            timestamp: new Date().toISOString(),
            processingTime
          }
        };
        
        return await this.processResponse(enhancedResponse);
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // SOLID Debugging: Centralized error logging  
        apiDebugger.logError(lastError, { method, url, attempt });
        
        // Don't retry on certain error types
        if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
          break;
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // SOLID Debugging: Retry logging
        const retryDelay = requestConfig.retryDelay || 0;
        if (retryDelay > 0) {
          apiDebugger.logRetry(attempt + 1, maxRetries, retryDelay);
          await this.delay(retryDelay * (attempt + 1));
        }
      }
    }
    
    throw lastError || new ApiError('Request failed after retries');
  }

  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeout = config?.timeout || this.defaultConfig.timeout;
    
    // SOLID Debugging: Single responsibility for logging
    apiDebugger.logRequest(method, url, data, config?.headers);
    
    // Set up timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
    
    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          ...this.defaultConfig.headers,
          ...config?.headers
        },
        signal: controller.signal
      };
      
      if (data && method !== 'GET') {
        if (data instanceof FormData) {
          fetchOptions.body = data;
          // Remove Content-Type header for FormData - browser will set it with boundary
          const headers = { ...fetchOptions.headers };
          delete (headers as any)['Content-Type'];
          fetchOptions.headers = headers;
        } else {
          fetchOptions.body = JSON.stringify(data);
        }
      }
      
      const startTime = Date.now();
      const response = await fetch(url, fetchOptions);
      const responseTime = Date.now() - startTime;
      clearTimeout(timeoutId);
      
      // SOLID Debugging: Centralized response logging
      apiDebugger.logResponse(response.status, response.ok, response.headers, responseTime);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        // Handle structured error responses
        let errorMessage;
        if (errorData.error && typeof errorData.error === 'object') {
          if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error.details && Array.isArray(errorData.error.details)) {
            errorMessage = errorData.error.details.join(', ');
          } else {
            errorMessage = JSON.stringify(errorData.error);
          }
        } else {
          errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new ApiError(
          errorMessage,
          response.status,
          errorData,
          config
        );
      }
      
      const responseData = await response.json();
      return responseData;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(timeout!, config);
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError(`Network error: ${error.message}`, config);
      }
      
      throw new ApiError(
        `Request failed: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        undefined,
        config
      );
    }
  }

  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    const base = this._baseUrl.endsWith('/') ? this._baseUrl.slice(0, -1) : this._baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${base}${cleanPath}`;
  }

  private async prepareConfig(config?: RequestConfig): Promise<RequestConfig> {
    let mergedConfig = {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...this.defaultConfig.headers,
        ...config?.headers
      }
    };
    
    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      mergedConfig = await interceptor(mergedConfig);
    }
    
    return mergedConfig;
  }

  private async processResponse<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let processedResponse = response;
    
    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse);
    }
    
    return processedResponse;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Default instance
export const defaultApiClient = new ApiClient(import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

// Add common interceptors
defaultApiClient.addRequestInterceptor((config) => {
  // Add authentication headers if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  return config;
});

defaultApiClient.addResponseInterceptor((response) => {
  // Log errors in development
  if (!response.success && import.meta.env.DEV) {
    console.error('API Error:', response.error);
  }
  return response;
});
