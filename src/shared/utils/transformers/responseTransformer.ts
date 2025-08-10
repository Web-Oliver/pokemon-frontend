/**
 * Response Transformer Utilities
 * Layer 1: Core/Foundation utilities
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Data transformation only
 * - No external dependencies to prevent circular imports
 * - Pure functions for predictable behavior
 */

/**
 * Convert ObjectId to string if it's an ObjectId object
 * Handles MongoDB ObjectId objects that need to be converted to strings
 */
export const convertObjectIdToString = (value: any): string => {
  if (!value) {
    return value;
  }

  // Handle ObjectId objects (they have _bsontype property)
  if (typeof value === 'object' && value._bsontype === 'ObjectID') {
    return value.toString();
  }

  // Handle objects with id property that might be ObjectId
  if (typeof value === 'object' && value.id && typeof value.id === 'object' && value.id._bsontype === 'ObjectID') {
    return value.id.toString();
  }

  // Return as string if it's already a string
  return String(value);
};

/**
 * Map MongoDB IDs to strings recursively
 * Transforms ObjectId objects to strings throughout nested objects
 * FIXED: Preserve populated MongoDB references instead of converting them to strings
 */
export const mapMongoIds = (obj: any): any => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(mapMongoIds);
  }

  const result: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Check if this is an ObjectId field that should be converted to string
    if ((key === '_id' || key === 'id' || key.endsWith('Id')) && value) {
      // CRITICAL FIX: Check if the value is a populated object (has non-ObjectId properties)
      // If it's a populated object, preserve it and recursively process it
      if (typeof value === 'object' && value !== null) {
        // Check if this looks like a populated MongoDB document (has fields other than _id, __v)
        const valueKeys = Object.keys(value);
        const isPopulatedDocument = valueKeys.some(k => 
          k !== '_id' && k !== '__v' && k !== 'createdAt' && k !== 'updatedAt'
        );
        
        if (isPopulatedDocument) {
          // This is a populated reference - preserve it and recursively process
          result[key] = mapMongoIds(value);
        } else {
          // This is just an ObjectId - convert to string
          result[key] = convertObjectIdToString(value);
        }
      } else {
        // Simple ObjectId string or primitive - convert to string
        result[key] = convertObjectIdToString(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      result[key] = mapMongoIds(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

/**
 * Check if an object contains metadata (MongoDB-specific fields)
 */
export const isMetadataObject = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  const metadataFields = ['_id', '__v', 'createdAt', 'updatedAt'];
  return metadataFields.some(field => obj.hasOwnProperty(field));
};

/**
 * Transform API response data
 * Unwraps new API response format and converts ObjectIds to strings
 */
export const transformApiResponse = (data: any): any => {
  if (!data) {
    return data;
  }

  // Check if this is the new API response format: { success, status, data, meta }
  if (typeof data === 'object' && data.hasOwnProperty('success') && data.hasOwnProperty('data')) {
    // Unwrap the actual data from the API response wrapper
    const actualData = data.data;
    
    if (Array.isArray(actualData)) {
      return actualData.map(item => mapMongoIds(item));
    }
    
    return mapMongoIds(actualData);
  }

  // Handle legacy format or direct data
  if (Array.isArray(data)) {
    return data.map(transformApiResponse);
  }

  if (typeof data === 'object') {
    return mapMongoIds(data);
  }

  return data;
};

/**
 * Transform request data before sending to API
 * Ensures ObjectIds are properly formatted as strings
 */
export const transformRequestData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // Don't transform FormData objects
  if (data instanceof FormData) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(transformRequestData);
  }

  const result: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && value._bsontype === 'ObjectID') {
      result[key] = convertObjectIdToString(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(transformRequestData);
    } else if (value && typeof value === 'object') {
      result[key] = transformRequestData(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};