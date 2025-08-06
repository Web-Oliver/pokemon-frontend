/**
 * Base API Service
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * 
 * Abstract base class providing common functionality for all API services
 * Implements SOLID principles with dependency injection and error handling
 * 
 * SOLID Principles:
 * - SRP: Single responsibility for common API service functionality
 * - DIP: Depends on HTTP client abstraction, not concrete implementation
 * - OCP: Open for extension by concrete service implementations
 * - DRY: Eliminates duplicate service patterns
 */

import { ITypeSafeHttpClient } from '../../api/TypeSafeApiClient';
import { ErrorHandlingService } from './ErrorHandlingService';
import { EnhancedRequestConfig } from '../../api/unifiedApiClient';
import {
  ApiSuccessResponse,
  ResourceResponse,
  CollectionResponse,
} from '../../types/api/ApiResponse';

/**
 * Abstract base API service
 * Provides common functionality and patterns for all API services
 */
export abstract class BaseApiService {
  protected httpClient: ITypeSafeHttpClient;
  protected serviceName: string;

  constructor(httpClient: ITypeSafeHttpClient, serviceName: string) {
    this.httpClient = httpClient;
    this.serviceName = serviceName;
  }

  /**
   * Validate ID parameter
   */
  protected validateId(id: string, operation: string): void {
    ErrorHandlingService.validateId(id, operation);
  }

  /**
   * Validate data object
   */
  protected validateData<T = unknown>(data: T, operation: string): void {
    ErrorHandlingService.validateData(data, operation);
  }

  /**
   * Execute API call with error handling
   */
  protected async executeWithErrorHandling<T>(
    operation: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    return ErrorHandlingService.executeWithErrorHandling(
      operation,
      apiCall,
      this.serviceName
    );
  }

  /**
   * Validate array response
   */
  protected validateArrayResponse<T>(result: any, operation: string): T[] {
    return ErrorHandlingService.validateArrayResponse<T>(
      result,
      operation,
      this.serviceName
    );
  }

  /**
   * Validate object response
   */
  protected validateObjectResponse<T>(
    result: any,
    operation: string,
    id?: string
  ): T {
    return ErrorHandlingService.validateObjectResponse<T>(
      result,
      operation,
      id,
      this.serviceName
    );
  }

  /**
   * Validate created resource response
   */
  protected validateCreatedResponse<T extends { [key: string]: any }>(
    result: any,
    operation: string,
    requiredField: string,
    data?: any
  ): T {
    return ErrorHandlingService.validateCreatedResponse<T>(
      result,
      operation,
      requiredField,
      data,
      this.serviceName
    );
  }

  /**
   * Validate sold status response
   */
  protected validateSoldResponse<T extends { sold?: boolean }>(
    result: any,
    operation: string,
    id: string,
    saleDetails?: any
  ): T {
    return ErrorHandlingService.validateSoldResponse<T>(
      result,
      operation,
      id,
      saleDetails,
      this.serviceName
    );
  }

  /**
   * Common GET operation with validation
   */
  protected async getResource<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<T>> {
    return await this.httpClient.getResource<T>(url, operation, config);
  }

  /**
   * Common GET collection operation with validation
   */
  protected async getCollection<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<CollectionResponse<T>> {
    return await this.httpClient.getCollection<T>(url, operation, config);
  }

  /**
   * Common GET by ID operation with validation
   */
  protected async getResourceById<T>(
    basePath: string,
    id: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<T>> {
    return await this.httpClient.getById<T>(basePath, id, operation, config);
  }

  /**
   * Common CREATE operation with validation
   */
  protected async createResource<TResponse, TRequest = Partial<TResponse>>(
    url: string,
    data: TRequest,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<TResponse>> {
    return await this.httpClient.post<TResponse, TRequest>(url, data, operation, config);
  }

  /**
   * Common UPDATE operation with validation
   */
  protected async updateResource<TResponse, TRequest = Partial<TResponse>>(
    basePath: string,
    id: string,
    data: TRequest,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<TResponse>> {
    return await this.httpClient.putById<TResponse, TRequest>(basePath, id, data, operation, config);
  }

  /**
   * Common DELETE operation
   */
  protected async deleteResource(
    basePath: string,
    id: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ApiSuccessResponse<void>> {
    return await this.httpClient.deleteById(basePath, id, operation, config);
  }

  /**
   * Common mark as sold operation with validation
   */
  protected async markResourceSold<TResponse extends { sold?: boolean }, TSaleDetails = unknown>(
    basePath: string,
    id: string,
    saleDetails: TSaleDetails,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<ResourceResponse<TResponse>> {
    return await this.httpClient.postById<TResponse, TSaleDetails>(
      basePath,
      id,
      saleDetails,
      'sold',
      operation,
      config
    );
  }
}