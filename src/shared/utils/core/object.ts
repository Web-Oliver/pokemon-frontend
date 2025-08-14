/**
 * Pure Object Utilities - Layer 1 Core
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Handles only object manipulation operations
 * DRY: Single source for object utilities
 * No external dependencies - pure functions only
 */

/**
 * Deep clone using JSON (safe for serializable objects)
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('[OBJECT UTILS] Failed to clone:', error);
    return obj;
  }
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: object | null | undefined): boolean => {
  if (!obj || typeof obj !== 'object') return true;
  return Object.keys(obj).length === 0;
};

/**
 * Safe object property access
 */
export const safeGet = <T>(
  obj: any,
  path: string,
  fallback?: T
): T | undefined => {
  if (!obj || typeof obj !== 'object') return fallback;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current?.[key] === undefined) return fallback;
    current = current[key];
  }
  
  return current;
};

/**
 * Pick specific properties from object
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
};

/**
 * Omit specific properties from object
 */
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj } as any;
  for (const key of keys) {
    delete result[key];
  }
  return result;
};