/**
 * Unified Response Transformation System
 * Single source of truth for ALL API response transformations
 * 
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for response transformation
 * - DRY: Eliminates duplicate transformation logic across API files
 * - OCP: Open for extension via configuration
 * - DIP: Abstract transformation interface for different API patterns
 */

import { 
  transformApiResponse, 
  extractResponseData,
  mapMongoIds,
  ResponseTransformers,
  APIResponse 
} from './responseTransformer';

// ================================
// TRANSFORMATION STRATEGIES
// ================================

/**
 * Transformation strategy interface
 * Allows different transformation approaches while maintaining consistency
 */
export interface TransformationStrategy<T> {
  transform(responseData: any): T;
  name: string;
  description: string;
}

/**
 * Standard backend API transformation strategy
 * For new backend format with {success, status, data, meta}
 */
export class StandardApiStrategy<T> implements TransformationStrategy<T> {
  name = 'standard-api';
  description = 'Standard backend API format with comprehensive transformations';

  transform(responseData: any): T {
    return transformApiResponse<T>(responseData);
  }
}

/**
 * Legacy direct response strategy
 * For APIs that return data directly without wrapper
 */
export class DirectResponseStrategy<T> implements TransformationStrategy<T> {
  name = 'direct-response';
  description = 'Direct response data with ID mapping only';

  transform(responseData: any): T {
    // Apply basic MongoDB ID mapping
    return mapMongoIds<T>(responseData);
  }
}

/**
 * Search API strategy
 * For search endpoints that return {success, query, count, data}
 */
export class SearchApiStrategy<T> implements TransformationStrategy<T> {
  name = 'search-api';
  description = 'Search API format with query metadata';

  transform(responseData: any): T {
    if (responseData && typeof responseData === 'object' && 'data' in responseData) {
      // Extract data and apply ID mapping
      const extractedData = responseData.data;
      const transformedData = mapMongoIds(extractedData);
      
      // Return the full search response structure
      return {
        ...responseData,
        data: transformedData
      } as T;
    }
    
    // If not in expected format, apply basic ID mapping
    return mapMongoIds<T>(responseData);
  }
}

/**
 * Raw response strategy
 * For responses that need no transformation
 */
export class RawResponseStrategy<T> implements TransformationStrategy<T> {
  name = 'raw-response';
  description = 'No transformation applied';

  transform(responseData: any): T {
    return responseData as T;
  }
}

// ================================
// UNIFIED TRANSFORMER
// ================================

/**
 * Unified Response Transformer
 * Single entry point for all response transformations
 */
export class UnifiedResponseTransformer {
  private static instance: UnifiedResponseTransformer;
  private strategies = new Map<string, TransformationStrategy<any>>();

  private constructor() {
    // Register default strategies
    this.registerStrategy(new StandardApiStrategy());
    this.registerStrategy(new DirectResponseStrategy());
    this.registerStrategy(new SearchApiStrategy());
    this.registerStrategy(new RawResponseStrategy());
  }

  static getInstance(): UnifiedResponseTransformer {
    if (!UnifiedResponseTransformer.instance) {
      UnifiedResponseTransformer.instance = new UnifiedResponseTransformer();
    }
    return UnifiedResponseTransformer.instance;
  }

  /**
   * Register a transformation strategy
   */
  registerStrategy<T>(strategy: TransformationStrategy<T>): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * Get available transformation strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Transform response using specified strategy
   */
  transform<T>(responseData: any, strategyName: string): T {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) {
      throw new Error(`Unknown transformation strategy: ${strategyName}`);
    }

    try {
      return strategy.transform(responseData);
    } catch (error) {
      console.error(`Transformation failed with strategy ${strategyName}:`, error);
      throw new Error(`Transformation failed: ${error.message}`);
    }
  }

  /**
   * Auto-detect transformation strategy based on response structure
   */
  autoTransform<T>(responseData: any): T {
    if (!responseData) {
      return responseData as T;
    }

    // Check for standard backend API format
    if (typeof responseData === 'object' && 'success' in responseData && 'data' in responseData) {
      // Check if it has meta object (backend API format)
      if ('meta' in responseData) {
        return this.transform<T>(responseData, 'standard-api');
      }
      
      // Check if it has query field (search API format)
      if ('query' in responseData && 'count' in responseData) {
        return this.transform<T>(responseData, 'search-api');
      }
    }

    // Default to direct response with ID mapping
    return this.transform<T>(responseData, 'direct-response');
  }
}

// ================================
// CONVENIENCE FUNCTIONS
// ================================

/**
 * Get the singleton transformer instance
 */
export const getTransformer = () => UnifiedResponseTransformer.getInstance();

/**
 * Transform response with auto-detection
 */
export const transformResponse = <T>(responseData: any): T => {
  return getTransformer().autoTransform<T>(responseData);
};

/**
 * Transform response with specific strategy
 */
export const transformWithStrategy = <T>(responseData: any, strategy: string): T => {
  return getTransformer().transform<T>(responseData, strategy);
};

// ================================
// STRATEGY-SPECIFIC TRANSFORMERS
// ================================

/**
 * Standard API transformers for common use cases
 */
export const ApiTransformers = {
  /**
   * For new backend API format
   */
  standard: <T>(data: any): T => transformWithStrategy<T>(data, 'standard-api'),

  /**
   * For search API responses
   */
  search: <T>(data: any): T => transformWithStrategy<T>(data, 'search-api'),

  /**
   * For direct responses with basic ID mapping
   */
  direct: <T>(data: any): T => transformWithStrategy<T>(data, 'direct-response'),

  /**
   * For raw responses (no transformation)
   */
  raw: <T>(data: any): T => transformWithStrategy<T>(data, 'raw-response'),

  /**
   * Auto-detect and transform
   */
  auto: <T>(data: any): T => transformResponse<T>(data),
} as const;

// ================================
// MIGRATION HELPERS
// ================================

/**
 * Migration helper to gradually replace existing transformations
 */
export const migrateTransformation = {
  /**
   * Replace manual ID mapping with unified system
   */
  fromManualIdMapping: <T>(data: any): T => ApiTransformers.direct<T>(data),

  /**
   * Replace ResponseTransformers usage
   */
  fromResponseTransformers: <T>(data: any, transformerType: keyof typeof ResponseTransformers): T => {
    switch (transformerType) {
      case 'standard':
      case 'enhanced':
        return ApiTransformers.standard<T>(data);
      case 'noIdMapping':
        return ApiTransformers.raw<T>(data);
      case 'extractOnly':
        return extractResponseData<T>(data);
      case 'raw':
        return ApiTransformers.raw<T>(data);
      default:
        return ApiTransformers.auto<T>(data);
    }
  },
} as const;

export default {
  UnifiedResponseTransformer,
  getTransformer,
  transformResponse,
  transformWithStrategy,
  ApiTransformers,
  migrateTransformation,
};