/**
 * Centralized Response Transformation Utility
 * Eliminates duplicate response transformation logic across API files
 *
 * Following CLAUDE.md DRY + SOLID principles:
 * - Single Responsibility: Only handles response transformation
 * - Open/Closed: Extensible through configuration
 * - DRY: Single source of truth for response transformation patterns
 * - Interface Segregation: Separate transformers for different response types
 */

/**
 * Standard API response wrapper format from backend
 */
export interface StandardApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

/**
 * MongoDB document interface for ID transformation
 */
interface _MongoDocument {
  _id?: string;
  id?: string;
  [key: string]: any;
}

/**
 * Configuration for response transformation
 */
interface TransformationConfig {
  extractData?: boolean;
  mapMongoIds?: boolean;
  skipMetadataObjects?: boolean;
  customTransformations?: Array<(data: any) => any>;
}

/**
 * Default transformation configuration
 */
const DEFAULT_CONFIG: TransformationConfig = {
  extractData: true,
  mapMongoIds: true,
  skipMetadataObjects: true,
  customTransformations: [],
};

/**
 * Metadata object keys that should be skipped during ID mapping
 * These objects contain properties/relationships, not entity data
 */
const METADATA_KEYS = [
  'saleDetails',
  'psaGrades',
  'psaTotalGradedForCard',
  'priceHistory',
  'metadata',
  'cardInfo',
  'productInfo',
  'setInfo',
  'buyerAddress',
  'sellerInfo',
  'paymentDetails',
] as const;

/**
 * Properties that indicate a metadata object
 * Objects containing these properties should not be ID-mapped
 */
const METADATA_PROPERTIES = [
  'paymentMethod',
  'deliveryMethod',
  'actualSoldPrice',
  'dateSold',
  'buyerFullName',
  'buyerEmail',
  'streetName',
  'postnr',
  'city',
  'grades', // PSA grade distribution
  'population', // Card population data
] as const;

/**
 * Extract data from wrapped API responses
 * Backend returns format: {success: true, count: number, data: Array}
 */
export const extractResponseData = <T>(responseData: any): T => {
  if (
    responseData &&
    typeof responseData === 'object' &&
    'data' in responseData
  ) {
    return responseData.data as T;
  }
  return responseData as T;
};

/**
 * Check if an object is a metadata object that shouldn't be ID-mapped
 */
export const isMetadataObject = (key: string, value: any): boolean => {
  // Check if key is in metadata keys list
  if (METADATA_KEYS.includes(key as any)) {
    return true;
  }

  // Check if object contains metadata properties
  if (typeof value === 'object' && value !== null) {
    const hasMetadataProps = METADATA_PROPERTIES.some((prop) => prop in value);
    if (hasMetadataProps) {
      return true;
    }
  }

  return false;
};

/**
 * Map MongoDB _id fields to id fields for frontend consistency
 * Recursively processes arrays and objects while preserving metadata
 */
export const mapMongoIds = <T>(data: T): T => {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => mapMongoIds(item)) as T;
  }

  if (typeof data === 'object') {
    const result = { ...data } as any;

    // Map _id to id if _id exists and id doesn't
    if ('_id' in result && !('id' in result)) {
      result.id = result._id;
    }

    // Recursively process non-metadata objects
    for (const [key, value] of Object.entries(result)) {
      if (!isMetadataObject(key, value)) {
        result[key] = mapMongoIds(value);
      }
    }

    return result as T;
  }

  return data;
};

/**
 * Transform API response using specified configuration
 */
export const transformResponse = <T>(
  responseData: any,
  config: Partial<TransformationConfig> = {}
): T => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let transformed = responseData;

  // Extract data from wrapper if needed
  if (finalConfig.extractData) {
    transformed = extractResponseData(transformed);
  }

  // Map MongoDB IDs if needed
  if (finalConfig.mapMongoIds) {
    transformed = mapMongoIds(transformed);
  }

  // Apply custom transformations
  if (finalConfig.customTransformations) {
    for (const transform of finalConfig.customTransformations) {
      transformed = transform(transformed);
    }
  }

  return transformed as T;
};

/**
 * Quick transformation for standard API responses
 * Most common use case: extract data and map IDs
 */
export const transformStandardResponse = <T>(responseData: any): T => {
  return transformResponse<T>(responseData, DEFAULT_CONFIG);
};

/**
 * Transform response without ID mapping
 * For cases where ID mapping might cause issues
 */
export const transformResponseNoIdMapping = <T>(responseData: any): T => {
  return transformResponse<T>(responseData, {
    extractData: true,
    mapMongoIds: false,
  });
};

/**
 * Transform response with custom transformation functions
 */
export const transformResponseWithCustom = <T>(
  responseData: any,
  customTransformations: Array<(data: any) => any>
): T => {
  return transformResponse<T>(responseData, {
    customTransformations,
  });
};

/**
 * Response transformer factory
 * Creates configured transformer functions for reuse
 */
export const createResponseTransformer = <T>(
  config: Partial<TransformationConfig>
) => {
  return (responseData: any): T => transformResponse<T>(responseData, config);
};

/**
 * Common response transformers for different data types
 */
export const ResponseTransformers = {
  /** Standard transformation for most API responses */
  standard: <T>(data: any): T => transformStandardResponse<T>(data),

  /** For responses that don't need ID transformation */
  noIdMapping: <T>(data: any): T => transformResponseNoIdMapping<T>(data),

  /** For responses that only need data extraction */
  extractOnly: <T>(data: any): T => extractResponseData<T>(data),

  /** For raw responses that don't need any transformation */
  raw: <T>(data: any): T => data as T,
} as const;

export default {
  transformResponse,
  transformStandardResponse,
  extractResponseData,
  mapMongoIds,
  isMetadataObject,
  ResponseTransformers,
  createResponseTransformer,
};
