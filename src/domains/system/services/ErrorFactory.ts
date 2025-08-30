/**
 * Error Factory - Context-aware error creation matching backend patterns
 * Provides centralized error creation with domain-specific context
 */

import { 
  ERROR_TYPES, 
  ErrorType, 
  PokemonCollectionError, 
  ErrorCategories,
  type ErrorCategory 
} from '@/types/ErrorTypes';

export class ErrorFactory {
  // Create error from error type with context
  static createError(
    errorType: ErrorType,
    context?: Record<string, any>,
    originalError?: Error
  ): PokemonCollectionError {
    return new PokemonCollectionError(errorType, context, originalError);
  }

  // Create error by code
  static createErrorByCode(
    code: string,
    context?: Record<string, any>,
    originalError?: Error
  ): PokemonCollectionError {
    const errorType = ERROR_TYPES[code];
    if (!errorType) {
      throw new Error(`Unknown error code: ${code}`);
    }
    return new PokemonCollectionError(errorType, context, originalError);
  }

  // Domain-specific error creators matching backend patterns

  // DBA/Marketplace errors
  static createDbaError(
    operation: string, 
    details?: any, 
    context?: Record<string, any>
  ): PokemonCollectionError {
    const errorCode = `DBA_${operation.toUpperCase()}`;
    const errorType = ERROR_TYPES[errorCode] || ERROR_TYPES.EXTERNAL_API_ERROR;
    
    return new PokemonCollectionError(errorType, {
      operation,
      details,
      domain: 'marketplace',
      ...context
    });
  }

  // OCR/ICR processing errors
  static createOcrError(
    operation: string,
    details?: any,
    context?: Record<string, any>
  ): PokemonCollectionError {
    const errorCode = `OCR_${operation.toUpperCase()}`;
    const errorType = ERROR_TYPES[errorCode] || ERROR_TYPES.OCR_PROCESSING_TIMEOUT;
    
    return new PokemonCollectionError(errorType, {
      operation,
      details,
      domain: 'icr',
      ...context
    });
  }

  // Database/Collection errors
  static createDatabaseError(
    operation: string,
    entity?: string,
    context?: Record<string, any>
  ): PokemonCollectionError {
    let errorType = ERROR_TYPES.DATABASE_CONNECTION_FAILED;
    
    if (operation === 'NOT_FOUND') {
      errorType = ERROR_TYPES.ENTITY_NOT_FOUND;
    }
    
    return new PokemonCollectionError(errorType, {
      operation,
      entity,
      domain: 'collection',
      ...context
    });
  }

  // Network/API errors
  static createNetworkError(
    endpoint: string,
    method: string,
    statusCode?: number,
    context?: Record<string, any>
  ): PokemonCollectionError {
    let errorType = ERROR_TYPES.NETWORK_TIMEOUT;
    
    if (statusCode === 401) {
      errorType = ERROR_TYPES.UNAUTHORIZED;
    } else if (statusCode === 403) {
      errorType = ERROR_TYPES.FORBIDDEN;
    } else if (statusCode === 404) {
      errorType = ERROR_TYPES.ENTITY_NOT_FOUND;
    } else if (statusCode && statusCode >= 500) {
      errorType = ERROR_TYPES.EXTERNAL_API_ERROR;
    }
    
    return new PokemonCollectionError(errorType, {
      endpoint,
      method,
      statusCode,
      domain: 'network',
      ...context
    });
  }

  // Validation errors
  static createValidationError(
    field: string,
    value: any,
    rule: string,
    context?: Record<string, any>
  ): PokemonCollectionError {
    return new PokemonCollectionError(ERROR_TYPES.INVALID_PAGINATION, {
      field,
      value,
      rule,
      domain: 'validation',
      ...context
    });
  }

  // Search errors
  static createSearchError(
    query: string,
    searchType: string,
    context?: Record<string, any>
  ): PokemonCollectionError {
    return new PokemonCollectionError(ERROR_TYPES.SYSTEM_ERROR, {
      query,
      searchType,
      domain: 'search',
      message: 'Search operation failed',
      ...context
    });
  }

  // Authentication errors
  static createAuthError(
    operation: string,
    context?: Record<string, any>
  ): PokemonCollectionError {
    const errorType = operation === 'UNAUTHORIZED' 
      ? ERROR_TYPES.UNAUTHORIZED 
      : ERROR_TYPES.FORBIDDEN;
      
    return new PokemonCollectionError(errorType, {
      operation,
      domain: 'auth',
      ...context
    });
  }

  // Convert HTTP error to PokemonCollectionError
  static fromHttpError(
    error: unknown,
    context?: Record<string, any>
  ): PokemonCollectionError {
    // Handle Axios errors
    if (error.response) {
      return this.createNetworkError(
        error.config?.url || 'unknown',
        error.config?.method || 'unknown',
        error.response.status,
        {
          responseData: error.response.data,
          ...context
        }
      );
    }

    // Handle network errors
    if (error.request) {
      return new PokemonCollectionError(ERROR_TYPES.NETWORK_TIMEOUT, {
        request: error.request,
        ...context
      });
    }

    // Handle other errors
    return new PokemonCollectionError(ERROR_TYPES.SYSTEM_ERROR, {
      originalMessage: error.message,
      ...context
    }, error);
  }

  // Batch error creation for multiple errors
  static createBatchError(
    errors: Error[],
    operation: string,
    context?: Record<string, any>
  ): PokemonCollectionError {
    return new PokemonCollectionError(ERROR_TYPES.SYSTEM_ERROR, {
      operation,
      errorCount: errors.length,
      errors: errors.map(e => ({
        message: e.message,
        stack: e.stack
      })),
      ...context
    });
  }

  // Get error severity for UI handling
  static getErrorSeverityStyle(error: PokemonCollectionError): {
    color: string;
    bgColor: string;
    borderColor: string;
  } {
    switch (error.severity) {
      case 'critical':
        return {
          color: 'text-red-800',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'high':
        return {
          color: 'text-orange-800',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'medium':
        return {
          color: 'text-yellow-800',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'low':
        return {
          color: 'text-blue-800',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          color: 'text-gray-800',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  }
}