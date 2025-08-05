/**
 * Error Handling Service
 * Layer 1: Core/Foundation/API Client
 * 
 * Centralized error handling and validation service
 * Eliminates duplicated error logic across services
 * 
 * SOLID Principles:
 * - SRP: Single responsibility for error handling and validation
 * - DRY: Eliminates duplicate validation and error patterns
 * - OCP: Open for extension with new validation types
 */

import { handleApiError } from '../../utils/errorHandler';
import { log } from '../../utils/logger';

/**
 * Centralized error handling service
 * Extracts common validation and error handling patterns from services
 */
export class ErrorHandlingService {
  /**
   * Validate ID parameter to prevent service errors
   */
  static validateId(id: string, operation: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      const error = new Error(`Invalid ID provided for ${operation}: ${id}`);
      log(`[ERROR HANDLING] ID validation failed for ${operation}`, {
        id,
        operation,
      });
      throw error;
    }
  }

  /**
   * Validate data object for create/update operations
   */
  static validateData(data: any, operation: string): void {
    if (!data || typeof data !== 'object') {
      const error = new Error(`Invalid data provided for ${operation}`);
      log(`[ERROR HANDLING] Data validation failed for ${operation}`, {
        data,
        operation,
      });
      throw error;
    }
  }

  /**
   * Standard error handling wrapper for service methods
   * Eliminates duplicate error handling code across services
   */
  static async executeWithErrorHandling<T>(
    operation: string,
    apiCall: () => Promise<T>,
    serviceName: string = 'API SERVICE'
  ): Promise<T> {
    try {
      log(`[${serviceName}] Executing ${operation}`);
      const result = await apiCall();
      log(`[${serviceName}] Successfully completed ${operation}`);
      return result;
    } catch (error) {
      log(`[${serviceName}] Error in ${operation}`, { error });
      handleApiError(error, `${serviceName} ${operation} failed`);
      throw error; // Re-throw after logging
    }
  }

  /**
   * Validate array response format
   */
  static validateArrayResponse<T>(
    result: any,
    operation: string,
    serviceName: string = 'API SERVICE'
  ): T[] {
    if (!Array.isArray(result)) {
      log(`[${serviceName}] ${operation} returned non-array result`, { result });
      throw new Error(`Invalid response format: expected array for ${operation}`);
    }
    return result;
  }

  /**
   * Validate object response format
   */
  static validateObjectResponse<T>(
    result: any,
    operation: string,
    id?: string,
    serviceName: string = 'API SERVICE'
  ): T {
    if (!result || typeof result !== 'object') {
      log(`[${serviceName}] ${operation} returned invalid result`, {
        id,
        result,
      });
      throw new Error(
        `${operation} failed: ${id ? `resource not found or invalid format: ${id}` : 'invalid response format'}`
      );
    }
    return result;
  }

  /**
   * Validate created resource response
   */
  static validateCreatedResponse<T extends { [key: string]: any }>(
    result: any,
    operation: string,
    requiredField: string,
    data?: any,
    serviceName: string = 'API SERVICE'
  ): T {
    if (!result || typeof result !== 'object' || !result[requiredField]) {
      log(`[${serviceName}] ${operation} returned invalid result`, {
        data,
        result,
      });
      throw new Error(
        `Failed to ${operation}: invalid response format or missing ${requiredField} reference`
      );
    }
    return result;
  }

  /**
   * Validate sold status response
   */
  static validateSoldResponse<T extends { sold?: boolean }>(
    result: any,
    operation: string,
    id: string,
    saleDetails?: any,
    serviceName: string = 'API SERVICE'
  ): T {
    if (!result || typeof result !== 'object' || !result.sold) {
      log(`[${serviceName}] ${operation} returned invalid result`, {
        id,
        saleDetails,
        result,
      });
      throw new Error(`Failed to ${operation}: ${id}`);
    }
    return result;
  }
}