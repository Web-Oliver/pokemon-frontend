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
 * Standard API response format - REMOVED (using new format only)
 * This interface is kept for reference but should not be used
 * @deprecated Use APIResponse<T> instead
 */
export interface StandardApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

/**
 * New enhanced API response format from updated backend
 * Includes structured metadata and standardized success/error handling
 */
export interface APIResponse<T> {
  success: boolean;
  status: 'success' | 'error' | 'partial';
  data: T;
  count?: number;
  message?: string;
  meta: {
    timestamp: string;
    version: string;
    duration: string;
    cached?: boolean;
  };
  details?: any; // For error responses
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
 * Validate that response data follows the backend API format
 * @param responseData - Response data to validate
 * @returns true if response follows backend API format
 */
const validateApiResponse = (
  responseData: any
): responseData is APIResponse<any> => {
  if (!responseData || typeof responseData !== 'object') {
    return false;
  }

  // Check required fields - 'status' is optional since backend doesn't include it
  if (
    !('success' in responseData) ||
    !('data' in responseData)
  ) {
    return false;
  }

  // Meta object is optional but if present should have basic structure
  if ('meta' in responseData && typeof responseData.meta === 'object') {
    const meta = responseData.meta;
    // At least one of these should be present if meta exists
    return 'timestamp' in meta || 'version' in meta || 'duration' in meta || 'query' in meta || 'totalResults' in meta;
  }

  // Response is valid even without meta object
  return true;
};

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
 * Convert MongoDB ObjectId to string
 * Handles both ObjectId objects and string representations
 */
export const convertObjectIdToString = (objectId: any): string => {
  if (!objectId) {
    return objectId;
  }

  // If it's already a string, return it
  if (typeof objectId === 'string') {
    return objectId;
  }

  // If it's not an object, we can't convert it - log warning and return as string
  if (typeof objectId !== 'object') {
    console.warn('[RESPONSE TRANSFORMER] Unable to convert non-object to ObjectId string:', objectId);
    return String(objectId);
  }

  // Debug logging removed - ObjectId structure understood

  // If it's an ObjectId object with $oid property (JSON representation)
  if (typeof objectId === 'object' && objectId.$oid) {
    return objectId.$oid;
  }

  // If it's an ObjectId-like object with _bsontype property
  if (typeof objectId === 'object' && objectId._bsontype === 'ObjectId') {
    // Try to access the toHexString method first
    if (typeof objectId.toHexString === 'function') {
      return objectId.toHexString();
    }
    // Try to access the id property directly
    if (objectId.id && typeof objectId.id === 'string') {
      return objectId.id;
    }
  }

  // Check for MongoDB ObjectId with buffer property (Node.js ObjectId format)
  if (typeof objectId === 'object' && objectId.buffer && typeof objectId.buffer === 'object') {
    const buffer = objectId.buffer;
    const bufferKeys = Object.keys(buffer);
    
    // Check if buffer has numeric keys 0-11 (12 bytes total)
    if (bufferKeys.length === 12 && bufferKeys.every(key => !isNaN(Number(key)) && Number(key) >= 0 && Number(key) <= 11)) {
      const bytes = [];
      for (let i = 0; i < 12; i++) {
        if (buffer[i] !== undefined) {
          bytes.push(buffer[i]);
        }
      }
      if (bytes.length === 12) {
        const hexString = bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
        return hexString;
      }
    }
  }

  // Check for MongoDB ObjectId with numeric keys (direct Buffer-like representation)
  if (typeof objectId === 'object' && Object.keys(objectId).length === 12 && 
      Object.keys(objectId).every(key => !isNaN(Number(key)) && Number(key) >= 0 && Number(key) <= 11)) {
    // Convert buffer-like object to hex string
    const bytes = [];
    for (let i = 0; i < 12; i++) {
      if (objectId[i] !== undefined) {
        bytes.push(objectId[i]);
      }
    }
    if (bytes.length === 12) {
      const hexString = bytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
      return hexString;
    }
  }

  // Check if it has valueOf method (another ObjectId pattern)
  if (typeof objectId === 'object' && typeof objectId.valueOf === 'function') {
    const valueOf = objectId.valueOf();
    if (typeof valueOf === 'string' && valueOf !== '[object Object]' && valueOf.length === 24) {
      return valueOf;
    }
  }

  // Last resort: check toString but with more validation
  if (typeof objectId === 'object' && typeof objectId.toString === 'function') {
    const stringRep = objectId.toString();
    // Make sure it's not the generic [object Object] string and looks like a valid ObjectId
    if (stringRep !== '[object Object]' && stringRep.length === 24 && 
        /^[a-f\d]{24}$/i.test(stringRep)) {
      return stringRep;
    }
  }

  // If we can't convert it, log error but return null to avoid passing invalid data
  console.error('[RESPONSE TRANSFORMER] Unable to convert ObjectId to string:', objectId);
  
  // Return null instead of the original object to avoid backend errors
  return null;
};

/**
 * List of ObjectId field names that need conversion
 * These are reference fields that MongoDB stores as ObjectIds
 */
const OBJECT_ID_FIELDS = [
  '_id',
  'id', 
  'productId',
  'setId',
  'cardId', 
  'itemId',
] as const;

/**
 * Check if a field name indicates it should be treated as an ObjectId
 */
const isObjectIdField = (fieldName: string): boolean => {
  // Direct match for known ObjectId fields
  if (OBJECT_ID_FIELDS.includes(fieldName as any)) {
    return true;
  }
  
  // Pattern match for fields ending with 'Id' (likely ObjectId references)
  if (fieldName.endsWith('Id') && fieldName.length > 2) {
    return true;
  }
  
  return false;
};

/**
 * Map MongoDB ObjectId fields to string representations for frontend consistency
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

    // Convert all ObjectId fields to strings first
    for (const [key, value] of Object.entries(result)) {
      if (isObjectIdField(key) && typeof value === 'object' && value !== null) {
        // Only convert actual ObjectId objects, not complex objects
        if (value.buffer || value.$oid || value._bsontype === 'ObjectId') {
          result[key] = convertObjectIdToString(value);
        }
        // If it's not a recognizable ObjectId format, leave it as is for now
      }
    }

    // Then recursively process non-ObjectId fields
    for (const [key, value] of Object.entries(result)) {
      if (!isObjectIdField(key) && !isMetadataObject(key, value) && typeof value === 'object' && value !== null) {
        result[key] = mapMongoIds(value);
      }
    }

    // Special handling: Map _id to id if _id exists and id doesn't
    if ('_id' in result && !('id' in result)) {
      result.id = result._id;
      // Don't delete _id in case it's needed elsewhere
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
 * Transform API response - Backend Format Handler
 * Handles the actual backend response format with enhanced error handling
 */
export const transformApiResponse = <T>(responseData: any): T => {
  console.log('[TRANSFORM API RESPONSE] Input:', responseData);

  // Validate response structure
  if (!validateApiResponse(responseData)) {
    console.error('[TRANSFORM API RESPONSE] Validation failed for:', responseData);
    const error = new Error(
      'Invalid API response format - expected backend standardized format'
    );
    (error as any).statusCode = 500;
    (error as any).details = { receivedFormat: typeof responseData };
    (error as any).apiResponse = responseData;
    throw error;
  }

  // Handle error responses
  if (!responseData.success) {
    const error = new Error(responseData.message || 'API request failed');
    (error as any).statusCode = responseData.status === 'error' ? 400 : 500;
    (error as any).details = responseData.details;
    (error as any).apiResponse = responseData;
    throw error;
  }

  // Extract and transform data with ID mapping
  const extractedData = responseData.data;
  console.log('[TRANSFORM API RESPONSE] Extracted data:', extractedData);
  
  const transformedData = mapMongoIds(extractedData) as T;
  console.log('[TRANSFORM API RESPONSE] Final result:', transformedData);
  
  return transformedData;
};

/**
 * @deprecated Use transformApiResponse instead
 * This function is kept for backward compatibility but should not be used
 */
export const transformNewApiResponse = <T>(responseData: any): T => {
  console.warn(
    'transformNewApiResponse is deprecated, use transformApiResponse instead'
  );
  return transformApiResponse<T>(responseData);
};

/**
 * @deprecated Use transformApiResponse instead
 * Legacy function kept for compatibility
 */
export const transformStandardResponse = <T>(responseData: any): T => {
  console.warn(
    'transformStandardResponse is deprecated, use transformApiResponse instead'
  );
  return transformApiResponse<T>(responseData);
};

/**
 * Transform request data before sending to backend
 * Converts ObjectId objects to strings in request payloads
 * This prevents BSON validation errors when ObjectId buffer objects are sent
 */
export const transformRequestData = <T>(requestData: T): T => {
  if (requestData === null || requestData === undefined) {
    return requestData;
  }

  if (Array.isArray(requestData)) {
    return requestData.map((item) => transformRequestData(item)) as T;
  }

  if (typeof requestData === 'object') {
    const result = { ...requestData } as any;

    // Convert all ObjectId fields to strings in request data
    for (const [key, value] of Object.entries(result)) {
      if (isObjectIdField(key) && typeof value === 'object' && value !== null) {
        // Only convert actual ObjectId objects, not complex objects
        if (value.buffer || value.$oid || value._bsontype === 'ObjectId') {
          result[key] = convertObjectIdToString(value);
        }
        // If it's not a recognizable ObjectId format, leave it as is
      } else if (typeof value === 'object' && value !== null && !isMetadataObject(key, value)) {
        // Recursively process nested objects
        result[key] = transformRequestData(value);
      }
    }

    return result as T;
  }

  return requestData;
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
 * Response transformers - SIMPLIFIED for new API format only
 */
export const ResponseTransformers = {
  /** Primary transformer for new API format */
  standard: <T>(data: any): T => transformApiResponse<T>(data),

  /** Alias for primary transformer (backward compatibility) */
  enhanced: <T>(data: any): T => transformApiResponse<T>(data),

  /** For responses that don't need ID transformation */
  noIdMapping: <T>(data: any): T => transformResponseNoIdMapping<T>(data),

  /** For responses that only need data extraction */
  extractOnly: <T>(data: any): T => extractResponseData<T>(data),

  /** For raw responses that don't need any transformation */
  raw: <T>(data: any): T => data as T,
} as const;

export default {
  // Primary API transformation
  transformApiResponse,

  // Request/Response transformation
  transformRequestData,

  // Backward compatibility (deprecated)
  transformNewApiResponse,
  transformStandardResponse,

  // Core utilities
  extractResponseData,
  mapMongoIds,
  isMetadataObject,

  // Configuration utilities
  transformResponse,
  ResponseTransformers,
  createResponseTransformer,
};
