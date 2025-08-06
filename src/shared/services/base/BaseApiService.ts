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

import { IHttpClient } from './HttpClientInterface';
import { ErrorHandlingService } from './ErrorHandlingService';
import { EnhancedRequestConfig } from '../../api/unifiedApiClient';

/**
 * Abstract base API service
 * Provides common functionality and patterns for all API services
 */
export abstract class BaseApiService {
  protected httpClient: IHttpClient;
  protected serviceName: string;

  constructor(httpClient: IHttpClient, serviceName: string) {
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
  protected validateData(data: any, operation: string): void {
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
  ): Promise<T> {
    return this.executeWithErrorHandling(operation, async () => {
      const result = await this.httpClient.get<T>(url, config);
      return this.validateObjectResponse<T>(result, operation);
    });
  }

  /**
   * Common GET collection operation with validation
   */
  protected async getCollection<T>(
    url: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<T[]> {
    return this.executeWithErrorHandling(operation, async () => {
      const result = await this.httpClient.get<T[]>(url, config);
      return this.validateArrayResponse<T>(result, operation);
    });
  }

  /**
   * Common GET by ID operation with validation
   */
  protected async getResourceById<T>(
    basePath: string,
    id: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    this.validateId(id, operation);
    return this.executeWithErrorHandling(operation, async () => {
      const result = await this.httpClient.getById<T>(basePath, id, undefined, config);
      return this.validateObjectResponse<T>(result, operation, id);
    });
  }

  /**
   * Common CREATE operation with validation
   */
  protected async createResource<T extends { [key: string]: any }>(
    url: string,
    data: Partial<T>,
    operation: string,
    requiredField: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    this.validateData(data, operation);
    return this.executeWithErrorHandling(operation, async () => {
      const result = await this.httpClient.post<T>(url, data, config);
      return this.validateCreatedResponse<T>(result, operation, requiredField, data);
    });
  }

  /**
   * Common UPDATE operation with validation
   */
  protected async updateResource<T>(
    basePath: string,
    id: string,
    data: Partial<T>,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    this.validateId(id, operation);
    this.validateData(data, operation);
    return this.executeWithErrorHandling(operation, async () => {
      const result = await this.httpClient.putById<T>(basePath, id, data, undefined, config);
      return this.validateObjectResponse<T>(result, operation, id);
    });
  }

  /**
   * Common DELETE operation
   */
  protected async deleteResource(
    basePath: string,
    id: string,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<void> {
    this.validateId(id, operation);
    return this.executeWithErrorHandling(operation, async () => {
      await this.httpClient.deleteById(basePath, id, undefined, config);
    });
  }

  /**
   * Common mark as sold operation with validation
   */
  protected async markResourceSold<T extends { sold?: boolean }>(
    basePath: string,
    id: string,
    saleDetails: any,
    operation: string,
    config?: EnhancedRequestConfig
  ): Promise<T> {
    this.validateId(id, operation);
    this.validateData(saleDetails, operation);
    return this.executeWithErrorHandling(operation, async () => {
      const result = await this.httpClient.postById<T>(
        basePath,
        id,
        saleDetails,
        'sold',
        config
      );
      return this.validateSoldResponse<T>(result, operation, id, saleDetails);
    });
  }
}